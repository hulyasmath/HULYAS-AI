import React, { useMemo } from 'react';
import type { CycleState, CycleType } from './index';

interface PVDiagramProps {
  cycle: CycleState;
  cycleType: CycleType;
  elapsedTime: number;
  syncValue: number;
}

export const PVDiagram: React.FC<PVDiagramProps> = ({ cycle, cycleType, elapsedTime, syncValue }) => {
  const { points, processes } = cycle;

  const svgW = 600;
  const svgH = 400;
  const margin = { top: 30, right: 30, bottom: 50, left: 70 };
  const plotW = svgW - margin.left - margin.right;
  const plotH = svgH - margin.top - margin.bottom;

  const { minV, maxV, minP, maxP } = useMemo(() => {
    let minV = Infinity, maxV = -Infinity, minP = Infinity, maxP = -Infinity;
    for (const pt of points) {
      if (pt.V < minV) minV = pt.V;
      if (pt.V > maxV) maxV = pt.V;
      if (pt.P < minP) minP = pt.P;
      if (pt.P > maxP) maxP = pt.P;
    }
    const vPad = (maxV - minV) * 0.15 || 0.1;
    const pPad = (maxP - minP) * 0.15 || 100;
    return {
      minV: Math.max(0, minV - vPad),
      maxV: maxV + vPad,
      minP: Math.max(0, minP - pPad),
      maxP: maxP + pPad,
    };
  }, [points]);

  const scaleV = (v: number) => margin.left + ((v - minV) / (maxV - minV)) * plotW;
  const scaleP = (p: number) => margin.top + plotH - ((p - minP) / (maxP - minP)) * plotH;

  // Generate process paths with intermediate points
  const processPaths = useMemo(() => {
    const paths: { d: string; color: string; label: string }[] = [];
    const n = points.length;

    for (let i = 0; i < n; i++) {
      const p1 = points[i];
      const p2 = points[(i + 1) % n];
      const proc = processes[i];
      const pts: string[] = [];
      const steps = 40;

      for (let s = 0; s <= steps; s++) {
        const t = s / steps;
        let V: number, P: number;

        if (proc.type === 'isothermal') {
          V = p1.V + (p2.V - p1.V) * t;
          P = V > 0 ? (p1.P * p1.V) / V : p1.P;
        } else if (proc.type === 'adiabatic') {
          V = p1.V + (p2.V - p1.V) * t;
          const gamma = 1.4;
          P = V > 0 ? p1.P * Math.pow(p1.V / V, gamma) : p1.P;
        } else if (proc.type === 'isochoric') {
          V = p1.V;
          P = p1.P + (p2.P - p1.P) * t;
        } else if (proc.type === 'isobaric') {
          V = p1.V + (p2.V - p1.V) * t;
          P = p1.P;
        } else {
          V = p1.V + (p2.V - p1.V) * t;
          P = p1.P + (p2.P - p1.P) * t;
        }

        const sx = scaleV(V);
        const sy = scaleP(P);
        if (isFinite(sx) && isFinite(sy)) {
          pts.push(`${s === 0 ? 'M' : 'L'}${sx.toFixed(1)},${sy.toFixed(1)}`);
        }
      }

      paths.push({ d: pts.join(' '), color: proc.color, label: proc.label });
    }
    return paths;
  }, [points, processes, minV, maxV, minP, maxP]);

  // Animated working point
  const animatedPoint = useMemo(() => {
    const totalPerimeter = points.length;
    const phase = ((elapsedTime * 0.3) % totalPerimeter);
    const segIdx = Math.floor(phase) % points.length;
    const segT = phase - segIdx;
    const p1 = points[segIdx];
    const p2 = points[(segIdx + 1) % points.length];
    const proc = processes[segIdx];

    let V: number, P: number;
    if (proc.type === 'isothermal') {
      V = p1.V + (p2.V - p1.V) * segT;
      P = V > 0 ? (p1.P * p1.V) / V : p1.P;
    } else if (proc.type === 'adiabatic') {
      V = p1.V + (p2.V - p1.V) * segT;
      P = V > 0 ? p1.P * Math.pow(p1.V / V, 1.4) : p1.P;
    } else if (proc.type === 'isochoric') {
      V = p1.V;
      P = p1.P + (p2.P - p1.P) * segT;
    } else if (proc.type === 'isobaric') {
      V = p1.V + (p2.V - p1.V) * segT;
      P = p1.P;
    } else {
      V = p1.V + (p2.V - p1.V) * segT;
      P = p1.P + (p2.P - p1.P) * segT;
    }

    return { x: scaleV(V), y: scaleP(P) };
  }, [elapsedTime, points, processes, minV, maxV, minP, maxP]);

  // Axis ticks
  const vTicks = useMemo(() => {
    const ticks: number[] = [];
    const step = (maxV - minV) / 5;
    for (let i = 0; i <= 5; i++) ticks.push(minV + step * i);
    return ticks;
  }, [minV, maxV]);

  const pTicks = useMemo(() => {
    const ticks: number[] = [];
    const step = (maxP - minP) / 5;
    for (let i = 0; i <= 5; i++) ticks.push(minP + step * i);
    return ticks;
  }, [minP, maxP]);

  const formatNum = (n: number) => {
    if (Math.abs(n) >= 1e6) return (n / 1e6).toFixed(1) + 'M';
    if (Math.abs(n) >= 1e3) return (n / 1e3).toFixed(1) + 'k';
    return n.toFixed(2);
  };

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-slate-200 mb-3">P-V Diagram</h3>
      <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full" style={{ maxHeight: 420 }}>
        {/* Background */}
        <rect x={margin.left} y={margin.top} width={plotW} height={plotH}
          fill="rgba(15,23,42,0.5)" stroke="rgba(100,116,139,0.3)" />

        {/* Grid lines */}
        {vTicks.map((v, i) => (
          <line key={`vg${i}`} x1={scaleV(v)} y1={margin.top} x2={scaleV(v)} y2={margin.top + plotH}
            stroke="rgba(100,116,139,0.15)" strokeDasharray="3,3" />
        ))}
        {pTicks.map((p, i) => (
          <line key={`pg${i}`} x1={margin.left} y1={scaleP(p)} x2={margin.left + plotW} y2={scaleP(p)}
            stroke="rgba(100,116,139,0.15)" strokeDasharray="3,3" />
        ))}

        {/* Process paths */}
        {processPaths.map((p, i) => (
          <path key={i} d={p.d} fill="none" stroke={p.color} strokeWidth={2.5}
            strokeLinecap="round" strokeLinejoin="round" />
        ))}

        {/* State points */}
        {points.map((pt, i) => (
          <g key={i}>
            <circle cx={scaleV(pt.V)} cy={scaleP(pt.P)} r={5}
              fill="white" stroke="rgba(15,23,42,0.8)" strokeWidth={2} />
            <text x={scaleV(pt.V) + 8} y={scaleP(pt.P) - 8}
              fill="white" fontSize={11} fontWeight="bold" fontFamily="monospace">
              {i + 1}
            </text>
          </g>
        ))}

        {/* Animated working point */}
        {isFinite(animatedPoint.x) && isFinite(animatedPoint.y) && (
          <circle cx={animatedPoint.x} cy={animatedPoint.y} r={4}
            fill="#22d3ee" stroke="white" strokeWidth={1.5}>
            <animate attributeName="r" values="4;6;4" dur="0.777s" repeatCount="indefinite" />
          </circle>
        )}

        {/* Axes */}
        <line x1={margin.left} y1={margin.top + plotH} x2={margin.left + plotW} y2={margin.top + plotH}
          stroke="rgba(148,163,184,0.5)" strokeWidth={1} />
        <line x1={margin.left} y1={margin.top} x2={margin.left} y2={margin.top + plotH}
          stroke="rgba(148,163,184,0.5)" strokeWidth={1} />

        {/* X axis ticks & labels */}
        {vTicks.map((v, i) => (
          <g key={`xt${i}`}>
            <line x1={scaleV(v)} y1={margin.top + plotH} x2={scaleV(v)} y2={margin.top + plotH + 5}
              stroke="rgba(148,163,184,0.5)" />
            <text x={scaleV(v)} y={margin.top + plotH + 18}
              fill="rgba(148,163,184,0.7)" fontSize={10} textAnchor="middle" fontFamily="monospace">
              {formatNum(v)}
            </text>
          </g>
        ))}
        <text x={margin.left + plotW / 2} y={svgH - 8}
          fill="rgba(148,163,184,0.8)" fontSize={12} textAnchor="middle">
          Volume (V)
        </text>

        {/* Y axis ticks & labels */}
        {pTicks.map((p, i) => (
          <g key={`yt${i}`}>
            <line x1={margin.left - 5} y1={scaleP(p)} x2={margin.left} y2={scaleP(p)}
              stroke="rgba(148,163,184,0.5)" />
            <text x={margin.left - 8} y={scaleP(p) + 4}
              fill="rgba(148,163,184,0.7)" fontSize={10} textAnchor="end" fontFamily="monospace">
              {formatNum(p)}
            </text>
          </g>
        ))}
        <text x={15} y={margin.top + plotH / 2}
          fill="rgba(148,163,184,0.8)" fontSize={12} textAnchor="middle"
          transform={`rotate(-90, 15, ${margin.top + plotH / 2})`}>
          Pressure (P)
        </text>
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-3">
        {processes.map((p, i) => (
          <div key={i} className="flex items-center gap-1.5 text-xs text-slate-300">
            <div className="w-3 h-0.5 rounded" style={{ backgroundColor: p.color }} />
            {p.label}
          </div>
        ))}
      </div>
    </div>
  );
};
