import React, { useEffect, useMemo, useState } from 'react';
import type { RegistryOperator } from './catalog';
import { X, Copy } from 'lucide-react';
import { getExampleParams } from '../../../services/operators';

export type SelectedOperator = { id: string; params: Record<string, any> };

export function OperatorDrawer(props: {
  open: boolean;
  onClose: () => void;
  op: RegistryOperator | null;
  selected: SelectedOperator | null;
  onUpdateParams: (id: string, params: Record<string, any>) => void;
  onRemove: (id: string) => void;
  globalParams: Record<string, any>;
  setGlobalParams: (p: Record<string, any>) => void;
}) {
  const { open, onClose, op, selected, onUpdateParams, onRemove, globalParams, setGlobalParams } = props;
  const [localJson, setLocalJson] = useState<string>('{}');
  const [globalJson, setGlobalJson] = useState<string>('{}');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);

  useEffect(() => {
    if (selected) {
      setLocalJson(JSON.stringify(selected.params || {}, null, 2));
      setJsonError(null);
    }
  }, [selected?.id]);

  useEffect(() => {
    setGlobalJson(JSON.stringify(globalParams || {}, null, 2));
    setGlobalError(null);
  }, [open]);

  const equation = op?.equation || op?.equationLaTeX || '';

  const applyExample = () => {
    if (!selected) return;
    const example = getExampleParams(selected.id);
    onUpdateParams(selected.id, { ...(selected.params || {}), ...example });
    setLocalJson(JSON.stringify({ ...(selected.params || {}), ...example }, null, 2));
  };

  const saveLocal = () => {
    if (!selected) return;
    try {
      const parsed = JSON.parse(localJson || '{}');
      onUpdateParams(selected.id, parsed);
      setJsonError(null);
    } catch (e: any) {
      setJsonError(String(e?.message || e));
    }
  };

  const saveGlobal = () => {
    try {
      const parsed = JSON.parse(globalJson || '{}');
      setGlobalParams(parsed);
      setGlobalError(null);
    } catch (e: any) {
      setGlobalError(String(e?.message || e));
    }
  };

  const copyText = async (t: string) => {
    try {
      await navigator.clipboard.writeText(t);
    } catch {
      // ignore
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[120] bg-black/70 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-6">
      <div className="w-full max-w-4xl bg-[#0a0a0f] border border-white/10 rounded-t-3xl md:rounded-3xl overflow-hidden shadow-2xl">
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div>
            <div className="font-mono text-cyan-300 font-bold">{op?.id || 'Operator'}</div>
            <div className="text-slate-400 text-sm">{op?.description || ''}</div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10">
            <X size={18} className="text-slate-300" />
          </button>
        </div>

        <div className="p-6 grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-4">
              <div className="flex items-center justify-between gap-3 mb-2">
                <div className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Equation</div>
                {equation ? (
                  <button
                    onClick={() => copyText(equation)}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10"
                    title="Copy equation"
                  >
                    <Copy size={14} className="text-slate-300" />
                  </button>
                ) : null}
              </div>
              {equation ? (
                <pre className="text-slate-200 text-sm font-mono whitespace-pre-wrap">{equation}</pre>
              ) : (
                <div className="text-slate-500 text-sm">No equation available in registry.</div>
              )}
            </div>

            <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-4">
              <div className="flex items-center justify-between gap-3 mb-2">
                <div className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Global Constants / Measurements</div>
                <button
                  onClick={saveGlobal}
                  className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold uppercase tracking-wider"
                >
                  Save
                </button>
              </div>
              <textarea
                value={globalJson}
                onChange={(e) => setGlobalJson(e.target.value)}
                className="w-full min-h-[140px] bg-black/40 border border-white/10 rounded-xl p-3 text-slate-100 font-mono text-xs"
              />
              {globalError ? <div className="mt-2 text-red-300 text-xs">{globalError}</div> : null}
              <div className="mt-2 text-slate-500 text-xs">
                These params are merged into every operator execution (operator-specific params override).
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-4">
              <div className="flex items-center justify-between gap-3 mb-2">
                <div className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Operator Params</div>
                <div className="flex gap-2">
                  <button
                    onClick={applyExample}
                    className="px-3 py-2 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 text-xs font-bold uppercase tracking-wider text-cyan-200"
                  >
                    Add Example
                  </button>
                  <button
                    onClick={saveLocal}
                    className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold uppercase tracking-wider"
                  >
                    Save
                  </button>
                </div>
              </div>
              <textarea
                value={localJson}
                onChange={(e) => setLocalJson(e.target.value)}
                className="w-full min-h-[260px] bg-black/40 border border-white/10 rounded-xl p-3 text-slate-100 font-mono text-xs"
              />
              {jsonError ? <div className="mt-2 text-red-300 text-xs">{jsonError}</div> : null}
            </div>

            {selected ? (
              <div className="flex items-center justify-between gap-3">
                <button
                  onClick={() => onRemove(selected.id)}
                  className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-200 text-xs font-bold uppercase tracking-wider"
                >
                  Remove from chain
                </button>
                <div className="text-slate-500 text-xs">Selected operator is ready for Step 5 execution.</div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

