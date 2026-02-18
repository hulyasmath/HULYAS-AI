import React, { useMemo } from 'react';
import { PrecisionBadge } from '../shared/PrecisionBadge';
import { EntropyVerifier } from '../shared/EntropyVerifier';
import { KolmogorovChecker } from '../shared/KolmogorovChecker';
import { Station, richterMagnitude } from './index';

interface SeismoMetricsProps {
  arrivals: { tp: number; ts: number };
  magnitude: number;
  depth: number;
  epicentralDist: number;
  m0: number;
  mwComputed: number;
  stations: Station[];
  stationDistances: number[];
  epicenter: { x: number; y: number } | null;
  refPSTime: number;
  syncValue: number;
  traces: { data: number[]; tp: number; ts: number }[];
}

export const SeismoMetrics: React.FC<SeismoMetricsProps> = ({
  arrivals, magnitude, depth, epicentralDist, m0, mwComputed,
  stations, stationDistances, epicenter, refPSTime, syncValue, traces,
}) => {
  const psDiff = arrivals.ts - arrivals.tp;

  // Richter magnitude estimate from amplitude at distance
  const mlEstimate = useMemo(() => {
    const amplitude = Math.pow(10, (magnitude - 1)) * 0.1; // mm
    return richterMagnitude(amplitude, epicentralDist);
  }, [magnitude, epicentralDist]);

  // Reference P-S time at 100km
  const computedRefPS = useMemo(() => {
    return (100 / 3.5) - (100 / 6.0);
  }, []);

  // Trace entropy data
  const traceData = useMemo(() => {
    if (traces.length === 0) return [];
    return traces[0].data.filter((v) => isFinite(v));
  }, [traces]);

  // Serialized state for Kolmogorov
  const serializedState = useMemo(() => {
    return JSON.stringify({
      tp: arrivals.tp,
      ts: arrivals.ts,
      magnitude,
      depth,
      dist: epicentralDist,
      mw: mwComputed,
      epicenter,
    });
  }, [arrivals, magnitude, depth, epicentralDist, mwComputed, epicenter]);

  return (
    <div className="space-y-4">
      {/* Triangulation Map */}
      <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-200 mb-3">Epicenter Triangulation</h3>
        <svg viewBox="0 0 500 400" className="w-full" style={{ maxHeight: 350 }}>
          <rect width={500} height={400} fill="#0f172a" />

          {/* Grid */}
          {Array.from({ length: 10 }, (_, i) => (
            <g key={`grid-${i}`}>
              <line x1={i * 50} y1={0} x2={i * 50} y2={400} stroke="#1e293b" strokeWidth={0.5} />
              <line x1={0} y1={i * 40} x2={500} y2={i * 40} stroke="#1e293b" strokeWidth={0.5} />
            </g>
          ))}

          {/* Station circles (distance rings) */}
          {stations.map((sta, i) => (
            <g key={sta.label}>
              <circle
                cx={sta.x} cy={sta.y}
                r={stationDistances[i] * 0.3}
                fill="none"
                stroke={['#22d3ee', '#fb923c', '#a78bfa'][i]}
                strokeWidth={1}
                strokeDasharray="4,3"
                opacity={0.5}
              />
              {/* Station marker */}
              <polygon
                points={`${sta.x},${sta.y - 8} ${sta.x - 6},${sta.y + 4} ${sta.x + 6},${sta.y + 4}`}
                fill={['#22d3ee', '#fb923c', '#a78bfa'][i]}
              />
              <text x={sta.x + 10} y={sta.y + 4} fill="#e2e8f0" fontSize="10" fontFamily="monospace">
                {sta.label}
              </text>
              <text x={sta.x + 10} y={sta.y + 16} fill="#64748b" fontSize="8" fontFamily="monospace">
                d={stationDistances[i].toFixed(0)}km
              </text>
            </g>
          ))}

          {/* Epicenter estimate */}
          {epicenter && (
            <g>
              <circle cx={epicenter.x} cy={epicenter.y} r={10 + Math.abs(syncValue) * 20} fill="none" stroke="#ef4444" strokeWidth={1} opacity={0.4} />
              <circle cx={epicenter.x} cy={epicenter.y} r={6} fill="#ef4444" />
              <circle cx={epicenter.x} cy={epicenter.y} r={3} fill="#fca5a5" />
              <text x={epicenter.x + 12} y={epicenter.y + 4} fill="#fca5a5" fontSize="10" fontFamily="monospace" fontWeight="bold">
                Epicenter
              </text>
            </g>
          )}

          <text x={10} y={390} fill="#64748b" fontSize="9" fontFamily="monospace">
            Triangulation: intersection of 3 distance circles (least squares)
          </text>
        </svg>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 space-y-3">
          <h3 className="text-sm font-semibold text-slate-200">Seismic Parameters</h3>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-400">P-wave arrival</span>
              <p className="font-mono text-cyan-400 text-lg">{arrivals.tp.toFixed(2)}s</p>
            </div>
            <div>
              <span className="text-slate-400">S-wave arrival</span>
              <p className="font-mono text-orange-400 text-lg">{arrivals.ts.toFixed(2)}s</p>
            </div>
            <div>
              <span className="text-slate-400">P-S difference</span>
              <p className="font-mono text-emerald-400 text-lg">{psDiff.toFixed(2)}s</p>
            </div>
            <div>
              <span className="text-slate-400">Epicentral dist</span>
              <p className="font-mono text-cyan-400 text-lg">{epicentralDist} km</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 space-y-3">
          <h3 className="text-sm font-semibold text-slate-200">Magnitude Estimates</h3>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-400">Input Mw</span>
              <p className="font-mono text-orange-400 text-lg">{magnitude.toFixed(1)}</p>
            </div>
            <div>
              <span className="text-slate-400">Computed Mw</span>
              <p className="font-mono text-cyan-400 text-lg">{mwComputed.toFixed(2)}</p>
            </div>
            <div>
              <span className="text-slate-400">Seismic Moment</span>
              <p className="font-mono text-slate-300">{m0.toExponential(2)} N&middot;m</p>
            </div>
            <div>
              <span className="text-slate-400">ML estimate</span>
              <p className="font-mono text-slate-300">{mlEstimate.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Depth estimate */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-200 mb-2">Depth Classification</h3>
        <div className="flex gap-4 text-xs">
          <div className={`px-3 py-2 rounded border ${depth <= 70 ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-slate-700/30 border-slate-600 text-slate-500'}`}>
            Shallow (0-70km)
          </div>
          <div className={`px-3 py-2 rounded border ${depth > 70 && depth <= 300 ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'bg-slate-700/30 border-slate-600 text-slate-500'}`}>
            Intermediate (70-300km)
          </div>
          <div className={`px-3 py-2 rounded border ${depth > 300 ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-slate-700/30 border-slate-600 text-slate-500'}`}>
            Deep (300-700km)
          </div>
        </div>
      </div>

      {/* Verification Badges */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-200">Verification</h3>
        <PrecisionBadge computed={mwComputed} reference={magnitude} label="Moment Magnitude (Mw roundtrip)" />
        <PrecisionBadge computed={computedRefPS} reference={refPSTime} label="P-S time at 100km (ref=11.9s)" />
        <EntropyVerifier data={traceData} label="Seismogram Trace Entropy" />
        <KolmogorovChecker data={serializedState} label="Seismic State Complexity" />
      </div>
    </div>
  );
};
