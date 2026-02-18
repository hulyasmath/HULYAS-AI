import React, { useState, useCallback } from 'react';
import { AppPageLayout } from '../shared/AppPageLayout';
import PortfolioInput, { Asset } from './PortfolioInput';
import MonteCarloChart from './MonteCarloChart';
import RiskMetrics from './RiskMetrics';

export interface SimulationResult {
  paths: number[][];
  meanPath: number[];
  p5Path: number[];
  p95Path: number[];
  finalValues: number[];
  years: number;
}

function runMonteCarlo(
  assets: Asset[],
  initialValue: number,
  years: number,
  numPaths: number,
  stepsPerYear: number
): SimulationResult {
  const dt = 1 / stepsPerYear;
  const totalSteps = years * stepsPerYear;

  // Portfolio-level expected return and volatility (weighted)
  const portfolioReturn = assets.reduce((s, a) => s + (a.weight / 100) * (a.expectedReturn / 100), 0);
  const portfolioVol = assets.reduce((s, a) => s + (a.weight / 100) * (a.volatility / 100), 0);

  const paths: number[][] = [];
  const finalValues: number[] = [];

  for (let p = 0; p < numPaths; p++) {
    const path: number[] = [initialValue];
    let value = initialValue;
    for (let t = 0; t < totalSteps; t++) {
      // Box-Muller transform for normal random
      const u1 = Math.random();
      const u2 = Math.random();
      const z = Math.sqrt(-2 * Math.log(u1 || 1e-10)) * Math.cos(2 * Math.PI * u2);
      // Geometric Brownian Motion
      const drift = (portfolioReturn - 0.5 * portfolioVol * portfolioVol) * dt;
      const diffusion = portfolioVol * Math.sqrt(dt) * z;
      value = value * Math.exp(drift + diffusion);
      path.push(value);
    }
    paths.push(path);
    finalValues.push(value);
  }

  // Compute percentile paths
  const meanPath: number[] = [];
  const p5Path: number[] = [];
  const p95Path: number[] = [];

  for (let t = 0; t <= totalSteps; t++) {
    const vals = paths.map(p => p[t]).sort((a, b) => a - b);
    meanPath.push(vals.reduce((s, v) => s + v, 0) / vals.length);
    p5Path.push(vals[Math.floor(vals.length * 0.05)]);
    p95Path.push(vals[Math.floor(vals.length * 0.95)]);
  }

  return { paths, meanPath, p5Path, p95Path, finalValues, years };
}

type Tab = 'portfolio' | 'simulation' | 'risk';

const FinancialAnalyzer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('portfolio');
  const [assets, setAssets] = useState<Asset[]>([
    { name: 'US Equities', weight: 60, expectedReturn: 10, volatility: 15 },
    { name: 'Bonds', weight: 30, expectedReturn: 4, volatility: 5 },
    { name: 'Commodities', weight: 10, expectedReturn: 7, volatility: 20 },
  ]);
  const [simulation, setSimulation] = useState<SimulationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRunSimulation = useCallback(() => {
    setError(null);
    const totalWeight = assets.reduce((s, a) => s + a.weight, 0);
    if (Math.abs(totalWeight - 100) > 0.01) {
      setError(`Total weight must be 100% (currently ${totalWeight.toFixed(1)}%)`);
      return;
    }
    if (assets.length === 0) {
      setError('Add at least one asset');
      return;
    }
    try {
      const result = runMonteCarlo(assets, 100000, 10, 100, 12);
      setSimulation(result);
      setActiveTab('simulation');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Simulation failed');
    }
  }, [assets]);

  const tabs: { id: Tab; label: string }[] = [
    { id: 'portfolio', label: 'Portfolio' },
    { id: 'simulation', label: 'Simulation' },
    { id: 'risk', label: 'Risk Metrics' },
  ];

  return (
    <AppPageLayout
      title="Financial Risk Analyzer"
      description="Monte Carlo portfolio simulation with VaR and risk metrics"
      domain="finance"
    >
      {/* Tab Navigation */}
      <div className="flex gap-1 bg-slate-800/50 rounded-lg p-1 border border-slate-700">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Tab Content */}
      {activeTab === 'portfolio' && (
        <PortfolioInput
          assets={assets}
          onChange={setAssets}
          onRun={handleRunSimulation}
        />
      )}

      {activeTab === 'simulation' && (
        simulation ? (
          <MonteCarloChart simulation={simulation} />
        ) : (
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8 text-center text-slate-400">
            <p>Run a simulation from the Portfolio tab first.</p>
          </div>
        )
      )}

      {activeTab === 'risk' && (
        simulation ? (
          <RiskMetrics assets={assets} simulation={simulation} />
        ) : (
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8 text-center text-slate-400">
            <p>Run a simulation from the Portfolio tab first.</p>
          </div>
        )
      )}
    </AppPageLayout>
  );
};

export default FinancialAnalyzer;
