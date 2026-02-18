import React, { useMemo, useState } from 'react';
import { Play, Sparkles, CheckCircle2, XCircle } from 'lucide-react';

import { parsePrompt, runStrict, type RunResponse } from './api';
import { buildCatalog, defaultCuratedIds, type RegistryOperator } from './operators/catalog';
import type { SelectedOperator } from './operators/OperatorDrawer';
import { executeOperator, getExampleParams } from '../../services/operators';
import { buildOperatorParams, hydrateSelectedOperators } from './operators/paramTemplates';

type ChainRow = {
  id: string;
  ok: boolean;
  value?: any;
  error?: string;
  execMs?: number;
};

function tokenize(input: string): string[] {
  return (input || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/g)
    .map((t) => t.trim())
    .filter((t) => t.length >= 3);
}

function scoreOperator(op: RegistryOperator, tokens: string[]): number {
  const hay = `${op.id} ${op.category} ${op.description || ''} ${op.equation || ''}`.toLowerCase();
  let score = 0;
  for (const t of tokens) {
    if (hay.includes(t)) score += 2;
    if (op.id.toLowerCase().includes(t)) score += 3;
    if ((op.category || '').toLowerCase().includes(t)) score += 1;
  }
  // Always bias toward ZEQ42 (KO42) operator family if present.
  if (op.id.startsWith('KO42')) score += 8;
  // Helpful biases for common physical prompts
  if (tokens.some((t) => ['orbit', 'orbital', 'satellite', 'gravity', 'gravitation'].includes(t)) && op.id.startsWith('GR')) score += 3;
  if (tokens.some((t) => ['fall', 'freefall', 'acceleration', 'force', 'mass'].includes(t)) && op.id.startsWith('NM')) score += 3;
  if (tokens.some((t) => ['quantum', 'tunnel', 'wave', 'schrodinger', 'uncertainty'].includes(t)) && op.id.startsWith('QM')) score += 3;
  return score;
}

function pickOperators(catalog: { operators: RegistryOperator[]; byId: Record<string, RegistryOperator> }, prompt: string): string[] {
  const tokens = tokenize(prompt);
  const scored = catalog.operators
    .map((op) => ({ id: op.id, score: scoreOperator(op, tokens) }))
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id, undefined, { numeric: true }));

  const picked: string[] = [];

  // Ensure KO42 metric tensor components are always included (mandatory).
  for (const must of ['KO42', 'KO42.1', 'KO42.2']) {
    if (catalog.byId[must] && !picked.includes(must)) picked.push(must);
  }

  // Pick up to 3 highest-scoring domain operators (golden rule: max 3 + KO42).
  let domainCount = 0;
  for (const s of scored) {
    if (domainCount >= 3) break;
    if (picked.includes(s.id)) continue;
    // Skip KO42 variants (already included)
    if (s.id === 'KO42' || s.id === 'KO42.1' || s.id === 'KO42.2') continue;
    picked.push(s.id);
    domainCount++;
  }

  // If prompt scoring yields no domain operators, fall back to curated set.
  if (domainCount === 0) {
    for (const id of defaultCuratedIds()) {
      if (domainCount >= 3) break;
      if (catalog.byId[id] && !picked.includes(id) && id !== 'KO42' && id !== 'KO42.1' && id !== 'KO42.2') {
        picked.push(id);
        domainCount++;
      }
    }
  }

  return picked;
}

export function AutoPilot(props: {
  prompt: string;
  setPrompt: (p: string) => void;
  presets: Array<{ id: string; title: string; prompt: string }>;
  onSelectPreset?: (id: string) => void;
  ko42Mode: 'KO42.1' | 'KO42.2';
  globalParams: Record<string, any>;
  setGlobalParams: (p: Record<string, any>) => void;
  setSelectedOperators: (ops: SelectedOperator[]) => void;
}) {
  const { prompt, setPrompt, presets, onSelectPreset, ko42Mode, globalParams, setGlobalParams, setSelectedOperators } = props;
  const catalog = useMemo(() => {
    try {
      return buildCatalog();
    } catch (e) {
      console.error('Failed to build catalog:', e);
      return { byId: {}, operators: [] };
    }
  }, []);
  const [presetQuery, setPresetQuery] = useState('');

  const [running, setRunning] = useState(false);
  const [stage, setStage] = useState<string>('');
  const [chain, setChain] = useState<ChainRow[]>([]);
  const [strictResult, setStrictResult] = useState<RunResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filteredPresets = useMemo(() => {
    const q = presetQuery.trim().toLowerCase();
    if (!q) return presets.slice(0, 12);
    return presets
      .filter((p) => `${p.id} ${p.title} ${p.prompt}`.toLowerCase().includes(q))
      .slice(0, 12);
  }, [presets, presetQuery]);

  const onAutoRun = async () => {
    setError(null);
    setRunning(true);
    setStage('Selecting operators…');
    setChain([]);
    setStrictResult(null);

    try {
      let suggestedKos: Record<string, number> = { KO42: 1.0 };
      try {
        setStage('Parsing prompt (optional)…');
        const parsed = await parsePrompt(prompt);
        suggestedKos = parsed.suggested_kos || suggestedKos;
      } catch {
        // If the 7-step backend isn't available, we still run the SDK chain.
      }
      const chosen = pickOperators(catalog, prompt);

      // Save selection into the guided chain too.
      const selected: SelectedOperator[] = hydrateSelectedOperators(chosen, globalParams || {}, ko42Mode);
      setSelectedOperators(selected);

      setStage(`Executing ${selected.length} operators…`);
      const out: ChainRow[] = [];
      for (const op of selected) {
        try {
          const params = buildOperatorParams(op.id, globalParams || {}, op.params || {});
          const res = await executeOperator(op.id, params);
          out.push({
            id: op.id,
            ok: true,
            value: res.result?.value,
            execMs: res.metadata?.execution_time_ms,
          });
        } catch (e: any) {
          out.push({ id: op.id, ok: false, error: String(e?.message || e) });
        }
        setChain([...out]);
      }

      // Also run strict autotune in the Python 7-step backend (if available).
      setStage('Running strict autotune (≤0.1%)…');
      try {
        const strict = await runStrict({ prompt, t_max: 5.0, dt: 0.01, ko_settings: suggestedKos });
        setStrictResult(strict);
      } catch (e: any) {
        // Non-fatal: chain execution is still useful
        setError(`Strict backend not available: ${String(e?.message || e)}`);
      }

      setStage('Done.');
    } catch (e: any) {
      setError(String(e?.message || e));
      setStage('');
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
              Auto Pilot (1-click)
            </h3>
            <p className="text-slate-400 text-sm mt-1">
              Automatically selects operators from all 1549, runs an SDK chain, then runs strict autotune (if the Python backend is running).
            </p>
          </div>
          <button
            onClick={onAutoRun}
            disabled={running}
            className="px-5 py-3 rounded-xl bg-cyan-500 text-black font-bold uppercase tracking-[0.2em] text-xs hover:bg-white disabled:opacity-40 transition-all flex items-center gap-2"
          >
            <Sparkles size={16} />
            {running ? 'Running…' : 'Auto Run'}
          </button>
        </div>

        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">Problem Prompt</div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full min-h-[140px] bg-black/40 border border-white/10 rounded-2xl p-4 text-slate-100"
            />
            <div className="mt-4">
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">Load preset</div>
              <input
                value={presetQuery}
                onChange={(e) => setPresetQuery(e.target.value)}
                placeholder="Search presets (orbit, fall, three-body)…"
                className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-4 py-3 text-slate-100 placeholder:text-slate-600"
              />
              <div className="mt-3 flex flex-wrap gap-2">
                {filteredPresets.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setPrompt(p.prompt);
                      onSelectPreset?.(p.id);
                    }}
                    className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-bold uppercase tracking-wider"
                    title={p.prompt}
                  >
                    {p.title}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">Global Constants / Measurements</div>
            <textarea
              value={JSON.stringify(globalParams || {}, null, 2)}
              onChange={(e) => {
                try {
                  setGlobalParams(JSON.parse(e.target.value || '{}'));
                } catch {
                  // ignore until valid
                }
              }}
              className="w-full min-h-[140px] bg-black/40 border border-white/10 rounded-2xl p-4 text-slate-100 font-mono text-xs"
            />
            <div className="mt-2 text-slate-500 text-xs">
              These values merge into every operator execution. Use real measurements here (masses, radii, GM, densities, etc.).
            </div>
          </div>
        </div>

        {stage ? (
          <div className="mt-6 text-slate-400 text-sm flex items-center gap-2">
            <Play size={16} className="text-cyan-300 fill-current" />
            <span>{stage}</span>
          </div>
        ) : null}

        {error ? (
          <div className="mt-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
            {error}
          </div>
        ) : null}
      </div>

      <div className="bg-white/[0.02] backdrop-blur-xl rounded-[2rem] p-6 md:p-10 border border-white/5">
        <h3 className="text-xl md:text-2xl font-bold font-futuristic uppercase tracking-tight text-white">
          Outcome
        </h3>
        <p className="text-slate-400 text-sm mt-1">SDK chain execution + strict verification summary.</p>

        {chain.length === 0 ? (
          <div className="mt-8 text-slate-500">Run Auto Pilot to see selected operators and results.</div>
        ) : (
          <div className="mt-8 space-y-2">
            {chain.map((r) => (
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
                    {r.ok && typeof r.execMs === 'number' ? (
                      <div className="mt-2 text-slate-500 text-xs font-mono">exec_ms: {r.execMs}</div>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-2">
                    {r.ok ? <CheckCircle2 size={18} className="text-emerald-400" /> : <XCircle size={18} className="text-red-400" />}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {strictResult ? (
          <div className="mt-10 bg-white/[0.02] border border-white/10 rounded-2xl p-5">
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">Strict Autotune Result</div>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="bg-slate-950/40 border border-white/10 rounded-xl p-3">
                <div className="text-slate-500 uppercase tracking-wider text-xs">CKO</div>
                <div className="font-mono text-slate-100 mt-1">{strictResult.cko_id}</div>
              </div>
              <div className="bg-slate-950/40 border border-white/10 rounded-xl p-3">
                <div className="text-slate-500 uppercase tracking-wider text-xs">mean error (%)</div>
                <div className="font-mono text-cyan-300 mt-1">{strictResult.error_pct}</div>
              </div>
              <div className="bg-slate-950/40 border border-white/10 rounded-xl p-3">
                <div className="text-slate-500 uppercase tracking-wider text-xs">iterations</div>
                <div className="font-mono text-slate-100 mt-1">{strictResult.tune_iterations ?? '—'}</div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

