import React, { useState, useCallback } from 'react';
import { Brain, Waves, BarChart3, Activity } from 'lucide-react';
import { AppPageLayout } from '../shared/AppPageLayout';
import { EEGWaveform, EEGBandAmplitudes } from './EEGWaveform';
import { SpectralAnalysis } from './SpectralAnalysis';
import { SignalEntropy } from './SignalEntropy';

type TabId = 'waveform' | 'spectral' | 'entropy';

interface TabConfig {
  id: TabId;
  label: string;
  icon: React.ReactNode;
}

const TABS: TabConfig[] = [
  { id: 'waveform', label: 'Waveform', icon: <Waves size={16} /> },
  { id: 'spectral', label: 'Spectral', icon: <BarChart3 size={16} /> },
  { id: 'entropy', label: 'Entropy Analysis', icon: <Activity size={16} /> },
];

const DEFAULT_AMPLITUDES: EEGBandAmplitudes = {
  delta: 20,
  theta: 10,
  alpha: 15,
  beta: 5,
  gamma: 2,
};

const SAMPLE_RATE = 256;

const NeuralProcessor: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('waveform');
  const [amplitudes, setAmplitudes] = useState<EEGBandAmplitudes>(DEFAULT_AMPLITUDES);
  const [samples, setSamples] = useState<number[]>([]);

  const handleSamplesGenerated = useCallback((newSamples: number[]) => {
    setSamples(newSamples);
  }, []);

  const handleAmplitudeChange = useCallback((band: keyof EEGBandAmplitudes, value: string) => {
    const num = parseFloat(value);
    if (!isNaN(num) && num >= 0 && num <= 100) {
      setAmplitudes(prev => ({ ...prev, [band]: num }));
    }
  }, []);

  const sidebar = (
    <div className="space-y-4">
      {/* Band Amplitudes */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <Brain size={16} className="text-cyan-400" />
          <h3 className="text-sm font-semibold text-slate-200">Band Amplitudes (uV)</h3>
        </div>

        {(Object.keys(amplitudes) as (keyof EEGBandAmplitudes)[]).map(band => {
          const colors: Record<string, string> = {
            delta: 'accent-purple-500',
            theta: 'accent-blue-500',
            alpha: 'accent-green-500',
            beta: 'accent-orange-500',
            gamma: 'accent-red-500',
          };
          const labels: Record<string, string> = {
            delta: 'Delta (0.5-4 Hz)',
            theta: 'Theta (4-8 Hz)',
            alpha: 'Alpha (8-12 Hz)',
            beta: 'Beta (12-30 Hz)',
            gamma: 'Gamma (30-100 Hz)',
          };
          return (
            <div key={band}>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs text-slate-400">{labels[band]}</label>
                <span className="text-xs font-mono text-slate-300">{amplitudes[band]} uV</span>
              </div>
              <input
                type="range"
                min={0}
                max={50}
                step={1}
                value={amplitudes[band]}
                onChange={e => handleAmplitudeChange(band, e.target.value)}
                className={`w-full h-1.5 bg-slate-700 rounded-lg cursor-pointer ${colors[band]}`}
              />
            </div>
          );
        })}

        <button
          onClick={() => setAmplitudes(DEFAULT_AMPLITUDES)}
          className="w-full px-3 py-2 rounded bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors text-sm"
        >
          Reset Defaults
        </button>
      </div>

      {/* Signal Info */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 space-y-2">
        <h3 className="text-sm font-semibold text-slate-200 mb-2">Signal Info</h3>
        <div className="text-xs space-y-1">
          <div className="flex justify-between">
            <span className="text-slate-400">Sample Rate</span>
            <span className="font-mono text-slate-300">{SAMPLE_RATE} Hz</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Samples</span>
            <span className="font-mono text-slate-300">{samples.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Window</span>
            <span className="font-mono text-slate-300">4 seconds</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <AppPageLayout
      title="Neural Signal Processor"
      description="Simulated EEG waveform analysis with spectral decomposition and entropy metrics"
      domain="Neuroscience"
      sidebar={sidebar}
    >
      {/* Tabs */}
      <div className="flex gap-1 bg-slate-800/30 rounded-lg p-1">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'waveform' && (
        <EEGWaveform
          amplitudes={amplitudes}
          sampleRate={SAMPLE_RATE}
          displaySeconds={4}
          onSamplesGenerated={handleSamplesGenerated}
        />
      )}

      {activeTab === 'spectral' && (
        <SpectralAnalysis samples={samples} sampleRate={SAMPLE_RATE} />
      )}

      {activeTab === 'entropy' && (
        <SignalEntropy samples={samples} />
      )}

      {/* Always show waveform in non-waveform tabs for reference */}
      {activeTab !== 'waveform' && (
        <div className="opacity-60">
          <EEGWaveform
            amplitudes={amplitudes}
            sampleRate={SAMPLE_RATE}
            displaySeconds={4}
            onSamplesGenerated={handleSamplesGenerated}
          />
        </div>
      )}
    </AppPageLayout>
  );
};

export default NeuralProcessor;
