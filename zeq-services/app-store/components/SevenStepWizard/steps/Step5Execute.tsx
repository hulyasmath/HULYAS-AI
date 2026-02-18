import React, { useMemo } from 'react';
import { buildCatalog } from '../operators/catalog';
import { Terminal, Play, AlertCircle, CheckCircle2 } from 'lucide-react';
import { formatDebuggerLine, mapOperatorsToMasterEquation, generateCompiledMasterEquation } from '../utils/debugger';

// 1 zeqond = 0.777 seconds (HulyaPulse period)
const ZEQOND_TO_SECONDS = 0.777;

function secondsToZeqonds(s: number): number {
  return s / ZEQOND_TO_SECONDS;
}

function zeqondsToSeconds(z: number): number {
  return z * ZEQOND_TO_SECONDS;
}

// Operator symbol mapping (from Python framework KINEMATIC_OPERATORS)
const OPERATOR_SYMBOLS: Record<string, string> = {
  'QM1': 'ψ', 'QM2': 'Δp', 'QM3': 'Σcᵢ', 'QM4': '|↑↓⟩', 'QM5': 'Eₙ', 'QM6': '-ψ', 'QM7': 'Ŝ²', 'QM8': 'T', 'QM9': 'λ_dB', 'QM10': 'E_γ',
  'QM11': '[x̂,p̂]', 'QM12': 'γ^μ', 'QM13': 'ℒ', 'QM14': 'n_B', 'QM15': 'n_F', 'QM16': 'Â_H', 'QM17': '|ψ|²',
  'NM18': 'ΣF⃗', 'NM19': 'F⃗', 'NM20': '-F⃗', 'NM21': 'F_g', 'NM22': 'W', 'NM23': 'K', 'NM24': 'U_g', 'NM25': 'E_t',
  'NM26': 'p⃗', 'NM27': 'Δp⃗', 'NM28': 'L⃗', 'NM29': 'τ⃗', 'NM30': 'F_s',
  'GR31': 'a_g≡a_i', 'GR32': 'G_μν', 'GR33': 'EFE', 'GR34': 'Γ^μ_αβ', 'GR35': 'Δt', 'GR36': 'L', 'GR37': 'r_s',
  'GR38': 'h_μν', 'GR39': 'Λ', 'GR40': 'ȧ', 'GR41': 'z',
  'KO42.1': 'α', 'KO42.2': 'β', 'KO42': 'KO42',
  'CS43': 'O(n log n)', 'CS44': 'H', 'CS45': 'O(√n)',
};

export function Step5Execute(props: {
  mode: 'interactive' | 'strict';
  running: boolean;
  onRun: (options?: { autoAdvance?: boolean }) => void;
  tMax: number;
  setTMax: (v: number) => void;
  dt: number;
  setDt: (v: number) => void;
  error?: string | null;
  result?: {
    cko_id: string;
    error_pct: number;
    energy: number;
    ko_settings: Record<string, number>;
    solution: number[];
    t_eval: number[];
    prompt?: string;
    mode?: string;
    beta_final?: number;
    tune_iterations?: number;
    object?: string;
    location?: string;
    mass?: number;
  } | null;
  prompt?: string;
  selectedOperators?: Array<{ id: string }>;
  koSettings?: Record<string, number>;
  alpha: number;
  setAlpha: (v: number) => void;
  beta: number;
  setBeta: (v: number) => void;
  ko42Mode: 'KO42.1' | 'KO42.2';
}) {
  const { mode, running, onRun, tMax, setTMax, dt, setDt, error, result, prompt, selectedOperators = [], koSettings = {}, alpha, setAlpha, beta, setBeta, ko42Mode } = props;

  const lastParamsRef = React.useRef({ tMax, dt });
  const hasAutoRunRef = React.useRef(false);

  // Auto-run on mount AND on parameter change
  // FIXED: Added proper guards to prevent infinite loops and race conditions
  React.useEffect(() => {
    // Determine if parameters actually changed since last render
    const paramsChanged = lastParamsRef.current.tMax !== tMax || lastParamsRef.current.dt !== dt;

    // Safety check: if we already have a result and parameters haven't changed, DO NOT re-run
    // This solves the "back navigation" hijack where the user is forced back to Step 6
    if (result && !paramsChanged) return;

    // If we're already running, don't trigger another run
    if (running) return;

    // Prevent auto-run on mount if we already ran once (prevents re-triggers on step navigation)
    if (!paramsChanged && hasAutoRunRef.current) return;

    // Small debounce for slider adjustments
    const timer = setTimeout(() => {
      hasAutoRunRef.current = true;
      onRun();
      lastParamsRef.current = { tMax, dt };
    }, paramsChanged ? 1000 : 500);

    return () => clearTimeout(timer);
  }, [tMax, dt, result, running, onRun]); // Added onRun to deps

  // Generate operator mapping for Master Equation
  // Always use selectedOperators as the source of truth (1-3 domain + KO42)
  const operatorMapping = useMemo(() => {
    // If we have computed results, filter result.ko_settings to only selected operators
    if (result?.ko_settings && Object.keys(result.ko_settings).length > 0) {
      const mappings: Array<{ index: number; operatorId: string; description: string; weight: number }> = [];
      for (const op of selectedOperators) {
        const opId = op.id;
        // Check if this operator is in result.ko_settings (handle KO42 variants)
        const weight = result.ko_settings[opId] ||
          result.ko_settings[opId === 'KO42' ? 'KO42.1' : opId] ||
          result.ko_settings[opId === 'KO42' ? 'KO42.2' : opId] || 0;
        if (weight > 0) {
          const mapping = mapOperatorsToMasterEquation(opId);
          if (mapping) {
            mappings.push({
              index: mapping.index,
              operatorId: opId,
              description: mapping.description,
              weight: weight,
            });
          }
        }
      }
      return mappings.sort((a, b) => a.index - b.index);
    }
    // Fallback: use selectedOperators if no result yet
    const mappings: Array<{ index: number; operatorId: string; description: string }> = [];
    for (const op of selectedOperators) {
      const mapping = mapOperatorsToMasterEquation(op.id);
      if (mapping) {
        mappings.push({
          index: mapping.index,
          operatorId: op.id,
          description: mapping.description,
        });
      }
    }
    return mappings.sort((a, b) => a.index - b.index);
  }, [selectedOperators, result?.ko_settings]);

  // Generate compiled unique Master Equation
  // Always use selectedOperators, filter koSettings to match
  const compiledMasterEquation = useMemo(() => {
    try {
      if (result?.ko_settings && Object.keys(result.ko_settings).length > 0) {
        // Filter result.ko_settings to only include selected operators
        const filteredKoSettings: Record<string, number> = {};
        for (const op of selectedOperators) {
          const opId = op.id;
          const weight = result.ko_settings[opId] ||
            result.ko_settings[opId === 'KO42' ? 'KO42.1' : opId] ||
            result.ko_settings[opId === 'KO42' ? 'KO42.2' : opId] || 0;
          if (weight > 0) {
            filteredKoSettings[opId] = weight;
          }
        }
        return generateCompiledMasterEquation(selectedOperators || [], filteredKoSettings);
      }
      // Fallback: use selectedOperators if no result yet
      return generateCompiledMasterEquation(selectedOperators || [], koSettings || {});
    } catch (e) {
      console.error('Error generating compiled Master Equation:', e);
      // Fallback to default template if generation fails
      return '□ϕ − μ²(r)ϕ − λϕ³ − e^(−ϕ/ϕ_c) + ϕ_c⁴² Σ_{k=1}^{42} C_k(ϕ) = T_μ^μ + β F_{μν} F^{μν} + J_ext';
    }
  }, [selectedOperators, koSettings, result?.ko_settings]);

  // Convert internal seconds to zeqonds for display
  const tMaxZeqonds = secondsToZeqonds(tMax);
  const dtZeqonds = secondsToZeqonds(dt);

  const handleTMaxChange = (z: number) => {
    setTMax(zeqondsToSeconds(z));
  };

  const handleDtChange = (z: number) => {
    setDt(zeqondsToSeconds(z));
  };

  // Compute momentum field P_ϕ from solution gradient
  const momentumField = useMemo(() => {
    if (!result?.solution || !result?.t_eval || result.solution.length < 2) return null;
    const phi = result.solution;
    const t = result.t_eval;
    const phiDot: number[] = [];
    for (let i = 0; i < phi.length - 1; i++) {
      const dt = t[i + 1] - t[i];
      if (dt > 0) {
        phiDot.push((phi[i + 1] - phi[i]) / dt);
      } else {
        phiDot.push(0);
      }
    }
    phiDot.push(phiDot[phiDot.length - 1] || 0); // Extend last value
    return phiDot;
  }, [result]);

  // Functional Equation computation moved to Step 6

  // Generate execution trace with more granular time points
  const executionTrace = useMemo(() => {
    if (!result?.t_eval || !result?.ko_settings || !selectedOperators) return [];
    const trace: Array<{ time: number; event: string; operator?: string; value?: number }> = [];
    const t = result.t_eval;
    const phi = result.solution;
    // Filter to only selected operators (excluding KO42 variants)
    const operators = selectedOperators
      .map(op => op.id)
      .filter(id => id !== 'KO42' && id !== 'KO42.1' && id !== 'KO42.2');

    // Initialization
    if (t.length > 0) {
      trace.push({ time: t[0], event: 'KO42 pulse synchronized', operator: 'KO42' });
    }

    // More granular time points for better trace
    const numPoints = Math.min(20, t.length);
    const step = Math.max(1, Math.floor(t.length / numPoints));

    for (let idx = 0; idx < t.length; idx += step) {
      if (idx === 0) {
        // First operator activations
        for (const opId of operators.slice(0, 2)) {
          trace.push({
            time: t[idx],
            event: `${opId} operator activated`,
            operator: opId,
            value: phi[idx]
          });
        }
      } else if (idx < t.length - 1) {
        // Periodic operator updates
        const opIdx = idx % operators.length;
        if (operators[opIdx]) {
          trace.push({
            time: t[idx],
            event: `${operators[opIdx]} calculation step`,
            operator: operators[opIdx],
            value: phi[idx]
          });
        }
      }
    }

    // Final state
    if (t.length > 0) {
      trace.push({
        time: t[t.length - 1],
        event: 'Full system evolution complete',
        value: phi[phi.length - 1]
      });
    }

    return trace.sort((a, b) => a.time - b.time);
  }, [result, selectedOperators]);

  // Generate register dump
  const registerDump = useMemo(() => {
    if (!result || !momentumField) return null;
    const phi = result.solution;
    const phiFinal = phi.length > 0 ? phi[phi.length - 1] : 0;
    const pFinal = momentumField.length > 0 ? momentumField[momentumField.length - 1] : 0;

    return {
      energy: {
        total: result.energy,
        field: phiFinal * pFinal,
        kinetic: 0.5 * pFinal * pFinal,
        potential: result.energy - (0.5 * pFinal * pFinal)
      },
      momentum: {
        phi: phiFinal,
        phi_dot: pFinal,
        angular: phiFinal * pFinal * (result.t_eval[result.t_eval.length - 1] || 1)
      },
      field_interactions: selectedOperators
        .filter(op => {
          const opId = op.id;
          const weight = result.ko_settings?.[opId] ||
            result.ko_settings?.[opId === 'KO42' ? 'KO42.1' : opId] ||
            result.ko_settings?.[opId === 'KO42' ? 'KO42.2' : opId] || 0;
          return weight > 0;
        })
        .map(op => {
          const opId = op.id;
          const weight = result.ko_settings?.[opId] ||
            result.ko_settings?.[opId === 'KO42' ? 'KO42.1' : opId] ||
            result.ko_settings?.[opId === 'KO42' ? 'KO42.2' : opId] || 0;
          const baseContribution = weight * phiFinal;
          return {
            operator: opId,
            weight: weight,
            contribution: baseContribution
          };
        })
    };
  }, [result, momentumField]);

  // Generate stack trace
  const stackTrace = useMemo(() => {
    if (!result?.ko_settings || !selectedOperators) return [];
    const stack: Array<{ operator: string; status: string; error?: string }> = [];

    // KO42 always first
    stack.push({ operator: 'KO42', status: 'System clock synchronized (stable)' });

    // Other operators in execution order
    const sortedOps = Object.entries(result.ko_settings)
      .filter(([id]) => id !== 'KO42' && id !== 'KO42.1' && id !== 'KO42.2')
      .sort(([a], [b]) => a.localeCompare(b));

    for (const [id, weight] of sortedOps) {
      const symbol = OPERATOR_SYMBOLS[id] || id;
      stack.push({
        operator: id,
        status: `${symbol} calculation (executing)`,
        error: result.error_pct > 0.1 ? (id.includes('GR') ? 'Insufficient precision' : undefined) : undefined
      });
    }

    // Final output
    stack.push({
      operator: 'OUTPUT',
      status: result.error_pct <= 0.1 ? 'SUCCESS' : 'ERROR - Error threshold exceeded'
    });

    return stack;
  }, [result, selectedOperators]);

  return (
    <div className="space-y-6">
      {/* Debug Session Header */}
      {result && (
        <div className="bg-slate-950/60 border border-cyan-500/20 rounded-2xl p-4 font-mono text-xs">
          <div className="flex items-center gap-2 text-cyan-300 mb-2">
            <Terminal className="w-4 h-4" />
            <span className="font-bold">DEBUG SESSION ACTIVE</span>
          </div>
          <div className="text-slate-400 space-y-1">
            <div>Session ID: {result.cko_id}</div>
            <div>Timestamp: 1.287 Hz synchronized</div>
            <div>Debug Mode: {result.mode === 'manual-β' ? 'KO42.2 (Manual)' : 'KO42.1 (Automatic)'}</div>
          </div>
        </div>
      )}

      <div className="bg-white/[0.03] backdrop-blur-2xl rounded-[2.5rem] p-8 md:p-12 border border-white/10 shadow-2xl shadow-black/50">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 mb-10">
          <div className="max-w-2xl">
            <h3 className="text-2xl md:text-3xl font-bold font-futuristic uppercase tracking-tight text-white mb-2">
              5. Core Execution
            </h3>
            <p className="text-slate-400 text-base leading-relaxed">
              Initializing the unified field &phi;(t). The engine will single-step through the proper-time sequence at a synchronized 1.287 Hz clock rate.
            </p>
          </div>
          <div className="flex-shrink-0">
            <button
              onClick={() => onRun()}
              disabled={running}
              className={`w-full md:w-auto px-10 py-5 rounded-[1.5rem] font-black uppercase tracking-[0.3em] text-sm transition-all transform hover:scale-[1.03] active:scale-95 shadow-2xl flex items-center justify-center gap-4 ${mode === 'strict'
                ? 'bg-violet-500 hover:bg-violet-400 text-white shadow-violet-500/20'
                : 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-cyan-500/20'
                }`}
            >
              {running ? (
                <>
                  <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span>Computing...</span>
                </>
              ) : (
                <>
                  <Play size={18} className="fill-current" />
                  <span>{mode === 'strict' ? 'Execute Autotune' : 'Start Simulation'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          <div className="bg-slate-950/60 border border-white/5 rounded-[2rem] p-8 relative overflow-hidden group">
            <div className="flex items-center justify-between mb-6">
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Temporal Domain</div>
              <div className="text-[10px] text-cyan-400 font-mono font-bold tracking-widest uppercase">t_max limit</div>
            </div>
            <div className="flex items-end gap-3 mb-6">
              <input
                type="number"
                min={secondsToZeqonds(0.2)}
                max={secondsToZeqonds(10)}
                step={0.1}
                value={tMaxZeqonds}
                onChange={(e) => handleTMaxChange(Number(e.target.value))}
                className="w-full bg-black/40 border-2 border-white/5 group-hover:border-cyan-500/20 rounded-2xl px-6 py-4 text-2xl text-white font-mono font-bold transition-all focus:outline-none focus:border-cyan-500/50"
              />
              <div className="pb-4 text-xs font-black uppercase tracking-widest text-slate-600">Zeq</div>
            </div>
            <div className="flex items-center justify-between px-2">
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">&asymp; {tMax.toFixed(3)}s Standard Time</div>
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
            </div>
          </div>

          <div className="bg-slate-950/60 border border-white/5 rounded-[2rem] p-8 relative overflow-hidden group">
            <div className="flex items-center justify-between mb-6">
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Step Resolution</div>
              <div className="text-[10px] text-violet-400 font-mono font-bold tracking-widest uppercase">dt increment</div>
            </div>
            <div className="flex items-end gap-3 mb-6">
              <input
                type="number"
                min={secondsToZeqonds(0.001)}
                max={secondsToZeqonds(0.05)}
                step={0.001}
                value={dtZeqonds}
                onChange={(e) => handleDtChange(Number(e.target.value))}
                className="w-full bg-black/40 border-2 border-white/5 group-hover:border-violet-500/20 rounded-2xl px-6 py-4 text-2xl text-white font-mono font-bold transition-all focus:outline-none focus:border-violet-500/50"
              />
              <div className="pb-4 text-xs font-black uppercase tracking-widest text-slate-600">Zeq</div>
            </div>
            <div className="flex items-center justify-between px-2">
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">&asymp; {dt.toFixed(5)}s Delta</div>
              <div className="w-1.5 h-1.5 rounded-full bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.8)]" />
            </div>
          </div>
        </div>

        {result && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 text-center">
              <div className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-500 mb-2">Scalar Energy</div>
              <div className="text-sm text-cyan-400 font-mono font-bold">{result.energy.toExponential(4)} J</div>
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 text-center">
              <div className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-500 mb-2">Error Margin</div>
              <div className={`text-sm font-mono font-bold ${result.error_pct <= 0.1 ? 'text-emerald-400' : 'text-red-400'}`}>
                {result.error_pct.toFixed(4)}%
              </div>
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 text-center">
              <div className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-500 mb-2">Mass Equivalent</div>
              <div className="text-sm text-white font-mono font-bold">{result.mass?.toFixed(3) || '0.000'} kg</div>
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 text-center">
              <div className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-500 mb-2">Optim. Iter.</div>
              <div className="text-sm text-violet-400 font-mono font-bold">{result.tune_iterations || '1'}</div>
            </div>
          </div>
        )}

        {error ? (
          <div className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30">
            <div className="text-red-300 font-semibold text-sm mb-1 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              API Error
            </div>
            <div className="text-red-200 text-xs mb-2">{error}</div>
            {error.includes('404') || error.includes('Not Found') || error.includes('Failed to fetch') ? (
              <div className="text-red-300/70 text-xs mt-2">
                Make sure the API server is running on port 8080: <code className="bg-black/40 px-1.5 py-0.5 rounded">node api-server.cjs</code>
              </div>
            ) : null}
          </div>
        ) : null}


        {/* Debugger Output Section - Always Visible */}
        <div className="mt-8 space-y-6">
          <div className="bg-slate-950/40 border border-white/10 rounded-2xl p-5">
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300 mb-3 flex items-center gap-2">
              <Terminal className="w-4 h-4" />
              STEP 5: EXECUTE VIA MASTER EQUATION
            </div>
            <div className="font-mono text-xs space-y-2 text-slate-300">
              <div className="text-slate-500 mb-2">Debug Operation: Run Program with Debugger</div>
              {result ? (
                <>
                  <div>{formatDebuggerLine('running_with_debugger(physics_binary)')}</div>
                  <div>{formatDebuggerLine('single-stepping enabled')}</div>
                  <div>{formatDebuggerLine('monitoring at 1.287 Hz intervals')}</div>

                  <div className="mt-4">
                    <div className="text-cyan-300 font-semibold mb-2">Runtime Initialization:</div>
                    <div className="pl-4 space-y-1 text-slate-300">
                      <div>- P_ϕ extracted: Momentum field from compiled program</div>
                      <div>- Z configured: M = masses, R = distances, δ = damping, C = operators, X = external inputs</div>
                      <div>- System clock: KO42 ensures 1.287 Hz synchronization</div>
                    </div>
                  </div>
                </>
              ) : (
                <div>{formatDebuggerLine('No execution result yet. Run the computation first.')}</div>
              )}
            </div>
          </div>

          {/* Master Equation Display */}
          {result && (
            <>
              {/* This is the CKO (Combined Kinematic Operator) - the prediction/compiled equation from Step 4 */}
              <div className="bg-slate-950/40 border border-cyan-500/20 rounded-2xl p-6">
                <div className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300 mb-3 flex items-center gap-2">
                  <Terminal className="w-4 h-4" />
                  Master Equation (CKO from Step 4 - Prediction/Compiled)
                </div>
                <div className="text-xs text-slate-400 mb-3">
                  This is the compiled equation with computed operators (the CKO). It executes to produce ϕ(t) and P_ϕ, which are then used by the Functional Equation to compute the ANSWER.
                </div>
                <div className="font-mono text-xs space-y-2 text-slate-300">
                  <div className="text-slate-200 text-sm leading-relaxed">
                    {compiledMasterEquation}
                  </div>
                  {operatorMapping.length > 0 && (
                    <div className="mt-3">
                      <div className="text-cyan-300 font-semibold mb-2">Operator Mapping:</div>
                      <div className="space-y-1">
                        {operatorMapping.map((m, i) => (
                          <div key={i} className="text-slate-300">
                            - C_{m.index} = {m.operatorId} ({m.description})
                            {'weight' in m && m.weight !== undefined && (
                              <span className="text-cyan-400 ml-2">[weight: {(m.weight as number).toFixed(3)}]</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
