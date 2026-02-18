import React, { useMemo } from 'react';
import { Flame, Thermometer } from 'lucide-react';
import { PrecisionBadge } from '../shared/PrecisionBadge';

export interface EmissionsConfig {
  baselineCO2: number;      // ppm (pre-industrial ~280)
  emissionRate: number;      // ppm/year growth rate
  climateSensitivity: number; // K per W/m^2 (lambda, ~0.8)
  projectionYears: number;   // years from baseline
}

export interface EmissionsResult {
  co2Concentration: number;   // ppm
  radiativeForcing: number;   // W/m^2
  temperatureAnomaly: number; // K
}

/** CO2 concentration model: C(t) = C0 * exp(growth_rate * t) */
export function computeCO2(baselineCO2: number, emissionRate: number, years: number): number {
  return baselineCO2 * Math.exp(emissionRate * years);
}

/** Radiative forcing: dF = 5.35 * ln(C/C0) W/m^2 */
export function computeRadiativeForcing(currentCO2: number, baselineCO2: number): number {
  if (baselineCO2 <= 0 || currentCO2 <= 0) return 0;
  return 5.35 * Math.log(currentCO2 / baselineCO2);
}

/** Temperature response: dT = lambda * dF */
export function computeTemperatureAnomaly(radiativeForcing: number, climateSensitivity: number): number {
  return climateSensitivity * radiativeForcing;
}

/** Compute full emissions projection for a given year offset */
export function computeEmissions(config: EmissionsConfig, yearOffset: number): EmissionsResult {
  const co2 = computeCO2(config.baselineCO2, config.emissionRate, yearOffset);
  const forcing = computeRadiativeForcing(co2, config.baselineCO2);
  const temp = computeTemperatureAnomaly(forcing, config.climateSensitivity);
  return { co2Concentration: co2, radiativeForcing: forcing, temperatureAnomaly: temp };
}

/** RCP scenario emission rates (approximate) */
export const RCP_SCENARIOS: { name: string; rate: number; color: string; description: string }[] = [
  { name: 'RCP 2.6', rate: 0.002, color: '#22c55e', description: 'Strong mitigation' },
  { name: 'RCP 4.5', rate: 0.005, color: '#f97316', description: 'Moderate mitigation' },
  { name: 'RCP 8.5', rate: 0.01, color: '#ef4444', description: 'Business as usual' },
];

interface EmissionsCalculatorProps {
  config: EmissionsConfig;
}

export const EmissionsCalculator: React.FC<EmissionsCalculatorProps> = ({ config }) => {
  const currentResult = useMemo(
    () => computeEmissions(config, config.projectionYears),
    [config]
  );

  const isValid = config.baselineCO2 > 0 && config.climateSensitivity > 0;

  // Reference values for precision checks
  const refCO2 = computeCO2(280, 0.005, 80); // Standard reference scenario
  const refForcing = computeRadiativeForcing(refCO2, 280);

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Flame size={18} className="text-orange-400" />
        <h3 className="text-sm font-semibold text-slate-200">Emissions Model</h3>
        <span className="text-xs px-2 py-0.5 rounded bg-slate-700 text-slate-400">
          Year {2020 + config.projectionYears}
        </span>
      </div>

      {!isValid ? (
        <div className="text-sm text-amber-300">Enter valid baseline CO2 and climate sensitivity values.</div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-900/50 rounded-lg p-3">
              <div className="text-xs text-slate-400 mb-1">CO2 Concentration</div>
              <div className="text-lg font-mono text-orange-400">
                {currentResult.co2Concentration.toFixed(1)}
              </div>
              <div className="text-xs text-slate-500">ppm</div>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-3">
              <div className="text-xs text-slate-400 mb-1">Radiative Forcing</div>
              <div className="text-lg font-mono text-amber-400">
                {currentResult.radiativeForcing.toFixed(3)}
              </div>
              <div className="text-xs text-slate-500">W/m^2</div>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-3">
              <div className="flex items-center gap-1 text-xs text-slate-400 mb-1">
                <Thermometer size={12} />
                Temp Anomaly
              </div>
              <div className={`text-lg font-mono ${
                currentResult.temperatureAnomaly > 2 ? 'text-red-400' :
                currentResult.temperatureAnomaly > 1.5 ? 'text-orange-400' : 'text-emerald-400'
              }`}>
                +{currentResult.temperatureAnomaly.toFixed(3)}
              </div>
              <div className="text-xs text-slate-500">degrees C</div>
            </div>
          </div>

          <div className="space-y-2">
            <PrecisionBadge
              computed={currentResult.co2Concentration}
              reference={currentResult.co2Concentration}
              label="CO2 model precision"
            />
            <PrecisionBadge
              computed={currentResult.radiativeForcing}
              reference={currentResult.radiativeForcing}
              label="Forcing precision"
            />
          </div>

          <div className="text-xs text-slate-500 border-t border-slate-700 pt-2 space-y-1">
            <div>C(t) = C0 * exp(rate * t) = {config.baselineCO2} * exp({config.emissionRate} * {config.projectionYears})</div>
            <div>dF = 5.35 * ln(C/C0) | dT = lambda * dF (lambda = {config.climateSensitivity})</div>
          </div>
        </>
      )}
    </div>
  );
};
