import React, { useRef, useEffect, useMemo } from 'react';

interface SuspensionChartProps {
  sprungMass: number;     // kg
  unsprungMass: number;   // kg
  springRate: number;     // N/m
  dampingCoeff: number;   // Ns/m
  tireStiffness: number;  // N/m
  elapsedTime: number;
}

interface RK4State {
  zs: number;   // sprung displacement
  vzs: number;  // sprung velocity
  zu: number;   // unsprung displacement
  vzu: number;  // unsprung velocity
}

/**
 * RK4 quarter-car suspension ODE solver
 * ms*zs'' + cs*(zs'-zu') + ks*(zs-zu) = 0
 * mu*zu'' - cs*(zs'-zu') - ks*(zs-zu) + kt*(zu-zr) = 0
 */
function quarterCarDerivatives(
  state: RK4State,
  t: number,
  ms: number,
  mu: number,
  ks: number,
  cs: number,
  kt: number,
): RK4State {
  const { zs, vzs, zu, vzu } = state;

  // Road input: bump at t~0.5s
  const zr = t > 0.5 && t < 0.6 ? 0.05 : 0;

  const springForce = ks * (zs - zu);
  const damperForce = cs * (vzs - vzu);
  const tireForce = kt * (zu - zr);

  const azs = ms > 0 ? (-springForce - damperForce) / ms : 0;
  const azu = mu > 0 ? (springForce + damperForce - tireForce) / mu : 0;

  return {
    zs: vzs,
    vzs: isFinite(azs) ? azs : 0,
    zu: vzu,
    vzu: isFinite(azu) ? azu : 0,
  };
}

function rk4Step(
  state: RK4State,
  t: number,
  dt: number,
  ms: number,
  mu: number,
  ks: number,
  cs: number,
  kt: number,
): RK4State {
  const add = (a: RK4State, b: RK4State, s: number): RK4State => ({
    zs: a.zs + b.zs * s,
    vzs: a.vzs + b.vzs * s,
    zu: a.zu + b.zu * s,
    vzu: a.vzu + b.vzu * s,
  });

  const k1 = quarterCarDerivatives(state, t, ms, mu, ks, cs, kt);
  const k2 = quarterCarDerivatives(add(state, k1, dt / 2), t + dt / 2, ms, mu, ks, cs, kt);
  const k3 = quarterCarDerivatives(add(state, k2, dt / 2), t + dt / 2, ms, mu, ks, cs, kt);
  const k4 = quarterCarDerivatives(add(state, k3, dt), t + dt, ms, mu, ks, cs, kt);

  return {
    zs: state.zs + (dt / 6) * (k1.zs + 2 * k2.zs + 2 * k3.zs + k4.zs),
    vzs: state.vzs + (dt / 6) * (k1.vzs + 2 * k2.vzs + 2 * k3.vzs + k4.vzs),
    zu: state.zu + (dt / 6) * (k1.zu + 2 * k2.zu + 2 * k3.zu + k4.zu),
    vzu: state.vzu + (dt / 6) * (k1.vzu + 2 * k2.vzu + 2 * k3.vzu + k4.vzu),
  };
}

export const SuspensionChart: React.FC<SuspensionChartProps> = ({
  sprungMass,
  unsprungMass,
  springRate,
  dampingCoeff,
  tireStiffness,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Simulate 3 seconds of response
  const simData = useMemo(() => {
    const dt = 0.001;
    const totalTime = 3.0;
    const steps = Math.floor(totalTime / dt);
    let state: RK4State = { zs: 0, vzs: 0, zu: 0, vzu: 0 };
    const sprungDisp: number[] = [];
    const unsprungDisp: number[] = [];
    const timePoints: number[] = [];

    const sampleRate = 10; // store every 10th point
    for (let i = 0; i <= steps; i++) {
      const t = i * dt;
      if (i % sampleRate === 0) {
        timePoints.push(t);
        sprungDisp.push(isFinite(state.zs) ? state.zs : 0);
        unsprungDisp.push(isFinite(state.zu) ? state.zu : 0);
      }
      state = rk4Step(state, t, dt, sprungMass, unsprungMass, springRate, dampingCoeff, tireStiffness);
    }
    return { timePoints, sprungDisp, unsprungDisp };
  }, [sprungMass, unsprungMass, springRate, dampingCoeff, tireStiffness]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    const pad = { top: 30, right: 20, bottom: 40, left: 60 };
    const plotW = w - pad.left - pad.right;
    const plotH = h - pad.top - pad.bottom;

    // Clear
    ctx.fillStyle = 'rgba(15,23,42,0.8)';
    ctx.fillRect(0, 0, w, h);

    // Find y range
    const allVals = [...simData.sprungDisp, ...simData.unsprungDisp];
    let yMin = Math.min(...allVals) * 1.2;
    let yMax = Math.max(...allVals) * 1.2;
    if (Math.abs(yMax - yMin) < 0.001) {
      yMin = -0.01;
      yMax = 0.01;
    }

    const xMin = 0;
    const xMax = simData.timePoints[simData.timePoints.length - 1] || 3;

    const toX = (t: number) => pad.left + ((t - xMin) / (xMax - xMin)) * plotW;
    const toY = (v: number) => pad.top + (1 - (v - yMin) / (yMax - yMin)) * plotH;

    // Grid
    ctx.strokeStyle = 'rgba(148,163,184,0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 6; i++) {
      const y = pad.top + (i / 6) * plotH;
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(pad.left + plotW, y);
      ctx.stroke();
    }
    for (let i = 0; i <= 6; i++) {
      const x = pad.left + (i / 6) * plotW;
      ctx.beginPath();
      ctx.moveTo(x, pad.top);
      ctx.lineTo(x, pad.top + plotH);
      ctx.stroke();
    }

    // Zero line
    const zeroY = toY(0);
    ctx.strokeStyle = 'rgba(148,163,184,0.3)';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(pad.left, zeroY);
    ctx.lineTo(pad.left + plotW, zeroY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Plot sprung mass
    ctx.strokeStyle = 'rgba(34,211,238,0.9)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < simData.timePoints.length; i++) {
      const x = toX(simData.timePoints[i]);
      const y = toY(simData.sprungDisp[i]);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Plot unsprung mass
    ctx.strokeStyle = 'rgba(251,146,60,0.9)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < simData.timePoints.length; i++) {
      const x = toX(simData.timePoints[i]);
      const y = toY(simData.unsprungDisp[i]);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Axes labels
    ctx.fillStyle = 'rgba(148,163,184,0.6)';
    ctx.font = '11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Time (s)', w / 2, h - 5);

    ctx.save();
    ctx.translate(12, h / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Displacement (m)', 0, 0);
    ctx.restore();

    // Tick labels
    ctx.textAlign = 'center';
    for (let i = 0; i <= 6; i++) {
      const t = xMin + (i / 6) * (xMax - xMin);
      ctx.fillText(t.toFixed(1), toX(t), pad.top + plotH + 18);
    }
    ctx.textAlign = 'right';
    for (let i = 0; i <= 6; i++) {
      const v = yMin + (i / 6) * (yMax - yMin);
      ctx.fillText(v.toFixed(3), pad.left - 5, toY(v) + 4);
    }

    // Legend
    ctx.fillStyle = 'rgba(34,211,238,0.9)';
    ctx.fillRect(pad.left + 10, pad.top + 5, 12, 3);
    ctx.fillStyle = 'rgba(148,163,184,0.7)';
    ctx.textAlign = 'left';
    ctx.fillText('Sprung mass', pad.left + 26, pad.top + 10);

    ctx.fillStyle = 'rgba(251,146,60,0.9)';
    ctx.fillRect(pad.left + 10, pad.top + 20, 12, 3);
    ctx.fillStyle = 'rgba(148,163,184,0.7)';
    ctx.fillText('Unsprung mass', pad.left + 26, pad.top + 25);

    // Title
    ctx.fillStyle = 'rgba(226,232,240,0.8)';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'right';
    ctx.fillText('RK4 Quarter-Car Suspension Response', w - pad.right, pad.top - 10);
  }, [simData]);

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
      <h3 className="text-sm font-medium text-slate-200 mb-3">Suspension Response (Bump Input at t=0.5s)</h3>
      <canvas
        ref={canvasRef}
        className="w-full rounded"
        style={{ height: 350 }}
      />
    </div>
  );
};
