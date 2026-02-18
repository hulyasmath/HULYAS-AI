/**
 * SevenStepWizard - Interactive 7-step methodology UI
 *
 * Runs computations via the Python 7-step backend (FastAPI) that wraps the existing framework.
 * Branding: ZEQ42 (KO42) is the universal proper-time modulation operator family.
 */

import React, { useMemo, useState } from 'react';
import { FileText, Play, Settings2, CheckCircle2, Wrench, Terminal, ShieldAlert } from 'lucide-react';

import { parsePrompt, runInteractive, runStrict } from './api';
import { SevenStepBackendStatus } from './SevenStepBackendStatus';
import { Step1Prompt, type PresetLike } from './steps/Step1Prompt';
import { Step2Operators } from './steps/Step2Operators';
import { Step3Mode, type WizardMode } from './steps/Step3Mode';
import { Step4Compile } from './steps/Step4Compile';
import { Step5Execute } from './steps/Step5Execute';
import { Step5ExecuteChain } from './steps/Step5ExecuteChain';
import { Step6Verify } from './steps/Step6Verify';
import { Step7Troubleshoot } from './steps/Step7Troubleshoot';
import { WizardHeader } from './WizardHeader';
import type { SelectedOperator } from './operators/OperatorDrawer';
import { EXPERIMENT_PRESETS, type ExperimentPreset } from './experiments/presets';
import { hydrateSelectedOperators, normalizeOperatorChain } from './operators/paramTemplates';
import { baseGlobalParams } from './experiments/constants';
import { normalizeWeightsToSum } from './utils/weightNormalization';


type StepId = 1 | 2 | 3 | 4 | 5 | 6 | 7;

const STEPS: { id: StepId; name: string; icon: React.ReactNode }[] = [
  { id: 1, name: 'Problem', icon: <FileText className="w-4 h-4" /> },
  { id: 2, name: 'Operators', icon: <Terminal className="w-4 h-4" /> },
  { id: 3, name: 'Mode', icon: <Settings2 className="w-4 h-4" /> },
  { id: 4, name: 'Compile', icon: <Play className="w-4 h-4 fill-current" /> },
  { id: 5, name: 'Execute', icon: <Play className="w-4 h-4 fill-current" /> },
  { id: 6, name: 'Verify', icon: <CheckCircle2 className="w-4 h-4" /> },
  { id: 7, name: 'Troubleshoot', icon: <Wrench className="w-4 h-4" /> },
];

export const SevenStepWizard: React.FC = () => {
  // Defensive loading of presets with error handling
  let presets: ExperimentPreset[] = [];
  try {
    presets = EXPERIMENT_PRESETS || [];
  } catch (error) {
    console.error('Error loading EXPERIMENT_PRESETS:', error);
    presets = [];
  }

  const safePresets = useMemo(() => presets, [presets.length]);
  const firstPreset = presets[0] || null;
  const presetsForStep1 = useMemo<PresetLike[]>(
    () =>
      presets.map((p) => ({
        id: p.id,
        title: p.title,
        difficulty: p.difficulty,
        domainTags: p.domainTags,
        prompt: p.prompt,
      })),
    [presets]
  );

  const [step, setStep] = useState<StepId>(1);
  const [prompt, setPrompt] = useState(firstPreset?.prompt || 'an egg falling in air on earth');
  const [components, setComponents] = useState<Record<string, any> | null>(null);
  const [suggested, setSuggested] = useState<Record<string, number>>({});
  const [koSettings, setKoSettings] = useState<Record<string, number>>(() => {
    if (!firstPreset) return {};
    const seedWeights: Record<string, number> = {};
    for (const id of normalizeOperatorChain(firstPreset.selectedOperators, firstPreset.ko42Mode)) {
      if (id.startsWith('KO')) seedWeights[id] = id === firstPreset.ko42Mode ? 1.5 : 1.0;
    }
    return seedWeights;
  });
  const [mode, setMode] = useState<WizardMode>('interactive');
  const [ko42Mode, setKo42Mode] = useState<'KO42.1' | 'KO42.2'>(firstPreset?.ko42Mode || 'KO42.1');
  const [alpha, setAlpha] = useState(1.0);
  const [beta, setBeta] = useState(0.0);
  const [tMax, setTMax] = useState(5.0);
  const [dt, setDt] = useState(0.01);
  const [globalParams, setGlobalParams] = useState<Record<string, any>>(() =>
    firstPreset?.globalParams ? firstPreset.globalParams : baseGlobalParams()
  );
  const [selectedOperators, setSelectedOperators] = useState<SelectedOperator[]>(() =>
    firstPreset ? hydrateSelectedOperators(firstPreset.selectedOperators, firstPreset.globalParams, firstPreset.ko42Mode) : []
  );

  const [analyzing, setAnalyzing] = useState(false);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [runError, setRunError] = useState<string | null>(null);
  const [result, setResult] = useState<any | null>(null);

  const [flow, setFlow] = useState<'auto' | 'guided'>(firstPreset?.defaultFlow || 'guided');
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(firstPreset?.id || null);

  const current = STEPS.find((s) => s.id === step)!;

  const applyPreset = (preset: ExperimentPreset, flowOverride?: 'auto' | 'guided') => {
    setPrompt(preset.prompt);
    setSelectedPresetId(preset.id);
    // Flow always stays 'guided' - auto mode removed
    setKo42Mode(preset.ko42Mode);
    // Hydrate operator chain + constants
    const global = preset.globalParams;
    setGlobalParams(global);
    setSelectedOperators(hydrateSelectedOperators(preset.selectedOperators, global, preset.ko42Mode));
    // Seed KO weights for legacy panels (light heuristic)
    const seedWeights: Record<string, number> = {};
    for (const id of normalizeOperatorChain(preset.selectedOperators, preset.ko42Mode)) {
      if (id.startsWith('KO')) seedWeights[id] = id === preset.ko42Mode ? 1.5 : 1.0;
    }
    setKoSettings(seedWeights);
  };

  const onAnalyze = async () => {
    setError(null);
    setAnalyzing(true);
    try {
      try {
        const res = await parsePrompt(prompt);
        setComponents(res.components);
        setSuggested(res.suggested_kos);
        setKoSettings(res.suggested_kos);
        setStep(2);
      } catch (e: any) {
        // Fallback (SDK-first): allow the user to proceed to the operator picker
        // even if the Python 7-step backend isn't running.
        const tokens = (prompt || '')
          .toLowerCase()
          .replace(/[^a-z0-9\s]/g, ' ')
          .split(/\s+/g)
          .filter(Boolean)
          .slice(0, 32);
        const fallbackSuggested: Record<string, number> = { KO42: 1.0 };
        setComponents({ prompt, tokens, note: 'Local fallback: 7-step backend not available.' });
        setSuggested(fallbackSuggested);
        setKoSettings(fallbackSuggested);
        setStep(2);
      }
    } catch (e: any) {
      setError(String(e?.message || e));
    } finally {
      setAnalyzing(false);
    }
  };

  const onRun = async (options?: { autoAdvance?: boolean }) => {
    const autoAdvance = options?.autoAdvance ?? true;
    setRunError(null);
    setRunning(true);
    try {
      // Normalize weights to sum = 1.0 before calling API
      const normalizedKoSettings = normalizeWeightsToSum(koSettings);

      if (mode === 'strict') {
        const res = await runStrict({ prompt, t_max: tMax, dt, ko_settings: normalizedKoSettings });
        setResult(res);
      } else {
        const res = await runInteractive({ prompt, alpha, beta, ko_settings: normalizedKoSettings, t_max: tMax, dt });
        setResult(res);
      }

      // Only auto-advance if requested OR if we are currently on Step 5
      // This prevents background updates in Step 7 from jumping the user back to 6
      if (autoAdvance && step === 5) {
        setStep(6);
      }
    } catch (e: any) {
      setRunError(String(e?.message || e));
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <WizardHeader currentStep={step} onStepClick={setStep} />

      {/* Tabs (steps) */}
      <div className="fixed top-16 left-0 right-0 z-40 bg-black/60 backdrop-blur-sm border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between gap-3 py-2">
            <div className="flex gap-1 overflow-x-auto">
              {STEPS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setStep(s.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${step === s.id
                    ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                >
                  {s.icon}
                  <span>{s.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content with padding for fixed header */}
      <main className="max-w-6xl mx-auto px-4 pt-36 pb-12 space-y-6">
        {/* safety note for backend */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-slate-500 mt-0.5" />
          <div className="text-slate-400 text-sm">
            The SDK operator chain runs locally via the ZEQ API. Strict ≤0.1% verification uses the optional 7-step Python verifier (no scraping by default).
          </div>
        </div>

        <SevenStepBackendStatus />


        {step === 1 && (
          <>
            <Step1Prompt
              prompt={prompt}
              setPrompt={setPrompt}
              presets={presetsForStep1}
              onSelectPreset={(id) => {
                const p = presets.find((x) => x.id === id);
                if (p) applyPreset(p);
                else setSelectedPresetId(id);
              }}
              onAnalyze={onAnalyze}
              analyzing={analyzing}
              error={error}
              components={components}
              mode={mode}
            />
            <div className="flex items-center justify-between mt-12 bg-white/[0.03] border border-white/10 rounded-[2rem] p-4 md:p-6 backdrop-blur-xl">
              <button
                disabled
                className="px-8 py-3 rounded-2xl bg-white/5 text-slate-600 text-[10px] font-black uppercase tracking-[0.25em] cursor-not-allowed opacity-30"
              >
                Prev
              </button>
              <div className="hidden md:flex flex-col items-center">
                <div className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-1">Session Progress</div>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5, 6, 7].map((s) => (
                    <div key={s} className={`h-1 w-6 rounded-full transition-all ${s <= step ? 'bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]' : 'bg-white/10'}`} />
                  ))}
                </div>
              </div>
              <button
                onClick={() => setStep(2)}
                className="px-10 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 text-white text-[10px] font-black uppercase tracking-[0.25em] transition-all transform hover:scale-[1.03] active:scale-95"
              >
                Next
              </button>
            </div>
          </>
        )}
        {flow === 'guided' && step === 2 && (
          <>
            <Step2Operators
              components={components}
              suggested={suggested}
              koSettings={koSettings}
              setKoSettings={setKoSettings}
              selectedOperators={selectedOperators}
              setSelectedOperators={setSelectedOperators}
              ko42Mode={ko42Mode}
              globalParams={globalParams}
              setGlobalParams={setGlobalParams}
            />
            <div className="flex items-center justify-between mt-12 bg-white/[0.03] border border-white/10 rounded-[2rem] p-4 md:p-6 backdrop-blur-xl">
              <button
                onClick={() => setStep(1)}
                className="px-10 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 text-white text-[10px] font-black uppercase tracking-[0.25em] transition-all transform hover:scale-[1.03] active:scale-95"
              >
                Prev
              </button>
              <div className="hidden md:flex flex-col items-center">
                <div className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-1">Session Progress</div>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5, 6, 7].map((s) => (
                    <div key={s} className={`h-1 w-6 rounded-full transition-all ${s <= step ? 'bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]' : 'bg-white/10'}`} />
                  ))}
                </div>
              </div>
              <button
                onClick={() => setStep(3)}
                className="px-10 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 text-white text-[10px] font-black uppercase tracking-[0.25em] transition-all transform hover:scale-[1.03] active:scale-95"
              >
                Next
              </button>
            </div>
          </>
        )}
        {step === 3 && (
          <>
            <Step3Mode
              mode={mode}
              setMode={setMode}
              ko42Mode={ko42Mode}
              setKo42Mode={setKo42Mode}
              alpha={alpha}
              setAlpha={setAlpha}
              beta={beta}
              setBeta={setBeta}
            />
            <div className="flex items-center justify-between mt-12 bg-white/[0.03] border border-white/10 rounded-[2rem] p-4 md:p-6 backdrop-blur-xl">
              <button
                onClick={() => setStep(2)}
                className="px-10 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 text-white text-[10px] font-black uppercase tracking-[0.25em] transition-all transform hover:scale-[1.03] active:scale-95"
              >
                Prev
              </button>
              <div className="hidden md:flex flex-col items-center">
                <div className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-1">Session Progress</div>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5, 6, 7].map((s) => (
                    <div key={s} className={`h-1 w-6 rounded-full transition-all ${s <= step ? 'bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]' : 'bg-white/10'}`} />
                  ))}
                </div>
              </div>
              <button
                onClick={() => setStep(4)}
                className="px-10 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 text-white text-[10px] font-black uppercase tracking-[0.25em] transition-all transform hover:scale-[1.03] active:scale-95"
              >
                Next
              </button>
            </div>
          </>
        )}
        {flow === 'guided' && step === 4 && (
          <>
            <Step4Compile
              koSettings={koSettings}
              mode={mode}
              selectedOperators={selectedOperators}
              ko42Mode={ko42Mode}
            />
            <div className="flex items-center justify-between mt-12 bg-white/[0.03] border border-white/10 rounded-[2rem] p-4 md:p-6 backdrop-blur-xl">
              <button
                onClick={() => setStep(3)}
                className="px-10 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 text-white text-[10px] font-black uppercase tracking-[0.25em] transition-all transform hover:scale-[1.03] active:scale-95"
              >
                Prev
              </button>
              <div className="hidden md:flex flex-col items-center">
                <div className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-1">Session Progress</div>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5, 6, 7].map((s) => (
                    <div key={s} className={`h-1 w-6 rounded-full transition-all ${s <= step ? 'bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]' : 'bg-white/10'}`} />
                  ))}
                </div>
              </div>
              <button
                onClick={() => setStep(5)}
                className="px-10 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 text-white text-[10px] font-black uppercase tracking-[0.25em] transition-all transform hover:scale-[1.03] active:scale-95"
              >
                Next
              </button>
            </div>
          </>
        )}
        {step === 5 && (
          <>
            <div className="space-y-6">
              <Step5ExecuteChain selectedOperators={selectedOperators} globalParams={globalParams} />
              <Step5Execute
                mode={mode}
                running={running}
                onRun={onRun}
                tMax={tMax}
                setTMax={setTMax}
                dt={dt}
                setDt={setDt}
                error={runError}
                result={result}
                prompt={prompt}
                selectedOperators={selectedOperators}
                koSettings={koSettings}
                alpha={alpha}
                setAlpha={setAlpha}
                beta={beta}
                setBeta={setBeta}
                ko42Mode={ko42Mode}
              />
            </div>
            <div className="flex items-center justify-between mt-12 bg-white/[0.03] border border-white/10 rounded-[2rem] p-4 md:p-6 backdrop-blur-xl">
              <button
                onClick={() => setStep(4)}
                className="px-10 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 text-white text-[10px] font-black uppercase tracking-[0.25em] transition-all transform hover:scale-[1.03] active:scale-95"
              >
                Prev
              </button>
              <div className="hidden md:flex flex-col items-center">
                <div className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-1">Session Progress</div>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5, 6, 7].map((s) => (
                    <div key={s} className={`h-1 w-6 rounded-full transition-all ${s <= step ? 'bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]' : 'bg-white/10'}`} />
                  ))}
                </div>
              </div>
              <button
                onClick={() => setStep(6)}
                className="px-10 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 text-white text-[10px] font-black uppercase tracking-[0.25em] transition-all transform hover:scale-[1.03] active:scale-95"
              >
                Next
              </button>
            </div>
          </>
        )}
        {flow === 'guided' && step === 6 && (
          <>
            <Step6Verify result={result} selectedOperators={selectedOperators} />
            <div className="flex items-center justify-between mt-12 bg-white/[0.03] border border-white/10 rounded-[2rem] p-4 md:p-6 backdrop-blur-xl">
              <button
                onClick={() => setStep(5)}
                className="px-10 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 text-white text-[10px] font-black uppercase tracking-[0.25em] transition-all transform hover:scale-[1.03] active:scale-95"
              >
                Prev
              </button>
              <div className="hidden md:flex flex-col items-center">
                <div className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-1">Session Progress</div>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5, 6, 7].map((s) => (
                    <div key={s} className={`h-1 w-6 rounded-full transition-all ${s <= step ? 'bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]' : 'bg-white/10'}`} />
                  ))}
                </div>
              </div>
              <button
                onClick={() => setStep(7)}
                className="px-10 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 text-white text-[10px] font-black uppercase tracking-[0.25em] transition-all transform hover:scale-[1.03] active:scale-95"
              >
                Next
              </button>
            </div>
          </>
        )}
        {step === 7 && (
          <>
            <Step7Troubleshoot
              prompt={prompt}
              selectedOperators={selectedOperators}
              koSettings={koSettings}
              mode={mode}
              result={result}
              alpha={alpha}
              setAlpha={setAlpha}
              beta={beta}
              setBeta={setBeta}
              onRun={onRun}
              running={running}
            />
            <div className="flex items-center justify-between mt-12 bg-white/[0.03] border border-white/10 rounded-[2rem] p-4 md:p-6 backdrop-blur-xl">
              <button
                onClick={() => setStep(6)}
                className="px-10 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 text-white text-[10px] font-black uppercase tracking-[0.25em] transition-all transform hover:scale-[1.03] active:scale-95"
              >
                Prev
              </button>
              <div className="hidden md:flex flex-col items-center">
                <div className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-1">Session Progress</div>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5, 6, 7].map((s) => (
                    <div key={s} className={`h-1 w-6 rounded-full transition-all ${s <= step ? 'bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]' : 'bg-white/10'}`} />
                  ))}
                </div>
              </div>
              <button
                onClick={() => setStep(1)}
                className="px-10 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 border border-cyan-500/20 text-black text-[10px] font-black uppercase tracking-[0.25em] transition-all transform hover:scale-[1.03] active:scale-95 shadow-lg shadow-cyan-500/20"
              >
                Reset Session
              </button>
            </div>
          </>
        )}
      </main>
    </div >
  );
};

export default SevenStepWizard;

