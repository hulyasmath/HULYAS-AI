import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

type StepId = 1 | 2 | 3 | 4 | 5 | 6 | 7;

interface WizardHeaderProps {
    currentStep: StepId;
    onStepClick: (step: StepId) => void;
}

export function WizardHeader({ currentStep, onStepClick }: WizardHeaderProps) {
    const stepLabels = ['Define', 'Operators', 'Mode', 'Compile', 'Execute', 'Verify', 'Debug'];

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-xl border-b border-white/10">
            <div className="max-w-7xl mx-auto px-4 py-3">
                {/* Top Row */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <Link to="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                            <ChevronLeft className="w-5 h-5" />
                            <span className="text-sm">Back to Store</span>
                        </Link>
                        <div className="h-6 w-px bg-white/20" />
                        <div>
                            <h1 className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
                                ZEQ 7-Step Wizard
                            </h1>
                            <p className="text-xs text-slate-500">ZEQ42 (KO42) · ≤0.1% verification</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => onStepClick(Math.max(1, currentStep - 1) as StepId)}
                            disabled={currentStep === 1}
                            className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-bold uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                        >
                            Prev
                        </button>
                        <button
                            onClick={() => onStepClick(Math.min(7, currentStep + 1) as StepId)}
                            disabled={currentStep === 7}
                            className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-600 border border-cyan-500 text-white text-xs font-bold uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                        >
                            Next
                        </button>
                    </div>
                </div>

                {/* Progress Tracker */}
                <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5, 6, 7].map((stepNum) => {
                        const isActive = currentStep === stepNum;
                        const isComplete = currentStep > stepNum;

                        return (
                            <React.Fragment key={stepNum}>
                                <button
                                    onClick={() => onStepClick(stepNum as StepId)}
                                    className={`flex-1 flex flex-col items-center gap-1.5 py-2.5 px-2 rounded-lg transition-all ${isActive
                                            ? 'bg-cyan-500/20 border-2 border-cyan-500'
                                            : isComplete
                                                ? 'bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20'
                                                : 'bg-white/5 border border-white/10 hover:bg-white/10'
                                        }`}
                                >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${isActive
                                            ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/50'
                                            : isComplete
                                                ? 'bg-emerald-500 text-white'
                                                : 'bg-slate-700 text-slate-400'
                                        }`}>
                                        {isComplete ? '✓' : stepNum}
                                    </div>
                                    <span className={`text-[10px] font-medium uppercase tracking-wider ${isActive ? 'text-cyan-300 font-bold' : isComplete ? 'text-emerald-300' : 'text-slate-500'
                                        }`}>
                                        {stepLabels[stepNum - 1]}
                                    </span>
                                </button>
                                {stepNum < 7 && (
                                    <div className={`w-6 h-0.5 transition-all ${isComplete ? 'bg-emerald-500' : 'bg-white/10'
                                        }`} />
                                )}
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>
        </header>
    );
}
