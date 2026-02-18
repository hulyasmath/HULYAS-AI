import React, { useMemo } from 'react';
import { PrecisionBadge } from '../shared/PrecisionBadge';
import { EntropyVerifier } from '../shared/EntropyVerifier';
import { KolmogorovChecker } from '../shared/KolmogorovChecker';
import type { PKParams } from './index';

interface Props {
  params: PKParams;
  timeSeries: { times: number[]; concentrations: number[] };
  pkResults: {
    auc: number;
    cmax: number;
    tmax: number;
    halfLife: number;
    clearance: number;
    accumFactor: number;
  };
}

function safe(v: number): number {
  return Number.isFinite(v) ? v : 0;
}

const PKMetrics: React.FC<Props> = ({ params, timeSeries, pkResults }) => {
  // Reference values for default oral params (500mg, ka=1.5, ke=0.2, Vd=50, F=0.8)
  const refTmax = useMemo(() => {
    if (params.model !== '1comp-oral') return pkResults.tmax;
    if (Math.abs(params.ka - params.ke) < 1e-9) return 0;
    return safe(Math.log(params.ka / params.ke) / (params.ka - params.ke));
  }, [params]);

  const analyticalTmax = useMemo(() => {
    if (params.model !== '1comp-oral') return pkResults.tmax;
    if (Math.abs(params.ka - params.ke) < 1e-9) return 0;
    return safe(Math.log(params.ka / params.ke) / (params.ka - params.ke));
  }, [params]);

  const analyticalHalfLife = safe(Math.LN2 / params.ke);

  const serializedState = useMemo(
    () =>
      JSON.stringify({
        model: params.model,
        dose: params.dose,
        ke: params.ke,
        vd: params.vd,
        auc: pkResults.auc,
        cmax: pkResults.cmax,
        tmax: pkResults.tmax,
      }),
    [params, pkResults]
  );

  const metrics = [
    {
      label: 'AUC (trapezoidal)',
      value: pkResults.auc,
      unit: 'mg*h/L',
      color: 'text-cyan-400',
    },
    {
      label: 'Cmax',
      value: pkResults.cmax,
      unit: 'mg/L',
      color: 'text-orange-400',
    },
    {
      label: 'Tmax',
      value: pkResults.tmax,
      unit: 'h',
      color: 'text-orange-400',
    },
    {
      label: 'Half-life (t1/2)',
      value: pkResults.halfLife,
      unit: 'h',
      color: 'text-emerald-400',
    },
    {
      label: 'Clearance (CL)',
      value: pkResults.clearance,
      unit: 'L/h',
      color: 'text-purple-400',
    },
    {
      label: 'Volume of Distribution',
      value: params.vd,
      unit: 'L',
      color: 'text-slate-300',
    },
    {
      label: 'Accumulation Factor',
      value: pkResults.accumFactor,
      unit: '',
      color: 'text-amber-400',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Primary PK Parameters */}
      <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-cyan-400 mb-4">Pharmacokinetic Parameters</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {metrics.map((m) => (
            <div key={m.label} className="bg-slate-900/50 rounded-lg p-3">
              <span className="text-xs text-slate-400 block mb-1">{m.label}</span>
              <span className={`text-lg font-mono font-bold ${m.color}`}>
                {safe(m.value).toFixed(3)}
              </span>
              {m.unit && (
                <span className="text-xs text-slate-500 ml-1">{m.unit}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Precision Verification */}
      <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-cyan-400 mb-3">Precision Verification</h3>
        <div className="space-y-2">
          {params.model === '1comp-oral' && (
            <PrecisionBadge
              computed={pkResults.tmax}
              reference={analyticalTmax}
              label="Tmax (numerical vs analytical)"
            />
          )}
          <PrecisionBadge
            computed={pkResults.halfLife}
            reference={analyticalHalfLife}
            label="Half-life (computed vs ln2/ke)"
          />
          <PrecisionBadge
            computed={pkResults.clearance}
            reference={safe(params.ke * params.vd)}
            label="Clearance (CL = ke * Vd)"
          />
        </div>
      </div>

      {/* Therapeutic Window Assessment */}
      <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-cyan-400 mb-3">Therapeutic Assessment</h3>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-slate-900/50 rounded-lg p-3 text-center">
            <span className="text-xs text-slate-400 block">Within Window</span>
            <span className={`text-lg font-mono font-bold ${
              pkResults.cmax >= params.mec && pkResults.cmax <= params.mtc
                ? 'text-emerald-400' : 'text-red-400'
            }`}>
              {pkResults.cmax >= params.mec && pkResults.cmax <= params.mtc ? 'YES' : 'NO'}
            </span>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-3 text-center">
            <span className="text-xs text-slate-400 block">MEC ({params.mec.toFixed(1)})</span>
            <span className={`text-lg font-mono font-bold ${
              pkResults.cmax >= params.mec ? 'text-emerald-400' : 'text-amber-400'
            }`}>
              {pkResults.cmax >= params.mec ? 'Above' : 'Below'}
            </span>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-3 text-center">
            <span className="text-xs text-slate-400 block">MTC ({params.mtc.toFixed(1)})</span>
            <span className={`text-lg font-mono font-bold ${
              pkResults.cmax <= params.mtc ? 'text-emerald-400' : 'text-red-400'
            }`}>
              {pkResults.cmax <= params.mtc ? 'Below' : 'Above'}
            </span>
          </div>
        </div>
      </div>

      {/* Entropy & Kolmogorov Verification */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <EntropyVerifier data={timeSeries.concentrations} label="Concentration Profile Entropy" />
        <KolmogorovChecker data={serializedState} label="PK State Complexity" />
      </div>
    </div>
  );
};

export default PKMetrics;
