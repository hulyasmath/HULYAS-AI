import React, { useMemo } from 'react';
import { PrecisionBadge } from '../shared/PrecisionBadge';
import { EntropyVerifier } from '../shared/EntropyVerifier';
import { KolmogorovChecker } from '../shared/KolmogorovChecker';
import { PowerFlowResult, FaultResult, Line } from './index';

interface GridMetricsProps {
  pfResult: PowerFlowResult;
  faultResult: FaultResult;
  lines: Line[];
  syncValue: number;
}

export const GridMetrics: React.FC<GridMetricsProps> = ({
  pfResult, faultResult, lines, syncValue,
}) => {
  const { buses, linePowers, totalGen, totalLoad, totalLoss, converged, iterations } = pfResult;

  const minV = Math.min(...buses.map((b) => b.V));
  const maxV = Math.max(...buses.map((b) => b.V));

  // Voltage data for entropy
  const voltageData = useMemo(() => buses.map((b) => b.V), [buses]);

  // Angle data for entropy
  const angleData = useMemo(() => buses.map((b) => b.theta), [buses]);

  // Serialized state for Kolmogorov
  const serializedState = useMemo(() => JSON.stringify({
    buses: buses.map((b) => ({ V: b.V, theta: b.theta, Pgen: b.Pgen, Pload: b.Pload })),
    linePowers: linePowers.map((lp) => ({ P: lp.P, Q: lp.Q, Ploss: lp.Ploss })),
    fault: faultResult,
    converged,
  }), [buses, linePowers, faultResult, converged]);

  // Reference: power balance check (total gen should equal total load + losses)
  const powerBalance = totalGen - totalLoad - totalLoss;

  // Fault waveform (simplified pre/post fault current)
  const faultWaveform = useMemo(() => {
    const data: number[] = [];
    const preFaultI = 0.5; // pu load current
    const faultI = faultResult.faultCurrent * 1000 / (230 / Math.sqrt(3)); // A
    const faultIPu = faultI / (100e6 / (Math.sqrt(3) * 230e3) * 1000); // normalize

    for (let i = 0; i < 200; i++) {
      const t = i / 200 * 0.2; // 200ms window
      if (t < 0.05) {
        // Pre-fault
        data.push(preFaultI * Math.sin(2 * Math.PI * 60 * t));
      } else if (t < 0.15) {
        // Fault period
        const dt = t - 0.05;
        const dcOffset = Math.exp(-dt / 0.03);
        const val = (isFinite(faultIPu) ? faultIPu : 5) * Math.sin(2 * Math.PI * 60 * t) + dcOffset * 2;
        data.push(isFinite(val) ? val : 0);
      } else {
        // Post-clearing (decaying)
        const dt = t - 0.15;
        data.push(preFaultI * Math.exp(-dt / 0.02) * Math.sin(2 * Math.PI * 60 * t));
      }
    }
    return data;
  }, [faultResult]);

  return (
    <div className="space-y-4">
      {/* Fault Analysis */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-200 mb-3">3-Phase Bolted Fault at {buses[faultResult.busId]?.name}</h3>
        <div className="grid grid-cols-3 gap-4 text-xs mb-4">
          <div>
            <span className="text-slate-400">Fault Current</span>
            <p className="font-mono text-red-400 text-lg">{faultResult.faultCurrent.toFixed(3)} kA</p>
          </div>
          <div>
            <span className="text-slate-400">Thevenin Z</span>
            <p className="font-mono text-cyan-400 text-lg">
              {faultResult.Zth.r.toFixed(4)} + j{faultResult.Zth.x.toFixed(4)} pu
            </p>
          </div>
          <div>
            <span className="text-slate-400">Pre-fault V</span>
            <p className="font-mono text-orange-400 text-lg">{faultResult.preFaultV.toFixed(4)} pu</p>
          </div>
        </div>

        {/* Fault current waveform */}
        <div className="mt-2">
          <h4 className="text-xs text-slate-400 mb-2">Fault Current Waveform</h4>
          <svg viewBox="0 0 500 150" className="w-full">
            <rect width={500} height={150} fill="#0f172a" rx="4" />

            {/* Time axis markers */}
            {[0, 50, 100, 150, 200].map((ms) => {
              const x = 30 + (ms / 200) * 450;
              return (
                <g key={ms}>
                  <line x1={x} y1={10} x2={x} y2={130} stroke="#1e293b" strokeWidth={0.5} />
                  <text x={x} y={145} fill="#64748b" fontSize="8" fontFamily="monospace" textAnchor="middle">
                    {ms}ms
                  </text>
                </g>
              );
            })}

            {/* Fault inception and clearing markers */}
            <line x1={30 + (50 / 200) * 450} y1={5} x2={30 + (50 / 200) * 450} y2={130} stroke="#ef4444" strokeWidth={1} strokeDasharray="3,2" />
            <text x={30 + (50 / 200) * 450} y={8} fill="#ef4444" fontSize="7" fontFamily="monospace" textAnchor="middle">Fault</text>

            <line x1={30 + (150 / 200) * 450} y1={5} x2={30 + (150 / 200) * 450} y2={130} stroke="#22c55e" strokeWidth={1} strokeDasharray="3,2" />
            <text x={30 + (150 / 200) * 450} y={8} fill="#22c55e" fontSize="7" fontFamily="monospace" textAnchor="middle">Clear</text>

            {/* Zero line */}
            <line x1={30} y1={75} x2={480} y2={75} stroke="#334155" strokeWidth={0.5} />

            {/* Waveform */}
            <path
              d={faultWaveform.map((v, i) => {
                const x = 30 + (i / 200) * 450;
                const y = 75 - v * 10;
                const safeY = isFinite(y) ? Math.max(10, Math.min(140, y)) : 75;
                return `${i === 0 ? 'M' : 'L'} ${x} ${safeY}`;
              }).join(' ')}
              fill="none"
              stroke="#fb923c"
              strokeWidth={1.5}
            />
          </svg>
        </div>

        <div className="mt-2 text-xs text-slate-500 font-mono">
          If = Vpre / Zth, Zf = 0 (bolted fault)
        </div>
      </div>

      {/* System Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-slate-200 mb-3">Power Summary</h3>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-400">Total Generation</span>
              <p className="font-mono text-emerald-400 text-lg">{totalGen.toFixed(1)} MW</p>
            </div>
            <div>
              <span className="text-slate-400">Total Load</span>
              <p className="font-mono text-orange-400 text-lg">{totalLoad.toFixed(1)} MW</p>
            </div>
            <div>
              <span className="text-slate-400">Total Losses</span>
              <p className="font-mono text-red-400 text-lg">{totalLoss.toFixed(2)} MW</p>
            </div>
            <div>
              <span className="text-slate-400">Loss Ratio</span>
              <p className="font-mono text-cyan-400 text-lg">
                {totalGen > 0 ? ((totalLoss / totalGen) * 100).toFixed(2) : '0.00'}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-slate-200 mb-3">Voltage Summary</h3>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-400">Min Voltage</span>
              <p className="font-mono text-cyan-400 text-lg">{minV.toFixed(4)} pu</p>
            </div>
            <div>
              <span className="text-slate-400">Max Voltage</span>
              <p className="font-mono text-cyan-400 text-lg">{maxV.toFixed(4)} pu</p>
            </div>
            <div>
              <span className="text-slate-400">Voltage Spread</span>
              <p className="font-mono text-orange-400 text-lg">{((maxV - minV) * 100).toFixed(2)}%</p>
            </div>
            <div>
              <span className="text-slate-400">Iterations</span>
              <p className="font-mono text-slate-300 text-lg">{iterations}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Verification */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-200">Verification</h3>
        <PrecisionBadge
          computed={totalGen}
          reference={totalLoad + totalLoss}
          label="Power balance (Pgen = Pload + Ploss)"
        />
        <PrecisionBadge
          computed={buses[0]?.V || 1.05}
          reference={1.05}
          label="Slack bus voltage (ref=1.05 pu)"
        />
        {buses.find((b) => b.type === 'PV') && (
          <PrecisionBadge
            computed={buses.find((b) => b.type === 'PV')!.V}
            reference={1.02}
            label="PV bus voltage (ref=1.02 pu)"
          />
        )}
        <EntropyVerifier data={voltageData} label="Bus Voltage Distribution Entropy" />
        <EntropyVerifier data={faultWaveform} label="Fault Waveform Entropy" />
        <KolmogorovChecker data={serializedState} label="Grid State Complexity" />
      </div>
    </div>
  );
};
