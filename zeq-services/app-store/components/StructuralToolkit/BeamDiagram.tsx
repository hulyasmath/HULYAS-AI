import React, { useMemo } from 'react';
import { useZeqSync } from '../SimulationVisualizer/useZeqSync';
import { BeamConfig, computeDeflection } from './DeflectionCalculator';

interface BeamDiagramProps {
  config: BeamConfig;
}

export const BeamDiagram: React.FC<BeamDiagramProps> = ({ config }) => {
  const { syncValue } = useZeqSync({ amplitude: 0.1 });
  const result = useMemo(() => computeDeflection(config), [config]);

  const isValid = config.length > 0 && config.width > 0 && config.height > 0 && config.loadMagnitude > 0;

  // SVG dimensions
  const svgW = 700;
  const svgH = 340;
  const margin = { left: 60, right: 60, top: 60, bottom: 80 };
  const beamY = margin.top + 80;
  const beamLeft = margin.left;
  const beamRight = svgW - margin.right;
  const beamLength = beamRight - beamLeft;

  // Deflection scale (amplified for visibility, modulated by sync)
  const deflScale = isValid
    ? Math.min(80, 80 / Math.max(result.maxDeflection * 1000, 0.001))
    : 0;
  const syncAmplify = 1 + syncValue * 2;

  // Generate deflection curve points
  const deflectionPoints = useMemo(() => {
    if (!isValid) return '';
    const pts: string[] = [];
    const numPts = 50;
    for (let i = 0; i <= numPts; i++) {
      const xRatio = i / numPts;
      const x = beamLeft + xRatio * beamLength;
      // Deflection shape for simply supported beam
      let yDefl: number;
      if (config.loadType === 'uniform') {
        // delta(x) = (w*x)/(24*E*I) * (L^3 - 2*L*x^2 + x^3) normalized
        const xm = xRatio;
        yDefl = xm * (1 - 2 * xm * xm + xm * xm * xm) * (16 / 5);
      } else {
        // Point load at center: piecewise
        const xm = xRatio;
        if (xm <= 0.5) {
          yDefl = xm * (3 - 4 * xm * xm) * (4 / 3);
        } else {
          const xm2 = 1 - xm;
          yDefl = xm2 * (3 - 4 * xm2 * xm2) * (4 / 3);
        }
      }
      const y = beamY + yDefl * result.maxDeflection * deflScale * syncAmplify * 1000;
      pts.push(`${x},${y}`);
    }
    return pts.join(' ');
  }, [isValid, config.loadType, result.maxDeflection, deflScale, syncAmplify, beamLeft, beamLength, beamY]);

  // Load arrows
  const loadArrows = useMemo(() => {
    if (!isValid) return [];
    if (config.loadType === 'uniform') {
      const count = 10;
      return Array.from({ length: count }, (_, i) => {
        const x = beamLeft + ((i + 0.5) / count) * beamLength;
        return { x, y1: beamY - 40, y2: beamY - 8 };
      });
    } else {
      return [{ x: beamLeft + beamLength / 2, y1: beamY - 50, y2: beamY - 8 }];
    }
  }, [isValid, config.loadType, beamLeft, beamLength, beamY]);

  // Reaction arrow height
  const reactionH = 30;

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-slate-200 mb-3">Beam Diagram</h3>
      <svg
        viewBox={`0 0 ${svgW} ${svgH}`}
        className="w-full"
        style={{ maxHeight: 340 }}
      >
        <defs>
          <marker id="arrowDown" markerWidth="8" markerHeight="8" refX="4" refY="8" orient="auto">
            <path d="M0,0 L4,8 L8,0" fill="#f97316" />
          </marker>
          <marker id="arrowUp" markerWidth="8" markerHeight="8" refX="4" refY="0" orient="auto">
            <path d="M0,8 L4,0 L8,8" fill="#22d3ee" />
          </marker>
        </defs>

        {/* Grid lines */}
        {[0, 1, 2, 3, 4].map(i => (
          <line
            key={`grid-${i}`}
            x1={beamLeft}
            y1={beamY + i * 20}
            x2={beamRight}
            y2={beamY + i * 20}
            stroke="#334155"
            strokeWidth={0.5}
            strokeDasharray="4,4"
          />
        ))}

        {/* Load arrows */}
        {loadArrows.map((arrow, i) => (
          <g key={`load-${i}`}>
            <line
              x1={arrow.x}
              y1={arrow.y1}
              x2={arrow.x}
              y2={arrow.y2}
              stroke="#f97316"
              strokeWidth={2}
              markerEnd="url(#arrowDown)"
            />
          </g>
        ))}

        {/* Load label */}
        {isValid && (
          <text
            x={beamLeft + beamLength / 2}
            y={beamY - 52}
            textAnchor="middle"
            className="fill-orange-400 text-xs font-mono"
            fontSize={11}
          >
            {config.loadType === 'uniform'
              ? `w = ${config.loadMagnitude} N/m`
              : `P = ${config.loadMagnitude} N`}
          </text>
        )}

        {/* Beam line */}
        <line
          x1={beamLeft}
          y1={beamY}
          x2={beamRight}
          y2={beamY}
          stroke="#94a3b8"
          strokeWidth={6}
          strokeLinecap="round"
        />

        {/* Deflection curve */}
        {isValid && deflectionPoints && (
          <polyline
            points={deflectionPoints}
            fill="none"
            stroke="#22d3ee"
            strokeWidth={2}
            strokeDasharray="6,3"
            opacity={0.8}
          />
        )}

        {/* Left support (triangle) */}
        <polygon
          points={`${beamLeft},${beamY + 4} ${beamLeft - 12},${beamY + 24} ${beamLeft + 12},${beamY + 24}`}
          fill="none"
          stroke="#64748b"
          strokeWidth={2}
        />
        {/* Left support hatching */}
        <line x1={beamLeft - 14} y1={beamY + 28} x2={beamLeft + 14} y2={beamY + 28} stroke="#64748b" strokeWidth={2} />

        {/* Right support (triangle + roller) */}
        <polygon
          points={`${beamRight},${beamY + 4} ${beamRight - 12},${beamY + 24} ${beamRight + 12},${beamY + 24}`}
          fill="none"
          stroke="#64748b"
          strokeWidth={2}
        />
        <circle cx={beamRight} cy={beamY + 30} r={5} fill="none" stroke="#64748b" strokeWidth={2} />
        <line x1={beamRight - 14} y1={beamY + 38} x2={beamRight + 14} y2={beamY + 38} stroke="#64748b" strokeWidth={2} />

        {/* Reaction force arrows */}
        {isValid && (
          <>
            <line
              x1={beamLeft}
              y1={beamY + 50 + reactionH}
              x2={beamLeft}
              y2={beamY + 50}
              stroke="#22d3ee"
              strokeWidth={2}
              markerEnd="url(#arrowUp)"
            />
            <text x={beamLeft} y={beamY + 50 + reactionH + 14} textAnchor="middle" fontSize={10} className="fill-cyan-400 font-mono">
              R = {result.reactionForce.toFixed(1)} N
            </text>

            <line
              x1={beamRight}
              y1={beamY + 58 + reactionH}
              x2={beamRight}
              y2={beamY + 58}
              stroke="#22d3ee"
              strokeWidth={2}
              markerEnd="url(#arrowUp)"
            />
            <text x={beamRight} y={beamY + 58 + reactionH + 14} textAnchor="middle" fontSize={10} className="fill-cyan-400 font-mono">
              R = {result.reactionForce.toFixed(1)} N
            </text>
          </>
        )}

        {/* Dimension label (beam length) */}
        <line x1={beamLeft} y1={beamY - 68} x2={beamRight} y2={beamY - 68} stroke="#475569" strokeWidth={1} />
        <line x1={beamLeft} y1={beamY - 74} x2={beamLeft} y2={beamY - 62} stroke="#475569" strokeWidth={1} />
        <line x1={beamRight} y1={beamY - 74} x2={beamRight} y2={beamY - 62} stroke="#475569" strokeWidth={1} />
        <text
          x={beamLeft + beamLength / 2}
          y={beamY - 72}
          textAnchor="middle"
          fontSize={10}
          className="fill-slate-400 font-mono"
        >
          L = {config.length} m
        </text>

        {/* Max deflection annotation */}
        {isValid && result.maxDeflection > 0 && (
          <text
            x={beamLeft + beamLength / 2}
            y={beamY + 20}
            textAnchor="middle"
            fontSize={10}
            className="fill-cyan-300 font-mono"
          >
            delta_max = {(result.maxDeflection * 1000).toFixed(4)} mm
          </text>
        )}
      </svg>
    </div>
  );
};
