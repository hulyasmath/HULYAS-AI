import React, { useMemo } from 'react';
import { getJointAngles, getGRF, getJointMoments, type BiomechParams } from './index';

interface Props {
  params: BiomechParams;
  animatedPhase: number;
  elapsedTime: number;
}

const G = 9.81;
const DEG = Math.PI / 180;

const SkeletonView: React.FC<Props> = ({ params, animatedPhase, elapsedTime }) => {
  const phase = params.gaitPhase;
  const angles = getJointAngles(phase);
  const grf = getGRF(phase, params.mass * G);
  const moments = getJointMoments(phase, params.mass, params.height);

  // Segment lengths in SVG units (scaled)
  const scale = 180;
  const thighL = 0.245 * params.height * scale;
  const shankL = 0.246 * params.height * scale;
  const footL = 0.152 * params.height * scale;

  // Compute joint positions (2D stick figure)
  const hipPos = { x: 250, y: 100 };

  const kneePos = useMemo(() => {
    const angle = (angles.hip - 90) * DEG; // Convert to SVG coordinate
    return {
      x: hipPos.x + thighL * Math.sin(angle),
      y: hipPos.y + thighL * Math.cos(angle),
    };
  }, [angles.hip, thighL]);

  const anklePos = useMemo(() => {
    const angle = (angles.hip + angles.knee - 90) * DEG;
    return {
      x: kneePos.x + shankL * Math.sin(angle),
      y: kneePos.y + shankL * Math.cos(angle),
    };
  }, [angles, kneePos, shankL]);

  const toePos = useMemo(() => {
    const angle = (angles.hip + angles.knee + angles.ankle) * DEG;
    return {
      x: anklePos.x + footL * Math.cos(angle),
      y: anklePos.y + footL * Math.sin(angle) * 0.3 + footL * 0.7,
    };
  }, [angles, anklePos, footL]);

  // Ground level
  const groundY = Math.max(anklePos.y + 20, toePos.y + 10, 340);

  // GRF vector (scaled)
  const grfScale = 0.15;
  const grfVectorLen = grf.fz * grfScale;

  // Torso and head
  const torsoTop = { x: hipPos.x, y: hipPos.y - thighL * 0.7 };
  const headCenter = { x: torsoTop.x, y: torsoTop.y - 18 };

  // Moment indicator size
  const momentScale = 0.003;

  // Walking animation offset
  const walkOffset = (animatedPhase / 100) * 100 - 50;

  return (
    <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-200">
          2D Stick Figure - Gait Cycle
        </h3>
        <span className="text-xs text-slate-500 font-mono">
          Phase: {phase.toFixed(0)}% | {phase <= 60 ? 'Stance' : 'Swing'}
        </span>
      </div>

      <svg viewBox="0 0 500 420" className="w-full" style={{ maxHeight: 420 }}>
        <defs>
          <marker id="grfArrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="#22c55e" />
          </marker>
        </defs>

        {/* Background */}
        <rect width="500" height="420" fill="#0f172a" rx={8} />

        {/* Ground */}
        <line x1={0} y1={groundY} x2={500} y2={groundY}
          stroke="#475569" strokeWidth={2} />
        {/* Ground hash marks */}
        {Array.from({ length: 25 }).map((_, i) => (
          <line key={`g-${i}`}
            x1={i * 20} y1={groundY}
            x2={i * 20 + 10} y2={groundY + 8}
            stroke="#334155" strokeWidth={1} />
        ))}

        {/* Torso */}
        <line x1={hipPos.x} y1={hipPos.y} x2={torsoTop.x} y2={torsoTop.y}
          stroke="#94a3b8" strokeWidth={4} strokeLinecap="round" />

        {/* Head */}
        <circle cx={headCenter.x} cy={headCenter.y} r={12}
          fill="none" stroke="#94a3b8" strokeWidth={3} />

        {/* Thigh */}
        <line x1={hipPos.x} y1={hipPos.y} x2={kneePos.x} y2={kneePos.y}
          stroke="#22d3ee" strokeWidth={5} strokeLinecap="round" />

        {/* Shank */}
        <line x1={kneePos.x} y1={kneePos.y} x2={anklePos.x} y2={anklePos.y}
          stroke="#f97316" strokeWidth={5} strokeLinecap="round" />

        {/* Foot */}
        <line x1={anklePos.x} y1={anklePos.y} x2={toePos.x} y2={toePos.y}
          stroke="#a855f7" strokeWidth={4} strokeLinecap="round" />

        {/* Joint circles */}
        <circle cx={hipPos.x} cy={hipPos.y} r={6}
          fill="#1e293b" stroke="#22d3ee" strokeWidth={2} />
        <circle cx={kneePos.x} cy={kneePos.y} r={5}
          fill="#1e293b" stroke="#f97316" strokeWidth={2} />
        <circle cx={anklePos.x} cy={anklePos.y} r={5}
          fill="#1e293b" stroke="#a855f7" strokeWidth={2} />

        {/* Joint labels */}
        <text x={hipPos.x + 12} y={hipPos.y - 8} fill="#22d3ee" fontSize={10} className="font-mono">
          Hip {angles.hip.toFixed(1)}&deg;
        </text>
        <text x={kneePos.x + 12} y={kneePos.y - 8} fill="#f97316" fontSize={10} className="font-mono">
          Knee {angles.knee.toFixed(1)}&deg;
        </text>
        <text x={anklePos.x + 12} y={anklePos.y - 8} fill="#a855f7" fontSize={10} className="font-mono">
          Ankle {angles.ankle.toFixed(1)}&deg;
        </text>

        {/* GRF vector (during stance phase) */}
        {phase <= 60 && grf.fz > 0 && (
          <g>
            <line
              x1={anklePos.x} y1={groundY}
              x2={anklePos.x - grf.fx * grfScale} y2={groundY - grfVectorLen}
              stroke="#22c55e" strokeWidth={3} markerEnd="url(#grfArrow)"
            />
            <text x={anklePos.x + 15} y={groundY - grfVectorLen / 2}
              fill="#22c55e" fontSize={9} className="font-mono">
              GRF={grf.fz.toFixed(0)}N
            </text>
          </g>
        )}

        {/* Joint moment indicators (arcs) */}
        {[
          { pos: hipPos, moment: moments.hip, color: '#22d3ee', label: 'Hip' },
          { pos: kneePos, moment: moments.knee, color: '#f97316', label: 'Knee' },
          { pos: anklePos, moment: moments.ankle, color: '#a855f7', label: 'Ankle' },
        ].map(({ pos, moment, color, label }) => {
          const radius = 15;
          const arcAngle = Math.min(Math.abs(moment * momentScale), Math.PI);
          const dir = moment >= 0 ? 1 : -1;
          const endX = pos.x + radius * Math.cos(dir * arcAngle);
          const endY = pos.y - radius * Math.sin(dir * arcAngle);
          const largeArc = arcAngle > Math.PI / 2 ? 1 : 0;

          return (
            <g key={label}>
              <path
                d={`M ${pos.x + radius} ${pos.y} A ${radius} ${radius} 0 ${largeArc} ${dir > 0 ? 0 : 1} ${endX} ${endY}`}
                fill="none" stroke={color} strokeWidth={1.5} opacity={0.6}
                strokeDasharray="3 2"
              />
            </g>
          );
        })}

        {/* Phase indicator bar */}
        <rect x={20} y={395} width={460} height={8} rx={4} fill="#1e293b" />
        <rect x={20} y={395} width={460 * (phase / 100)} height={8} rx={4}
          fill={phase <= 60 ? '#22d3ee' : '#f97316'} opacity={0.8} />
        {/* Stance/Swing divider */}
        <line x1={20 + 460 * 0.6} y1={392} x2={20 + 460 * 0.6} y2={406}
          stroke="#64748b" strokeWidth={1} strokeDasharray="2 2" />
        <text x={20 + 460 * 0.3} y={390} textAnchor="middle" fill="#94a3b8" fontSize={8}>
          Stance (0-60%)
        </text>
        <text x={20 + 460 * 0.8} y={390} textAnchor="middle" fill="#94a3b8" fontSize={8}>
          Swing (60-100%)
        </text>

        {/* Animated phase marker */}
        <circle cx={20 + 460 * (animatedPhase / 100)} cy={399}
          r={4} fill="#fff" stroke="#22d3ee" strokeWidth={1.5} />

        {/* Sync pulse */}
        <circle cx={480} cy={15} r={5}
          fill={Math.sin(elapsedTime * 8) > 0 ? '#22d3ee' : '#1e293b'}
          stroke="#22d3ee" strokeWidth={1} />
      </svg>
    </div>
  );
};

export default SkeletonView;
