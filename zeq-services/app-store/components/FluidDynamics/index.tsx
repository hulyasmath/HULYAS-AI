import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Droplets, Play, Pause, RotateCcw } from 'lucide-react';
import { AppPageLayout } from '../shared/AppPageLayout';
import { useZeqSync } from '../SimulationVisualizer/useZeqSync';
import { FlowFieldCanvas } from './FlowFieldCanvas';
import { VorticityMap } from './VorticityMap';
import { FluidMetrics } from './FluidMetrics';

type TabId = 'flow' | 'vorticity' | 'metrics';
type ObstacleShape = 'circle' | 'rectangle';

// D2Q9 Lattice Boltzmann types
export interface LBMState {
  nx: number;
  ny: number;
  f: Float64Array[];    // 9 distribution functions
  rho: Float64Array;    // density
  ux: Float64Array;     // x-velocity
  uy: Float64Array;     // y-velocity
  obstacle: Uint8Array; // obstacle mask
  vorticity: Float64Array;
}

// D2Q9 velocity directions
const ex = [0, 1, 0, -1, 0, 1, -1, -1, 1];
const ey = [0, 0, 1, 0, -1, 1, 1, -1, -1];
const weights = [4/9, 1/9, 1/9, 1/9, 1/9, 1/36, 1/36, 1/36, 1/36];
const opp = [0, 3, 4, 1, 2, 7, 8, 5, 6]; // opposite directions

function initLBM(nx: number, ny: number, tau: number, inletVel: number, shape: ObstacleShape, obsX: number, obsY: number, obsSize: number): LBMState {
  const n = nx * ny;
  const f: Float64Array[] = [];
  for (let i = 0; i < 9; i++) f.push(new Float64Array(n));
  const rho = new Float64Array(n).fill(1.0);
  const ux = new Float64Array(n);
  const uy = new Float64Array(n);
  const obstacle = new Uint8Array(n);
  const vorticity = new Float64Array(n);

  // Set up obstacle
  for (let y = 0; y < ny; y++) {
    for (let x = 0; x < nx; x++) {
      const idx = y * nx + x;
      if (shape === 'circle') {
        const dx = x - obsX;
        const dy = y - obsY;
        if (dx * dx + dy * dy <= obsSize * obsSize) obstacle[idx] = 1;
      } else {
        if (Math.abs(x - obsX) <= obsSize && Math.abs(y - obsY) <= obsSize) obstacle[idx] = 1;
      }
    }
  }

  // Initialize equilibrium
  for (let y = 0; y < ny; y++) {
    for (let x = 0; x < nx; x++) {
      const idx = y * nx + x;
      ux[idx] = inletVel;
      uy[idx] = 0;
      for (let i = 0; i < 9; i++) {
        const eu = ex[i] * ux[idx] + ey[i] * uy[idx];
        const usq = ux[idx] * ux[idx] + uy[idx] * uy[idx];
        f[i][idx] = weights[i] * rho[idx] * (1 + 3 * eu + 4.5 * eu * eu - 1.5 * usq);
      }
    }
  }

  return { nx, ny, f, rho, ux, uy, obstacle, vorticity };
}

function stepLBM(state: LBMState, tau: number, inletVel: number): void {
  const { nx, ny, f, rho, ux, uy, obstacle, vorticity } = state;
  const n = nx * ny;
  const omega = 1.0 / tau;

  // Collision (BGK)
  for (let idx = 0; idx < n; idx++) {
    if (obstacle[idx]) continue;
    for (let i = 0; i < 9; i++) {
      const eu = ex[i] * ux[idx] + ey[i] * uy[idx];
      const usq = ux[idx] * ux[idx] + uy[idx] * uy[idx];
      const feq = weights[i] * rho[idx] * (1 + 3 * eu + 4.5 * eu * eu - 1.5 * usq);
      f[i][idx] = f[i][idx] - omega * (f[i][idx] - feq);
    }
  }

  // Streaming (with bounce-back for obstacles)
  const fNew: Float64Array[] = [];
  for (let i = 0; i < 9; i++) fNew.push(new Float64Array(n));

  for (let y = 0; y < ny; y++) {
    for (let x = 0; x < nx; x++) {
      const idx = y * nx + x;
      for (let i = 0; i < 9; i++) {
        const nx2 = x + ex[i];
        const ny2 = y + ey[i];
        if (nx2 >= 0 && nx2 < nx && ny2 >= 0 && ny2 < ny) {
          const nidx = ny2 * nx + nx2;
          if (obstacle[nidx]) {
            // Bounce-back
            fNew[opp[i]][idx] = f[i][idx];
          } else {
            fNew[i][nidx] = f[i][idx];
          }
        }
      }
    }
  }

  // Copy back and compute macroscopic
  for (let idx = 0; idx < n; idx++) {
    for (let i = 0; i < 9; i++) f[i][idx] = fNew[i][idx];

    if (obstacle[idx]) {
      rho[idx] = 0;
      ux[idx] = 0;
      uy[idx] = 0;
      continue;
    }

    let r = 0, vx = 0, vy = 0;
    for (let i = 0; i < 9; i++) {
      r += f[i][idx];
      vx += f[i][idx] * ex[i];
      vy += f[i][idx] * ey[i];
    }
    rho[idx] = r > 0 ? r : 1e-10;
    ux[idx] = isFinite(vx / rho[idx]) ? vx / rho[idx] : 0;
    uy[idx] = isFinite(vy / rho[idx]) ? vy / rho[idx] : 0;
  }

  // Inlet boundary (Zou-He style, simplified)
  for (let y = 1; y < ny - 1; y++) {
    const idx = y * nx;
    ux[idx] = inletVel;
    uy[idx] = 0;
    rho[idx] = 1.0;
    for (let i = 0; i < 9; i++) {
      const eu = ex[i] * ux[idx] + ey[i] * uy[idx];
      const usq = ux[idx] * ux[idx] + uy[idx] * uy[idx];
      f[i][idx] = weights[i] * rho[idx] * (1 + 3 * eu + 4.5 * eu * eu - 1.5 * usq);
    }
  }

  // Compute vorticity
  for (let y = 1; y < ny - 1; y++) {
    for (let x = 1; x < nx - 1; x++) {
      const idx = y * nx + x;
      const duyDx = (uy[idx + 1] - uy[idx - 1]) * 0.5;
      const duxDy = (ux[(y + 1) * nx + x] - ux[(y - 1) * nx + x]) * 0.5;
      vorticity[idx] = isFinite(duyDx - duxDy) ? duyDx - duxDy : 0;
    }
  }
}

const FluidDynamics: React.FC = () => {
  const { syncValue, elapsedTime, pulseCount } = useZeqSync();

  const [activeTab, setActiveTab] = useState<TabId>('flow');
  const [playing, setPlaying] = useState(false);
  const [tau, setTau] = useState(0.6);
  const [inletVel, setInletVel] = useState(0.08);
  const [gridNx, setGridNx] = useState(100);
  const [gridNy, setGridNy] = useState(50);
  const [obstacleShape, setObstacleShape] = useState<ObstacleShape>('circle');
  const [obstacleSize, setObstacleSize] = useState(8);
  const [stepCount, setStepCount] = useState(0);

  const lbmRef = useRef<LBMState | null>(null);

  const [renderTrigger, setRenderTrigger] = useState(0);

  const resetSimulation = useCallback(() => {
    const obsX = Math.floor(gridNx * 0.25);
    const obsY = Math.floor(gridNy / 2);
    lbmRef.current = initLBM(gridNx, gridNy, tau, inletVel, obstacleShape, obsX, obsY, obstacleSize);
    setStepCount(0);
    setRenderTrigger((p) => p + 1);
  }, [gridNx, gridNy, tau, inletVel, obstacleShape, obstacleSize]);

  useEffect(() => {
    resetSimulation();
  }, [resetSimulation]);

  useEffect(() => {
    if (!playing || !lbmRef.current) return;
    let raf: number;
    const loop = () => {
      if (lbmRef.current) {
        for (let i = 0; i < 5; i++) stepLBM(lbmRef.current, tau, inletVel);
        setStepCount((p) => p + 5);
        setRenderTrigger((p) => p + 1);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [playing, tau, inletVel]);

  const nu = useMemo(() => (tau - 0.5) / 3, [tau]);
  const obstDiameter = obstacleSize * 2;
  const reynolds = useMemo(() => {
    const re = inletVel * obstDiameter / nu;
    return isFinite(re) ? re : 0;
  }, [inletVel, obstDiameter, nu]);

  const maxVelocity = useMemo(() => {
    if (!lbmRef.current) return 0;
    const { ux, uy } = lbmRef.current;
    let maxV = 0;
    for (let i = 0; i < ux.length; i++) {
      const v = Math.sqrt(ux[i] * ux[i] + uy[i] * uy[i]);
      if (isFinite(v) && v > maxV) maxV = v;
    }
    return maxV;
  }, [renderTrigger]);

  const dragCoeff = useMemo(() => {
    if (!lbmRef.current || inletVel === 0) return 0;
    // Simplified momentum deficit drag estimation
    const { ux, uy, nx, ny, obstacle } = lbmRef.current;
    let dragForce = 0;
    // Sum over obstacle boundary
    for (let y = 1; y < ny - 1; y++) {
      for (let x = 1; x < nx - 1; x++) {
        const idx = y * nx + x;
        if (!obstacle[idx]) continue;
        // Check neighbors
        for (let d = 1; d <= 4; d++) {
          const nx2 = x + ex[d];
          const ny2 = y + ey[d];
          if (nx2 >= 0 && nx2 < nx && ny2 >= 0 && ny2 < ny) {
            const nidx = ny2 * nx + nx2;
            if (!obstacle[nidx]) {
              dragForce += Math.abs(ux[nidx] - inletVel) * 2;
            }
          }
        }
      }
    }
    const cd = 2 * dragForce / (1.0 * inletVel * inletVel * obstDiameter);
    return isFinite(cd) ? cd : 0;
  }, [renderTrigger, inletVel, obstDiameter]);

  const vorticityStats = useMemo(() => {
    if (!lbmRef.current) return { min: 0, max: 0, mean: 0 };
    const v = lbmRef.current.vorticity;
    let min = Infinity, max = -Infinity, sum = 0, count = 0;
    for (let i = 0; i < v.length; i++) {
      if (!isFinite(v[i])) continue;
      if (v[i] < min) min = v[i];
      if (v[i] > max) max = v[i];
      sum += v[i];
      count++;
    }
    return {
      min: isFinite(min) ? min : 0,
      max: isFinite(max) ? max : 0,
      mean: count > 0 ? sum / count : 0,
    };
  }, [renderTrigger]);

  const tabs: { id: TabId; label: string }[] = [
    { id: 'flow', label: 'Flow Field' },
    { id: 'vorticity', label: 'Vorticity' },
    { id: 'metrics', label: 'Metrics' },
  ];

  const sidebar = (
    <div className="space-y-4">
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3">
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 text-xs py-1.5 px-2 rounded transition-colors ${
                activeTab === tab.id
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Playback controls */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3">
        <h3 className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1">
          <Droplets size={14} className="text-cyan-400" /> Simulation
        </h3>
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setPlaying(!playing)}
            className={`flex-1 flex items-center justify-center gap-1 text-xs py-1.5 rounded transition-colors ${
              playing ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
            }`}
          >
            {playing ? <Pause size={12} /> : <Play size={12} />}
            {playing ? 'Pause' : 'Play'}
          </button>
          <button
            onClick={() => { setPlaying(false); resetSimulation(); }}
            className="flex items-center gap-1 text-xs py-1.5 px-3 rounded bg-slate-700/50 text-slate-300 hover:text-white transition-colors"
          >
            <RotateCcw size={12} /> Reset
          </button>
        </div>
        <p className="text-xs text-slate-500 font-mono">Steps: {stepCount}</p>
      </div>

      {/* Parameters */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 space-y-3">
        <h3 className="text-xs font-semibold text-slate-300">Parameters</h3>

        <div>
          <label className="text-xs text-slate-400 flex justify-between">
            <span>Relaxation (tau)</span>
            <span className="font-mono text-cyan-400">{tau.toFixed(2)}</span>
          </label>
          <input type="range" min={0.51} max={2.0} step={0.01} value={tau}
            onChange={(e) => setTau(Number(e.target.value))}
            className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500" />
        </div>

        <div>
          <label className="text-xs text-slate-400 flex justify-between">
            <span>Inlet Velocity</span>
            <span className="font-mono text-cyan-400">{inletVel.toFixed(3)}</span>
          </label>
          <input type="range" min={0.02} max={0.15} step={0.005} value={inletVel}
            onChange={(e) => setInletVel(Number(e.target.value))}
            className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500" />
        </div>

        <div>
          <label className="text-xs text-slate-400 flex justify-between">
            <span>Obstacle Shape</span>
          </label>
          <div className="flex gap-1 mt-1">
            {(['circle', 'rectangle'] as ObstacleShape[]).map((s) => (
              <button key={s} onClick={() => setObstacleShape(s)}
                className={`flex-1 text-xs py-1 rounded ${
                  obstacleShape === s ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-slate-700/50 text-slate-400'
                }`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs text-slate-400 flex justify-between">
            <span>Obstacle Size</span>
            <span className="font-mono text-cyan-400">{obstacleSize}</span>
          </label>
          <input type="range" min={4} max={15} step={1} value={obstacleSize}
            onChange={(e) => setObstacleSize(Number(e.target.value))}
            className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500" />
        </div>
      </div>

      {/* Quick stats */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 space-y-2">
        <h3 className="text-xs font-semibold text-slate-300">Quick Stats</h3>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-slate-400">Re</span>
            <p className="font-mono text-orange-400">{reynolds.toFixed(1)}</p>
          </div>
          <div>
            <span className="text-slate-400">Viscosity</span>
            <p className="font-mono text-cyan-400">{nu.toFixed(4)}</p>
          </div>
          <div>
            <span className="text-slate-400">Max |u|</span>
            <p className="font-mono text-cyan-400">{maxVelocity.toFixed(4)}</p>
          </div>
          <div>
            <span className="text-slate-400">Pulse</span>
            <p className="font-mono text-orange-400">{pulseCount}</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <AppPageLayout
      title="Fluid Dynamics Simulator"
      description="D2Q9 Lattice Boltzmann Method - Real-time CFD"
      domain="Computational Fluid Dynamics"
      sidebar={sidebar}
    >
      {activeTab === 'flow' && (
        <FlowFieldCanvas
          lbm={lbmRef.current}
          renderTrigger={renderTrigger}
          syncValue={syncValue}
        />
      )}
      {activeTab === 'vorticity' && (
        <VorticityMap
          lbm={lbmRef.current}
          renderTrigger={renderTrigger}
        />
      )}
      {activeTab === 'metrics' && (
        <FluidMetrics
          reynolds={reynolds}
          dragCoeff={dragCoeff}
          maxVelocity={maxVelocity}
          vorticityStats={vorticityStats}
          tau={tau}
          inletVel={inletVel}
          obstDiameter={obstDiameter}
          nu={nu}
          stepCount={stepCount}
          lbm={lbmRef.current}
          syncValue={syncValue}
        />
      )}
    </AppPageLayout>
  );
};

export default FluidDynamics;
