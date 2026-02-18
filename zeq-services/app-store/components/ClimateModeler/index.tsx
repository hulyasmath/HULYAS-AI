import React, { useState, useCallback } from 'react';
import { CloudSun, Settings, RotateCcw } from 'lucide-react';
import { AppPageLayout } from '../shared/AppPageLayout';
import { EntropyVerifier } from '../shared/EntropyVerifier';
import { KolmogorovChecker } from '../shared/KolmogorovChecker';
import { ProjectionChart } from './ProjectionChart';
import { EmissionsCalculator, EmissionsConfig, RCP_SCENARIOS } from './EmissionsCalculator';
import { EnergyMetrics } from './EnergyMetrics';

const DEFAULT_CONFIG: EmissionsConfig = {
  baselineCO2: 280,
  emissionRate: 0.005,
  climateSensitivity: 0.8,
  projectionYears: 80,
};

const ClimateModeler: React.FC = () => {
  const [config, setConfig] = useState<EmissionsConfig>(DEFAULT_CONFIG);

  const updateConfig = useCallback((patch: Partial<EmissionsConfig>) => {
    setConfig(prev => ({ ...prev, ...patch }));
  }, []);

  const handleReset = useCallback(() => {
    setConfig(DEFAULT_CONFIG);
  }, []);

  const handleNumberInput = useCallback((field: keyof EmissionsConfig, value: string) => {
    const num = parseFloat(value);
    if (!isNaN(num) && num >= 0) {
      updateConfig({ [field]: num });
    }
  }, [updateConfig]);

  const entropyData = [config.baselineCO2, config.emissionRate, config.climateSensitivity, config.projectionYears];

  const sidebar = (
    <div className="space-y-4">
      {/* Model Configuration */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <Settings size={16} className="text-cyan-400" />
          <h3 className="text-sm font-semibold text-slate-200">Model Parameters</h3>
        </div>

        {/* RCP Scenario Presets */}
        <div>
          <label className="text-xs text-slate-400 block mb-1">Scenario Preset</label>
          <div className="space-y-1">
            {RCP_SCENARIOS.map(scenario => (
              <button
                key={scenario.name}
                onClick={() => updateConfig({ emissionRate: scenario.rate })}
                className={`w-full flex items-center justify-between px-3 py-2 rounded text-sm transition-colors ${
                  Math.abs(config.emissionRate - scenario.rate) < 0.0001
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'bg-slate-900 text-slate-400 border border-slate-600 hover:border-slate-500'
                }`}
              >
                <span>{scenario.name}</span>
                <span className="text-xs font-mono">{scenario.rate}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Baseline CO2 */}
        <div>
          <label className="text-xs text-slate-400 block mb-1">Baseline CO2 (ppm)</label>
          <input
            type="number"
            value={config.baselineCO2}
            onChange={e => handleNumberInput('baselineCO2', e.target.value)}
            min={100}
            max={1000}
            step={10}
            className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-sm text-white font-mono focus:border-cyan-400 focus:outline-none"
          />
        </div>

        {/* Emission Rate */}
        <div>
          <label className="text-xs text-slate-400 block mb-1">Emission Rate (ppm/yr growth)</label>
          <input
            type="number"
            value={config.emissionRate}
            onChange={e => handleNumberInput('emissionRate', e.target.value)}
            min={0}
            max={0.05}
            step={0.001}
            className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-sm text-white font-mono focus:border-cyan-400 focus:outline-none"
          />
        </div>

        {/* Climate Sensitivity */}
        <div>
          <label className="text-xs text-slate-400 block mb-1">Climate Sensitivity (K per W/m^2)</label>
          <input
            type="number"
            value={config.climateSensitivity}
            onChange={e => handleNumberInput('climateSensitivity', e.target.value)}
            min={0.1}
            max={2.0}
            step={0.1}
            className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-sm text-white font-mono focus:border-cyan-400 focus:outline-none"
          />
        </div>

        {/* Projection Years */}
        <div>
          <label className="text-xs text-slate-400 block mb-1">
            Projection Years ({2020 + config.projectionYears})
          </label>
          <input
            type="range"
            min={10}
            max={80}
            step={5}
            value={config.projectionYears}
            onChange={e => handleNumberInput('projectionYears', e.target.value)}
            className="w-full h-1.5 bg-slate-700 rounded-lg cursor-pointer accent-cyan-500"
          />
          <div className="flex justify-between text-xs text-slate-500">
            <span>2030</span>
            <span>2100</span>
          </div>
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
      <EntropyVerifier data={entropyData} label="Model Config Entropy" />
      <KolmogorovChecker
        data={JSON.stringify(config)}
        label="Config Complexity"
      />
    </div>
  );

  return (
    <AppPageLayout
      title="Climate & Environment Modeler"
      description="CO2 concentration, radiative forcing, and temperature projection models"
      domain="Climate Science"
      sidebar={sidebar}
    >
      <ProjectionChart config={config} />
      <EmissionsCalculator config={config} />
      <EnergyMetrics />
    </AppPageLayout>
  );
};

export default ClimateModeler;
