import React, { useMemo } from 'react';
import { EarthLayer } from './index';

interface EarthCrossSectionProps {
  layers: EarthLayer[];
  depth: number;
  epicentralDist: number;
  arrivals: { tp: number; ts: number };
  syncValue: number;
}

const EARTH_RADIUS = 6371; // km

export const EarthCrossSection: React.FC<EarthCrossSectionProps> = ({
  layers, depth, epicentralDist, arrivals, syncValue,
}) => {
  const viewSize = 500;
  const cx = viewSize / 2;
  const cy = viewSize / 2;
  const maxR = viewSize * 0.45;

  // Convert depth to radius fraction
  const depthToR = (d: number) => maxR * (1 - d / EARTH_RADIUS);

  // Angular position of station based on epicentral distance
  const stationAngle = useMemo(() => {
    // Convert km to radians on Earth surface
    return (epicentralDist / EARTH_RADIUS) * (180 / Math.PI);
  }, [epicentralDist]);

  const stationAngleRad = (stationAngle * Math.PI) / 180;

  // Source position (at depth, at angle 0 = top)
  const sourceAngle = -Math.PI / 2; // top
  const sourceR = depthToR(depth);
  const sourceX = cx + sourceR * Math.cos(sourceAngle);
  const sourceY = cy + sourceR * Math.sin(sourceAngle);

  // Station position on surface
  const stationR = depthToR(0);
  const stationAngleFull = sourceAngle + stationAngleRad;
  const stationX = cx + stationR * Math.cos(stationAngleFull);
  const stationY = cy + stationR * Math.sin(stationAngleFull);

  // Generate ray path points (simplified curved path through layers)
  const generateRayPath = (waveType: 'P' | 'S'): string => {
    const points: { x: number; y: number }[] = [{ x: sourceX, y: sourceY }];

    // Create intermediate bending points through layers
    const numSegments = 8;
    for (let i = 1; i < numSegments; i++) {
      const frac = i / numSegments;
      const angle = sourceAngle + stationAngleRad * frac;

      // Ray bends deeper for longer distances
      const maxPenetration = Math.min(depth + epicentralDist * 0.3, EARTH_RADIUS * 0.8);
      const penetrationDepth = depth + (maxPenetration - depth) * Math.sin(frac * Math.PI);
      const r = depthToR(penetrationDepth);

      // Add some refraction wobble
      const wobble = waveType === 'S' ? 0.02 * Math.sin(frac * Math.PI * 3) : 0;
      const px = cx + r * Math.cos(angle + wobble);
      const py = cy + r * Math.sin(angle + wobble);
      points.push({ x: px, y: py });
    }

    points.push({ x: stationX, y: stationY });

    // Convert to smooth SVG path
    if (points.length < 2) return '';
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cpx = (prev.x + curr.x) / 2;
      const cpy = (prev.y + curr.y) / 2 + (i % 2 === 0 ? -5 : 5);
      d += ` Q ${cpx} ${cpy} ${curr.x} ${curr.y}`;
    }
    return d;
  };

  const pRayPath = useMemo(() => generateRayPath('P'), [sourceX, sourceY, stationX, stationY, depth, epicentralDist]);
  const sRayPath = useMemo(() => generateRayPath('S'), [sourceX, sourceY, stationX, stationY, depth, epicentralDist]);

  // Pulse animation offset
  const pulseOffset = Math.abs(syncValue) * 5;

  return (
    <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-slate-200 mb-3">Earth Cross-Section with Ray Paths</h3>
      <svg viewBox={`0 0 ${viewSize} ${viewSize}`} className="w-full" style={{ maxHeight: 500 }}>
        <defs>
          <radialGradient id="earthGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFD700" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Background */}
        <rect width={viewSize} height={viewSize} fill="#0f172a" />

        {/* Earth layers (concentric circles) */}
        {[...layers].reverse().map((layer) => {
          const rOuter = depthToR(layer.depthTop);
          const rInner = depthToR(layer.depthBot);
          return (
            <g key={layer.name}>
              <circle cx={cx} cy={cy} r={rOuter} fill={layer.color} opacity={0.3} stroke={layer.color} strokeWidth={0.5} />
              {/* Layer label */}
              <text
                x={cx + (rOuter + rInner) / 2 * Math.cos(-Math.PI / 4)}
                y={cy + (rOuter + rInner) / 2 * Math.sin(-Math.PI / 4)}
                fill="#e2e8f0"
                fontSize="8"
                textAnchor="middle"
                dominantBaseline="middle"
                opacity={0.7}
              >
                {layer.name}
              </text>
            </g>
          );
        })}

        {/* Inner core glow */}
        <circle cx={cx} cy={cy} r={depthToR(5150)} fill="url(#earthGlow)" />

        {/* Layer boundaries */}
        {layers.map((layer) => (
          <circle
            key={`boundary-${layer.name}`}
            cx={cx} cy={cy}
            r={depthToR(layer.depthTop)}
            fill="none"
            stroke="#94a3b8"
            strokeWidth={0.5}
            strokeDasharray="3,3"
            opacity={0.4}
          />
        ))}

        {/* Surface circle */}
        <circle cx={cx} cy={cy} r={maxR} fill="none" stroke="#94a3b8" strokeWidth={1.5} />

        {/* P-wave ray path */}
        <path
          d={pRayPath}
          fill="none"
          stroke="#22d3ee"
          strokeWidth={2}
          strokeDasharray="6,3"
          opacity={0.9}
        />

        {/* S-wave ray path */}
        <path
          d={sRayPath}
          fill="none"
          stroke="#fb923c"
          strokeWidth={2}
          strokeDasharray="4,4"
          opacity={0.8}
        />

        {/* Earthquake source (star) */}
        <g transform={`translate(${sourceX}, ${sourceY})`}>
          <circle r={8 + pulseOffset} fill="none" stroke="#ef4444" strokeWidth={1} opacity={0.5} />
          <circle r={5} fill="#ef4444" />
          <text x={12} y={4} fill="#fca5a5" fontSize="9" fontFamily="monospace">
            {`D=${depth}km`}
          </text>
        </g>

        {/* Station (triangle) */}
        <g transform={`translate(${stationX}, ${stationY})`}>
          <polygon points="0,-8 -6,4 6,4" fill="#22d3ee" stroke="#06b6d4" strokeWidth={1} />
          <text x={10} y={4} fill="#67e8f9" fontSize="9" fontFamily="monospace">Station</text>
        </g>

        {/* Legend */}
        <g transform="translate(10, 20)">
          <line x1={0} y1={0} x2={20} y2={0} stroke="#22d3ee" strokeWidth={2} strokeDasharray="6,3" />
          <text x={25} y={4} fill="#22d3ee" fontSize="10" fontFamily="monospace">P-wave ({arrivals.tp.toFixed(1)}s)</text>
        </g>
        <g transform="translate(10, 38)">
          <line x1={0} y1={0} x2={20} y2={0} stroke="#fb923c" strokeWidth={2} strokeDasharray="4,4" />
          <text x={25} y={4} fill="#fb923c" fontSize="10" fontFamily="monospace">S-wave ({arrivals.ts.toFixed(1)}s)</text>
        </g>

        {/* Snell's law annotation */}
        <g transform={`translate(${viewSize - 180}, ${viewSize - 40})`}>
          <text fill="#64748b" fontSize="9" fontFamily="monospace">
            {"sin(\u03B81)/V1 = sin(\u03B82)/V2 = p"}
          </text>
          <text y={14} fill="#64748b" fontSize="9" fontFamily="monospace">
            {`\u0394 = ${epicentralDist} km`}
          </text>
        </g>
      </svg>
    </div>
  );
};
