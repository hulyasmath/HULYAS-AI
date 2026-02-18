import React, { useState, useCallback } from 'react';
import { Play, Loader2, AlertCircle, Clock } from 'lucide-react';
import { API_BASE, OperatorResult } from './types';
import { PrecisionBadge } from './PrecisionBadge';

interface OperatorExecutionProps {
  operator: string;
  params: Record<string, number>;
  referenceValue?: number;
  onResult?: (result: OperatorResult) => void;
  autoExecute?: boolean;
  children?: (state: { result: OperatorResult | null; loading: boolean; error: string | null; execute: () => void }) => React.ReactNode;
}

export async function executeOperator(operator: string, params: Record<string, number>): Promise<OperatorResult> {
  const startTime = Date.now();
  const resp = await fetch(`${API_BASE}/api/zeq/operators/execute?operator=${encodeURIComponent(operator)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ params }),
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error || err.message || `HTTP ${resp.status}`);
  }

  const data = await resp.json();
  return {
    operator,
    result: data.result ?? data.value ?? data,
    precision: data.precision ?? 0,
    executionTimeMs: Date.now() - startTime,
    timestamp: Date.now(),
    metadata: data.metadata,
  };
}

/** Client-side operator computation for common formulas */
export function computeLocally(operator: string, params: Record<string, number>): number {
  const MU_EARTH = 3.986e14; // m^3/s^2
  const G = 6.674e-11;
  const RE = 6.371e6; // Earth radius in meters

  switch (operator) {
    case 'HOHMANN_TRANSFER': {
      const r1 = (params.altitude1 || 200) * 1000 + RE;
      const r2 = (params.altitude2 || 35786) * 1000 + RE;
      const v1 = Math.sqrt(MU_EARTH / r1);
      const vt1 = Math.sqrt(MU_EARTH * (2 / r1 - 2 / (r1 + r2)));
      const vt2 = Math.sqrt(MU_EARTH * (2 / r2 - 2 / (r1 + r2)));
      const v2 = Math.sqrt(MU_EARTH / r2);
      return Math.abs(vt1 - v1) + Math.abs(v2 - vt2);
    }
    case 'ORBIT_VELOCITY':
      return Math.sqrt(MU_EARTH / ((params.altitude || 200) * 1000 + RE));
    case 'ORBIT_PERIOD':
      return 2 * Math.PI * Math.sqrt(Math.pow((params.altitude || 200) * 1000 + RE, 3) / MU_EARTH);
    case 'ORBIT_ESCAPE':
      return Math.sqrt(2 * MU_EARTH / ((params.altitude || 200) * 1000 + RE));
    case 'BLACK_SCHOLES': {
      const { S = 100, K = 100, T = 1, r = 0.05, sigma = 0.2 } = params;
      const d1 = (Math.log(S / K) + (r + sigma * sigma / 2) * T) / (sigma * Math.sqrt(T));
      const d2 = d1 - sigma * Math.sqrt(T);
      const Nd1 = 0.5 * (1 + erf(d1 / Math.sqrt(2)));
      const Nd2 = 0.5 * (1 + erf(d2 / Math.sqrt(2)));
      return S * Nd1 - K * Math.exp(-r * T) * Nd2;
    }
    case 'MED_GFR': {
      const { age = 50, weight = 70, creatinine = 1.0, isFemale = 0 } = params;
      const result = ((140 - age) * weight) / (72 * creatinine);
      return isFemale ? result * 0.85 : result;
    }
    case 'MED_BMI':
      return (params.weight || 70) / Math.pow((params.height || 1.7), 2);
    case 'MED_BSA':
      return 0.007184 * Math.pow(params.weight || 70, 0.425) * Math.pow((params.height || 170), 0.725);
    case 'MED_DOSE': {
      const bsa = 0.007184 * Math.pow(params.weight || 70, 0.425) * Math.pow((params.height || 170), 0.725);
      return (params.standardDose || 100) * bsa / 1.73;
    }
    default:
      return 0;
  }
}

function erf(x: number): number {
  const t = 1.0 / (1.0 + 0.3275911 * Math.abs(x));
  const y = 1.0 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
  return x >= 0 ? y : -y;
}

export const OperatorExecution: React.FC<OperatorExecutionProps> = ({ operator, params, referenceValue, onResult, children }) => {
  const [result, setResult] = useState<OperatorResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Try API first, fall back to local computation
      let opResult: OperatorResult;
      try {
        opResult = await executeOperator(operator, params);
      } catch {
        const localResult = computeLocally(operator, params);
        opResult = {
          operator,
          result: localResult,
          precision: 0,
          executionTimeMs: 1,
          timestamp: Date.now(),
          metadata: { source: 'local' },
        };
      }
      setResult(opResult);
      onResult?.(opResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Execution failed');
    } finally {
      setLoading(false);
    }
  }, [operator, params, onResult]);

  if (children) {
    return <>{children({ result, loading, error, execute })}</>;
  }

  return (
    <div className="space-y-3">
      <button
        onClick={execute}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg border border-cyan-500/30 transition-colors disabled:opacity-50"
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
        Execute {operator}
      </button>

      {error && (
        <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {result && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Clock size={12} />
            {result.executionTimeMs}ms
          </div>
          <div className="text-lg font-mono text-cyan-400">
            {typeof result.result === 'number' ? result.result.toFixed(6) : JSON.stringify(result.result)}
          </div>
          {referenceValue !== undefined && typeof result.result === 'number' && (
            <PrecisionBadge computed={result.result} reference={referenceValue} />
          )}
        </div>
      )}
    </div>
  );
};
