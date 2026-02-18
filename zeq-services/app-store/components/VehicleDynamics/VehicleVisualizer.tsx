import React, { useMemo } from 'react';

interface VehicleVisualizerProps {
  mass: number;
  speedMs: number;
  turnRadius: number;
  lateralAccel: number;
  slipAngle: number;
  syncValue: number;
  elapsedTime: number;
  brakingMode?: boolean;
  deceleration?: number;
  cgHeight?: number;
  wheelbase?: number;
}

/** Pacejka Magic Formula (normalized) */
function pacejka(alpha: number): number {
  const B = 10;
  const C = 1.9;
  const D = 1.0;
  const E = 0.97;
  const ba = B * alpha;
  const val = D * Math.sin(C * Math.atan(ba - E * (ba - Math.atan(ba))));
  return isFinite(val) ? val : 0;
}

export const VehicleVisualizer: React.FC<VehicleVisualizerProps> = ({
  mass,
  speedMs,
  turnRadius,
  lateralAccel,
  slipAngle,
  syncValue,
  elapsedTime,
  brakingMode = false,
  deceleration = 8,
  cgHeight = 0.55,
  wheelbase = 2.7,
}) => {
  const width = 600;
  const height = 400;
  const cx = width / 2;
  const cy = height / 2;

  // Vehicle body dimensions (in SVG units)
  const bodyW = 60;
  const bodyH = 120;

  // Heading angle for animation
  const heading = useMemo(() => {
    return (elapsedTime * 0.5 + syncValue) % (2 * Math.PI);
  }, [elapsedTime, syncValue]);

  // Tire forces via Pacejka
  const tireForce = useMemo(() => pacejka(slipAngle), [slipAngle]);

  // Lateral force arrow scale
  const latForceScale = useMemo(() => {
    const f = mass * lateralAccel;
    return Math.min(f / 20000, 1) * 80;
  }, [mass, lateralAccel]);

  // Braking load transfer
  const loadTransfer = useMemo(() => {
    if (!brakingMode) return 0;
    const wb = wheelbase > 0 ? wheelbase : 1;
    const val = (mass * deceleration * cgHeight) / wb;
    return isFinite(val) ? val : 0;
  }, [brakingMode, mass, deceleration, cgHeight, wheelbase]);

  // Normal force distribution (front/rear)
  const normalFront = useMemo(() => {
    const base = (mass * 9.81) / 2;
    return base + loadTransfer / 2;
  }, [mass, loadTransfer]);

  const normalRear = useMemo(() => {
    const base = (mass * 9.81) / 2;
    return base - loadTransfer / 2;
  }, [mass, loadTransfer]);

  // Wheel positions relative to center
  const wheels = [
    { x: -25, y: -45, label: 'FL' },
    { x: 25, y: -45, label: 'FR' },
    { x: -25, y: 45, label: 'RL' },
    { x: 25, y: 45, label: 'RR' },
  ];

  const slipAngleDeg = (slipAngle * 180) / Math.PI;
  const rotDeg = heading * (180 / Math.PI);

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
      <h3 className="text-sm font-medium text-slate-200 mb-3">
        {brakingMode ? 'Braking Force Distribution' : 'Top-Down Vehicle View'}
      </h3>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full bg-slate-900/50 rounded-lg"
        style={{ maxHeight: 400 }}
      >
        {/* Grid */}
        {Array.from({ length: 13 }).map((_, i) => (
          <line
            key={`gv-${i}`}
            x1={i * 50}
            y1={0}
            x2={i * 50}
            y2={height}
            stroke="rgba(148,163,184,0.08)"
          />
        ))}
        {Array.from({ length: 9 }).map((_, i) => (
          <line
            key={`gh-${i}`}
            x1={0}
            y1={i * 50}
            x2={width}
            y2={i * 50}
            stroke="rgba(148,163,184,0.08)"
          />
        ))}

        {/* Vehicle group */}
        <g transform={`translate(${cx},${cy}) rotate(${brakingMode ? 0 : rotDeg * 0.1})`}>
          {/* Vehicle body */}
          <rect
            x={-bodyW / 2}
            y={-bodyH / 2}
            width={bodyW}
            height={bodyH}
            rx={10}
            fill="rgba(34,211,238,0.15)"
            stroke="rgba(34,211,238,0.6)"
            strokeWidth={2}
          />

          {/* Direction indicator */}
          <polygon
            points={`0,${-bodyH / 2 - 8} -8,${-bodyH / 2 + 5} 8,${-bodyH / 2 + 5}`}
            fill="rgba(34,211,238,0.8)"
          />

          {/* CG marker */}
          <circle cx={0} cy={0} r={4} fill="rgba(251,146,60,0.9)" />
          <text x={8} y={4} fill="rgba(251,146,60,0.8)" fontSize={9} fontFamily="monospace">
            CG
          </text>

          {/* Wheels */}
          {wheels.map((w) => {
            const isFront = w.y < 0;
            const normalF = isFront ? normalFront : normalRear;
            const normalScale = Math.min(normalF / 15000, 1);
            return (
              <g key={w.label}>
                <rect
                  x={w.x - 8}
                  y={w.y - 14}
                  width={16}
                  height={28}
                  rx={4}
                  fill={`rgba(${brakingMode ? '251,146,60' : '34,211,238'},${0.2 + normalScale * 0.4})`}
                  stroke={brakingMode ? 'rgba(251,146,60,0.6)' : 'rgba(34,211,238,0.4)'}
                  strokeWidth={1.5}
                />
                <text
                  x={w.x}
                  y={w.y + 3}
                  fill="rgba(226,232,240,0.7)"
                  fontSize={8}
                  textAnchor="middle"
                  fontFamily="monospace"
                >
                  {w.label}
                </text>

                {/* Slip angle indicator on front wheels */}
                {!brakingMode && isFront && Math.abs(slipAngleDeg) > 0.1 && (
                  <line
                    x1={w.x}
                    y1={w.y}
                    x2={w.x + Math.sin(slipAngle) * 25}
                    y2={w.y - Math.cos(slipAngle) * 25}
                    stroke="rgba(251,146,60,0.8)"
                    strokeWidth={2}
                    markerEnd="url(#arrowOrange)"
                  />
                )}

                {/* Normal force bars (braking) */}
                {brakingMode && (
                  <rect
                    x={w.x - 3}
                    y={w.y + 16}
                    width={6}
                    height={normalScale * 30}
                    fill={isFront ? 'rgba(251,146,60,0.6)' : 'rgba(34,211,238,0.4)'}
                    rx={2}
                  />
                )}
              </g>
            );
          })}

          {/* Lateral force arrow (cornering) */}
          {!brakingMode && latForceScale > 2 && (
            <line
              x1={0}
              y1={0}
              x2={latForceScale}
              y2={0}
              stroke="rgba(251,146,60,0.9)"
              strokeWidth={3}
              markerEnd="url(#arrowOrange)"
            />
          )}

          {/* Braking force arrow */}
          {brakingMode && (
            <line
              x1={0}
              y1={0}
              x2={0}
              y2={Math.min(deceleration / 15, 1) * 60}
              stroke="rgba(239,68,68,0.9)"
              strokeWidth={3}
              markerEnd="url(#arrowRed)"
            />
          )}
        </g>

        {/* Arrow markers */}
        <defs>
          <marker id="arrowOrange" markerWidth={8} markerHeight={6} refX={7} refY={3} orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="rgba(251,146,60,0.9)" />
          </marker>
          <marker id="arrowRed" markerWidth={8} markerHeight={6} refX={7} refY={3} orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="rgba(239,68,68,0.9)" />
          </marker>
        </defs>

        {/* Labels */}
        <text x={10} y={20} fill="rgba(148,163,184,0.6)" fontSize={11} fontFamily="monospace">
          {brakingMode ? 'Braking Analysis' : 'Cornering Analysis'}
        </text>
        <text x={10} y={height - 50} fill="rgba(148,163,184,0.5)" fontSize={10} fontFamily="monospace">
          Speed: {speedMs.toFixed(1)} m/s | Lat.Accel: {lateralAccel.toFixed(2)} m/s&sup2;
        </text>
        <text x={10} y={height - 35} fill="rgba(148,163,184,0.5)" fontSize={10} fontFamily="monospace">
          Slip: {slipAngleDeg.toFixed(3)}&deg; | Pacejka F: {tireForce.toFixed(4)}
        </text>
        {brakingMode && (
          <text x={10} y={height - 20} fill="rgba(148,163,184,0.5)" fontSize={10} fontFamily="monospace">
            Load Transfer: {loadTransfer.toFixed(0)} N | Front: {normalFront.toFixed(0)} N | Rear: {normalRear.toFixed(0)} N
          </text>
        )}
      </svg>
    </div>
  );
};
