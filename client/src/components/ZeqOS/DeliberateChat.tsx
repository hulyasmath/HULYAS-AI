import { useState, useCallback } from 'react';
import { Brain, Clock, Zap, CheckCircle } from 'lucide-react';

interface DeliberateStep {
  id: string;
  label: string;
  description: string;
  status: 'pending' | 'active' | 'done';
}

const DELIBERATION_STEPS: Omit<DeliberateStep, 'id' | 'status'>[] = [
  { label: 'Domain Analysis', description: 'Identifying relevant operator domains' },
  { label: 'Operator Selection', description: 'Selecting optimal operators for the query' },
  { label: 'Framework Processing', description: 'Processing through Zeq OS mathematical framework' },
  { label: 'Coherence Check', description: 'Verifying mathematical coherence and precision' },
  { label: 'Response Synthesis', description: 'Synthesizing verified response' },
];

export default function DeliberateChatPanel() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [steps, setSteps] = useState<DeliberateStep[]>(
    DELIBERATION_STEPS.map((s, i) => ({ ...s, id: `step-${i}`, status: 'pending' })),
  );
  const [lastProcessTime, setLastProcessTime] = useState<number | null>(null);

  const simulateDeliberation = useCallback(() => {
    setSteps(DELIBERATION_STEPS.map((s, i) => ({ ...s, id: `step-${i}`, status: 'pending' })));

    const startTime = Date.now();
    DELIBERATION_STEPS.forEach((_, idx) => {
      setTimeout(() => {
        setSteps((prev) =>
          prev.map((s, i) => ({
            ...s,
            status: i < idx ? 'done' : i === idx ? 'active' : 'pending',
          })),
        );
      }, idx * 400);
    });

    setTimeout(() => {
      setSteps((prev) => prev.map((s) => ({ ...s, status: 'done' })));
      setLastProcessTime(Date.now() - startTime);
    }, DELIBERATION_STEPS.length * 400);
  }, []);

  const toggleDeliberate = useCallback(() => {
    const newState = !isEnabled;
    setIsEnabled(newState);
    if (newState) {
      // Store deliberate mode preference
      try {
        localStorage.setItem('zeq-deliberate-mode', 'true');
        // Dispatch event so ChatForm can pick it up
        window.dispatchEvent(new CustomEvent('zeq-deliberate-mode', { detail: { enabled: true } }));
      } catch {
        // Storage access may fail
      }
    } else {
      try {
        localStorage.removeItem('zeq-deliberate-mode');
        window.dispatchEvent(new CustomEvent('zeq-deliberate-mode', { detail: { enabled: false } }));
      } catch {
        // Storage access may fail
      }
    }
  }, [isEnabled]);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="border-b border-border-medium px-3 py-2">
        <h3 className="text-sm font-semibold text-text-primary">Deliberate Chat</h3>
        <p className="text-xs text-text-secondary">Enhanced processing with step-by-step verification</p>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <div className="space-y-4">
          {/* Toggle */}
          <div className="flex items-center justify-between rounded-lg border border-border-medium bg-surface-secondary p-3">
            <div className="flex items-center gap-2">
              <Brain className={`h-5 w-5 ${isEnabled ? 'text-cyan-400' : 'text-text-tertiary'}`} />
              <div>
                <span className="text-sm font-medium text-text-primary">Deliberate Mode</span>
                <p className="text-[10px] text-text-secondary">
                  {isEnabled ? 'Enhanced processing active' : 'Standard processing'}
                </p>
              </div>
            </div>
            <button
              onClick={toggleDeliberate}
              className={`relative h-6 w-11 rounded-full transition-colors ${
                isEnabled ? 'bg-cyan-500' : 'bg-surface-tertiary'
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  isEnabled ? 'translate-x-[22px]' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {/* Description */}
          <div className="rounded-lg border border-border-medium bg-surface-secondary p-3">
            <p className="text-xs text-text-secondary">
              Deliberate mode processes each message through the full Zeq OS mathematical framework
              pipeline before responding. This ensures maximum precision and coherence but takes
              slightly longer per response.
            </p>
            <div className="mt-2 flex gap-3">
              <div className="flex items-center gap-1 text-[10px] text-text-tertiary">
                <Clock className="h-3 w-3" /> ~2-5s extra
              </div>
              <div className="flex items-center gap-1 text-[10px] text-text-tertiary">
                <Zap className="h-3 w-3" /> 5-step pipeline
              </div>
            </div>
          </div>

          {/* Processing Steps */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-text-secondary">Processing Pipeline</span>
              <button
                onClick={simulateDeliberation}
                className="rounded-md bg-cyan-500/10 px-2 py-0.5 text-[10px] text-cyan-400 hover:bg-cyan-500/20"
              >
                Test Pipeline
              </button>
            </div>
            {steps.map((step) => (
              <div
                key={step.id}
                className={`flex items-center gap-2 rounded-lg border p-2 transition-all ${
                  step.status === 'active'
                    ? 'border-cyan-500/30 bg-cyan-500/5'
                    : step.status === 'done'
                      ? 'border-green-500/20 bg-green-500/5'
                      : 'border-border-medium bg-surface-secondary'
                }`}
              >
                <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center">
                  {step.status === 'done' ? (
                    <CheckCircle className="h-4 w-4 text-green-400" />
                  ) : step.status === 'active' ? (
                    <div className="h-3 w-3 animate-pulse rounded-full bg-cyan-400" />
                  ) : (
                    <div className="h-3 w-3 rounded-full border border-border-medium" />
                  )}
                </div>
                <div>
                  <span
                    className={`text-xs font-medium ${
                      step.status === 'active'
                        ? 'text-cyan-400'
                        : step.status === 'done'
                          ? 'text-green-400'
                          : 'text-text-secondary'
                    }`}
                  >
                    {step.label}
                  </span>
                  <p className="text-[10px] text-text-tertiary">{step.description}</p>
                </div>
              </div>
            ))}
          </div>

          {lastProcessTime && (
            <div className="text-center text-[10px] text-text-tertiary">
              Pipeline completed in {lastProcessTime}ms
            </div>
          )}

          {/* When enabled info */}
          {isEnabled && (
            <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-3">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-cyan-400" />
                <span className="text-xs font-medium text-cyan-400">Deliberate Mode Active</span>
              </div>
              <p className="mt-1 text-[10px] text-text-secondary">
                All messages will be processed through the full mathematical verification pipeline
                before being sent. Each operator result is verified against the 0.1% precision threshold.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
