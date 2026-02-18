import React, { useMemo } from 'react';
import type { CycleState, CycleType } from './index';

interface TSDiagramProps {
  cycle: CycleState;
  cycleType: CycleType;
  elapsedTime: number;
}

export const TSDiagram: React.FC<TSDiagramProps> = ({ cycle, cycleType, elapsedTime }) => {
  const { points, processes } = cycle;

  const svgW = 600;
  const svgH = 400;
  const margin = { top: 30, right: 30, bottom: 50, left: 70 };
  const plotW = svgW - margin.left - margin.right;
  const plotH = svgH - margin.top - margin.bottom;

  const { minS, maxS, minT, maxT } = useMemo(() => {
    let minS = Infinity, maxS = -Infinity, minT = Infinity, maxT = -Infinity;
    for (const pt of points) {
      if (pt.S < minS) minS = pt.S;
      if (pt.S > maxS) maxS = pt.S;
      if (pt.T < minT) minT = pt.T;
      if (pt.T > maxT) maxT = pt.T;
    }
    const sPad = (maxS - minS) * 0.15 || 10;
    const tPad = (maxT - minT) * 0.15 || 20;
    return { minS: minS - sPad, maxS: maxS + sPad, minT: Math.max(0, minT - tPad), maxT: maxT + tPad };
  }, [points]);

  const scaleS = (s: number) => margin.left + ((s - minS) / (maxS - minS)) * plotW;
  const scaleT = (t: number) => margin.top + plotH - ((t - minT) / (maxT - minT)) * plotH;

  // Process paths in T-S space
  const processPaths = useMemo(() => {
    const paths: { d: string; color: string }[] = [];
    const n = points.length;

    for (let i = 0; i < n; i++) {
      const p1 = points[i];
      const p2 = points[(i + 1) % n];
      const proc = processes[i];
      const pts: string[] = [];
      const steps = 40;

      for (let s = 0; s <= steps; s++) {
        const t = s / steps;
        let S: number, T: number;

        if (proc.type === 'adiabatic') {
          // Isentropic: S = const, T changes
          S = p1.S;
          T = p1.T + (p2.T - p1.T) * t;
        } else if (proc.type === 'isothermal') {
          // T = const, S changes
          S = p1.S + (p2.S - p1.S) * t;
          T = p1.T;
        } else if (proc.type === 'isochoric') {
          // T and S both change (curve)
          T = p1.T + (p2.T - p1.T) * t;
          S = p1.S + (p2.S - p1.S) * t;
        } else if (proc.type === 'isobaric') {
          // T and S both change
          T = p1.T + (p2.T - p1.T) * t;
          S = p1.S + (p2.S - p1.S) * t;
        } else {
          T = p1.T + (p2.T - p1.T) * t;
          S = p1.S + (p2.S - p1.S) * t;
        }

        const sx = scaleS(S);
        const sy = scaleT(T);
        if (isFinite(sx) && isFinite(sy)) {
          pts.push(`${s === 0 ? 'M' : 'L'}${sx.toFixed(1)},${sy.toFixed(1)}`);
        }
      }

      paths.push({ d: pts.join(' '), color: proc.color });
    }
    return paths;
  }, [points, processes, minS, maxS, minT, maxT]);

  // Heat transfer area (fill under curve for heat input processes)
  const fillPath = useMemo(() => {
    const allPts: [number, number][] = [];
    const n = points.length;
    for (let i = 0; i < n; i++) {
      const p1 = points[i];
      const p2 = points[(i + 1) % n];
      const proc = processes[i];
      const steps = 40;

      for (let s = 0; s <= steps; s++) {
        const t = s / steps;
        let S: number, T: number;

        if (proc.type === 'adiabatic') {
          S = p1.S;
          T = p1.T + (p2.T - p1.T) * t;
        } else if (proc.type === 'isothermal') {
          S = p1.S + (p2.S - p1.S) * t;
          T = p1.T;
        } else {
          T = p1.T + (p2.T - p1.T) * t;
          S = p1.S + (p2.S - p1.S) * t;
        }

        if (isFinite(scaleS(S)) && isFinite(scaleT(T))) {
          allPts.push([scaleS(S), scaleT(T)]);
        }
      }
    }

    if (allPts.length < 3) return '';
    let d = `M${allPts[0][0].toFixed(1)},${allPts[0][1].toFixed(1)}`;
    for (let i = 1; i < allPts.length; i++) {
      d += ` L${allPts[i][0].toFixed(1)},${allPts[i][1].toFixed(1)}`;
    }
    d += ' Z';
    return d;
  }, [points, processes, minS, maxS, minT, maxT]);

  // Axis ticks
  const sTicks = useMemo(() => {
    const ticks: number[] = [];
    const step = (maxS - minS) / 5;
    for (let i = 0; i <= 5; i++) ticks.push(minS + step * i);
    return ticks;
  }, [minS, maxS]);

  const tTicks = useMemo(() => {
    const ticks: number[] = [];
    const step = (maxT - minT) / 5;
    for (let i = 0; i <= 5; i++) ticks.push(minT + step * i);
    return ticks;
  }, [minT, maxT]);

  const formatNum = (n: number) => {
    if (Math.abs(n) >= 1e6) return (n / 1e6).toFixed(1) + 'M';
    if (Math.abs(n) >= 1e3) return (n / 1e3).toFixed(1) + 'k';
    return n.toFixed(1);
  };

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-slate-200 mb-3">T-S Diagram</h3>
      <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full" style={{ maxHeight: 420 }}>
        {/* Background */}
        <rect x={margin.left} y={margin.top} width={plotW} height={plotH}
          fill="rgba(15,23,42,0.5)" stroke="rgba(100,116,139,0.3)" />

        {/* Grid */}
        {sTicks.map((s, i) => (
          <line key={`sg${i}`} x1={scaleS(s)} y1={margin.top} x2={scaleS(s)} y2={margin.top + plotH}
            stroke="rgba(100,116,139,0.15)" strokeDasharray="3,3" />
        ))}
        {tTicks.map((t, i) => (
          <line key={`tg${i}`} x1={margin.left} y1={scaleT(t)} x2={margin.left + plotW} y2={scaleT(t)}
            stroke="rgba(100,116,139,0.15)" strokeDasharray="3,3" />
        ))}

        {/* Heat transfer area fill */}
        {fillPath && (
          <path d={fillPath} fill="rgba(251,146,60,0.1)" stroke="none" />
        )}

        {/* Process paths */}
        {processPaths.map((p, i) => (
          <path key={i} d={p.d} fill="none" stroke={p.color} strokeWidth={2.5}
            strokeLinecap="round" strokeLinejoin="round" />
        ))}

        {/* State points */}
        {points.map((pt, i) => (
          <g key={i}>
            <circle cx={scaleS(pt.S)} cy={scaleT(pt.T)} r={5}
              fill="white" stroke="rgba(15,23,42,0.8)" strokeWidth={2} />
            <text x={scaleS(pt.S) + 8} y={scaleT(pt.T) - 8}
              fill="white" fontSize={11} fontWeight="bold" fontFamily="monospace">
              {i + 1}
            </text>
          </g>
        ))}

        {/* Efficiency annotation */}
        <text x={margin.left + plotW / 2} y={margin.top + 20}
          fill="rgba(251,146,60,0.8)" fontSize={12} textAnchor="middle" fontFamily="monospace">
          eta = {(cycle.efficiency * 100).toFixed(2)}% (shaded area = net work)
        </text>

        {/* Axes */}
        <line x1={margin.left} y1={margin.top + plotH} x2={margin.left + plotW} y2={margin.top + plotH}
          stroke="rgba(148,163,184,0.5)" strokeWidth={1} />
        <line x1={margin.left} y1={margin.top} x2={margin.left} y2={margin.top + plotH}
          stroke="rgba(148,163,184,0.5)" strokeWidth={1} />

        {/* X axis */}
        {sTicks.map((s, i) => (
          <g key={`xt${i}`}>
            <line x1={scaleS(s)} y1={margin.top + plotH} x2={scaleS(s)} y2={margin.top + plotH + 5}
              stroke="rgba(148,163,184,0.5)" />
            <text x={scaleS(s)} y={margin.top + plotH + 18}
              fill="rgba(148,163,184,0.7)" fontSize={10} textAnchor="middle" fontFamily="monospace">
              {formatNum(s)}
            </text>
          </g>
        ))}
        <text x={margin.left + plotW / 2} y={svgH - 8}
          fill="rgba(148,163,184,0.8)" fontSize={12} textAnchor="middle">
          Entropy (S)
        </text>

        {/* Y axis */}
        {tTicks.map((t, i) => (
          <g key={`yt${i}`}>
            <line x1={margin.left - 5} y1={scaleT(t)} x2={margin.left} y2={scaleT(t)}
              stroke="rgba(148,163,184,0.5)" />
            <text x={margin.left - 8} y={scaleT(t) + 4}
              fill="rgba(148,163,184,0.7)" fontSize={10} textAnchor="end" fontFamily="monospace">
              {formatNum(t)}
            </text>
          </g>
        ))}
        <text x={15} y={margin.top + plotH / 2}
          fill="rgba(148,163,184,0.8)" fontSize={12} textAnchor="middle"
          transform={`rotate(-90, 15, ${margin.top + plotH / 2})`}>
          Temperature (K)
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
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <div className="w-3 h-3 rounded bg-orange-400/10 border border-orange-400/30" />
          Net work (enclosed area)
        </div>
      </div>
    </div>
  );
};
