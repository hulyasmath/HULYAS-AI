import React, { useMemo } from 'react';
import { Binary, CheckCircle, AlertTriangle } from 'lucide-react';
import { KolmogorovData } from './types';

/** CS87 Kolmogorov complexity estimation via compression ratio */
export function estimateKolmogorov(data: string): KolmogorovData {
  const original = new TextEncoder().encode(data);
  // Simple RLE-based compression estimate
  let compressed = 0;
  let i = 0;
  while (i < data.length) {
    let run = 1;
    while (i + run < data.length && data[i + run] === data[i] && run < 255) run++;
    compressed += 2; // char + count
    i += run;
  }

  const ratio = original.length > 0 ? compressed / original.length : 1;
  return {
    originalSize: original.length,
    compressedSize: compressed,
    ratio,
    complexity: ratio > 0.8 ? 'high' : ratio > 0.4 ? 'medium' : 'low',
  };
}

interface KolmogorovCheckerProps {
  data: string;
  label?: string;
  compact?: boolean;
}

export const KolmogorovChecker: React.FC<KolmogorovCheckerProps> = ({ data, label = 'Kolmogorov Complexity', compact = false }) => {
  const result = useMemo(() => estimateKolmogorov(data), [data]);
  const color = result.complexity === 'high' ? 'text-cyan-400' : result.complexity === 'medium' ? 'text-amber-400' : 'text-emerald-400';

  if (compact) {
    return (
      <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-slate-700/50 ${color}`}>
        <Binary size={12} />
        K={result.ratio.toFixed(3)}
      </span>
    );
  }

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3">
      <div className="flex items-center gap-2 mb-2">
        <Binary size={16} className={color} />
        <span className="text-sm font-medium text-slate-200">{label} (CS87)</span>
      </div>
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div>
          <span className="text-slate-400">Original</span>
          <p className="text-slate-300 font-mono">{result.originalSize}B</p>
        </div>
        <div>
          <span className="text-slate-400">Compressed</span>
          <p className="text-slate-300 font-mono">{result.compressedSize}B</p>
        </div>
        <div>
          <span className="text-slate-400">Complexity</span>
          <p className={`font-mono capitalize ${color}`}>{result.complexity}</p>
        </div>
      </div>
    </div>
  );
};
