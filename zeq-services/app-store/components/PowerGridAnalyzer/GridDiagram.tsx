import React, { useMemo } from 'react';
import { Bus, Line } from './index';

interface GridDiagramProps {
  buses: Bus[];
  lines: Line[];
  linePowers: { from: number; to: number; P: number; Q: number; Ploss: number }[];
  syncValue: number;
  elapsedTime: number;
}

function voltageColor(v: number): string {
  if (v >= 0.95 && v <= 1.05) return '#22c55e'; // green - nominal
  if (v >= 0.90 && v < 0.95) return '#eab308'; // yellow - low
  if (v > 1.05 && v <= 1.10) return '#eab308'; // yellow - high
  return '#ef4444'; // red - out of range
}

export const GridDiagram: React.FC<GridDiagramProps> = ({
  buses, lines, linePowers, syncValue, elapsedTime,
}) => {
  const viewW = 560;
  const viewH = 400;

  // Animated power flow particles
  const particles = useMemo(() => {
    return linePowers.map((lp) => {
      const fromBus = buses.find((b) => b.id === lp.from);
      const toBus = buses.find((b) => b.id === lp.to);
      if (!fromBus || !toBus) return null;

      const speed = Math.abs(lp.P) / 200; // Normalize particle count
      const numParticles = Math.max(1, Math.min(5, Math.floor(speed * 3)));
      const direction = lp.P >= 0 ? 1 : -1;

      return { from: fromBus, to: toBus, numParticles, direction, P: lp.P };
    }).filter(Boolean);
  }, [buses, linePowers]);

  return (
    <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-slate-200 mb-3">Single-Line Diagram</h3>
      <svg viewBox={`0 0 ${viewW} ${viewH}`} className="w-full" style={{ maxHeight: 450 }}>
        <defs>
          <marker id="arrowFlow" markerWidth="6" markerHeight="4" refX="3" refY="2" orient="auto">
            <path d="M0,0 L6,2 L0,4" fill="#22d3ee" opacity="0.7" />
          </marker>
        </defs>

        {/* Background */}
        <rect width={viewW} height={viewH} fill="#0f172a" rx="4" />

        {/* Transmission lines */}
        {lines.map((line, idx) => {
          const fromBus = buses.find((b) => b.id === line.from);
          const toBus = buses.find((b) => b.id === line.to);
          if (!fromBus || !toBus) return null;

          const lp = linePowers[idx];
          const lineLoading = lp ? Math.abs(lp.P) / 300 : 0; // Normalize
          const lineColor = lineLoading > 0.8 ? '#ef4444' : lineLoading > 0.5 ? '#eab308' : '#4ade80';

          return (
            <g key={`line-${line.from}-${line.to}`}>
              {/* Line */}
              <line
                x1={fromBus.x} y1={fromBus.y}
                x2={toBus.x} y2={toBus.y}
                stroke={lineColor}
                strokeWidth={2}
                opacity={0.6}
              />

              {/* Impedance label */}
              <text
                x={(fromBus.x + toBus.x) / 2 + 8}
                y={(fromBus.y + toBus.y) / 2 - 8}
                fill="#64748b"
                fontSize="8"
                fontFamily="monospace"
              >
                {`R=${line.R} X=${line.X}`}
              </text>

              {/* Power flow label */}
              {lp && (
                <text
                  x={(fromBus.x + toBus.x) / 2 + 8}
                  y={(fromBus.y + toBus.y) / 2 + 5}
                  fill="#22d3ee"
                  fontSize="9"
                  fontFamily="monospace"
                >
                  {`${lp.P.toFixed(1)} MW`}
                </text>
              )}

              {/* Animated power flow particles */}
              {particles[idx] && Array.from({ length: particles[idx]!.numParticles }, (_, pi) => {
                const phase = ((elapsedTime * 0.5 + pi * 0.3) % 1);
                const t = particles[idx]!.direction > 0 ? phase : 1 - phase;
                const px = fromBus.x + (toBus.x - fromBus.x) * t;
                const py = fromBus.y + (toBus.y - fromBus.y) * t;
                return (
                  <circle
                    key={`particle-${idx}-${pi}`}
                    cx={px} cy={py}
                    r={2.5}
                    fill="#22d3ee"
                    opacity={0.8}
                  />
                );
              })}
            </g>
          );
        })}

        {/* Buses */}
        {buses.map((bus) => {
          const color = voltageColor(bus.V);
          const isGen = bus.type === 'slack' || bus.type === 'PV';

          return (
            <g key={`bus-${bus.id}`}>
              {isGen ? (
                // Generator symbol: circle with sine wave
                <>
                  <circle cx={bus.x} cy={bus.y} r={22} fill="none" stroke={color} strokeWidth={2.5} />
                  <path
                    d={`M${bus.x - 12},${bus.y} Q${bus.x - 6},${bus.y - 8} ${bus.x},${bus.y} Q${bus.x + 6},${bus.y + 8} ${bus.x + 12},${bus.y}`}
                    fill="none" stroke={color} strokeWidth={1.5}
                  />
                  {/* Generator power */}
                  <text x={bus.x} y={bus.y - 30} fill="#22d3ee" fontSize="9" fontFamily="monospace" textAnchor="middle">
                    {bus.type === 'slack' ? 'Slack' : `G: ${bus.Pgen}MW`}
                  </text>
                </>
              ) : (
                // Load bus: rectangle
                <>
                  <rect x={bus.x - 18} y={bus.y - 18} width={36} height={36} fill="none" stroke={color} strokeWidth={2.5} rx={3} />
                  {/* Load arrow */}
                  {bus.Pload > 0 && (
                    <>
                      <line x1={bus.x} y1={bus.y + 18} x2={bus.x} y2={bus.y + 40} stroke="#fb923c" strokeWidth={2} />
                      <polygon points={`${bus.x},${bus.y + 45} ${bus.x - 5},${bus.y + 38} ${bus.x + 5},${bus.y + 38}`} fill="#fb923c" />
                      <text x={bus.x} y={bus.y + 56} fill="#fb923c" fontSize="9" fontFamily="monospace" textAnchor="middle">
                        {`${bus.Pload}MW`}
                      </text>
                    </>
                  )}
                </>
              )}

              {/* Bus name */}
              <text x={bus.x} y={bus.y + 4} fill="#e2e8f0" fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                {bus.name}
              </text>

              {/* Voltage display */}
              <text x={bus.x} y={bus.y + (isGen ? 42 : -25)} fill={color} fontSize="9" fontFamily="monospace" textAnchor="middle">
                {`${bus.V.toFixed(3)} pu`}
              </text>
              <text x={bus.x} y={bus.y + (isGen ? 53 : -15)} fill="#64748b" fontSize="8" fontFamily="monospace" textAnchor="middle">
                {`${(bus.theta * 180 / Math.PI).toFixed(2)}\u00B0`}
              </text>
            </g>
          );
        })}

        {/* Legend */}
        <g transform="translate(10, 350)">
          <circle cx={8} cy={0} r={4} fill="#22c55e" />
          <text x={16} y={3} fill="#64748b" fontSize="8" fontFamily="monospace">0.95-1.05 pu</text>

          <circle cx={100} cy={0} r={4} fill="#eab308" />
          <text x={108} y={3} fill="#64748b" fontSize="8" fontFamily="monospace">warning</text>

          <circle cx={170} cy={0} r={4} fill="#ef4444" />
          <text x={178} y={3} fill="#64748b" fontSize="8" fontFamily="monospace">violation</text>
        </g>

        {/* Sync pulse */}
        <circle cx={viewW - 15} cy={15} r={4 + Math.abs(syncValue) * 10} fill="none" stroke="#22d3ee" strokeWidth={1} opacity={0.5} />
        <circle cx={viewW - 15} cy={15} r={3} fill="#22d3ee" opacity={0.8} />
      </svg>
    </div>
  );
};
