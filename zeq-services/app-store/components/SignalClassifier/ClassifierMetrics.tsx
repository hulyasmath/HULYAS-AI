import React, { useMemo } from 'react';
import { Activity, Target, BarChart3 } from 'lucide-react';
import { useZeqSync } from '../SimulationVisualizer/useZeqSync';
import { PrecisionBadge } from '../shared/PrecisionBadge';
import { EntropyVerifier } from '../shared/EntropyVerifier';
import { KolmogorovChecker } from '../shared/KolmogorovChecker';
import type { ClassificationResult, SignalConfig, SignalType } from './index';

interface ClassifierMetricsProps {
  result: ClassificationResult | null;
  currentFeatures: number[];
  config: SignalConfig;
  signalType: SignalType;
}

export const ClassifierMetrics: React.FC<ClassifierMetricsProps> = ({
  result, currentFeatures, config, signalType,
}) => {
  const { syncValue, elapsedTime, pulseCount } = useZeqSync();

  const stats = useMemo(() => {
    if (!result) return null;

    const { confusionMatrix, classes, accuracy, predictions } = result;
    const n = classes.length;

    // Macro F1
    let f1Sum = 0;
    for (let i = 0; i < n; i++) {
      const tp = confusionMatrix[i][i];
      let fp = 0, fn = 0;
      for (let j = 0; j < n; j++) {
        if (j !== i) {
          fp += confusionMatrix[j][i];
          fn += confusionMatrix[i][j];
        }
      }
      const precision = tp + fp > 0 ? tp / (tp + fp) : 0;
      const recall = tp + fn > 0 ? tp / (tp + fn) : 0;
      const f1 = precision + recall > 0 ? 2 * precision * recall / (precision + recall) : 0;
      f1Sum += f1;
    }
    const macroF1 = f1Sum / n;

    // Feature importance: variance of each feature across predictions
    const numFeatures = predictions[0]?.features.length || 0;
    const featureImportance: number[] = [];
    for (let f = 0; f < numFeatures; f++) {
      const vals = predictions.map(p => p.features[f] || 0);
      const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
      const variance = vals.reduce((a, b) => a + (b - mean) ** 2, 0) / vals.length;
      featureImportance.push(isFinite(variance) ? variance : 0);
    }
    const maxImportance = Math.max(1e-10, ...featureImportance);
    const normalizedImportance = featureImportance.map(v => v / maxImportance);

    return {
      accuracy,
      macroF1,
      totalSamples: predictions.length,
      featureImportance: normalizedImportance,
    };
  }, [result]);

  // Reference: spectral centroid for sine at config.frequency
  const referenceSpectralCentroid = config.frequency;
  const computedSpectralCentroid = currentFeatures[0] || 0;

  const featureArray = useMemo(() => currentFeatures.filter(v => isFinite(v)), [currentFeatures]);
  const serializedState = useMemo(() => JSON.stringify({
    signalType,
    config,
    features: currentFeatures,
    accuracy: stats?.accuracy,
    macroF1: stats?.macroF1,
    sync: syncValue,
  }), [signalType, config, currentFeatures, stats, syncValue]);

  const featureNames = ['Spectral Centroid', 'Zero-Cross Rate', 'Low Band', 'Mid Band', 'High Band', 'RMS Energy'];

  if (!result || !stats) {
    return (
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8 text-center text-slate-400">
        Run classification first to see detailed metrics.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target size={16} className="text-cyan-400" />
            <span className="text-xs text-slate-400">Overall Accuracy</span>
          </div>
          <p className="text-2xl font-bold font-mono text-white">
            {(stats.accuracy * 100).toFixed(1)}%
          </p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 size={16} className="text-orange-400" />
            <span className="text-xs text-slate-400">Macro F1</span>
          </div>
          <p className="text-2xl font-bold font-mono text-white">
            {stats.macroF1.toFixed(3)}
          </p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity size={16} className="text-emerald-400" />
            <span className="text-xs text-slate-400">Test Samples</span>
          </div>
          <p className="text-2xl font-bold font-mono text-white">{stats.totalSamples}</p>
        </div>
      </div>

      {/* Feature Importance */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-200 mb-3">Feature Importance (Variance-based)</h3>
        <div className="space-y-2">
          {featureNames.map((name, i) => {
            const importance = stats.featureImportance[i] || 0;
            return (
              <div key={name} className="flex items-center gap-3">
                <span className="text-xs text-slate-400 w-32 flex-shrink-0">{name}</span>
                <div className="flex-1 h-4 bg-slate-700 rounded overflow-hidden">
                  <div
                    className="h-full rounded transition-all duration-300"
                    style={{
                      width: `${importance * 100}%`,
                      backgroundColor: importance > 0.7 ? '#22d3ee' : importance > 0.3 ? '#f97316' : '#64748b',
                    }}
                  />
                </div>
                <span className="text-xs font-mono text-slate-300 w-12 text-right">
                  {(importance * 100).toFixed(0)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Current Signal Features */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-200 mb-3">
          Current Signal: <span className="text-cyan-400 capitalize">{signalType}</span>
        </h3>
        <div className="grid grid-cols-3 gap-3 text-sm">
          {featureNames.map((name, i) => (
            <div key={name}>
              <span className="text-xs text-slate-400">{name}</span>
              <p className="font-mono text-cyan-400">{currentFeatures[i]?.toFixed(4) ?? '0'}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Sync footer */}
      <div className="text-xs text-slate-500 text-right font-mono">
        HulyaPulse sync: {syncValue.toFixed(6)} | t={elapsedTime.toFixed(1)}s | pulse #{pulseCount}
      </div>

      {/* Verification Badges */}
      <div className="space-y-3">
        <PrecisionBadge
          computed={computedSpectralCentroid}
          reference={referenceSpectralCentroid}
          label={`Spectral Centroid vs ${config.frequency}Hz reference`}
        />
        <EntropyVerifier data={featureArray} label="Feature Vector Entropy" />
        <KolmogorovChecker data={serializedState} label="Classifier State Complexity" />
      </div>
    </div>
  );
};
