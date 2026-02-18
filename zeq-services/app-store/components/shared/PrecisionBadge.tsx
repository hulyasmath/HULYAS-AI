import React from 'react';
import { Target, CheckCircle, XCircle } from 'lucide-react';
import { PRECISION_THRESHOLD } from './types';

interface PrecisionBadgeProps {
  computed: number;
  reference: number;
  label?: string;
  compact?: boolean;
}

export const PrecisionBadge: React.FC<PrecisionBadgeProps> = ({ computed, reference, label, compact = false }) => {
  const error = reference !== 0 ? Math.abs((computed - reference) / reference) : (computed === 0 ? 0 : 1);
  const errorPercent = error * 100;
  const withinThreshold = error <= PRECISION_THRESHOLD;

  if (compact) {
    return (
      <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded ${withinThreshold ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
        <Target size={12} />
        {errorPercent.toFixed(4)}%
      </span>
    );
  }

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${withinThreshold ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
      {withinThreshold ? <CheckCircle size={16} className="text-emerald-400" /> : <XCircle size={16} className="text-red-400" />}
      <div className="text-sm">
        {label && <span className="text-slate-300 mr-2">{label}</span>}
        <span className={`font-mono font-bold ${withinThreshold ? 'text-emerald-400' : 'text-red-400'}`}>
          {errorPercent.toFixed(4)}% error
        </span>
        <span className="text-slate-500 ml-2">(threshold: {PRECISION_THRESHOLD * 100}%)</span>
      </div>
    </div>
  );
};
