import React from 'react';
import { Shield, ShieldCheck, ShieldAlert, Lock } from 'lucide-react';

interface IntegrityBadgeProps {
  entropyScore?: number;
  kolmogorovScore?: number;
  signature?: string;
  compact?: boolean;
}

export const IntegrityBadge: React.FC<IntegrityBadgeProps> = ({ entropyScore, kolmogorovScore, signature, compact = false }) => {
  const hasEntropy = entropyScore !== undefined && entropyScore > 0;
  const hasKolmogorov = kolmogorovScore !== undefined && kolmogorovScore > 0;
  const hasSig = !!signature;

  const entropyOk = hasEntropy && entropyScore > 3.0;
  const kolmogorovOk = hasKolmogorov && kolmogorovScore > 0.3;
  const allGood = entropyOk && kolmogorovOk && hasSig;

  const Icon = allGood ? ShieldCheck : (hasEntropy || hasKolmogorov) ? Shield : ShieldAlert;
  const color = allGood ? 'text-emerald-400' : (hasEntropy || hasKolmogorov) ? 'text-amber-400' : 'text-red-400';
  const bg = allGood ? 'bg-emerald-500/10 border-emerald-500/20' : (hasEntropy || hasKolmogorov) ? 'bg-amber-500/10 border-amber-500/20' : 'bg-red-500/10 border-red-500/20';

  if (compact) {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded ${bg} ${color} border`}>
          <Icon size={12} />
          {allGood ? 'Verified' : 'Partial'}
        </span>
        {hasEntropy && (
          <span className="text-xs text-slate-400 font-mono">H={entropyScore.toFixed(2)}</span>
        )}
        {hasKolmogorov && (
          <span className="text-xs text-slate-400 font-mono">K={kolmogorovScore.toFixed(3)}</span>
        )}
        {hasSig && (
          <span className="inline-flex items-center gap-0.5 text-xs text-slate-400">
            <Lock size={10} />
            Signed
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`rounded-lg border p-4 ${bg}`}>
      <div className="flex items-center gap-2 mb-3">
        <Icon size={18} className={color} />
        <span className={`text-sm font-bold ${color}`}>
          {allGood ? 'Integrity Verified' : 'Partial Verification'}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-3 text-xs">
        <div>
          <span className="text-slate-400">Shannon Entropy</span>
          <p className={`font-mono ${entropyOk ? 'text-emerald-400' : 'text-amber-400'}`}>
            {hasEntropy ? entropyScore.toFixed(4) : 'N/A'}
          </p>
        </div>
        <div>
          <span className="text-slate-400">Kolmogorov</span>
          <p className={`font-mono ${kolmogorovOk ? 'text-emerald-400' : 'text-amber-400'}`}>
            {hasKolmogorov ? kolmogorovScore.toFixed(4) : 'N/A'}
          </p>
        </div>
        <div>
          <span className="text-slate-400">Signature</span>
          <p className={`font-mono ${hasSig ? 'text-emerald-400' : 'text-red-400'}`}>
            {hasSig ? `${signature.slice(0, 8)}...` : 'Unsigned'}
          </p>
        </div>
      </div>
    </div>
  );
};
