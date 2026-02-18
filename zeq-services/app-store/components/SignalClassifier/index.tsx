import React, { useState, useCallback, useMemo } from 'react';
import { Radio, Waves, Grid3X3, BarChart3 } from 'lucide-react';
import { AppPageLayout } from '../shared/AppPageLayout';
import { WaveformDisplay } from './WaveformDisplay';
import { ConfusionMatrix } from './ConfusionMatrix';
import { ClassifierMetrics } from './ClassifierMetrics';

export type SignalType = 'sine' | 'square' | 'triangle' | 'noise' | 'chirp';

export interface SignalConfig {
  duration: number;
  sampleRate: number;
  noiseLevel: number;
  frequency: number;
}

export interface ClassificationResult {
  confusionMatrix: number[][];
  classes: SignalType[];
  predictions: { actual: SignalType; predicted: SignalType; features: number[] }[];
  accuracy: number;
}

type TabId = 'signals' | 'features' | 'classification';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'signals', label: 'Signals', icon: <Waves size={16} /> },
  { id: 'features', label: 'Features', icon: <Grid3X3 size={16} /> },
  { id: 'classification', label: 'Classification', icon: <BarChart3 size={16} /> },
];

const SIGNAL_CLASSES: SignalType[] = ['sine', 'square', 'triangle', 'noise', 'chirp'];

// Generate a signal of given type
export function generateSignal(type: SignalType, config: SignalConfig): number[] {
  const { duration, sampleRate, noiseLevel, frequency } = config;
  const n = Math.floor(duration * sampleRate);
  const signal: number[] = new Array(n);

  for (let i = 0; i < n; i++) {
    const t = i / sampleRate;
    let value = 0;

    switch (type) {
      case 'sine':
        value = Math.sin(2 * Math.PI * frequency * t);
        break;
      case 'square':
        value = Math.sin(2 * Math.PI * frequency * t) >= 0 ? 1 : -1;
        break;
      case 'triangle': {
        const phase = (frequency * t) % 1;
        value = phase < 0.5 ? 4 * phase - 1 : 3 - 4 * phase;
        break;
      }
      case 'noise':
        value = (Math.random() * 2 - 1);
        break;
      case 'chirp': {
        // Linear chirp from frequency to frequency*4
        const f0 = frequency;
        const f1 = frequency * 4;
        const chirpRate = (f1 - f0) / duration;
        const freq = f0 + chirpRate * t / 2;
        value = Math.sin(2 * Math.PI * freq * t);
        break;
      }
    }

    // Add noise
    if (type !== 'noise') {
      value += noiseLevel * (Math.random() * 2 - 1);
    }

    signal[i] = isFinite(value) ? value : 0;
  }

  return signal;
}

// FFT (Cooley-Tukey radix-2) - pads to next power of 2
export function fft(signal: number[]): { real: number[]; imag: number[]; power: number[] } {
  // Pad to next power of 2
  let n = 1;
  while (n < signal.length) n *= 2;
  const real = new Array(n).fill(0);
  const imag = new Array(n).fill(0);
  for (let i = 0; i < signal.length; i++) real[i] = signal[i];

  // Bit-reversal permutation
  for (let i = 0; i < n; i++) {
    let j = 0;
    let bit = i;
    for (let k = 0; k < Math.log2(n); k++) {
      j = (j << 1) | (bit & 1);
      bit >>= 1;
    }
    if (j > i) {
      [real[i], real[j]] = [real[j], real[i]];
      [imag[i], imag[j]] = [imag[j], imag[i]];
    }
  }

  // Butterfly computation
  for (let size = 2; size <= n; size *= 2) {
    const halfSize = size / 2;
    const angle = -2 * Math.PI / size;
    for (let i = 0; i < n; i += size) {
      for (let j = 0; j < halfSize; j++) {
        const cos = Math.cos(angle * j);
        const sin = Math.sin(angle * j);
        const tReal = real[i + j + halfSize] * cos - imag[i + j + halfSize] * sin;
        const tImag = real[i + j + halfSize] * sin + imag[i + j + halfSize] * cos;
        real[i + j + halfSize] = real[i + j] - tReal;
        imag[i + j + halfSize] = imag[i + j] - tImag;
        real[i + j] += tReal;
        imag[i + j] += tImag;
      }
    }
  }

  // Power spectrum
  const power = new Array(n / 2);
  for (let i = 0; i < n / 2; i++) {
    power[i] = (real[i] * real[i] + imag[i] * imag[i]) / n;
    if (!isFinite(power[i])) power[i] = 0;
  }

  return { real, imag, power };
}

// Feature extraction
export function extractFeatures(signal: number[], sampleRate: number): number[] {
  const { power } = fft(signal);
  const n = power.length;
  const freqRes = sampleRate / (n * 2);

  // Spectral centroid
  let sumFP = 0, sumP = 0;
  for (let i = 0; i < n; i++) {
    const f = i * freqRes;
    sumFP += f * power[i];
    sumP += power[i];
  }
  const spectralCentroid = sumP > 0 ? sumFP / sumP : 0;

  // Zero crossing rate
  let zcr = 0;
  for (let i = 1; i < signal.length; i++) {
    if ((signal[i] >= 0 && signal[i - 1] < 0) || (signal[i] < 0 && signal[i - 1] >= 0)) {
      zcr++;
    }
  }
  zcr = signal.length > 1 ? zcr / (signal.length - 1) : 0;

  // Power band ratios
  const bandPower = (low: number, high: number): number => {
    let sum = 0;
    for (let i = 0; i < n; i++) {
      const f = i * freqRes;
      if (f >= low && f < high) sum += power[i];
    }
    return sum;
  };

  const totalPower = sumP || 1;
  const lowBand = bandPower(0, 20) / totalPower;
  const midBand = bandPower(20, 60) / totalPower;
  const highBand = bandPower(60, sampleRate / 2) / totalPower;

  // RMS energy
  let rmsSum = 0;
  for (const s of signal) rmsSum += s * s;
  const rms = Math.sqrt(rmsSum / signal.length);

  return [
    isFinite(spectralCentroid) ? spectralCentroid : 0,
    isFinite(zcr) ? zcr : 0,
    isFinite(lowBand) ? lowBand : 0,
    isFinite(midBand) ? midBand : 0,
    isFinite(highBand) ? highBand : 0,
    isFinite(rms) ? rms : 0,
  ];
}

// KNN Classifier
function euclideanDist(a: number[], b: number[]): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const d = (a[i] || 0) - (b[i] || 0);
    sum += d * d;
  }
  return Math.sqrt(sum);
}

export function runClassification(
  config: SignalConfig,
  numTestPerClass: number,
  k: number
): ClassificationResult {
  const classes = SIGNAL_CLASSES;
  const numClasses = classes.length;

  // Generate training data (20 per class)
  const trainingData: { features: number[]; label: SignalType }[] = [];
  for (const cls of classes) {
    for (let i = 0; i < 20; i++) {
      const sig = generateSignal(cls, {
        ...config,
        frequency: config.frequency + (Math.random() - 0.5) * 2,
      });
      const features = extractFeatures(sig, config.sampleRate);
      trainingData.push({ features, label: cls });
    }
  }

  // Generate test data and classify
  const confusionMatrix: number[][] = Array.from({ length: numClasses }, () =>
    new Array(numClasses).fill(0)
  );
  const predictions: { actual: SignalType; predicted: SignalType; features: number[] }[] = [];
  let correct = 0;

  for (const cls of classes) {
    for (let i = 0; i < numTestPerClass; i++) {
      const sig = generateSignal(cls, {
        ...config,
        frequency: config.frequency + (Math.random() - 0.5) * 2,
      });
      const features = extractFeatures(sig, config.sampleRate);

      // KNN
      const distances = trainingData.map(td => ({
        dist: euclideanDist(features, td.features),
        label: td.label,
      }));
      distances.sort((a, b) => a.dist - b.dist);
      const topK = distances.slice(0, k);

      // Vote
      const votes: Record<string, number> = {};
      for (const d of topK) {
        votes[d.label] = (votes[d.label] || 0) + 1;
      }
      let predicted: SignalType = classes[0];
      let maxVotes = 0;
      for (const [label, count] of Object.entries(votes)) {
        if (count > maxVotes) {
          maxVotes = count;
          predicted = label as SignalType;
        }
      }

      const actualIdx = classes.indexOf(cls);
      const predIdx = classes.indexOf(predicted);
      confusionMatrix[actualIdx][predIdx]++;
      if (cls === predicted) correct++;
      predictions.push({ actual: cls, predicted, features });
    }
  }

  const total = numTestPerClass * numClasses;
  const accuracy = total > 0 ? correct / total : 0;

  return { confusionMatrix, classes, predictions, accuracy };
}

const SignalClassifier: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('signals');
  const [signalType, setSignalType] = useState<SignalType>('sine');
  const [config, setConfig] = useState<SignalConfig>({
    duration: 1.0,
    sampleRate: 256,
    noiseLevel: 0.1,
    frequency: 10,
  });
  const [numTestPerClass, setNumTestPerClass] = useState(20);
  const [knn, setKnn] = useState(5);
  const [classResult, setClassResult] = useState<ClassificationResult | null>(null);

  const currentSignal = useMemo(
    () => generateSignal(signalType, config),
    [signalType, config]
  );

  const currentFeatures = useMemo(
    () => extractFeatures(currentSignal, config.sampleRate),
    [currentSignal, config.sampleRate]
  );

  const handleClassify = useCallback(() => {
    const result = runClassification(config, numTestPerClass, knn);
    setClassResult(result);
    setActiveTab('classification');
  }, [config, numTestPerClass, knn]);

  const updateConfig = useCallback((key: keyof SignalConfig, value: number) => {
    if (isFinite(value)) {
      setConfig(prev => ({ ...prev, [key]: value }));
    }
  }, []);

  const sidebar = (
    <div className="space-y-4">
      {/* Signal Type */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <Radio size={16} className="text-cyan-400" />
          <h3 className="text-sm font-semibold text-slate-200">Signal Type</h3>
        </div>
        <div className="grid grid-cols-2 gap-1">
          {SIGNAL_CLASSES.map(cls => (
            <button
              key={cls}
              onClick={() => setSignalType(cls)}
              className={`text-xs py-1.5 rounded capitalize transition-colors ${
                signalType === cls
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'bg-slate-700/50 text-slate-400 border border-slate-600'
              }`}
            >
              {cls}
            </button>
          ))}
        </div>
      </div>

      {/* Signal Parameters */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 space-y-2">
        <h3 className="text-sm font-semibold text-slate-200 mb-2">Parameters</h3>
        {[
          { label: 'Duration (s)', key: 'duration' as const, min: 0.5, max: 5, step: 0.1, value: config.duration },
          { label: 'Sample Rate (Hz)', key: 'sampleRate' as const, min: 256, max: 1024, step: 128, value: config.sampleRate },
          { label: 'Frequency (Hz)', key: 'frequency' as const, min: 1, max: 50, step: 1, value: config.frequency },
          { label: 'Noise Level', key: 'noiseLevel' as const, min: 0, max: 0.5, step: 0.01, value: config.noiseLevel },
        ].map(p => (
          <div key={p.key}>
            <div className="flex justify-between">
              <label className="text-xs text-slate-400">{p.label}</label>
              <span className="text-xs font-mono text-slate-300">{p.value}</span>
            </div>
            <input type="range" min={p.min} max={p.max} step={p.step} value={p.value}
              onChange={e => updateConfig(p.key, parseFloat(e.target.value))}
              className="w-full accent-cyan-500" />
          </div>
        ))}
      </div>

      {/* Classification Controls */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 space-y-2">
        <h3 className="text-sm font-semibold text-slate-200 mb-2">Classification</h3>
        <div>
          <div className="flex justify-between">
            <label className="text-xs text-slate-400">Test Samples/Class</label>
            <span className="text-xs font-mono text-slate-300">{numTestPerClass}</span>
          </div>
          <input type="range" min={10} max={50} value={numTestPerClass}
            onChange={e => setNumTestPerClass(parseInt(e.target.value))}
            className="w-full accent-cyan-500" />
        </div>
        <div>
          <div className="flex justify-between">
            <label className="text-xs text-slate-400">K (KNN)</label>
            <span className="text-xs font-mono text-slate-300">{knn}</span>
          </div>
          <input type="range" min={1} max={15} step={2} value={knn}
            onChange={e => setKnn(parseInt(e.target.value))}
            className="w-full accent-cyan-500" />
        </div>
        <button onClick={handleClassify}
          className="w-full py-2 text-sm rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/30 transition-colors">
          Run Classification
        </button>
      </div>

      {/* Current Features */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-200 mb-2">Extracted Features</h3>
        <div className="space-y-1 text-xs">
          {['Spectral Centroid', 'Zero-Cross Rate', 'Low Band', 'Mid Band', 'High Band', 'RMS Energy'].map((label, i) => (
            <div key={label} className="flex justify-between">
              <span className="text-slate-400">{label}</span>
              <span className="font-mono text-cyan-400">{currentFeatures[i]?.toFixed(4) ?? '0'}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <AppPageLayout
      title="Signal Classification Studio"
      description="Generate, analyze, and classify signals with FFT and KNN"
      domain="Machine Learning"
      sidebar={sidebar}
    >
      <div className="flex gap-1 bg-slate-800/50 border border-slate-700 rounded-lg p-1">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
            }`}>
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'signals' && (
        <WaveformDisplay signal={currentSignal} sampleRate={config.sampleRate} signalType={signalType} />
      )}
      {activeTab === 'features' && (
        <ConfusionMatrix result={classResult} classes={SIGNAL_CLASSES} />
      )}
      {activeTab === 'classification' && (
        <ClassifierMetrics
          result={classResult}
          currentFeatures={currentFeatures}
          config={config}
          signalType={signalType}
        />
      )}
    </AppPageLayout>
  );
};

export default SignalClassifier;
