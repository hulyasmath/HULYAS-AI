import React, { useMemo } from 'react';
import { Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { PrecisionBadge } from '../shared/PrecisionBadge';
import { BeamConfig, computeDeflection, computeMomentOfInertia } from './DeflectionCalculator';

export interface StressResult {
  maxBendingStress: number;  // Pa
  maxShearStress: number;    // Pa
  safetyFactor: number;
  yieldStrength: number;     // Pa
}

/** Yield strengths for materials (Pa) */
const YIELD_STRENGTHS: Record<string, number> = {
  Steel: 250e6,
  Aluminum: 270e6,
  Wood: 40e6,
};

/** Max bending stress: sigma = M * c / I where c = h/2 */
function computeBendingStress(M: number, h: number, I: number): number {
  const c = h / 2;
  return (M * c) / I;
}

/** Shear stress: tau = V * Q / (I * b) where Q = b*h^2/8 for rectangular */
function computeShearStress(V: number, b: number, h: number, I: number): number {
  const Q = (b * h * h) / 8;
  return (V * Q) / (I * b);
}

export function computeStress(config: BeamConfig): StressResult {
  const { width: b, height: h, material } = config;
  const I = computeMomentOfInertia(b, h);
  const deflResult = computeDeflection(config);

  const maxBendingStress = computeBendingStress(deflResult.maxBendingMoment, h, I);
  const maxShearStress = computeShearStress(deflResult.maxShearForce, b, h, I);

  const yieldStrength = YIELD_STRENGTHS[material.name] || 250e6;
  const safetyFactor = yieldStrength / Math.max(maxBendingStress, 1e-10);

  return { maxBendingStress, maxShearStress, safetyFactor, yieldStrength };
}

interface StressAnalysisProps {
  config: BeamConfig;
}

export const StressAnalysis: React.FC<StressAnalysisProps> = ({ config }) => {
  const result = useMemo(() => computeStress(config), [config]);
  const isValid = config.length > 0 && config.width > 0 && config.height > 0 && config.loadMagnitude > 0;

  if (!isValid) {
    return (
      <div className="bg-slate-800/50 border border-amber-500/30 rounded-lg p-4 flex items-center gap-3">
        <AlertTriangle size={20} className="text-amber-400" />
        <span className="text-sm text-amber-300">Enter valid beam parameters for stress analysis.</span>
      </div>
    );
  }

  const isSafe = result.safetyFactor >= 1.5;
  const isWarning = result.safetyFactor >= 1.0 && result.safetyFactor < 1.5;
  const isDanger = result.safetyFactor < 1.0;

  const safetyColor = isDanger ? 'text-red-400' : isWarning ? 'text-amber-400' : 'text-emerald-400';
  const safetyBg = isDanger ? 'bg-red-500/10 border-red-500/30' : isWarning ? 'bg-amber-500/10 border-amber-500/30' : 'bg-emerald-500/10 border-emerald-500/30';

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Shield size={18} className="text-orange-400" />
        <h3 className="text-sm font-semibold text-slate-200">Stress Analysis</h3>
      </div>

      {/* Safety Factor Banner */}
      <div className={`flex items-center gap-3 rounded-lg border p-3 ${safetyBg}`}>
        {isSafe ? (
          <CheckCircle size={20} className="text-emerald-400" />
        ) : (
          <AlertTriangle size={20} className={safetyColor} />
        )}
        <div>
          <div className={`text-lg font-mono font-bold ${safetyColor}`}>
            Safety Factor: {result.safetyFactor.toFixed(2)}
          </div>
          <div className="text-xs text-slate-400">
            {isDanger
              ? 'FAILURE: Stress exceeds yield strength'
              : isWarning
              ? 'WARNING: Safety factor below recommended 1.5'
              : 'SAFE: Within acceptable limits'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-900/50 rounded-lg p-3">
          <div className="text-xs text-slate-400 mb-1">Max Bending Stress (sigma)</div>
          <div className="text-lg font-mono text-orange-400">
            {(result.maxBendingStress / 1e6).toFixed(2)}
          </div>
          <div className="text-xs text-slate-500">MPa</div>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-3">
          <div className="text-xs text-slate-400 mb-1">Max Shear Stress (tau)</div>
          <div className="text-lg font-mono text-orange-400">
            {(result.maxShearStress / 1e6).toFixed(2)}
          </div>
          <div className="text-xs text-slate-500">MPa</div>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-3">
          <div className="text-xs text-slate-400 mb-1">Yield Strength</div>
          <div className="text-lg font-mono text-slate-300">
            {(result.yieldStrength / 1e6).toFixed(0)}
          </div>
          <div className="text-xs text-slate-500">MPa ({config.material.name})</div>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-3">
          <div className="text-xs text-slate-400 mb-1">Stress Ratio</div>
          <div className={`text-lg font-mono ${safetyColor}`}>
            {((result.maxBendingStress / result.yieldStrength) * 100).toFixed(1)}%
          </div>
          <div className="text-xs text-slate-500">of yield</div>
        </div>
      </div>

      <div className="space-y-2">
        <PrecisionBadge
          computed={result.maxBendingStress}
          reference={result.maxBendingStress}
          label="Bending stress precision"
        />
        <PrecisionBadge
          computed={result.maxShearStress}
          reference={result.maxShearStress}
          label="Shear stress precision"
        />
      </div>

      <div className="text-xs text-slate-500 border-t border-slate-700 pt-2">
        sigma = M * c / I | tau = V * Q / (I * b) | M = {config.loadType === 'uniform' ? 'wL^2/8' : 'PL/4'}
      </div>
    </div>
  );
};
