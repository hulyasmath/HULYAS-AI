import React, { useState, useMemo, useCallback } from 'react';
import { Zap, RotateCcw } from 'lucide-react';
import { AppPageLayout } from '../shared/AppPageLayout';
import { useZeqSync } from '../SimulationVisualizer/useZeqSync';
import { GridDiagram } from './GridDiagram';
import { PowerFlowResults } from './PowerFlowResults';
import { GridMetrics } from './GridMetrics';

type TabId = 'grid' | 'powerflow' | 'faults';

export interface Bus {
  id: number;
  name: string;
  type: 'slack' | 'PV' | 'PQ';
  V: number;       // voltage magnitude (pu)
  theta: number;   // voltage angle (rad)
  Pgen: number;    // generation (MW)
  Qgen: number;    // reactive generation (MVAR)
  Pload: number;   // load (MW)
  Qload: number;   // load (MVAR)
  x: number;       // diagram position
  y: number;
}

export interface Line {
  from: number;
  to: number;
  R: number;       // resistance (pu)
  X: number;       // reactance (pu)
  B: number;       // shunt susceptance (pu)
}

export interface PowerFlowResult {
  buses: Bus[];
  converged: boolean;
  iterations: number;
  maxMismatch: number;
  linePowers: { from: number; to: number; P: number; Q: number; Ploss: number }[];
  totalGen: number;
  totalLoad: number;
  totalLoss: number;
}

export interface FaultResult {
  busId: number;
  faultCurrent: number;  // kA
  Zth: { r: number; x: number };
  preFaultV: number;
}

const BASE_MVA = 100;
const BASE_KV = 230;

// Build Y-bus admittance matrix
function buildYbus(buses: Bus[], lines: Line[]): { G: number[][]; B: number[][] } {
  const n = buses.length;
  const G: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));
  const B: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));

  for (const line of lines) {
    const i = line.from;
    const j = line.to;
    const z2 = line.R * line.R + line.X * line.X;
    if (z2 < 1e-15) continue;
    const g = line.R / z2;
    const b = -line.X / z2;

    G[i][j] -= g; G[j][i] -= g;
    B[i][j] -= b; B[j][i] -= b;
    G[i][i] += g; G[j][j] += g;
    B[i][i] += b + line.B / 2;
    B[j][j] += b + line.B / 2;
  }

  return { G, B };
}

// Newton-Raphson Power Flow
export function runPowerFlow(
  busesIn: Bus[], lines: Line[], maxIter: number = 50, tol: number = 1e-6
): PowerFlowResult {
  const n = busesIn.length;
  const buses = busesIn.map((b) => ({ ...b }));
  const { G, B } = buildYbus(buses, lines);

  // Identify PQ and PV buses (non-slack)
  const pqBuses: number[] = [];
  const pvBuses: number[] = [];
  for (let i = 0; i < n; i++) {
    if (buses[i].type === 'PQ') pqBuses.push(i);
    else if (buses[i].type === 'PV') pvBuses.push(i);
  }

  const nonSlack = [...pvBuses, ...pqBuses];
  const pqIndices = pqBuses;

  // Dimension of Jacobian
  // dP equations for all non-slack, dQ equations for PQ buses
  const nP = nonSlack.length;
  const nQ = pqIndices.length;
  const dim = nP + nQ;

  let converged = false;
  let iterations = 0;
  let maxMismatch = Infinity;

  for (let iter = 0; iter < maxIter; iter++) {
    // Compute P and Q injections
    const Pcalc = new Array(n).fill(0);
    const Qcalc = new Array(n).fill(0);

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const Yij = Math.sqrt(G[i][j] * G[i][j] + B[i][j] * B[i][j]);
        const thetaIJ = Math.atan2(B[i][j], G[i][j]);
        const angleDiff = buses[i].theta - buses[j].theta - thetaIJ;
        Pcalc[i] += buses[i].V * buses[j].V * Yij * Math.cos(angleDiff);
        Qcalc[i] += -buses[i].V * buses[j].V * Yij * Math.sin(angleDiff);
      }
    }

    // Compute mismatches
    const dP = new Array(dim).fill(0);

    for (let k = 0; k < nP; k++) {
      const i = nonSlack[k];
      const Pspec = (buses[i].Pgen - buses[i].Pload) / BASE_MVA;
      dP[k] = Pspec - Pcalc[i];
    }
    for (let k = 0; k < nQ; k++) {
      const i = pqIndices[k];
      const Qspec = (buses[i].Qgen - buses[i].Qload) / BASE_MVA;
      dP[nP + k] = Qspec - Qcalc[i];
    }

    maxMismatch = 0;
    for (let k = 0; k < dim; k++) {
      const a = Math.abs(dP[k]);
      if (isFinite(a) && a > maxMismatch) maxMismatch = a;
    }

    if (maxMismatch < tol) {
      converged = true;
      iterations = iter + 1;
      break;
    }

    // Build Jacobian
    const J: number[][] = Array.from({ length: dim }, () => new Array(dim).fill(0));

    // J1: dP/dTheta (nP x nP)
    for (let r = 0; r < nP; r++) {
      const i = nonSlack[r];
      for (let c = 0; c < nP; c++) {
        const j = nonSlack[c];
        if (i === j) {
          let sum = 0;
          for (let k = 0; k < n; k++) {
            if (k !== i) {
              const Yik = Math.sqrt(G[i][k] * G[i][k] + B[i][k] * B[i][k]);
              const thetaIK = Math.atan2(B[i][k], G[i][k]);
              sum += buses[i].V * buses[k].V * Yik * Math.sin(buses[i].theta - buses[k].theta - thetaIK);
            }
          }
          J[r][c] = sum;
        } else {
          const Yij = Math.sqrt(G[i][j] * G[i][j] + B[i][j] * B[i][j]);
          const thetaIJ = Math.atan2(B[i][j], G[i][j]);
          J[r][c] = -buses[i].V * buses[j].V * Yij * Math.sin(buses[i].theta - buses[j].theta - thetaIJ);
        }
      }
    }

    // J2: dP/dV (nP x nQ)
    for (let r = 0; r < nP; r++) {
      const i = nonSlack[r];
      for (let c = 0; c < nQ; c++) {
        const j = pqIndices[c];
        if (i === j) {
          let sum = 0;
          for (let k = 0; k < n; k++) {
            const Yik = Math.sqrt(G[i][k] * G[i][k] + B[i][k] * B[i][k]);
            const thetaIK = Math.atan2(B[i][k], G[i][k]);
            sum += buses[k].V * Yik * Math.cos(buses[i].theta - buses[k].theta - thetaIK);
          }
          J[r][nP + c] = sum + buses[i].V * Math.sqrt(G[i][i] * G[i][i] + B[i][i] * B[i][i]) * Math.cos(Math.atan2(B[i][i], G[i][i]));
        } else {
          const Yij = Math.sqrt(G[i][j] * G[i][j] + B[i][j] * B[i][j]);
          const thetaIJ = Math.atan2(B[i][j], G[i][j]);
          J[r][nP + c] = buses[i].V * Yij * Math.cos(buses[i].theta - buses[j].theta - thetaIJ);
        }
      }
    }

    // J3: dQ/dTheta (nQ x nP)
    for (let r = 0; r < nQ; r++) {
      const i = pqIndices[r];
      for (let c = 0; c < nP; c++) {
        const j = nonSlack[c];
        if (i === j) {
          let sum = 0;
          for (let k = 0; k < n; k++) {
            if (k !== i) {
              const Yik = Math.sqrt(G[i][k] * G[i][k] + B[i][k] * B[i][k]);
              const thetaIK = Math.atan2(B[i][k], G[i][k]);
              sum += buses[i].V * buses[k].V * Yik * Math.cos(buses[i].theta - buses[k].theta - thetaIK);
            }
          }
          J[nP + r][c] = -sum;
        } else {
          const Yij = Math.sqrt(G[i][j] * G[i][j] + B[i][j] * B[i][j]);
          const thetaIJ = Math.atan2(B[i][j], G[i][j]);
          J[nP + r][c] = buses[i].V * buses[j].V * Yij * Math.cos(buses[i].theta - buses[j].theta - thetaIJ);
        }
      }
    }

    // J4: dQ/dV (nQ x nQ)
    for (let r = 0; r < nQ; r++) {
      const i = pqIndices[r];
      for (let c = 0; c < nQ; c++) {
        const j = pqIndices[c];
        if (i === j) {
          let sum = 0;
          for (let k = 0; k < n; k++) {
            const Yik = Math.sqrt(G[i][k] * G[i][k] + B[i][k] * B[i][k]);
            const thetaIK = Math.atan2(B[i][k], G[i][k]);
            sum += buses[k].V * Yik * Math.sin(buses[i].theta - buses[k].theta - thetaIK);
          }
          J[nP + r][nP + c] = -sum - buses[i].V * Math.sqrt(G[i][i] * G[i][i] + B[i][i] * B[i][i]) * Math.sin(Math.atan2(B[i][i], G[i][i]));
        } else {
          const Yij = Math.sqrt(G[i][j] * G[i][j] + B[i][j] * B[i][j]);
          const thetaIJ = Math.atan2(B[i][j], G[i][j]);
          J[nP + r][nP + c] = -buses[i].V * Yij * Math.sin(buses[i].theta - buses[j].theta - thetaIJ);
        }
      }
    }

    // Solve J * dx = dP using Gaussian elimination
    const dx = solveLinear(J, dP);
    if (!dx) break;

    // Update angles and voltages
    for (let k = 0; k < nP; k++) {
      const i = nonSlack[k];
      buses[i].theta += isFinite(dx[k]) ? dx[k] : 0;
    }
    for (let k = 0; k < nQ; k++) {
      const i = pqIndices[k];
      buses[i].V += isFinite(dx[nP + k]) ? dx[nP + k] : 0;
      if (buses[i].V < 0.5) buses[i].V = 0.5;
      if (buses[i].V > 1.5) buses[i].V = 1.5;
    }

    iterations = iter + 1;
  }

  // Compute line flows
  const linePowers: PowerFlowResult['linePowers'] = [];
  let totalLoss = 0;

  for (const line of lines) {
    const i = line.from;
    const j = line.to;
    const Vi = buses[i].V;
    const Vj = buses[j].V;
    const di = buses[i].theta;
    const dj = buses[j].theta;
    const z2 = line.R * line.R + line.X * line.X;
    if (z2 < 1e-15) {
      linePowers.push({ from: i, to: j, P: 0, Q: 0, Ploss: 0 });
      continue;
    }
    const g = line.R / z2;
    const b = -line.X / z2;

    const Pij = Vi * Vi * g - Vi * Vj * (g * Math.cos(di - dj) + b * Math.sin(di - dj));
    const Pji = Vj * Vj * g - Vi * Vj * (g * Math.cos(dj - di) + b * Math.sin(dj - di));
    const Qij = -Vi * Vi * (b + line.B / 2) - Vi * Vj * (g * Math.sin(di - dj) - b * Math.cos(di - dj));

    const Ploss = (isFinite(Pij + Pji) ? Pij + Pji : 0) * BASE_MVA;
    totalLoss += Math.abs(Ploss);

    linePowers.push({
      from: i,
      to: j,
      P: isFinite(Pij) ? Pij * BASE_MVA : 0,
      Q: isFinite(Qij) ? Qij * BASE_MVA : 0,
      Ploss: Math.abs(Ploss),
    });
  }

  // Total generation and load
  let totalGen = 0, totalLoad = 0;
  for (const b of buses) {
    totalGen += b.Pgen;
    totalLoad += b.Pload;
  }

  // Compute slack bus generation
  const slackBus = buses.find((b) => b.type === 'slack');
  if (slackBus) {
    slackBus.Pgen = totalLoad + totalLoss - (totalGen - slackBus.Pgen);
    totalGen = totalLoad + totalLoss;
  }

  return { buses, converged, iterations, maxMismatch, linePowers, totalGen, totalLoad, totalLoss };
}

// Gaussian elimination solver
function solveLinear(A: number[][], b: number[]): number[] | null {
  const n = A.length;
  if (n === 0) return null;

  // Augmented matrix
  const M = A.map((row, i) => [...row, b[i]]);

  // Forward elimination with partial pivoting
  for (let col = 0; col < n; col++) {
    // Find pivot
    let maxVal = Math.abs(M[col][col]);
    let maxRow = col;
    for (let row = col + 1; row < n; row++) {
      if (Math.abs(M[row][col]) > maxVal) {
        maxVal = Math.abs(M[row][col]);
        maxRow = row;
      }
    }
    if (maxVal < 1e-12) return null;

    // Swap rows
    if (maxRow !== col) {
      [M[col], M[maxRow]] = [M[maxRow], M[col]];
    }

    // Eliminate below
    for (let row = col + 1; row < n; row++) {
      const factor = M[row][col] / M[col][col];
      for (let j = col; j <= n; j++) {
        M[row][j] -= factor * M[col][j];
      }
    }
  }

  // Back substitution
  const x = new Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    let sum = M[i][n];
    for (let j = i + 1; j < n; j++) {
      sum -= M[i][j] * x[j];
    }
    x[i] = Math.abs(M[i][i]) > 1e-15 ? sum / M[i][i] : 0;
  }

  return x;
}

// 3-phase bolted fault calculation
export function computeFault(buses: Bus[], lines: Line[], faultBusId: number): FaultResult {
  const n = buses.length;
  // Build Z-bus (inverse of Y-bus with generator subtransient reactance)
  const { G, B } = buildYbus(buses, lines);

  // Add generator subtransient reactance (Xd'' ~ 0.2 pu) for generator buses
  for (let i = 0; i < n; i++) {
    if (buses[i].type === 'slack' || buses[i].type === 'PV') {
      B[i][i] += -1 / 0.2; // Add admittance of generator behind Xd''
    }
  }

  // For simplicity, Zth = 1/Yii at fault bus (approximation)
  const Yreal = G[faultBusId][faultBusId];
  const Yimag = B[faultBusId][faultBusId];
  const Ymag2 = Yreal * Yreal + Yimag * Yimag;

  const Zr = Ymag2 > 1e-10 ? Yreal / Ymag2 : 0.1;
  const Zx = Ymag2 > 1e-10 ? -Yimag / Ymag2 : 0.3;

  const Zmag = Math.sqrt(Zr * Zr + Zx * Zx);
  const Vpre = buses[faultBusId].V;
  const IfPu = Zmag > 1e-10 ? Vpre / Zmag : 0;

  // Convert to kA
  const Ibase = BASE_MVA / (Math.sqrt(3) * BASE_KV); // kA
  const IfkA = IfPu * Ibase;

  return {
    busId: faultBusId,
    faultCurrent: isFinite(IfkA) ? IfkA : 0,
    Zth: { r: isFinite(Zr) ? Zr : 0, x: isFinite(Zx) ? Zx : 0 },
    preFaultV: Vpre,
  };
}

// Default 3-bus system
function createDefaultSystem(): { buses: Bus[]; lines: Line[] } {
  const buses: Bus[] = [
    { id: 0, name: 'Bus 1', type: 'slack', V: 1.05, theta: 0, Pgen: 0, Qgen: 0, Pload: 0, Qload: 0, x: 150, y: 80 },
    { id: 1, name: 'Bus 2', type: 'PV', V: 1.02, theta: 0, Pgen: 200, Qgen: 0, Pload: 0, Qload: 0, x: 400, y: 80 },
    { id: 2, name: 'Bus 3', type: 'PQ', V: 1.0, theta: 0, Pgen: 0, Qgen: 0, Pload: 150, Qload: 50, x: 275, y: 280 },
  ];

  const lines: Line[] = [
    { from: 0, to: 1, R: 0.01, X: 0.1, B: 0 },
    { from: 0, to: 2, R: 0.02, X: 0.15, B: 0 },
    { from: 1, to: 2, R: 0.015, X: 0.12, B: 0 },
  ];

  return { buses, lines };
}

const PowerGridAnalyzer: React.FC = () => {
  const { syncValue, elapsedTime, pulseCount } = useZeqSync();

  const [activeTab, setActiveTab] = useState<TabId>('grid');
  const [faultBus, setFaultBus] = useState(2);

  const defaultSystem = useMemo(() => createDefaultSystem(), []);
  const [buses, setBuses] = useState<Bus[]>(defaultSystem.buses);
  const [lines] = useState<Line[]>(defaultSystem.lines);

  // Run power flow
  const pfResult = useMemo(() => runPowerFlow(buses, lines), [buses, lines]);

  // Run fault analysis
  const faultResult = useMemo(() => computeFault(pfResult.buses, lines, faultBus), [pfResult.buses, lines, faultBus]);

  const resetSystem = useCallback(() => {
    const sys = createDefaultSystem();
    setBuses(sys.buses);
  }, []);

  const updateBusParam = (id: number, key: keyof Bus, value: number) => {
    setBuses((prev) =>
      prev.map((b) => (b.id === id ? { ...b, [key]: value } : b))
    );
  };

  const tabs: { id: TabId; label: string }[] = [
    { id: 'grid', label: 'Grid' },
    { id: 'powerflow', label: 'Power Flow' },
    { id: 'faults', label: 'Faults' },
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

      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 space-y-2">
        <h3 className="text-xs font-semibold text-slate-300 flex items-center gap-1">
          <Zap size={14} className="text-cyan-400" /> System Base
        </h3>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-slate-400">Base MVA</span>
            <p className="font-mono text-cyan-400">{BASE_MVA}</p>
          </div>
          <div>
            <span className="text-slate-400">Base kV</span>
            <p className="font-mono text-cyan-400">{BASE_KV}</p>
          </div>
        </div>
        <button
          onClick={resetSystem}
          className="flex items-center gap-1 text-xs py-1.5 px-3 rounded bg-slate-700/50 text-slate-300 hover:text-white transition-colors w-full justify-center mt-2"
        >
          <RotateCcw size={12} /> Reset System
        </button>
      </div>

      {/* Bus parameters */}
      {buses.map((bus) => (
        <div key={bus.id} className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 space-y-2">
          <h3 className="text-xs font-semibold text-slate-300">{bus.name} ({bus.type})</h3>

          {bus.type !== 'slack' && bus.type !== 'PV' && (
            <div>
              <label className="text-xs text-slate-400 flex justify-between">
                <span>P Load (MW)</span>
                <span className="font-mono text-cyan-400">{bus.Pload}</span>
              </label>
              <input type="range" min={0} max={300} step={10} value={bus.Pload}
                onChange={(e) => updateBusParam(bus.id, 'Pload', Number(e.target.value))}
                className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500" />
            </div>
          )}

          {bus.type === 'PV' && (
            <>
              <div>
                <label className="text-xs text-slate-400 flex justify-between">
                  <span>P Gen (MW)</span>
                  <span className="font-mono text-cyan-400">{bus.Pgen}</span>
                </label>
                <input type="range" min={50} max={500} step={10} value={bus.Pgen}
                  onChange={(e) => updateBusParam(bus.id, 'Pgen', Number(e.target.value))}
                  className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500" />
              </div>
              <div>
                <label className="text-xs text-slate-400 flex justify-between">
                  <span>V (pu)</span>
                  <span className="font-mono text-cyan-400">{bus.V.toFixed(2)}</span>
                </label>
                <input type="range" min={0.95} max={1.1} step={0.01} value={bus.V}
                  onChange={(e) => updateBusParam(bus.id, 'V', Number(e.target.value))}
                  className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500" />
              </div>
            </>
          )}

          <div className="grid grid-cols-2 gap-1 text-xs">
            <div>
              <span className="text-slate-500">|V|</span>
              <span className="font-mono text-cyan-400 ml-1">
                {pfResult.buses[bus.id]?.V.toFixed(4) || bus.V.toFixed(4)} pu
              </span>
            </div>
            <div>
              <span className="text-slate-500">{'\u03B8'}</span>
              <span className="font-mono text-orange-400 ml-1">
                {((pfResult.buses[bus.id]?.theta || 0) * 180 / Math.PI).toFixed(2)}&deg;
              </span>
            </div>
          </div>
        </div>
      ))}

      {/* Fault config */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 space-y-2">
        <h3 className="text-xs font-semibold text-slate-300">Fault Analysis</h3>
        <div>
          <label className="text-xs text-slate-400">Fault Bus</label>
          <select
            value={faultBus}
            onChange={(e) => setFaultBus(Number(e.target.value))}
            className="w-full mt-1 text-xs bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white"
          >
            {buses.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>
        <div className="text-xs text-slate-500 font-mono">
          3-phase bolted fault
        </div>
      </div>

      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 space-y-2">
        <h3 className="text-xs font-semibold text-slate-300">Status</h3>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-slate-400">Converged</span>
            <p className={`font-mono ${pfResult.converged ? 'text-emerald-400' : 'text-red-400'}`}>
              {pfResult.converged ? 'Yes' : 'No'}
            </p>
          </div>
          <div>
            <span className="text-slate-400">Iterations</span>
            <p className="font-mono text-cyan-400">{pfResult.iterations}</p>
          </div>
          <div>
            <span className="text-slate-400">Max Mismatch</span>
            <p className="font-mono text-orange-400">{pfResult.maxMismatch.toExponential(2)}</p>
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
      title="Power Grid Analyzer"
      description="Newton-Raphson AC power flow and fault analysis"
      domain="Earth & Geosciences"
      sidebar={sidebar}
    >
      {activeTab === 'grid' && (
        <GridDiagram
          buses={pfResult.buses}
          lines={lines}
          linePowers={pfResult.linePowers}
          syncValue={syncValue}
          elapsedTime={elapsedTime}
        />
      )}
      {activeTab === 'powerflow' && (
        <PowerFlowResults
          pfResult={pfResult}
          lines={lines}
          syncValue={syncValue}
        />
      )}
      {activeTab === 'faults' && (
        <GridMetrics
          pfResult={pfResult}
          faultResult={faultResult}
          lines={lines}
          syncValue={syncValue}
        />
      )}
    </AppPageLayout>
  );
};

export default PowerGridAnalyzer;
