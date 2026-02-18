import React from 'react';
import { Terminal, Layers } from 'lucide-react';
import { formatDebuggerLine } from '../utils/debugger';

export type WizardMode = 'interactive' | 'strict';

export function Step3Mode(props: {
  mode: WizardMode;
  setMode: (m: WizardMode) => void;
  ko42Mode: 'KO42.1' | 'KO42.2';
  setKo42Mode: (m: 'KO42.1' | 'KO42.2') => void;
  alpha: number;
  setAlpha: (v: number) => void;
  beta: number;
  setBeta: (v: number) => void;
}) {
  const { mode = 'interactive', setMode, ko42Mode = 'KO42.1', setKo42Mode, alpha = 1.0, setAlpha, beta = 0.0, setBeta } = props;

  // Safe reasoning calculation with fallbacks
  const reasoning = React.useMemo(() => {
    try {
      if (mode === 'strict') {
        return 'Strict Autotune provides automatic parameter tuning to achieve ≤0.1% precision';
      } else if (ko42Mode === 'KO42.1') {
        return 'KO42.1 (Automatic) provides 0.1% precision for initial estimates';
      } else {
        return 'KO42.2 (Manual) allows explicit parameter tuning for fine control';
      }
    } catch (e) {
      return 'Configure debug environment for optimal precision';
    }
  }, [mode, ko42Mode]);

  return (
    <div className="space-y-6">
      {/* Debugger Output Section */}
      <div className="bg-slate-950/40 border border-white/10 rounded-2xl p-5">
        <div className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300 mb-3 flex items-center gap-2">
          <Terminal className="w-4 h-4" />
          STEP 3: SELECT MODE
        </div>
        <div className="font-mono text-xs space-y-1 text-slate-300">
          <div className="text-slate-500 mb-2">Debug Operation: Configure Debug Environment</div>
          <div>{formatDebuggerLine(`debug_mode = "${mode}"`)}</div>
          <div>{formatDebuggerLine('tolerance = 0.001 (0.1%)')}</div>
          <div>{formatDebuggerLine('sampling_rate = 1.287 Hz')}</div>
          <div>{formatDebuggerLine(`auto_tune = ${mode === 'strict' ? 'True' : 'False'}`)}</div>
          <div className="mt-3 text-cyan-300">Mode: {ko42Mode === 'KO42.1' ? 'KO42.1 (Automatic Metric Tensioner)' : 'KO42.2 (Manual Metric Tensioner)'}</div>
          <div className="text-slate-400">Reasoning: {reasoning}</div>
        </div>
      </div>

      <div className="bg-white/[0.03] backdrop-blur-2xl rounded-[2.5rem] p-8 md:p-12 border border-white/10 shadow-2xl shadow-black/50">
        <div className="max-w-2xl mb-10">
          <h3 className="text-2xl md:text-3xl font-bold font-futuristic uppercase tracking-tight text-white mb-2">
            3. Configure Simulation Mode
          </h3>
          <p className="text-slate-400 text-base leading-relaxed">
            Choose the execution strategy for your operator chain. Interactive allows manual tweaking, while Strict Autotune optimizes for maximum precision.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-10">
          <button
            onClick={() => setMode('interactive')}
            className={`group text-left p-8 rounded-[2rem] border-2 transition-all duration-300 relative overflow-hidden ${mode === 'interactive'
              ? 'bg-cyan-500/10 border-cyan-500/50 shadow-lg shadow-cyan-500/10'
              : 'bg-white/[0.02] border-white/5 hover:border-white/20'
              }`}
          >
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-2xl ${mode === 'interactive' ? 'bg-cyan-500 text-black' : 'bg-white/5 text-slate-400'}`}>
                  <Terminal size={24} />
                </div>
                {mode === 'interactive' && (
                  <div className="px-3 py-1 rounded-full bg-cyan-500 text-black text-[10px] font-black uppercase tracking-widest">Active</div>
                )}
              </div>
              <h4 className="text-xl font-bold text-white mb-2">Interactive Mode</h4>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Real-time execution with active feedback. Ideal for exploring operator interactions and manual boundary tuning.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                  Manual β Control
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                  Live Error Tracking
                </div>
              </div>
            </div>
            <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-cyan-500/5 blur-3xl rounded-full" />
          </button>

          <button
            onClick={() => setMode('strict')}
            className={`group text-left p-8 rounded-[2rem] border-2 transition-all duration-300 relative overflow-hidden ${mode === 'strict'
              ? 'bg-violet-500/10 border-violet-500/50 shadow-lg shadow-violet-500/10'
              : 'bg-white/[0.02] border-white/5 hover:border-white/20'
              }`}
          >
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-2xl ${mode === 'strict' ? 'bg-violet-500 text-white' : 'bg-white/5 text-slate-400'}`}>
                  <Layers size={24} />
                </div>
                {mode === 'strict' && (
                  <div className="px-3 py-1 rounded-full bg-violet-500 text-white text-[10px] font-black uppercase tracking-widest">Active</div>
                )}
              </div>
              <h4 className="text-xl font-bold text-white mb-2">Strict Autotune</h4>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Automated iterative solver. The engine will self-tune parameters until reaching a &le;0.1% error threshold.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                  <div className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                  Auto-Boundary Optimization
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                  <div className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                  Target: &le;0.1% Precision
                </div>
              </div>
            </div>
            <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-violet-500/5 blur-3xl rounded-full" />
          </button>
        </div>

        <div className="bg-slate-950/60 border border-white/10 rounded-[2rem] p-8 shadow-inner">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-white/5 pb-6">
            <div>
              <div className="text-xs font-black uppercase tracking-[0.3em] text-cyan-400 mb-1">Tensioner Protocol</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">ZEQ42 (KO42) Kernel</div>
            </div>
            <div className="flex bg-black/40 rounded-2xl p-1.5 border border-white/5">
              <button
                onClick={() => setKo42Mode('KO42.1')}
                className={`px-6 py-2.5 rounded-[1.25rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all ${ko42Mode === 'KO42.1' ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20' : 'text-slate-500 hover:text-slate-300'
                  }`}
              >
                KO42.1 Auto
              </button>
              <button
                onClick={() => setKo42Mode('KO42.2')}
                className={`px-6 py-2.5 rounded-[1.25rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all ${ko42Mode === 'KO42.2' ? 'bg-violet-500 text-white shadow-lg shadow-violet-500/20' : 'text-slate-500 hover:text-slate-300'
                  }`}
              >
                KO42.2 Manual
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5">
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Protocol Logic</div>
                <p className="text-slate-300 text-sm leading-relaxed">{reasoning}</p>
              </div>
            </div>
            <div className="flex items-center justify-center p-8 rounded-2xl bg-white/[0.02] border border-white/5 border-dashed">
              <p className="text-slate-500 text-xs text-center font-bold tracking-widest leading-loose">
                RULE: KO42 MANDATORY ENFORCED<br />
                1-3 KINEMATIC OPERATORS DETECTED<br />
                READY FOR COMPILATION
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

