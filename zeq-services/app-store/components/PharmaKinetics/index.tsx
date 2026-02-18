import React, { useState, useMemo, useCallback } from 'react';
import { AppPageLayout } from '../shared/AppPageLayout';
import { useZeqSync } from '../SimulationVisualizer/useZeqSync';
import { Pill, Beaker, Activity, Clock } from 'lucide-react';
import ConcentrationCurve from './ConcentrationCurve';
import CompartmentView from './CompartmentView';
import PKMetrics from './PKMetrics';

type Tab = 'concentration' | 'compartments' | 'metrics';
type ModelType = '1comp-iv' | '1comp-oral' | '2comp-iv';

export interface PKParams {
  dose: number;
  bioavailability: number;
  ka: number;
  ke: number;
  vd: number;
  k12: number;
  k21: number;
  dosingInterval: number;
  numDoses: number;
  mec: number;
  mtc: number;
  model: ModelType;
}

/** Safe number guard */
function safe(v: number): number {
  return Number.isFinite(v) ? v : 0;
}

/** Compute concentration at time t for a single dose */
export function singleDoseConcentration(t: number, p: PKParams): number {
  if (t < 0) return 0;
  const { dose, bioavailability: F, ka, ke, vd, k12, k21, model } = p;

  if (model === '1comp-iv') {
    return safe((dose / vd) * Math.exp(-ke * t));
  }

  if (model === '1comp-oral') {
    if (Math.abs(ka - ke) < 1e-9) {
      return safe((F * dose * ka * t) / vd * Math.exp(-ke * t));
    }
    return safe(
      ((F * dose * ka) / (vd * (ka - ke))) *
        (Math.exp(-ke * t) - Math.exp(-ka * t))
    );
  }

  // 2comp-iv
  const sum = k12 + k21 + ke;
  const disc = sum * sum - 4 * k21 * ke;
  if (disc < 0) return 0;
  const sqrtDisc = Math.sqrt(disc);
  const alpha = 0.5 * (sum + sqrtDisc);
  const beta = 0.5 * (sum - sqrtDisc);
  if (Math.abs(alpha - beta) < 1e-12) return 0;
  const A = (dose * (alpha - k21)) / (vd * (alpha - beta));
  const B = (dose * (k21 - beta)) / (vd * (alpha - beta));
  return safe(A * Math.exp(-alpha * t) + B * Math.exp(-beta * t));
}

/** Compute concentration with multiple dosing (superposition) */
export function multiDoseConcentration(t: number, p: PKParams): number {
  let total = 0;
  for (let i = 0; i < p.numDoses; i++) {
    const tDose = t - i * p.dosingInterval;
    total += singleDoseConcentration(tDose, p);
  }
  return safe(total);
}

/** Generate time series */
export function generateTimeSeries(
  p: PKParams,
  dt: number = 0.05
): { times: number[]; concentrations: number[] } {
  const totalTime = p.dosingInterval * p.numDoses + 10;
  const times: number[] = [];
  const concentrations: number[] = [];
  for (let t = 0; t <= totalTime; t += dt) {
    times.push(t);
    concentrations.push(multiDoseConcentration(t, p));
  }
  return { times, concentrations };
}

/** Trapezoidal AUC */
export function computeAUC(times: number[], conc: number[]): number {
  let auc = 0;
  for (let i = 0; i < times.length - 1; i++) {
    auc += ((conc[i] + conc[i + 1]) / 2) * (times[i + 1] - times[i]);
  }
  return safe(auc);
}

const PharmaKinetics: React.FC = () => {
  const { syncValue, elapsedTime, pulseCount } = useZeqSync();
  const [activeTab, setActiveTab] = useState<Tab>('concentration');

  const [params, setParams] = useState<PKParams>({
    dose: 500,
    bioavailability: 0.8,
    ka: 1.5,
    ke: 0.2,
    vd: 50,
    k12: 0.15,
    k21: 0.1,
    dosingInterval: 8,
    numDoses: 3,
    mec: 2,
    mtc: 15,
    model: '1comp-oral',
  });

  const updateParam = useCallback(
    <K extends keyof PKParams>(key: K, value: PKParams[K]) => {
      setParams((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const timeSeries = useMemo(() => generateTimeSeries(params), [params]);

  const pkResults = useMemo(() => {
    const { times, concentrations } = timeSeries;
    const auc = computeAUC(times, concentrations);
    let cmax = 0;
    let tmax = 0;
    for (let i = 0; i < concentrations.length; i++) {
      if (concentrations[i] > cmax) {
        cmax = concentrations[i];
        tmax = times[i];
      }
    }
    const halfLife = safe(Math.LN2 / params.ke);
    const clearance = safe(params.ke * params.vd);
    const accumFactor =
      params.numDoses > 1
        ? safe(1 / (1 - Math.exp(-params.ke * params.dosingInterval)))
        : 1;
    return { auc, cmax, tmax, halfLife, clearance, accumFactor };
  }, [timeSeries, params]);

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'concentration', label: 'Concentration', icon: <Activity size={14} /> },
    { id: 'compartments', label: 'Compartments', icon: <Beaker size={14} /> },
    { id: 'metrics', label: 'PK Metrics', icon: <Pill size={14} /> },
  ];

  const sidebar = (
    <div className="space-y-4">
      {/* Model Selection */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-cyan-400 mb-3">Model</h3>
        <select
          value={params.model}
          onChange={(e) => updateParam('model', e.target.value as ModelType)}
          className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1.5 text-sm text-white"
        >
          <option value="1comp-iv">1-Compartment IV Bolus</option>
          <option value="1comp-oral">1-Compartment Oral</option>
          <option value="2comp-iv">2-Compartment IV</option>
        </select>
      </div>

      {/* Dosing Parameters */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 space-y-3">
        <h3 className="text-sm font-semibold text-cyan-400 mb-1">Dosing</h3>
        <label className="block text-xs text-slate-400">
          Dose: <span className="text-orange-400 font-mono">{params.dose} mg</span>
          <input type="range" min={50} max={2000} step={10} value={params.dose}
            onChange={(e) => updateParam('dose', +e.target.value)}
            className="w-full mt-1 accent-cyan-400" />
        </label>
        {params.model === '1comp-oral' && (
          <label className="block text-xs text-slate-400">
            Bioavailability (F): <span className="text-orange-400 font-mono">{params.bioavailability.toFixed(2)}</span>
            <input type="range" min={0.1} max={1} step={0.05} value={params.bioavailability}
              onChange={(e) => updateParam('bioavailability', +e.target.value)}
              className="w-full mt-1 accent-cyan-400" />
          </label>
        )}
        <label className="block text-xs text-slate-400">
          Doses: <span className="text-orange-400 font-mono">{params.numDoses}</span>
          <input type="range" min={1} max={10} step={1} value={params.numDoses}
            onChange={(e) => updateParam('numDoses', +e.target.value)}
            className="w-full mt-1 accent-cyan-400" />
        </label>
        <label className="block text-xs text-slate-400">
          Interval (tau): <span className="text-orange-400 font-mono">{params.dosingInterval} h</span>
          <input type="range" min={4} max={24} step={1} value={params.dosingInterval}
            onChange={(e) => updateParam('dosingInterval', +e.target.value)}
            className="w-full mt-1 accent-cyan-400" />
        </label>
      </div>

      {/* PK Parameters */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 space-y-3">
        <h3 className="text-sm font-semibold text-cyan-400 mb-1">PK Parameters</h3>
        {(params.model === '1comp-oral') && (
          <label className="block text-xs text-slate-400">
            ka (absorption): <span className="text-orange-400 font-mono">{params.ka.toFixed(2)} h&sup1;</span>
            <input type="range" min={0.1} max={5} step={0.1} value={params.ka}
              onChange={(e) => updateParam('ka', +e.target.value)}
              className="w-full mt-1 accent-cyan-400" />
          </label>
        )}
        <label className="block text-xs text-slate-400">
          ke (elimination): <span className="text-orange-400 font-mono">{params.ke.toFixed(3)} h&sup1;</span>
          <input type="range" min={0.01} max={1} step={0.01} value={params.ke}
            onChange={(e) => updateParam('ke', +e.target.value)}
            className="w-full mt-1 accent-cyan-400" />
        </label>
        <label className="block text-xs text-slate-400">
          Vd: <span className="text-orange-400 font-mono">{params.vd} L</span>
          <input type="range" min={5} max={500} step={5} value={params.vd}
            onChange={(e) => updateParam('vd', +e.target.value)}
            className="w-full mt-1 accent-cyan-400" />
        </label>
        {params.model === '2comp-iv' && (
          <>
            <label className="block text-xs text-slate-400">
              k12: <span className="text-orange-400 font-mono">{params.k12.toFixed(2)} h&sup1;</span>
              <input type="range" min={0.01} max={1} step={0.01} value={params.k12}
                onChange={(e) => updateParam('k12', +e.target.value)}
                className="w-full mt-1 accent-cyan-400" />
            </label>
            <label className="block text-xs text-slate-400">
              k21: <span className="text-orange-400 font-mono">{params.k21.toFixed(2)} h&sup1;</span>
              <input type="range" min={0.01} max={1} step={0.01} value={params.k21}
                onChange={(e) => updateParam('k21', +e.target.value)}
                className="w-full mt-1 accent-cyan-400" />
            </label>
          </>
        )}
      </div>

      {/* Therapeutic Window */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 space-y-3">
        <h3 className="text-sm font-semibold text-cyan-400 mb-1">Therapeutic Window</h3>
        <label className="block text-xs text-slate-400">
          MEC: <span className="text-emerald-400 font-mono">{params.mec.toFixed(1)} mg/L</span>
          <input type="range" min={0.1} max={10} step={0.1} value={params.mec}
            onChange={(e) => updateParam('mec', +e.target.value)}
            className="w-full mt-1 accent-emerald-400" />
        </label>
        <label className="block text-xs text-slate-400">
          MTC: <span className="text-red-400 font-mono">{params.mtc.toFixed(1)} mg/L</span>
          <input type="range" min={5} max={50} step={0.5} value={params.mtc}
            onChange={(e) => updateParam('mtc', +e.target.value)}
            className="w-full mt-1 accent-red-400" />
        </label>
      </div>

      {/* Sync Info */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-2">
          <Clock size={14} className="text-cyan-400" />
          <span className="text-xs text-slate-400">HulyaPulse Sync</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-slate-500">Pulse</span>
            <p className="text-cyan-400 font-mono">{pulseCount}</p>
          </div>
          <div>
            <span className="text-slate-500">Sync</span>
            <p className="text-cyan-400 font-mono">{syncValue.toFixed(4)}</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <AppPageLayout
      title="Pharmacokinetics Modeler"
      description="Multi-compartment PK modeling with therapeutic window analysis"
      domain="life-sciences"
      sidebar={sidebar}
    >
      {/* Tab Navigation */}
      <div className="flex gap-1 bg-slate-800/50 rounded-lg p-1 border border-slate-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm transition-colors ${
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
      {activeTab === 'concentration' && (
        <ConcentrationCurve
          params={params}
          timeSeries={timeSeries}
          pkResults={pkResults}
          elapsedTime={elapsedTime}
        />
      )}
      {activeTab === 'compartments' && (
        <CompartmentView
          params={params}
          elapsedTime={elapsedTime}
          syncValue={syncValue}
        />
      )}
      {activeTab === 'metrics' && (
        <PKMetrics
          params={params}
          timeSeries={timeSeries}
          pkResults={pkResults}
        />
      )}
    </AppPageLayout>
  );
};

export default PharmaKinetics;
