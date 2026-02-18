import React, { useMemo } from 'react';
import { BarChart3, Zap } from 'lucide-react';
import { PrecisionBadge } from '../shared/PrecisionBadge';

interface SpectralAnalysisProps {
  samples: number[];
  sampleRate: number;
}

export interface BandPower {
  name: string;
  freqRange: string;
  power: number;
  color: string;
}

/** Simple DFT to compute power at a specific frequency */
function dftPowerAtFreq(samples: number[], freq: number, sampleRate: number): number {
  const N = samples.length;
  if (N === 0) return 0;
  let realSum = 0;
  let imagSum = 0;
  for (let n = 0; n < N; n++) {
    const angle = (2 * Math.PI * freq * n) / sampleRate;
    realSum += samples[n] * Math.cos(angle);
    imagSum -= samples[n] * Math.sin(angle);
  }
  return (realSum * realSum + imagSum * imagSum) / (N * N);
}

/** Compute average power in a frequency band using DFT at representative frequencies */
function computeBandPower(samples: number[], freqLow: number, freqHigh: number, sampleRate: number): number {
  const steps = Math.max(4, Math.ceil((freqHigh - freqLow) / 2));
  let total = 0;
  for (let i = 0; i <= steps; i++) {
    const f = freqLow + (i / steps) * (freqHigh - freqLow);
    total += dftPowerAtFreq(samples, f, sampleRate);
  }
  return total / (steps + 1);
}

/** Find peak frequency by scanning DFT */
function findPeakFrequency(samples: number[], sampleRate: number, maxFreq: number = 50): { freq: number; power: number } {
  let peakFreq = 0;
  let peakPower = 0;
  const step = 0.5;
  for (let f = 0.5; f <= maxFreq; f += step) {
    const p = dftPowerAtFreq(samples, f, sampleRate);
    if (p > peakPower) {
      peakPower = p;
      peakFreq = f;
    }
  }
  return { freq: peakFreq, power: peakPower };
}

const BAND_CONFIGS = [
  { name: 'Delta', freqRange: '0.5-4 Hz', low: 0.5, high: 4, color: '#a855f7' },
  { name: 'Theta', freqRange: '4-8 Hz', low: 4, high: 8, color: '#3b82f6' },
  { name: 'Alpha', freqRange: '8-12 Hz', low: 8, high: 12, color: '#22c55e' },
  { name: 'Beta', freqRange: '12-30 Hz', low: 12, high: 30, color: '#f97316' },
  { name: 'Gamma', freqRange: '30-50 Hz', low: 30, high: 50, color: '#ef4444' },
];

export const SpectralAnalysis: React.FC<SpectralAnalysisProps> = ({ samples, sampleRate }) => {
  const bands = useMemo<BandPower[]>(() => {
    if (samples.length === 0) return BAND_CONFIGS.map(b => ({ ...b, power: 0 }));
    return BAND_CONFIGS.map(b => ({
      name: b.name,
      freqRange: b.freqRange,
      power: computeBandPower(samples, b.low, b.high, sampleRate),
      color: b.color,
    }));
  }, [samples, sampleRate]);

  const peak = useMemo(() => {
    if (samples.length === 0) return { freq: 0, power: 0 };
    return findPeakFrequency(samples, sampleRate);
  }, [samples, sampleRate]);

  const maxPower = Math.max(...bands.map(b => b.power), 1);

  // Expected peak frequency (alpha band at ~10 Hz since it has highest amplitude in default)
  const expectedPeak = 10;

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <BarChart3 size={18} className="text-cyan-400" />
        <h3 className="text-sm font-semibold text-slate-200">Power Spectrum</h3>
      </div>

      {/* Band power bars */}
      <div className="space-y-2">
        {bands.map(band => {
          const barWidth = maxPower > 0 ? (band.power / maxPower) * 100 : 0;
          return (
            <div key={band.name} className="flex items-center gap-3">
              <div className="w-16 text-xs text-slate-300 font-medium">{band.name}</div>
              <div className="w-20 text-xs text-slate-500 font-mono">{band.freqRange}</div>
              <div className="flex-1 h-6 bg-slate-900 rounded overflow-hidden">
                <div
                  className="h-full rounded transition-all duration-300"
                  style={{
                    width: `${Math.max(barWidth, 1)}%`,
                    backgroundColor: band.color,
                    opacity: 0.8,
                  }}
                />
              </div>
              <div className="w-20 text-xs text-slate-400 font-mono text-right">
                {band.power.toFixed(2)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Peak frequency */}
      <div className="flex items-center gap-3 bg-slate-900/50 rounded-lg p-3">
        <Zap size={16} className="text-amber-400" />
        <div>
          <div className="text-xs text-slate-400">Peak Frequency</div>
          <div className="text-lg font-mono text-amber-400">{peak.freq.toFixed(1)} Hz</div>
        </div>
        <div className="ml-auto">
          <PrecisionBadge
            computed={peak.freq}
            reference={expectedPeak}
            label="Peak accuracy"
            compact
          />
        </div>
      </div>

      <div className="text-xs text-slate-500">
        DFT-based spectral estimation | {samples.length} samples at {sampleRate} Hz
      </div>
    </div>
  );
};
