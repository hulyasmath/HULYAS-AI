import React, { useMemo } from 'react';
import type { PKParams } from './index';
import { singleDoseConcentration } from './index';

interface Props {
  params: PKParams;
  elapsedTime: number;
  syncValue: number;
}

function safe(v: number): number {
  return Number.isFinite(v) ? v : 0;
}

const CompartmentView: React.FC<Props> = ({ params, elapsedTime, syncValue }) => {
  const { model, ke, ka, k12, k21, dose, vd } = params;
  const is2Comp = model === '2comp-iv';
  const isOral = model === '1comp-oral';

  // Animate: cycle through 0..20 hours in ~20s
  const animTime = (elapsedTime % 20);
  const currentConc = singleDoseConcentration(animTime, params);
  const maxConc = dose / vd;
  const concFrac = maxConc > 0 ? Math.min(currentConc / maxConc, 1) : 0;

  // Bi-exponential decay curve points for 2-comp
  const decayCurve = useMemo(() => {
    const pts: { x: number; y: number }[] = [];
    const nPts = 100;
    const tEnd = 20;
    let maxC = 0;
    for (let i = 0; i <= nPts; i++) {
      const t = (i / nPts) * tEnd;
      const c = singleDoseConcentration(t, params);
      if (c > maxC) maxC = c;
      pts.push({ x: t, y: c });
    }
    return { pts, maxC: maxC || 1 };
  }, [params]);

  // Flow animation
  const dashOffset = -elapsedTime * 30;

  return (
    <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-slate-200 mb-4">
        Compartment Model Diagram
        <span className="ml-2 text-xs text-slate-500 font-mono">t={animTime.toFixed(1)}h</span>
      </h3>

      <svg viewBox="0 0 700 400" className="w-full" style={{ maxHeight: 400 }}>
        <defs>
          <marker id="arrowCyan" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="#22d3ee" />
          </marker>
          <marker id="arrowOrange" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="#f97316" />
          </marker>
          <marker id="arrowRed" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="#ef4444" />
          </marker>
        </defs>

        {/* GI Tract (oral only) */}
        {isOral && (
          <g>
            <rect x={40} y={80} width={110} height={70} rx={12}
              fill="rgba(249,115,22,0.1)" stroke="#f97316" strokeWidth={1.5} />
            <text x={95} y={108} textAnchor="middle" fill="#f97316" fontSize={12} fontWeight="bold">GI Tract</text>
            <text x={95} y={128} textAnchor="middle" fill="#94a3b8" fontSize={10} className="font-mono">
              Gut
            </text>
            {/* Absorption arrow */}
            <line x1={150} y1={115} x2={228} y2={115}
              stroke="#f97316" strokeWidth={2} markerEnd="url(#arrowOrange)"
              strokeDasharray="6 4" strokeDashoffset={dashOffset} />
            <text x={190} y={105} textAnchor="middle" fill="#f97316" fontSize={10} className="font-mono">
              ka={ka.toFixed(2)}
            </text>
          </g>
        )}

        {/* Central Compartment */}
        <g>
          <rect x={240} y={60} width={160} height={110} rx={16}
            fill={`rgba(34,211,238,${0.05 + concFrac * 0.25})`}
            stroke="#22d3ee" strokeWidth={2} />
          <text x={320} y={92} textAnchor="middle" fill="#22d3ee" fontSize={13} fontWeight="bold">
            Central
          </text>
          <text x={320} y={112} textAnchor="middle" fill="#94a3b8" fontSize={10}>
            (Plasma)
          </text>
          <text x={320} y={135} textAnchor="middle" fill="#e2e8f0" fontSize={12} className="font-mono">
            C = {currentConc.toFixed(2)} mg/L
          </text>
          {/* Concentration fill bar */}
          <rect x={255} y={145} width={130} height={8} rx={4} fill="#1e293b" />
          <rect x={255} y={145} width={safe(130 * concFrac)} height={8} rx={4} fill="#22d3ee" opacity={0.7} />
        </g>

        {/* Peripheral Compartment (2-comp only) */}
        {is2Comp && (
          <g>
            <rect x={500} y={60} width={150} height={110} rx={16}
              fill="rgba(168,85,247,0.08)" stroke="#a855f7" strokeWidth={1.5} />
            <text x={575} y={92} textAnchor="middle" fill="#a855f7" fontSize={13} fontWeight="bold">
              Peripheral
            </text>
            <text x={575} y={112} textAnchor="middle" fill="#94a3b8" fontSize={10}>
              (Tissue)
            </text>

            {/* k12 arrow */}
            <line x1={400} y1={95} x2={498} y2={95}
              stroke="#22d3ee" strokeWidth={1.5} markerEnd="url(#arrowCyan)"
              strokeDasharray="6 4" strokeDashoffset={dashOffset} />
            <text x={450} y={88} textAnchor="middle" fill="#22d3ee" fontSize={10} className="font-mono">
              k12={k12.toFixed(2)}
            </text>

            {/* k21 arrow */}
            <line x1={498} y1={140} x2={400} y2={140}
              stroke="#a855f7" strokeWidth={1.5} markerEnd="url(#arrowCyan)"
              strokeDasharray="6 4" strokeDashoffset={-dashOffset} />
            <text x={450} y={158} textAnchor="middle" fill="#a855f7" fontSize={10} className="font-mono">
              k21={k21.toFixed(2)}
            </text>
          </g>
        )}

        {/* Elimination arrow */}
        <line x1={320} y1={170} x2={320} y2={240}
          stroke="#ef4444" strokeWidth={2} markerEnd="url(#arrowRed)"
          strokeDasharray="6 4" strokeDashoffset={dashOffset} />
        <text x={340} y={210} fill="#ef4444" fontSize={10} className="font-mono">
          ke={ke.toFixed(3)}
        </text>

        {/* Elimination box */}
        <rect x={270} y={245} width={100} height={40} rx={8}
          fill="rgba(239,68,68,0.08)" stroke="#ef4444" strokeWidth={1} />
        <text x={320} y={270} textAnchor="middle" fill="#ef4444" fontSize={11}>
          Elimination
        </text>

        {/* Decay curve (below) */}
        <g transform="translate(40,310)">
          <text x={0} y={-5} fill="#94a3b8" fontSize={10}>Concentration Decay</text>
          <rect x={0} y={0} width={620} height={70} rx={4} fill="#0f172a" stroke="#334155" strokeWidth={0.5} />
          <polyline
            points={decayCurve.pts
              .map((p) => `${(p.x / 20) * 620},${70 - (p.y / decayCurve.maxC) * 65}`)
              .join(' ')}
            fill="none" stroke="#22d3ee" strokeWidth={1.5}
          />
          {/* Current time marker */}
          <line
            x1={(animTime / 20) * 620} y1={0}
            x2={(animTime / 20) * 620} y2={70}
            stroke="#f97316" strokeWidth={1} strokeDasharray="3 3"
          />
        </g>

        {/* Sync pulse indicator */}
        <circle cx={670} cy={20} r={6}
          fill={syncValue > 0 ? '#22d3ee' : '#1e293b'}
          stroke="#22d3ee" strokeWidth={1} />
      </svg>
    </div>
  );
};

export default CompartmentView;
