import React, { useMemo } from 'react';
import { Shield, CheckCircle, AlertTriangle } from 'lucide-react';
import { EntropyData } from './types';

/** CS47 Shannon entropy calculation */
export function calculateShannonEntropy(data: number[]): EntropyData {
  if (!data.length) return { shannonEntropy: 0, maxEntropy: 0, normalizedEntropy: 0, dataLength: 0 };

  const freq = new Map<number, number>();
  for (const v of data) {
    const key = Math.round(v * 1e6) / 1e6;
    freq.set(key, (freq.get(key) || 0) + 1);
  }

  const n = data.length;
  let entropy = 0;
  for (const count of freq.values()) {
    const p = count / n;
    if (p > 0) entropy -= p * Math.log2(p);
  }

  const maxEntropy = Math.log2(freq.size || 1);
  return {
    shannonEntropy: entropy,
    maxEntropy,
    normalizedEntropy: maxEntropy > 0 ? entropy / maxEntropy : 0,
    dataLength: n,
  };
}

interface EntropyVerifierProps {
  data: number[];
  label?: string;
  compact?: boolean;
}

export const EntropyVerifier: React.FC<EntropyVerifierProps> = ({ data, label = 'Shannon Entropy', compact = false }) => {
  const entropy = useMemo(() => calculateShannonEntropy(data), [data]);
  const isHealthy = entropy.normalizedEntropy > 0.5;

  if (compact) {
    return (
      <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded ${isHealthy ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
        <Shield size={12} />
        H={entropy.shannonEntropy.toFixed(3)}
      </span>
    );
  }

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3">
      <div className="flex items-center gap-2 mb-2">
        {isHealthy ? <CheckCircle size={16} className="text-emerald-400" /> : <AlertTriangle size={16} className="text-amber-400" />}
        <span className="text-sm font-medium text-slate-200">{label} (CS47)</span>
      </div>
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div>
          <span className="text-slate-400">H(X)</span>
          <p className="text-cyan-400 font-mono">{entropy.shannonEntropy.toFixed(4)}</p>
        </div>
        <div>
          <span className="text-slate-400">H_max</span>
          <p className="text-slate-300 font-mono">{entropy.maxEntropy.toFixed(4)}</p>
        </div>
        <div>
          <span className="text-slate-400">Normalized</span>
          <p className={`font-mono ${isHealthy ? 'text-emerald-400' : 'text-amber-400'}`}>{(entropy.normalizedEntropy * 100).toFixed(1)}%</p>
        </div>
      </div>
    </div>
  );
};
