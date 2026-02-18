import React, { useMemo } from 'react';
import type { GridCell } from './index';

interface GridWorldViewProps {
  grid: GridCell[][];
  agentPos: [number, number];
  onCellClick: (r: number, c: number) => void;
}

const CELL_SIZE = 70;
const PAD = 2;

const ARROWS: { dx: number; dy: number }[] = [
  { dx: 0, dy: -1 },  // up
  { dx: 0, dy: 1 },   // down
  { dx: -1, dy: 0 },  // left
  { dx: 1, dy: 0 },   // right
];

export const GridWorldView: React.FC<GridWorldViewProps> = ({ grid, agentPos, onCellClick }) => {
  const size = grid.length;

  const { qMin, qMax } = useMemo(() => {
    let min = 0, max = 0;
    for (const row of grid) {
      for (const cell of row) {
        for (const q of cell.qValues) {
          if (isFinite(q)) {
            if (q < min) min = q;
            if (q > max) max = q;
          }
        }
      }
    }
    return { qMin: min, qMax: max };
  }, [grid]);

  const qToColor = (maxQ: number): string => {
    const range = qMax - qMin || 1;
    const t = (maxQ - qMin) / range; // 0 to 1
    // Blue (cold/low) to green (high)
    const r = Math.round((1 - t) * 30);
    const g = Math.round(30 + t * 100);
    const b = Math.round(60 + (1 - t) * 80);
    return `rgb(${r},${g},${b})`;
  };

  const svgSize = size * CELL_SIZE + PAD * 2;

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 flex flex-col items-center">
      <h3 className="text-sm font-semibold text-slate-200 mb-3">
        Grid World ({size}x{size}) - Q-Value Heatmap
      </h3>
      <svg width={svgSize} height={svgSize} viewBox={`0 0 ${svgSize} ${svgSize}`}>
        {grid.map((row, r) =>
          row.map((cell, c) => {
            const x = PAD + c * CELL_SIZE;
            const y = PAD + r * CELL_SIZE;
            const maxQ = Math.max(...cell.qValues.filter(q => isFinite(q)));
            const bestAction = cell.qValues.indexOf(Math.max(...cell.qValues));

            let fill = qToColor(isFinite(maxQ) ? maxQ : 0);
            if (cell.type === 'wall') fill = '#1e293b';
            if (cell.type === 'goal') fill = '#854d0e';
            if (cell.type === 'pit') fill = '#7f1d1d';

            const isAgent = r === agentPos[0] && c === agentPos[1];

            return (
              <g key={`${r}-${c}`} onClick={() => onCellClick(r, c)} className="cursor-pointer">
                {/* Cell background */}
                <rect x={x + 1} y={y + 1} width={CELL_SIZE - 2} height={CELL_SIZE - 2}
                  rx={4} fill={fill} stroke="#334155" strokeWidth={1} />

                {/* Goal star */}
                {cell.type === 'goal' && (
                  <text x={x + CELL_SIZE / 2} y={y + CELL_SIZE / 2 + 5}
                    textAnchor="middle" fontSize={22} fill="#fbbf24">
                    &#9733;
                  </text>
                )}

                {/* Pit X */}
                {cell.type === 'pit' && (
                  <text x={x + CELL_SIZE / 2} y={y + CELL_SIZE / 2 + 6}
                    textAnchor="middle" fontSize={20} fontWeight="bold" fill="#ef4444">
                    X
                  </text>
                )}

                {/* Policy arrow for empty cells */}
                {cell.type === 'empty' && (maxQ !== 0 || cell.qValues.some(q => q !== 0)) && (
                  <line
                    x1={x + CELL_SIZE / 2}
                    y1={y + CELL_SIZE / 2}
                    x2={x + CELL_SIZE / 2 + ARROWS[bestAction].dx * 18}
                    y2={y + CELL_SIZE / 2 + ARROWS[bestAction].dy * 18}
                    stroke="#67e8f9" strokeWidth={2.5} markerEnd="url(#policyArrow)"
                  />
                )}

                {/* Q-value in corner */}
                {cell.type === 'empty' && (
                  <text x={x + 4} y={y + CELL_SIZE - 4}
                    fontSize={8} fill="#94a3b8" fontFamily="monospace">
                    {isFinite(maxQ) ? maxQ.toFixed(1) : '0'}
                  </text>
                )}

                {/* Agent marker */}
                {isAgent && (
                  <circle cx={x + CELL_SIZE / 2} cy={y + CELL_SIZE / 2} r={10}
                    fill="#22d3ee" stroke="#0891b2" strokeWidth={2} opacity={0.9} />
                )}
              </g>
            );
          })
        )}

        <defs>
          <marker id="policyArrow" viewBox="0 0 10 10" refX={8} refY={5}
            markerWidth={5} markerHeight={5} orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#67e8f9" />
          </marker>
        </defs>
      </svg>

      <div className="flex gap-4 mt-3 text-xs text-slate-400">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-cyan-400 inline-block" /> Agent
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded inline-block" style={{ backgroundColor: '#854d0e' }} /> Goal (+10)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded inline-block" style={{ backgroundColor: '#7f1d1d' }} /> Pit (-10)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded inline-block bg-slate-800" /> Wall
        </span>
      </div>
    </div>
  );
};
