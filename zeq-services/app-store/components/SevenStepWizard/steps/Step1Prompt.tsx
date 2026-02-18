import React, { useMemo, useState } from 'react';
import { Terminal } from 'lucide-react';
import { generateSessionId, parseBreakpointLocation, extractFrameworkTranslation, extractWatchVariables, formatDebuggerLine } from '../utils/debugger';

type Difficulty = 'easy' | 'medium' | 'hard' | 'expert' | 'impossible';

export type PresetLike = {
  id: string;
  title: string;
  difficulty: Difficulty;
  domainTags: string[];
  prompt: string;
};

export function Step1Prompt(props: {
  prompt: string;
  setPrompt: (v: string) => void;
  presets: PresetLike[];
  onSelectPreset?: (presetId: string) => void;
  onAnalyze: () => void;
  analyzing: boolean;
  error?: string | null;
  components?: Record<string, any> | null;
  mode?: 'interactive' | 'strict';
}) {
  const { prompt, setPrompt, presets, onSelectPreset, onAnalyze, analyzing, error, components, mode = 'interactive' } = props;
  const [q, setQ] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty | 'all'>('all');
  const [highlightedPresetId, setHighlightedPresetId] = useState<string | null>(null);

  // Generate session ID and debugger info
  const sessionId = useMemo(() => generateSessionId(prompt), [prompt]);
  const breakpointLocation = useMemo(() => parseBreakpointLocation(prompt), [prompt]);
  const watchVariables = useMemo(() => extractWatchVariables(components), [components]);
  const frameworkTranslation = useMemo(() => extractFrameworkTranslation(components, prompt), [components, prompt]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    let list = presets || [];
    if (difficulty !== 'all') list = list.filter((p) => p.difficulty === difficulty);
    if (query) {
      list = list.filter((p) => {
        const hay = `${p.title} ${p.id} ${p.prompt} ${(p.domainTags || []).join(' ')}`.toLowerCase();
        return hay.includes(query);
      });
    }
    return list.slice(0, 60);
  }, [presets, q, difficulty]);

  return (
    <div className="space-y-6">
      {/* Debug Session Header */}
      {prompt && (
        <div className="bg-slate-950/60 border border-cyan-500/20 rounded-2xl p-4 font-mono text-xs">
          <div className="flex items-center gap-2 text-cyan-300 mb-2">
            <Terminal className="w-4 h-4" />
            <span className="font-bold">DEBUG SESSION START</span>
          </div>
          <div className="text-slate-400 space-y-1">
            <div>Session ID: {sessionId}</div>
            <div>Timestamp: 1.287 Hz synchronized</div>
            <div>Debug Mode: {mode === 'strict' ? 'Strict Autotune (≤0.1%)' : 'KO42.1 (Automatic)'}</div>
          </div>
        </div>
      )}

      <div className="bg-white/[0.03] backdrop-blur-2xl rounded-[2.5rem] p-8 md:p-12 border border-white/10 shadow-2xl shadow-black/50">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 mb-8">
          <div className="max-w-2xl">
            <h3 className="text-2xl md:text-3xl font-bold font-futuristic uppercase tracking-tight text-white mb-2">
              1. Define the Physics Engine
            </h3>
            <p className="text-slate-400 text-base leading-relaxed">
              Describe the physical scenario you want to simulate. Our engine will synthesize a custom operator chain based on your prompt.
            </p>
          </div>
          <div className="flex-shrink-0">
            <button
              onClick={onAnalyze}
              disabled={analyzing || !prompt.trim()}
              className="w-full md:w-auto px-8 py-4 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black font-black uppercase tracking-[0.25em] text-sm shadow-lg shadow-cyan-500/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-95"
            >
              {analyzing ? (
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  <span>Synthesizing...</span>
                </div>
              ) : (
                'Initialize Session'
              )}
            </button>
          </div>
        </div>

        {/* Debugger Output Section */}
        {prompt && (
          <div className="mb-8 bg-slate-950/60 border border-cyan-500/30 rounded-3xl p-6 shadow-inner">
            <div className="flex items-center gap-3 mb-4">
              <Terminal className="w-5 h-5 text-cyan-400" />
              <span className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-400">Environment Debugger</span>
            </div>
            <div className="font-mono text-[13px] space-y-2 text-slate-300 leading-relaxed overflow-x-auto custom-scrollbar">
              <div className="text-slate-500 font-bold mb-2">// Initializing debug session...</div>
              <div>&gt; <span className="text-cyan-400">breakpoint set</span> at: {breakpointLocation}</div>
              {watchVariables.length > 0 && (
                <div>&gt; <span className="text-violet-400">watch</span>: {watchVariables.join(', ')}</div>
              )}
              <div>&gt; <span className="text-amber-400">trigger</span>: error &gt; 0.1%</div>
              <div className="mt-4 pt-4 border-t border-white/5">
                <div className="text-slate-500 text-xs uppercase mb-2">Framework Mapping</div>
                <div className="text-slate-200 bg-white/5 p-3 rounded-xl border border-white/5">
                  {frameworkTranslation || 'Awaiting classification...'}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="relative mb-12">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., 'a pulsar spinning at 1000Hz NEAR a black hole' or 'a single electron through a double slit'"
            className="w-full min-h-[160px] bg-black/40 border-2 border-white/10 rounded-[2rem] p-6 text-lg text-slate-200 placeholder:text-slate-700 focus:outline-none focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/10 transition-all shadow-inner"
          />
          <div className="absolute bottom-4 right-6 text-[10px] uppercase tracking-widest text-slate-600 font-bold pointer-events-none">
            Natural Language Interface
          </div>
        </div>

        {error ? (
          <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
            {error}
          </div>
        ) : null}

        <div className="mt-12">
          <div className="flex items-center justify-between gap-4 mb-6 border-b border-white/10 pb-4">
            <div>
              <div className="text-sm font-black uppercase tracking-[0.3em] text-slate-300">Library of Scenarios</div>
              <div className="text-xs text-slate-500 mt-1">Select a template to auto-initialize the engine</div>
            </div>
            <div className="text-[10px] font-mono text-slate-600">{filtered.length} AVAILABLE</div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
            <div className="lg:col-span-3">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search core domains (GR, QM, Three-body)..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-slate-100 placeholder:text-slate-600 text-sm focus:bg-white/10 transition-all font-mono"
              />
            </div>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as any)}
              className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-slate-300 text-sm focus:bg-white/10 appearance-none font-sans"
            >
              <option value="all">Any Complexity</option>
              <option value="easy">Level 1: Entry</option>
              <option value="medium">Level 2: Common</option>
              <option value="hard">Level 3: Expert</option>
              <option value="expert">Level 4: Master</option>
              <option value="impossible">Level 5: Quantum</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {filtered.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  setHighlightedPresetId(p.id);
                  setPrompt(p.prompt);
                  onSelectPreset?.(p.id);
                  onAnalyze();
                }}
                className={`group text-left p-6 rounded-3xl border transition-all duration-300 relative overflow-hidden ${highlightedPresetId === p.id
                    ? 'bg-cyan-500/20 border-cyan-500/50 scale-[0.98]'
                    : 'bg-white/[0.03] hover:bg-white/[0.08] border-white/10'
                  }`}
              >
                <div className="relative z-10">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest ${p.difficulty === 'impossible' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                        p.difficulty === 'expert' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                          'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}>
                      {p.difficulty}
                    </div>
                    <div className="text-[10px] font-mono text-slate-600 group-hover:text-cyan-400 transition-colors">{p.id}</div>
                  </div>
                  <h4 className="text-white font-bold text-base mb-2 group-hover:text-cyan-300 transition-colors">{p.title}</h4>
                  <p className="text-slate-400 text-xs line-clamp-3 leading-relaxed mb-4 group-hover:text-slate-300 transition-colors">
                    {p.prompt}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {(p.domainTags || []).slice(0, 3).map((t) => (
                      <span key={t} className="px-2 py-0.5 rounded-full bg-white/5 border border-white/5 text-[9px] text-slate-500">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-3xl rounded-full translate-x-16 -translate-y-16 group-hover:bg-cyan-500/10 transition-colors" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

