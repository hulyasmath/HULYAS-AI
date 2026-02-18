import React, { useMemo } from 'react';
import { Activity, TrendingUp } from 'lucide-react';
import { EntropyVerifier, calculateShannonEntropy } from '../shared/EntropyVerifier';
import { KolmogorovChecker } from '../shared/KolmogorovChecker';

interface SignalEntropyProps {
  samples: number[];
}

/** Compute signal-to-noise ratio estimate */
function computeSNR(samples: number[]): number {
  if (samples.length === 0) return 0;
  const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
  const signalPower = samples.reduce((a, s) => a + s * s, 0) / samples.length;
  const noisePower = samples.reduce((a, s) => a + (s - mean) * (s - mean), 0) / samples.length;
  if (noisePower === 0) return Infinity;
  return 10 * Math.log10(signalPower / noisePower);
}

/** Approximate entropy (ApEn) for irregularity detection */
function computeApproximateEntropy(samples: number[], m: number = 2, r?: number): number {
  const N = samples.length;
  if (N < m + 1) return 0;

  // r defaults to 0.2 * std
  if (r === undefined) {
    const mean = samples.reduce((a, b) => a + b, 0) / N;
    const std = Math.sqrt(samples.reduce((a, s) => a + (s - mean) * (s - mean), 0) / N);
    r = 0.2 * std;
  }
  if (r === 0) return 0;

  function phi(dim: number): number {
    const templates: number[][] = [];
    for (let i = 0; i <= N - dim; i++) {
      templates.push(samples.slice(i, i + dim));
    }
    let sum = 0;
    for (let i = 0; i < templates.length; i++) {
      let count = 0;
      for (let j = 0; j < templates.length; j++) {
        const maxDist = Math.max(...templates[i].map((v, k) => Math.abs(v - templates[j][k])));
        if (maxDist <= r!) count++;
      }
      sum += Math.log(count / templates.length);
    }
    return sum / templates.length;
  }

  return phi(m) - phi(m + 1);
}

export const SignalEntropy: React.FC<SignalEntropyProps> = ({ samples }) => {
  const snr = useMemo(() => computeSNR(samples), [samples]);

  // Subsample for ApEn to avoid performance issues (use first 200 samples)
  const apEnSamples = useMemo(() => samples.slice(0, 200), [samples]);
  const apEn = useMemo(() => computeApproximateEntropy(apEnSamples), [apEnSamples]);

  // Entropy data from discretized samples
  const entropyData = useMemo(() => {
    return samples.map(s => Math.round(s * 10) / 10);
  }, [samples]);

  // String representation for Kolmogorov
  const kolmogorovData = useMemo(() => {
    return samples.slice(0, 500).map(s => s.toFixed(2)).join(',');
  }, [samples]);

  const shannonResult = useMemo(() => calculateShannonEntropy(entropyData), [entropyData]);

  return (
    <div className="space-y-4">
      {/* Signal Metrics */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Activity size={18} className="text-cyan-400" />
          <h3 className="text-sm font-semibold text-slate-200">Signal Metrics</h3>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-900/50 rounded-lg p-3">
            <div className="text-xs text-slate-400 mb-1">Signal-to-Noise Ratio</div>
            <div className="text-lg font-mono text-cyan-400">{snr.toFixed(2)} dB</div>
            <div className="text-xs text-slate-500">
              {snr > 20 ? 'Excellent' : snr > 10 ? 'Good' : snr > 0 ? 'Fair' : 'Poor'}
            </div>
          </div>

          <div className="bg-slate-900/50 rounded-lg p-3">
            <div className="text-xs text-slate-400 mb-1">Approximate Entropy</div>
            <div className="text-lg font-mono text-orange-400">{apEn.toFixed(4)}</div>
            <div className="text-xs text-slate-500">
              {apEn > 1.0 ? 'High irregularity' : apEn > 0.5 ? 'Moderate' : 'Regular pattern'}
            </div>
          </div>

          <div className="bg-slate-900/50 rounded-lg p-3">
            <div className="text-xs text-slate-400 mb-1">Shannon Entropy</div>
            <div className="text-lg font-mono text-emerald-400">{shannonResult.shannonEntropy.toFixed(4)}</div>
            <div className="text-xs text-slate-500">
              Normalized: {(shannonResult.normalizedEntropy * 100).toFixed(1)}%
            </div>
          </div>

          <div className="bg-slate-900/50 rounded-lg p-3">
            <div className="text-xs text-slate-400 mb-1">Sample Count</div>
            <div className="text-lg font-mono text-slate-300">{samples.length}</div>
            <div className="text-xs text-slate-500">
              Unique values: {new Set(entropyData).size}
            </div>
          </div>
        </div>

        {/* Regularity indicator bar */}
        <div>
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Regular</span>
            <TrendingUp size={12} />
            <span>Irregular</span>
          </div>
          <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300 bg-gradient-to-r from-emerald-500 via-amber-500 to-red-500"
              style={{ width: `${Math.min(apEn * 50, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Shannon Entropy Verifier */}
      <EntropyVerifier data={entropyData} label="Signal Shannon Entropy" />

      {/* Kolmogorov Complexity */}
      <KolmogorovChecker data={kolmogorovData} label="Signal Complexity" />
    </div>
  );
};
