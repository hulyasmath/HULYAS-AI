import React from 'react';
import { PowerFlowResult, Line } from './index';

interface PowerFlowResultsProps {
  pfResult: PowerFlowResult;
  lines: Line[];
  syncValue: number;
}

export const PowerFlowResults: React.FC<PowerFlowResultsProps> = ({
  pfResult, lines, syncValue,
}) => {
  const { buses, linePowers, converged, iterations, maxMismatch } = pfResult;

  // Voltage profile data
  const minV = Math.min(...buses.map((b) => b.V));
  const maxV = Math.max(...buses.map((b) => b.V));

  return (
    <div className="space-y-4">
      {/* Convergence status */}
      <div className={`border rounded-lg p-3 ${converged ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
        <div className="flex items-center justify-between text-sm">
          <span className={converged ? 'text-emerald-400' : 'text-red-400'}>
            {converged ? 'Power flow converged' : 'Power flow did NOT converge'}
          </span>
          <span className="text-slate-400 text-xs font-mono">
            {iterations} iterations | max mismatch: {maxMismatch.toExponential(2)}
          </span>
        </div>
      </div>

      {/* Voltage Profile Bar Chart */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-200 mb-3">Bus Voltage Profile</h3>
        <svg viewBox="0 0 500 200" className="w-full">
          <rect width={500} height={200} fill="#0f172a" rx="4" />

          {/* Y-axis */}
          {[0.9, 0.95, 1.0, 1.05, 1.1].map((v) => {
            const y = 180 - ((v - 0.85) / 0.3) * 160;
            return (
              <g key={v}>
                <line x1={50} y1={y} x2={470} y2={y} stroke="#1e293b" strokeWidth={0.5} />
                <text x={45} y={y + 3} fill="#64748b" fontSize="8" fontFamily="monospace" textAnchor="end">
                  {v.toFixed(2)}
                </text>
              </g>
            );
          })}

          {/* Normal voltage band */}
          <rect
            x={50}
            y={180 - ((1.05 - 0.85) / 0.3) * 160}
            width={420}
            height={((1.05 - 0.95) / 0.3) * 160}
            fill="rgba(34,197,94,0.05)"
            stroke="rgba(34,197,94,0.2)"
            strokeWidth={0.5}
            strokeDasharray="4,2"
          />

          {/* Bars */}
          {buses.map((bus, i) => {
            const barW = Math.min(60, 400 / buses.length);
            const barX = 70 + i * (420 / buses.length);
            const barH = ((bus.V - 0.85) / 0.3) * 160;
            const barY = 180 - barH;
            const color = bus.V >= 0.95 && bus.V <= 1.05 ? '#22c55e' : bus.V >= 0.90 ? '#eab308' : '#ef4444';

            return (
              <g key={bus.id}>
                <rect x={barX} y={barY} width={barW - 4} height={barH} fill={color} opacity={0.7} rx={2} />
                <text x={barX + (barW - 4) / 2} y={barY - 5} fill={color} fontSize="9" fontFamily="monospace" textAnchor="middle">
                  {bus.V.toFixed(4)}
                </text>
                <text x={barX + (barW - 4) / 2} y={195} fill="#94a3b8" fontSize="9" fontFamily="monospace" textAnchor="middle">
                  {bus.name}
                </text>
              </g>
            );
          })}

          <text x={15} y={100} fill="#94a3b8" fontSize="9" fontFamily="monospace" textAnchor="middle" transform="rotate(-90,15,100)">
            Voltage (pu)
          </text>
        </svg>
      </div>

      {/* Line Loading */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-200 mb-3">Line Loading</h3>
        <svg viewBox="0 0 500 180" className="w-full">
          <rect width={500} height={180} fill="#0f172a" rx="4" />

          {linePowers.map((lp, i) => {
            const barW = Math.min(80, 400 / linePowers.length);
            const barX = 70 + i * (420 / linePowers.length);
            const maxP = 300;
            const barH = (Math.abs(lp.P) / maxP) * 130;
            const barY = 150 - barH;
            const loading = Math.abs(lp.P) / maxP;
            const color = loading > 0.8 ? '#ef4444' : loading > 0.5 ? '#eab308' : '#22d3ee';

            return (
              <g key={`line-${lp.from}-${lp.to}`}>
                <rect x={barX} y={barY} width={barW - 8} height={barH} fill={color} opacity={0.7} rx={2} />
                <text x={barX + (barW - 8) / 2} y={barY - 5} fill={color} fontSize="8" fontFamily="monospace" textAnchor="middle">
                  {`${Math.abs(lp.P).toFixed(1)} MW`}
                </text>
                <text x={barX + (barW - 8) / 2} y={165} fill="#94a3b8" fontSize="8" fontFamily="monospace" textAnchor="middle">
                  {`${lp.from + 1}-${lp.to + 1}`}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Power Flow Table */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-200 mb-3">Bus Results</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="text-slate-400 border-b border-slate-700">
                <th className="text-left py-2 px-2">Bus</th>
                <th className="text-left py-2 px-2">Type</th>
                <th className="text-right py-2 px-2">|V| (pu)</th>
                <th className="text-right py-2 px-2">{'\u03B8'} (deg)</th>
                <th className="text-right py-2 px-2">Pgen (MW)</th>
                <th className="text-right py-2 px-2">Pload (MW)</th>
              </tr>
            </thead>
            <tbody>
              {buses.map((bus) => (
                <tr key={bus.id} className="border-b border-slate-800 hover:bg-slate-800/30">
                  <td className="py-1.5 px-2 text-slate-200">{bus.name}</td>
                  <td className="py-1.5 px-2 text-slate-400">{bus.type}</td>
                  <td className="py-1.5 px-2 text-right text-cyan-400">{bus.V.toFixed(4)}</td>
                  <td className="py-1.5 px-2 text-right text-orange-400">{(bus.theta * 180 / Math.PI).toFixed(4)}</td>
                  <td className="py-1.5 px-2 text-right text-emerald-400">{bus.Pgen.toFixed(1)}</td>
                  <td className="py-1.5 px-2 text-right text-red-400">{bus.Pload.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Line Results */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-200 mb-3">Line Flows</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="text-slate-400 border-b border-slate-700">
                <th className="text-left py-2 px-2">Line</th>
                <th className="text-right py-2 px-2">P (MW)</th>
                <th className="text-right py-2 px-2">Q (MVAR)</th>
                <th className="text-right py-2 px-2">Loss (MW)</th>
              </tr>
            </thead>
            <tbody>
              {linePowers.map((lp, i) => (
                <tr key={i} className="border-b border-slate-800 hover:bg-slate-800/30">
                  <td className="py-1.5 px-2 text-slate-200">{`Bus ${lp.from + 1} → Bus ${lp.to + 1}`}</td>
                  <td className="py-1.5 px-2 text-right text-cyan-400">{lp.P.toFixed(2)}</td>
                  <td className="py-1.5 px-2 text-right text-orange-400">{lp.Q.toFixed(2)}</td>
                  <td className="py-1.5 px-2 text-right text-red-400">{lp.Ploss.toFixed(3)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
