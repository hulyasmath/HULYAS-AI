import React, { useState } from 'react';
import { AppPageLayout } from '../shared/AppPageLayout';
import { KolmogorovChecker } from '../shared/KolmogorovChecker';
import CMBVisualization from './CMBVisualization';
import PowerSpectrum from './PowerSpectrum';
import CosmicParameters from './CosmicParameters';

const CosmicAnalyzer: React.FC = () => {
  const [hubbleConstant, setHubbleConstant] = useState(67.4);
  const [darkEnergyFraction, setDarkEnergyFraction] = useState(0.685);
  const [baryonFraction, setBaryonFraction] = useState(0.0493);
  const [resolution, setResolution] = useState(100);
  const [fluctuationScale, setFluctuationScale] = useState(1.0);

  const handleParamChange = (h0: number, ol: number, ob: number) => {
    setHubbleConstant(h0);
    setDarkEnergyFraction(ol);
    setBaryonFraction(ob);
  };

  // Serialized parameters for Kolmogorov
  const paramString = `H0=${hubbleConstant},OL=${darkEnergyFraction},Ob=${baryonFraction},res=${resolution},scale=${fluctuationScale}`;

  const sidebar = (
    <div className="space-y-4">
      {/* Visualization controls */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 space-y-3">
        <h3 className="text-sm font-semibold text-slate-300">Visualization Controls</h3>
        <div>
          <label className="text-xs text-slate-400 block mb-1">
            Resolution: {resolution}px
          </label>
          <input
            type="range"
            value={resolution}
            onChange={(e) => {
              const v = parseInt(e.target.value);
              if (v >= 50 && v <= 200) setResolution(v);
            }}
            min={50}
            max={200}
            step={10}
            className="w-full accent-cyan-500"
          />
        </div>
        <div>
          <label className="text-xs text-slate-400 block mb-1">
            Fluctuation Scale: {fluctuationScale.toFixed(1)}x
          </label>
          <input
            type="range"
            value={fluctuationScale}
            onChange={(e) => setFluctuationScale(parseFloat(e.target.value))}
            min={0.1}
            max={3.0}
            step={0.1}
            className="w-full accent-cyan-500"
          />
        </div>
      </div>

      {/* Cosmological parameters panel */}
      <CosmicParameters onParamChange={handleParamChange} />

      <KolmogorovChecker data={paramString} label="Parameter Complexity" compact />
    </div>
  );

  return (
    <AppPageLayout
      title="Cosmic Background Analyzer"
      description="CMB temperature fluctuation analysis with Planck 2018 parameters"
      domain="cosmology"
      sidebar={sidebar}
    >
      <CMBVisualization resolution={resolution} fluctuationScale={fluctuationScale} />
      <PowerSpectrum
        hubbleConstant={hubbleConstant}
        darkEnergyFraction={darkEnergyFraction}
        baryonFraction={baryonFraction}
      />
    </AppPageLayout>
  );
};

export default CosmicAnalyzer;
