import React, { useCallback, useEffect, useState } from 'react';
import { SEVENSTEP_BASE } from './api';

type Health = {
  ok: boolean;
  backend?: string;
  version?: string;
  python?: { ok: boolean; detail?: string };
  endpoints?: Record<string, string>;
  notes?: { install?: string; restart?: string };
};

export function SevenStepBackendStatus() {
  const [health, setHealth] = useState<Health | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(`${SEVENSTEP_BASE}/api/7step/health`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (!res.ok) throw new Error(await res.text());
      const json = (await res.json()) as Health;
      setHealth(json);
    } catch (e: any) {
      setHealth(null);
      const msg = e?.name === 'AbortError'
        ? 'Connection timed out (5s). Is the API server running?'
        : String(e?.message || e);
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const pythonOk = !!health?.python?.ok;

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">7-Step Verifier (Strict) Status</div>
          <div className="mt-2 text-sm">
            {error ? (
              <span className="text-red-300">OFFLINE — cannot reach `{SEVENSTEP_BASE}/api/7step/health`</span>
            ) : pythonOk ? (
              <span className="text-emerald-300">AVAILABLE — strict autotune / ≤0.1% verification is online</span>
            ) : (
              <span className="text-amber-200">OFFLINE — SDK chain works; strict verifier needs Python deps</span>
            )}
          </div>
          {health?.python?.detail ? <div className="mt-2 text-xs text-slate-500 font-mono">{health.python.detail}</div> : null}
          {health?.notes?.install ? (
            <div className="mt-3 text-xs text-slate-500">
              Install: <span className="font-mono text-slate-300">{health.notes.install}</span>
            </div>
          ) : null}
          {health?.notes?.restart ? (
            <div className="mt-1 text-xs text-slate-500">
              Then: <span className="font-mono text-slate-300">{health.notes.restart}</span>
            </div>
          ) : null}
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-bold uppercase tracking-[0.2em] disabled:opacity-40"
        >
          {loading ? 'Checking…' : 'Refresh'}
        </button>
      </div>
    </div>
  );
}

