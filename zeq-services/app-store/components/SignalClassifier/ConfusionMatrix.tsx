import React, { useMemo } from 'react';
import type { ClassificationResult, SignalType } from './index';

interface ConfusionMatrixProps {
  result: ClassificationResult | null;
  classes: SignalType[];
}

export const ConfusionMatrix: React.FC<ConfusionMatrixProps> = ({ result, classes }) => {
  const metrics = useMemo(() => {
    if (!result) return null;

    const { confusionMatrix } = result;
    const n = classes.length;

    const perClass = classes.map((cls, i) => {
      let tp = confusionMatrix[i][i];
      let fp = 0, fn = 0, tn = 0;
      for (let j = 0; j < n; j++) {
        if (j !== i) {
          fp += confusionMatrix[j][i]; // predicted as i but not i
          fn += confusionMatrix[i][j]; // actual is i but predicted as j
        }
      }
      for (let r = 0; r < n; r++) {
        for (let c = 0; c < n; c++) {
          if (r !== i && c !== i) tn += confusionMatrix[r][c];
        }
      }
      const precision = tp + fp > 0 ? tp / (tp + fp) : 0;
      const recall = tp + fn > 0 ? tp / (tp + fn) : 0;
      const f1 = precision + recall > 0 ? 2 * precision * recall / (precision + recall) : 0;

      return { cls, tp, fp, fn, tn, precision, recall, f1 };
    });

    // ROC data for each class (one-vs-rest simplified)
    const rocCurves = classes.map((cls, classIdx) => {
      // For simplicity, use confidence approximation from confusion matrix
      const points: { fpr: number; tpr: number }[] = [{ fpr: 0, tpr: 0 }];
      const m = perClass[classIdx];
      if (m.tp + m.fn > 0 && m.fp + m.tn > 0) {
        const tpr = m.tp / (m.tp + m.fn);
        const fpr = m.fp / (m.fp + m.tn);
        points.push({ fpr, tpr });
      }
      points.push({ fpr: 1, tpr: 1 });

      // AUC via trapezoidal integration
      let auc = 0;
      for (let i = 1; i < points.length; i++) {
        auc += (points[i].fpr - points[i - 1].fpr) * (points[i].tpr + points[i - 1].tpr) / 2;
      }

      return { cls, points, auc: isFinite(auc) ? auc : 0 };
    });

    return { perClass, rocCurves };
  }, [result, classes]);

  if (!result) {
    return (
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8 text-center text-slate-400">
        Run classification to see the confusion matrix and ROC curves.
      </div>
    );
  }

  const maxVal = Math.max(1, ...result.confusionMatrix.flat());

  return (
    <div className="space-y-4">
      {/* Confusion Matrix */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-200 mb-3">Confusion Matrix</h3>
        <div className="overflow-x-auto">
          <table className="mx-auto">
            <thead>
              <tr>
                <th className="p-1 text-xs text-slate-500" />
                <th colSpan={classes.length} className="text-xs text-slate-400 text-center pb-1">Predicted</th>
              </tr>
              <tr>
                <th className="p-1 text-xs text-slate-500" />
                {classes.map(cls => (
                  <th key={cls} className="px-2 py-1 text-xs text-slate-400 capitalize font-mono">{cls}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {result.confusionMatrix.map((row, r) => (
                <tr key={r}>
                  <td className="px-2 py-1 text-xs text-slate-400 capitalize font-mono text-right">
                    {r === 0 && <span className="text-slate-500 text-[10px] mr-1">Actual</span>}
                    {classes[r]}
                  </td>
                  {row.map((val, c) => {
                    const intensity = val / maxVal;
                    const isDiag = r === c;
                    const bg = isDiag
                      ? `rgba(34, 211, 238, ${0.1 + intensity * 0.5})`
                      : `rgba(239, 68, 68, ${intensity * 0.4})`;
                    return (
                      <td key={c}
                        className="w-12 h-10 text-center text-sm font-mono font-bold border border-slate-700"
                        style={{ backgroundColor: bg, color: val > 0 ? '#e2e8f0' : '#475569' }}>
                        {val}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Per-class Metrics */}
      {metrics && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-slate-200 mb-3">Per-Class Metrics</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-slate-700">
                  <th className="text-left py-2 pr-3">Class</th>
                  <th className="text-right py-2 pr-3">TP</th>
                  <th className="text-right py-2 pr-3">FP</th>
                  <th className="text-right py-2 pr-3">FN</th>
                  <th className="text-right py-2 pr-3">Precision</th>
                  <th className="text-right py-2 pr-3">Recall</th>
                  <th className="text-right py-2 pr-3">F1</th>
                  <th className="text-right py-2">AUC</th>
                </tr>
              </thead>
              <tbody>
                {metrics.perClass.map((m, i) => (
                  <tr key={m.cls} className="border-b border-slate-800 text-slate-300">
                    <td className="py-1.5 pr-3 font-mono capitalize">{m.cls}</td>
                    <td className="py-1.5 pr-3 font-mono text-right text-emerald-400">{m.tp}</td>
                    <td className="py-1.5 pr-3 font-mono text-right text-red-400">{m.fp}</td>
                    <td className="py-1.5 pr-3 font-mono text-right text-amber-400">{m.fn}</td>
                    <td className="py-1.5 pr-3 font-mono text-right">{(m.precision * 100).toFixed(1)}%</td>
                    <td className="py-1.5 pr-3 font-mono text-right">{(m.recall * 100).toFixed(1)}%</td>
                    <td className="py-1.5 pr-3 font-mono text-right text-cyan-400">{m.f1.toFixed(3)}</td>
                    <td className="py-1.5 font-mono text-right">{metrics.rocCurves[i].auc.toFixed(3)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ROC Curves */}
      {metrics && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-slate-200 mb-3">ROC Curves (One-vs-Rest)</h3>
          <div className="flex justify-center">
            <svg width={320} height={320} viewBox="0 0 320 320">
              {/* Background */}
              <rect x={40} y={10} width={260} height={260} fill="#0f172a" rx={4} />

              {/* Grid */}
              {[0, 0.25, 0.5, 0.75, 1].map(v => (
                <g key={v}>
                  <line x1={40} y1={10 + (1 - v) * 260} x2={300} y2={10 + (1 - v) * 260}
                    stroke="#1e293b" strokeWidth={0.5} />
                  <line x1={40 + v * 260} y1={10} x2={40 + v * 260} y2={270}
                    stroke="#1e293b" strokeWidth={0.5} />
                  <text x={36} y={10 + (1 - v) * 260 + 4} textAnchor="end"
                    fill="#64748b" fontSize={8} fontFamily="monospace">{v.toFixed(1)}</text>
                  <text x={40 + v * 260} y={282} textAnchor="middle"
                    fill="#64748b" fontSize={8} fontFamily="monospace">{v.toFixed(1)}</text>
                </g>
              ))}

              {/* Diagonal reference */}
              <line x1={40} y1={270} x2={300} y2={10} stroke="#475569" strokeWidth={1} strokeDasharray="4 2" />

              {/* ROC curves */}
              {metrics.rocCurves.map((roc, idx) => {
                const colors = ['#22d3ee', '#f97316', '#a855f7', '#22c55e', '#ef4444'];
                const color = colors[idx % colors.length];
                const pathData = roc.points
                  .map((p, i) => `${i === 0 ? 'M' : 'L'} ${40 + p.fpr * 260} ${10 + (1 - p.tpr) * 260}`)
                  .join(' ');
                return (
                  <path key={roc.cls} d={pathData} fill="none" stroke={color} strokeWidth={2} />
                );
              })}

              {/* Labels */}
              <text x={170} y={300} textAnchor="middle" fill="#94a3b8" fontSize={10}>FPR</text>
              <text x={10} y={140} textAnchor="middle" fill="#94a3b8" fontSize={10}
                transform="rotate(-90, 10, 140)">TPR</text>
            </svg>
          </div>
          <div className="flex gap-3 justify-center mt-2 text-xs text-slate-400 flex-wrap">
            {metrics.rocCurves.map((roc, idx) => {
              const colors = ['text-cyan-400', 'text-orange-400', 'text-purple-400', 'text-green-400', 'text-red-400'];
              return (
                <span key={roc.cls} className={`capitalize ${colors[idx % colors.length]}`}>
                  {roc.cls} (AUC={roc.auc.toFixed(2)})
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
