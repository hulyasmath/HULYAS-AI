import React, { useState } from 'react';
import { Play, CheckCircle2, XCircle } from 'lucide-react';
import { executeOperator } from '../../../services/operators';
import type { SelectedOperator } from '../operators/OperatorDrawer';
import { buildOperatorParams } from '../operators/paramTemplates';

type ChainResult = {
  id: string;
  ok: boolean;
  value?: any;
  error?: string;
  metadata?: any;
};

export function Step5ExecuteChain(props: {
  selectedOperators: SelectedOperator[];
  globalParams: Record<string, any>;
}) {
  const { selectedOperators, globalParams } = props;
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<ChainResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  // Use ref instead of state to prevent re-render loops
  const hasAutoRunRef = React.useRef(false);

  // Auto-run on mount only (not on every re-render)
  // FIXED: Removed reactive dependencies that could cause re-triggers
  React.useEffect(() => {
    // Only run once on mount when operators are selected
    if (selectedOperators.length > 0 && !hasAutoRunRef.current) {
      hasAutoRunRef.current = true;
      const timer = setTimeout(() => {
        // Check running state at execution time to avoid race conditions
        if (!running) {
          runChain();
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, []); // Empty deps - only run on mount

  const runChain = async () => {
    setError(null);
    setRunning(true);
    setResults([]);
    try {
      const out: ChainResult[] = [];
      for (const op of selectedOperators) {
        try {
          const params = buildOperatorParams(op.id, globalParams || {}, op.params || {});
          const res = await executeOperator(op.id, params);
          out.push({ id: op.id, ok: true, value: res.result?.value, metadata: res.metadata });
        } catch (e: any) {
          out.push({ id: op.id, ok: false, error: String(e?.message || e) });
        }
      }
      setResults(out);
    } catch (e: any) {
      setError(String(e?.message || e));
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white/[0.02] backdrop-blur-xl rounded-[2rem] p-6 md:p-10 border border-white/5">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h3 className="text-xl md:text-2xl font-bold font-futuristic uppercase tracking-tight text-white">
              Step 5: Execute (SDK Operator Chain)
            </h3>
            <p className="text-slate-400 text-sm mt-1">
              Executes selected operators sequentially via <span className="font-mono">/api/zeq/operators/execute</span>. Global constants are merged into each operator’s params.
            </p>
          </div>
          <button
            onClick={runChain}
            disabled={running || selectedOperators.length === 0}
            className="px-5 py-3 rounded-xl bg-cyan-500 text-black font-bold uppercase tracking-[0.2em] text-xs hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2"
          >
            <Play size={16} className="fill-current" />
            {running ? 'Running…' : 'Run Chain'}
          </button>
        </div>

        {selectedOperators.length === 0 ? (
          <div className="mt-8 text-slate-500">No operators selected. Go to Step 2 and select operators from the periodic table.</div>
        ) : (
          <div className="mt-8">
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 mb-3">
              Selected ({selectedOperators.length})
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedOperators.map((o) => (
                <span key={o.id} className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 font-mono text-sm text-slate-200">
                  {o.id}
                </span>
              ))}
            </div>
          </div>
        )}

        {error ? (
          <div className="mt-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
            {error}
          </div>
        ) : null}

        {results.length > 0 ? (
          <div className="mt-10 space-y-3">
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Results</div>
            <div className="space-y-2">
              {results.map((r) => (
                <div key={r.id} className="p-4 rounded-2xl border border-white/10 bg-slate-950/40">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="font-mono text-slate-100 font-semibold">{r.id}</div>
                      {r.ok ? (
                        <div className="text-slate-300 text-sm mt-2">
                          value: <span className="font-mono text-cyan-300">{String(r.value)}</span>
                        </div>
                      ) : (
                        <div className="text-red-300 text-sm mt-2 break-words">{r.error}</div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {r.ok ? <CheckCircle2 size={18} className="text-emerald-400" /> : <XCircle size={18} className="text-red-400" />}
                    </div>
                  </div>
                  {r.ok && r.metadata ? (
                    <div className="mt-3 text-slate-500 text-xs font-mono">
                      exec_ms: {r.metadata.execution_time_ms} · ts: {r.metadata.timestamp}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

