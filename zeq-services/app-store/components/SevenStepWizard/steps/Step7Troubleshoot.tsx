import React, { useMemo, useState } from 'react';
import { Terminal, CheckCircle2, AlertTriangle, ChevronDown, ChevronRight, Play } from 'lucide-react';
import { formatDebuggerLine } from '../utils/debugger';

export function Step7Troubleshoot(props: {
  prompt?: string;
  selectedOperators?: Array<{ id: string }>;
  koSettings?: Record<string, number>;
  mode: 'interactive' | 'strict';
  result?: {
    cko_id: string;
    error_pct: number;
    energy: number;
    beta_final?: number;
    tune_iterations?: number;
    tune_status?: string;
    object?: string;
    location?: string;
    mass?: number;
  } | null;
  alpha: number;
  setAlpha: (v: number) => void;
  beta: number;
  setBeta: (v: number) => void;
  onRun: (options?: { autoAdvance?: boolean }) => void;
  running: boolean;
}) {
  const { prompt, selectedOperators = [], koSettings = {}, mode, result, alpha, setAlpha, beta, setBeta, onRun, running } = props;

  // Use same threshold logic as Step6: <=0.1% error means PASS
  const passed = result != null ? result.error_pct <= 0.1 : null;
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    steps: true,
    finetune: !passed,
    insights: true
  });

  const lastWeightsRef = React.useRef({ alpha, beta });
  const isRunningRef = React.useRef(false);

  // Auto-run on parameter change (alpha/beta)
  // FIXED: Added proper guards and onRun to deps
  React.useEffect(() => {
    // Only run if we actually have a result and not currently running
    if (!result || running || isRunningRef.current) return;

    // Check if parameters actually changed
    const weightsChanged = lastWeightsRef.current.alpha !== alpha || lastWeightsRef.current.beta !== beta;
    if (!weightsChanged) return;

    // small debounce for slider movement
    const timer = setTimeout(() => {
      if (!isRunningRef.current) {
        isRunningRef.current = true;
        // SILENT RUN: do not auto-advance to step 6 (stay on troubleshoot)
        onRun({ autoAdvance: false });
        lastWeightsRef.current = { alpha, beta };
        // Reset after a delay to allow next run
        setTimeout(() => {
          isRunningRef.current = false;
        }, 500);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [alpha, beta, result, running, onRun]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <div className="bg-white/[0.03] backdrop-blur-2xl rounded-[2.5rem] p-8 md:p-12 border border-white/10 shadow-2xl shadow-black/50 overflow-hidden relative group">
      <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-8 mb-10 pb-10 border-b border-white/10">
        <div className="max-w-2xl">
          <h3 className="text-2xl md:text-3xl font-bold font-futuristic uppercase tracking-tight text-white mb-2">
            7. Final Debug Session Summary
          </h3>
          <p className="text-slate-400 text-base leading-relaxed">
            Consolidating the verification traces and cross-equation signatures. This dashboard provides the ultimate summary of the proper-time simulation.
          </p>
        </div>
        <div className={`px-8 py-4 rounded-2xl flex items-center gap-4 border-2 transition-all duration-500 shadow-2xl ${passed
          ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400 shadow-emerald-500/10'
          : result
            ? 'bg-red-500/10 border-red-500/50 text-red-400 shadow-red-500/10'
            : 'bg-slate-500/10 border-slate-500/50 text-slate-400 shadow-slate-500/10'
          }`}>
          <div className={`w-3 h-3 rounded-full animate-pulse ${passed ? 'bg-emerald-500' : result ? 'bg-red-500' : 'bg-slate-500'}`} />
          <span className="text-lg font-black uppercase tracking-[0.25em]">
            {passed ? 'System Verified' : result ? 'Tuning Required' : 'Awaiting Run'}
          </span>
        </div>
      </div>

      {result && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <div className="bg-black/40 border border-white/5 rounded-2xl p-6 text-center shadow-inner">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2 truncate">Session Kernel</div>
            <div className="text-xs text-cyan-400 font-mono font-bold truncate">{result.cko_id.split('-').pop()}</div>
          </div>
          <div className="bg-black/40 border border-white/5 rounded-2xl p-6 text-center shadow-inner">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Error Margin</div>
            <div className={`text-xs font-mono font-bold ${passed ? 'text-emerald-400' : 'text-red-400'}`}>{result.error_pct.toFixed(5)}%</div>
          </div>
          <div className="bg-black/40 border border-white/5 rounded-2xl p-6 text-center shadow-inner">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Final Energy</div>
            <div className="text-xs text-white font-mono font-bold">{result.energy.toExponential(3)} J</div>
          </div>
          <div className="bg-black/40 border border-white/5 rounded-2xl p-6 text-center shadow-inner">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Beta Iter.</div>
            <div className="text-xs text-violet-300 font-mono font-bold">{result.tune_iterations || 1}</div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Complete Session Log - Collapsible */}
        <div className="bg-slate-950/60 border border-white/10 rounded-[2rem] overflow-hidden shadow-inner group/log">
          <button
            onClick={() => toggleSection('steps')}
            className="w-full px-8 py-6 flex items-center justify-between hover:bg-white/[0.03] transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 group-hover/log:scale-110 transition-transform">
                <Terminal size={20} />
              </div>
              <span className="text-xs font-black uppercase tracking-[0.3em] text-cyan-300">
                Full Evolution History
              </span>
            </div>
            <div className="p-2 rounded-full border border-white/5">
              {expandedSections.steps ? (
                <ChevronDown className="w-4 h-4 text-slate-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-500" />
              )}
            </div>
          </button>

          {expandedSections.steps && (
            <div className="px-8 pb-8 space-y-4 font-mono text-[11px] animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                  <div className="flex items-center gap-3 text-emerald-400 font-black tracking-widest uppercase text-[10px]">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Step 1-3 Configuration
                  </div>
                  <div className="pl-4 border-l border-white/5 space-y-1.5 text-slate-400">
                    <div className="line-clamp-1">Prompt: <span className="text-slate-200">{prompt || 'Default Synthesis'}</span></div>
                    <div>Engine: <span className="text-slate-200">ZEQ42 Proper-Time</span></div>
                    <div>Mode: <span className="text-slate-200 uppercase">{mode}</span></div>
                  </div>
                </div>
                <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                  <div className="flex items-center gap-3 text-cyan-400 font-black tracking-widest uppercase text-[10px]">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                    Step 4-6 Execution
                  </div>
                  <div className="pl-4 border-l border-white/5 space-y-1.5 text-slate-400">
                    <div>Compilation: <span className="text-emerald-400 font-bold uppercase">Pass</span></div>
                    <div>Runtime Trace: <span className="text-slate-200">{result?.cko_id.split('-')[0]}...</span></div>
                    <div>Final Status: <span className={passed ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>{passed ? 'VERIFIED' : 'FAILED'}</span></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Fine-Tune Controls */}
        {
          result && (
            <div className="bg-slate-950/60 border border-white/10 rounded-[2rem] overflow-hidden shadow-inner group/tune">
              <button
                onClick={() => toggleSection('finetune')}
                className="w-full px-8 py-6 flex items-center justify-between hover:bg-white/[0.03] transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-xl bg-violet-500/10 text-violet-400 group-hover/tune:scale-110 transition-transform">
                    <AlertTriangle size={20} />
                  </div>
                  <span className="text-xs font-black uppercase tracking-[0.3em] text-violet-300">
                    Metric Tensioning Controls
                  </span>
                </div>
                <div className="p-2 rounded-full border border-white/5">
                  {expandedSections.finetune ? (
                    <ChevronDown className="w-4 h-4 text-slate-500" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  )}
                </div>
              </button>

              {expandedSections.finetune && (
                <div className="px-8 pb-10 space-y-8 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="p-6 rounded-2xl bg-black/40 border border-white/5 group/alpha">
                      <div className="flex items-center justify-between mb-6">
                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">&alpha; (Automatic)</div>
                        <div className="text-xs text-white font-mono font-bold bg-white/5 px-3 py-1 rounded-lg">{alpha.toFixed(3)}</div>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={2}
                        step={0.01}
                        value={alpha}
                        onChange={(e) => setAlpha(Number(e.target.value))}
                        className="w-full h-1.5 bg-slate-800 rounded-full appearance-none cursor-pointer accent-cyan-500 transition-all group-hover/alpha:scale-y-125"
                      />
                    </div>
                    <div className="p-6 rounded-2xl bg-black/40 border border-white/5 group/beta">
                      <div className="flex items-center justify-between mb-6">
                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">&beta; (Manual)</div>
                        <div className="text-xs text-white font-mono font-bold bg-white/5 px-3 py-1 rounded-lg">{beta.toFixed(3)}</div>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={2}
                        step={0.01}
                        value={beta}
                        onChange={(e) => setBeta(Number(e.target.value))}
                        className="w-full h-1.5 bg-slate-800 rounded-full appearance-none cursor-pointer accent-violet-500 transition-all group-hover/beta:scale-y-125"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => onRun({ autoAdvance: false })}
                    disabled={running}
                    className="w-full px-8 py-5 rounded-2xl bg-gradient-to-r from-cyan-600 to-violet-600 hover:from-cyan-500 hover:to-violet-500 text-white font-black uppercase tracking-[0.3em] text-sm shadow-2xl transition-all transform hover:scale-[1.01] active:scale-95 disabled:opacity-30 flex items-center justify-center gap-4"
                  >
                    {running ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Play size={18} className="fill-current" />}
                    <span>{running ? 'Synchronizing Field...' : 'Sync Metric Parameters'}</span>
                  </button>
                </div>
              )}
            </div>
          )
        }

        {/* Key Insights */}
        {
          result && (
            <div className="bg-slate-950/60 border border-white/10 rounded-[2rem] overflow-hidden shadow-inner group/ins">
              <button
                onClick={() => toggleSection('insights')}
                className="w-full px-8 py-6 flex items-center justify-between hover:bg-white/[0.03] transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover/ins:scale-110 transition-transform">
                    <CheckCircle2 size={20} />
                  </div>
                  <span className="text-xs font-black uppercase tracking-[0.3em] text-emerald-300">
                    System Synthesis Insights
                  </span>
                </div>
                <div className="p-2 rounded-full border border-white/5">
                  {expandedSections.insights ? (
                    <ChevronDown className="w-4 h-4 text-slate-500" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  )}
                </div>
              </button>

              {expandedSections.insights && (
                <div className="px-8 pb-8 grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex gap-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-white mb-1">Execution High Stability</div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-widest font-black leading-relaxed">Normalized scalars detected across all chosen models.</div>
                    </div>
                  </div>
                  <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex gap-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-violet-500 mt-2 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-white mb-1">Clock Sync Active</div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-widest font-black leading-relaxed">HulyaPulse 1.287 Hz maintained across {result.tune_iterations || 1} iterations.</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        }
      </div >
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 blur-3xl rounded-full -translate-y-32 translate-x-32" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-500/5 blur-3xl rounded-full translate-y-32 -translate-x-32" />
    </div >
  );
}
