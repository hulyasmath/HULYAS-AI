import React, { useState, useCallback } from 'react';
import { Ruler, Settings, RotateCcw } from 'lucide-react';
import { AppPageLayout } from '../shared/AppPageLayout';
import { EntropyVerifier, calculateShannonEntropy } from '../shared/EntropyVerifier';
import { KolmogorovChecker } from '../shared/KolmogorovChecker';
import { BeamDiagram } from './BeamDiagram';
import { DeflectionCalculator, MATERIALS, BeamConfig, LoadType, MaterialPreset } from './DeflectionCalculator';
import { StressAnalysis } from './StressAnalysis';

const DEFAULT_CONFIG: BeamConfig = {
  length: 6,
  width: 0.2,
  height: 0.4,
  material: MATERIALS[0],
  loadType: 'uniform',
  loadMagnitude: 10000,
};

const StructuralToolkit: React.FC = () => {
  const [config, setConfig] = useState<BeamConfig>(DEFAULT_CONFIG);

  const updateConfig = useCallback((patch: Partial<BeamConfig>) => {
    setConfig(prev => ({ ...prev, ...patch }));
  }, []);

  const handleReset = useCallback(() => {
    setConfig(DEFAULT_CONFIG);
  }, []);

  const handleNumberInput = useCallback((field: keyof BeamConfig, value: string) => {
    const num = parseFloat(value);
    if (!isNaN(num) && num >= 0) {
      updateConfig({ [field]: num });
    }
  }, [updateConfig]);

  // Data for entropy verification
  const entropyData = [config.length, config.width, config.height, config.loadMagnitude, config.material.E];

  const sidebar = (
    <div className="space-y-4">
      {/* Beam Configuration */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <Settings size={16} className="text-cyan-400" />
          <h3 className="text-sm font-semibold text-slate-200">Beam Configuration</h3>
        </div>

        {/* Material */}
        <div>
          <label className="text-xs text-slate-400 block mb-1">Material</label>
          <select
            value={config.material.name}
            onChange={e => {
              const mat = MATERIALS.find(m => m.name === e.target.value);
              if (mat) updateConfig({ material: mat });
            }}
            className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-sm text-white focus:border-cyan-400 focus:outline-none"
          >
            {MATERIALS.map(m => (
              <option key={m.name} value={m.name}>
                {m.name} (E = {m.E} GPa)
              </option>
            ))}
          </select>
        </div>

        {/* Load Type */}
        <div>
          <label className="text-xs text-slate-400 block mb-1">Load Type</label>
          <div className="flex gap-2">
            {(['uniform', 'point'] as LoadType[]).map(type => (
              <button
                key={type}
                onClick={() => updateConfig({ loadType: type })}
                className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-colors ${
                  config.loadType === type
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'bg-slate-900 text-slate-400 border border-slate-600 hover:border-slate-500'
                }`}
              >
                {type === 'uniform' ? 'Uniform' : 'Point'}
              </button>
            ))}
          </div>
        </div>

        {/* Dimensions */}
        <div>
          <label className="text-xs text-slate-400 block mb-1">Beam Length (m)</label>
          <input
            type="number"
            value={config.length}
            onChange={e => handleNumberInput('length', e.target.value)}
            min={0.1}
            step={0.5}
            className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-sm text-white font-mono focus:border-cyan-400 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-slate-400 block mb-1">Width b (m)</label>
            <input
              type="number"
              value={config.width}
              onChange={e => handleNumberInput('width', e.target.value)}
              min={0.01}
              step={0.01}
              className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-sm text-white font-mono focus:border-cyan-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">Height h (m)</label>
            <input
              type="number"
              value={config.height}
              onChange={e => handleNumberInput('height', e.target.value)}
              min={0.01}
              step={0.01}
              className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-sm text-white font-mono focus:border-cyan-400 focus:outline-none"
            />
          </div>
        </div>

        {/* Load Magnitude */}
        <div>
          <label className="text-xs text-slate-400 block mb-1">
            {config.loadType === 'uniform' ? 'Load (N/m)' : 'Force (N)'}
          </label>
          <input
            type="number"
            value={config.loadMagnitude}
            onChange={e => handleNumberInput('loadMagnitude', e.target.value)}
            min={0}
            step={100}
            className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-sm text-white font-mono focus:border-cyan-400 focus:outline-none"
          />
        </div>

        {/* Reset */}
        <button
          onClick={handleReset}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors text-sm"
        >
          <RotateCcw size={14} />
          Reset Defaults
        </button>
      </div>

      {/* Verification */}
      <EntropyVerifier data={entropyData} label="Config Entropy" />
      <KolmogorovChecker
        data={JSON.stringify(config)}
        label="Config Complexity"
      />
    </div>
  );

  return (
    <AppPageLayout
      title="Structural Engineering Toolkit"
      description="Simply supported beam analysis with deflection, stress, and safety calculations"
      domain="Structural Engineering"
      sidebar={sidebar}
    >
      <BeamDiagram config={config} />
      <DeflectionCalculator config={config} />
      <StressAnalysis config={config} />
    </AppPageLayout>
  );
};

export default StructuralToolkit;
