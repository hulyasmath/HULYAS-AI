import React, { useMemo } from 'react';
import { useZeqSync } from '../SimulationVisualizer/useZeqSync';
import { JointAngles, LinkLengths, getJointPositions, KinematicsMode } from './KinematicsSolver';

interface RobotArm2DProps {
  angles: JointAngles;
  links: LinkLengths;
  mode: KinematicsMode;
  targetX: number;
  targetY: number;
}

export const RobotArm2D: React.FC<RobotArm2DProps> = ({
  angles,
  links,
  mode,
  targetX,
  targetY,
}) => {
  const { syncValue } = useZeqSync({ amplitude: 0.02 });

  const svgW = 600;
  const svgH = 500;
  const centerX = svgW / 2;
  const centerY = svgH / 2 + 40;
  const scale = 60; // pixels per unit length

  // Subtle joint oscillation from sync
  const animatedAngles: JointAngles = {
    theta1: angles.theta1 + syncValue * 2,
    theta2: angles.theta2 + syncValue * 1.5,
    theta3: angles.theta3 + syncValue * 1,
  };

  const joints = useMemo(
    () => getJointPositions(animatedAngles, links),
    [animatedAngles, links]
  );

  // Transform robot coords to SVG coords (flip Y for screen)
  const toSvg = (pt: { x: number; y: number }) => ({
    x: centerX + pt.x * scale,
    y: centerY - pt.y * scale,
  });

  const svgJoints = joints.map(toSvg);

  // Workspace boundary (max reach circle)
  const maxReach = links.L1 + links.L2 + links.L3;
  const workspaceRadius = maxReach * scale;

  // Grid
  const gridSize = scale;
  const gridCount = Math.ceil(Math.max(svgW, svgH) / gridSize / 2);

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-slate-200 mb-3">2D Robot Arm</h3>
      <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full bg-slate-900 rounded-lg">
        {/* Grid */}
        {Array.from({ length: gridCount * 2 + 1 }, (_, i) => {
          const offset = (i - gridCount) * gridSize;
          return (
            <React.Fragment key={`grid-${i}`}>
              <line
                x1={centerX + offset}
                y1={0}
                x2={centerX + offset}
                y2={svgH}
                stroke="#1e293b"
                strokeWidth={offset === 0 ? 1 : 0.5}
              />
              <line
                x1={0}
                y1={centerY + offset}
                x2={svgW}
                y2={centerY + offset}
                stroke="#1e293b"
                strokeWidth={offset === 0 ? 1 : 0.5}
              />
            </React.Fragment>
          );
        })}

        {/* Axes */}
        <line x1={0} y1={centerY} x2={svgW} y2={centerY} stroke="#334155" strokeWidth={1} />
        <line x1={centerX} y1={0} x2={centerX} y2={svgH} stroke="#334155" strokeWidth={1} />
        <text x={svgW - 15} y={centerY - 8} fontSize={10} className="fill-slate-500">X</text>
        <text x={centerX + 8} y={15} fontSize={10} className="fill-slate-500">Y</text>

        {/* Workspace boundary */}
        <circle
          cx={centerX}
          cy={centerY}
          r={workspaceRadius}
          fill="none"
          stroke="#334155"
          strokeWidth={1}
          strokeDasharray="6,4"
          opacity={0.5}
        />
        <text
          x={centerX + workspaceRadius + 5}
          y={centerY - 5}
          fontSize={9}
          className="fill-slate-500"
        >
          reach={maxReach.toFixed(1)}
        </text>

        {/* Target position marker (IK mode) */}
        {mode === 'inverse' && (
          <g>
            <circle
              cx={centerX + targetX * scale}
              cy={centerY - targetY * scale}
              r={8}
              fill="none"
              stroke="#f97316"
              strokeWidth={2}
              strokeDasharray="3,3"
            />
            <line
              x1={centerX + targetX * scale - 5}
              y1={centerY - targetY * scale}
              x2={centerX + targetX * scale + 5}
              y2={centerY - targetY * scale}
              stroke="#f97316"
              strokeWidth={1.5}
            />
            <line
              x1={centerX + targetX * scale}
              y1={centerY - targetY * scale - 5}
              x2={centerX + targetX * scale}
              y2={centerY - targetY * scale + 5}
              stroke="#f97316"
              strokeWidth={1.5}
            />
            <text
              x={centerX + targetX * scale + 12}
              y={centerY - targetY * scale - 5}
              fontSize={9}
              className="fill-orange-400 font-mono"
            >
              target
            </text>
          </g>
        )}

        {/* Robot arm links */}
        {svgJoints.slice(0, -1).map((j, i) => {
          const next = svgJoints[i + 1];
          const colors = ['#22d3ee', '#3b82f6', '#8b5cf6'];
          return (
            <line
              key={`link-${i}`}
              x1={j.x}
              y1={j.y}
              x2={next.x}
              y2={next.y}
              stroke={colors[i]}
              strokeWidth={6}
              strokeLinecap="round"
              opacity={0.9}
            />
          );
        })}

        {/* Joint circles */}
        {svgJoints.map((j, i) => {
          const isBase = i === 0;
          const isEnd = i === svgJoints.length - 1;
          return (
            <g key={`joint-${i}`}>
              {/* Joint glow */}
              <circle
                cx={j.x}
                cy={j.y}
                r={isBase ? 10 : isEnd ? 8 : 7}
                fill={isBase ? '#1e293b' : isEnd ? '#f97316' : '#0f172a'}
                stroke={isBase ? '#64748b' : isEnd ? '#f97316' : '#22d3ee'}
                strokeWidth={2}
              />
              {/* Joint label */}
              <text
                x={j.x + (isEnd ? 12 : -12)}
                y={j.y - 12}
                fontSize={9}
                textAnchor={isEnd ? 'start' : 'end'}
                className={`font-mono ${isEnd ? 'fill-orange-400' : 'fill-cyan-400'}`}
              >
                {isBase ? 'Base' : isEnd ? 'EE' : `J${i}`}
              </text>
            </g>
          );
        })}

        {/* End effector coordinates */}
        {svgJoints.length > 0 && (
          <text
            x={svgJoints[svgJoints.length - 1].x + 14}
            y={svgJoints[svgJoints.length - 1].y + 14}
            fontSize={10}
            className="fill-slate-400 font-mono"
          >
            ({joints[joints.length - 1].x.toFixed(2)}, {joints[joints.length - 1].y.toFixed(2)})
          </text>
        )}

        {/* Base mount */}
        <rect
          x={centerX - 20}
          y={centerY + 10}
          width={40}
          height={8}
          rx={2}
          fill="#334155"
          stroke="#475569"
          strokeWidth={1}
        />
        {/* Base hatching */}
        {[-15, -5, 5, 15].map(offset => (
          <line
            key={`hatch-${offset}`}
            x1={centerX + offset - 3}
            y1={centerY + 22}
            x2={centerX + offset + 3}
            y2={centerY + 18}
            stroke="#475569"
            strokeWidth={1}
          />
        ))}

        {/* Scale indicator */}
        <line x1={20} y1={svgH - 20} x2={20 + scale} y2={svgH - 20} stroke="#64748b" strokeWidth={1} />
        <line x1={20} y1={svgH - 25} x2={20} y2={svgH - 15} stroke="#64748b" strokeWidth={1} />
        <line x1={20 + scale} y1={svgH - 25} x2={20 + scale} y2={svgH - 15} stroke="#64748b" strokeWidth={1} />
        <text x={20 + scale / 2} y={svgH - 8} textAnchor="middle" fontSize={9} className="fill-slate-500">
          1 unit
        </text>
      </svg>
    </div>
  );
};
