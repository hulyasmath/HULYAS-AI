import React, { useMemo } from 'react';
import { useZeqSync } from '../SimulationVisualizer/useZeqSync';
import { HohmannResult, RE } from './TransferCalculator';

interface OrbitVisualizer3DProps {
  departureAlt: number;
  arrivalAlt: number;
  transfer: HohmannResult | null;
}

const SVG_SIZE = 500;
const CENTER = SVG_SIZE / 2;
const EARTH_RADIUS = 40;

const OrbitVisualizer3D: React.FC<OrbitVisualizer3DProps> = ({
  departureAlt,
  arrivalAlt,
  transfer,
}) => {
  const { elapsedTime } = useZeqSync();

  // Scale orbits to fit SVG
  const maxAlt = Math.max(departureAlt, arrivalAlt);
  const scale = useMemo(() => {
    const maxR = maxAlt * 1000 + RE;
    return (SVG_SIZE / 2 - 30) / maxR;
  }, [maxAlt]);

  const r1Px = (departureAlt * 1000 + RE) * scale;
  const r2Px = (arrivalAlt * 1000 + RE) * scale;
  const earthPx = RE * scale;

  // Transfer ellipse parameters
  const aTransfer = transfer ? transfer.semiMajorTransfer * scale : (r1Px + r2Px) / 2;
  const cTransfer = aTransfer - Math.min(r1Px, r2Px);
  const bTransfer = Math.sqrt(Math.abs(aTransfer * aTransfer - cTransfer * cTransfer));

  // Animated spacecraft position on transfer ellipse
  const transferProgress = transfer
    ? ((elapsedTime % (transfer.transferTime / 500)) / (transfer.transferTime / 500))
    : (elapsedTime % 5) / 5;
  const angle = Math.PI * transferProgress; // 0 to PI for Hohmann half-orbit
  const scX = CENTER - cTransfer + aTransfer * Math.cos(Math.PI + angle);
  const scY = CENTER + bTransfer * Math.sin(angle);

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-slate-200 mb-3">Orbit Visualization</h3>
      <svg
        viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
        className="w-full max-w-lg mx-auto"
        style={{ background: 'radial-gradient(circle, #0f172a 0%, #020617 100%)' }}
      >
        {/* Stars background */}
        {Array.from({ length: 60 }, (_, i) => (
          <circle
            key={i}
            cx={((i * 97 + 13) % SVG_SIZE)}
            cy={((i * 53 + 29) % SVG_SIZE)}
            r={0.5 + (i % 3) * 0.5}
            fill="white"
            opacity={0.3 + (i % 5) * 0.1}
          />
        ))}

        {/* Departure orbit */}
        <circle
          cx={CENTER}
          cy={CENTER}
          r={r1Px}
          fill="none"
          stroke="#22d3ee"
          strokeWidth={1.5}
          opacity={0.6}
        />
        <text
          x={CENTER + r1Px + 5}
          y={CENTER - 5}
          fill="#22d3ee"
          fontSize={10}
          opacity={0.8}
        >
          {departureAlt} km
        </text>

        {/* Arrival orbit */}
        <circle
          cx={CENTER}
          cy={CENTER}
          r={r2Px}
          fill="none"
          stroke="#fb923c"
          strokeWidth={1.5}
          opacity={0.6}
        />
        <text
          x={CENTER + r2Px + 5}
          y={CENTER + 12}
          fill="#fb923c"
          fontSize={10}
          opacity={0.8}
        >
          {arrivalAlt} km
        </text>

        {/* Transfer orbit ellipse */}
        {transfer && (
          <ellipse
            cx={CENTER - cTransfer}
            cy={CENTER}
            rx={aTransfer}
            ry={bTransfer}
            fill="none"
            stroke="#4ade80"
            strokeWidth={1.5}
            strokeDasharray="6 4"
            opacity={0.7}
          />
        )}

        {/* Earth */}
        <circle
          cx={CENTER}
          cy={CENTER}
          r={Math.max(earthPx, EARTH_RADIUS)}
          fill="url(#earthGradient)"
          stroke="#3b82f6"
          strokeWidth={1}
        />
        <defs>
          <radialGradient id="earthGradient">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="70%" stopColor="#1e40af" />
            <stop offset="100%" stopColor="#1e3a8a" />
          </radialGradient>
        </defs>
        <text
          x={CENTER}
          y={CENTER + 3}
          textAnchor="middle"
          fill="white"
          fontSize={9}
          fontWeight="bold"
        >
          Earth
        </text>

        {/* Departure point */}
        <circle cx={CENTER + r1Px} cy={CENTER} r={4} fill="#22d3ee" />
        <text x={CENTER + r1Px + 8} y={CENTER + 3} fill="#22d3ee" fontSize={9}>
          Burn 1
        </text>

        {/* Arrival point */}
        <circle cx={CENTER - r2Px} cy={CENTER} r={4} fill="#fb923c" />
        <text x={CENTER - r2Px - 35} y={CENTER + 3} fill="#fb923c" fontSize={9}>
          Burn 2
        </text>

        {/* Animated spacecraft */}
        {transfer && (
          <g>
            <circle cx={scX} cy={scY} r={5} fill="#4ade80" />
            <circle cx={scX} cy={scY} r={8} fill="none" stroke="#4ade80" strokeWidth={1} opacity={0.5}>
              <animate attributeName="r" values="8;14;8" dur="1.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.5;0;0.5" dur="1.5s" repeatCount="indefinite" />
            </circle>
            <text x={scX + 10} y={scY + 3} fill="#4ade80" fontSize={9} fontWeight="bold">
              S/C
            </text>
          </g>
        )}

        {/* Legend */}
        <g transform="translate(10, 20)">
          <line x1={0} y1={0} x2={15} y2={0} stroke="#22d3ee" strokeWidth={2} />
          <text x={20} y={4} fill="#94a3b8" fontSize={9}>Departure</text>
          <line x1={0} y1={15} x2={15} y2={15} stroke="#fb923c" strokeWidth={2} />
          <text x={20} y={19} fill="#94a3b8" fontSize={9}>Arrival</text>
          <line x1={0} y1={30} x2={15} y2={30} stroke="#4ade80" strokeWidth={2} strokeDasharray="4 3" />
          <text x={20} y={34} fill="#94a3b8" fontSize={9}>Transfer</text>
        </g>
      </svg>
    </div>
  );
};

export default OrbitVisualizer3D;
