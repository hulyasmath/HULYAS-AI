import React, { useMemo } from 'react';
import { Intersection, Road } from './index';

interface NetworkGraphProps {
  intersections: Intersection[];
  roads: Road[];
  gridSize: number;
  maxDensity: number;
  signalCycle: number;
  greenSplit: number;
  elapsedTime: number;
  syncValue: number;
}

function densityColor(density: number, maxDensity: number): string {
  const ratio = Math.min(density / maxDensity, 1);
  if (ratio < 0.33) {
    // green
    const g = Math.floor(200 + 55 * (1 - ratio / 0.33));
    return `rgba(34,${g},34,0.8)`;
  } else if (ratio < 0.66) {
    // yellow
    const t = (ratio - 0.33) / 0.33;
    const r = Math.floor(200 + 55 * t);
    const g = Math.floor(200 - 80 * t);
    return `rgba(${r},${g},34,0.8)`;
  } else {
    // red
    const t = (ratio - 0.66) / 0.34;
    return `rgba(${Math.floor(220 + 35 * t)},${Math.floor(60 - 40 * t)},34,0.9)`;
  }
}

export const NetworkGraph: React.FC<NetworkGraphProps> = ({
  intersections,
  roads,
  gridSize,
  maxDensity,
  signalCycle,
  greenSplit,
  elapsedTime,
  syncValue,
}) => {
  const width = 600;
  const height = 450;
  const pad = 60;
  const plotW = width - 2 * pad;
  const plotH = height - 2 * pad;

  // Map intersection positions to SVG coords
  const maxCoord = (gridSize - 1) * 0.5;
  const scale = (coord: number) => (maxCoord > 0 ? coord / maxCoord : 0.5);

  const nodePositions = useMemo(() => {
    return intersections.map((n) => ({
      id: n.id,
      sx: pad + scale(n.x) * plotW,
      sy: pad + scale(n.y) * plotH,
      greenPhase: n.greenPhase,
    }));
  }, [intersections, plotW, plotH]);

  // Signal state animation
  const signalPhase = useMemo(() => {
    const t = elapsedTime % signalCycle;
    return t < signalCycle * greenSplit ? 'green' : 'red';
  }, [elapsedTime, signalCycle, greenSplit]);

  // Animated vehicle positions along roads
  const vehicles = useMemo(() => {
    const result: { x: number; y: number; color: string }[] = [];
    const uniqueRoads = roads.filter((r) => r.from < r.to);

    for (const road of uniqueRoads) {
      const fromNode = nodePositions.find((n) => n.id === road.from);
      const toNode = nodePositions.find((n) => n.id === road.to);
      if (!fromNode || !toNode) continue;

      // Number of visible vehicles proportional to density
      const nVeh = Math.floor((road.density / maxDensity) * 4) + 1;
      for (let v = 0; v < nVeh; v++) {
        const phase = ((elapsedTime * 0.3 + v * 0.25 + road.from * 0.1 + syncValue * 0.2) % 1);
        const x = fromNode.sx + (toNode.sx - fromNode.sx) * phase;
        const y = fromNode.sy + (toNode.sy - fromNode.sy) * phase;
        result.push({ x, y, color: densityColor(road.density, maxDensity) });
      }
    }
    return result;
  }, [roads, nodePositions, maxDensity, elapsedTime, syncValue]);

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
      <h3 className="text-sm font-medium text-slate-200 mb-3">Road Network ({gridSize}x{gridSize})</h3>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full bg-slate-900/50 rounded-lg" style={{ maxHeight: 450 }}>
        {/* Roads */}
        {roads.filter((r) => r.from < r.to).map((road, i) => {
          const fromNode = nodePositions.find((n) => n.id === road.from);
          const toNode = nodePositions.find((n) => n.id === road.to);
          if (!fromNode || !toNode) return null;

          const color = densityColor(road.density, maxDensity);
          return (
            <line
              key={`road-${i}`}
              x1={fromNode.sx}
              y1={fromNode.sy}
              x2={toNode.sx}
              y2={toNode.sy}
              stroke={color}
              strokeWidth={4}
              strokeLinecap="round"
              opacity={0.7}
            />
          );
        })}

        {/* Vehicles */}
        {vehicles.map((v, i) => (
          <circle
            key={`veh-${i}`}
            cx={v.x}
            cy={v.y}
            r={3}
            fill="rgba(226,232,240,0.8)"
            stroke={v.color}
            strokeWidth={1}
          />
        ))}

        {/* Intersections */}
        {nodePositions.map((node) => {
          const isGreen = signalPhase === 'green';
          return (
            <g key={`node-${node.id}`}>
              <circle
                cx={node.sx}
                cy={node.sy}
                r={10}
                fill={isGreen ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}
                stroke={isGreen ? 'rgba(34,197,94,0.8)' : 'rgba(239,68,68,0.8)'}
                strokeWidth={2}
              />
              <text
                x={node.sx}
                y={node.sy + 3}
                fill="rgba(226,232,240,0.7)"
                fontSize={8}
                textAnchor="middle"
                fontFamily="monospace"
              >
                {node.id}
              </text>
            </g>
          );
        })}

        {/* Legend */}
        <text x={10} y={20} fill="rgba(148,163,184,0.6)" fontSize={10} fontFamily="monospace">
          {'\u25CF'} Green = Low Density | {'\u25CF'} Yellow = Medium | {'\u25CF'} Red = High
        </text>
        <text x={10} y={height - 10} fill="rgba(148,163,184,0.5)" fontSize={10} fontFamily="monospace">
          Signal: {signalPhase.toUpperCase()} | Cycle: {signalCycle}s | Split: {(greenSplit * 100).toFixed(0)}%
        </text>
      </svg>
    </div>
  );
};
