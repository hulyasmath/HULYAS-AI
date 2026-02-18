import React from 'react';
import { PrecisionBadge } from '../shared/PrecisionBadge';
import { EntropyVerifier } from '../shared/EntropyVerifier';

interface CosmicParam {
  name: string;
  symbol: string;
  value: number;
  uncertainty: number;
  unit: string;
  planck2018: number;
}

const COSMIC_PARAMS: CosmicParam[] = [
  {
    name: 'Hubble Constant',
    symbol: 'H\u2080',
    value: 67.4,
    uncertainty: 0.5,
    unit: 'km/s/Mpc',
    planck2018: 67.4,
  },
  {
    name: 'Dark Energy Fraction',
    symbol: '\u03A9\u039B',
    value: 0.685,
    uncertainty: 0.007,
    unit: '',
    planck2018: 0.6847,
  },
  {
    name: 'Dark Matter Fraction',
    symbol: '\u03A9_DM',
    value: 0.265,
    uncertainty: 0.007,
    unit: '',
    planck2018: 0.2647,
  },
  {
    name: 'Baryon Fraction',
    symbol: '\u03A9_b',
    value: 0.0493,
    uncertainty: 0.0003,
    unit: '',
    planck2018: 0.04930,
  },
  {
    name: 'CMB Temperature',
    symbol: 'T\u2080',
    value: 2.7255,
    uncertainty: 0.0006,
    unit: 'K',
    planck2018: 2.7255,
  },
  {
    name: 'Age of Universe',
    symbol: 't\u2080',
    value: 13.787,
    uncertainty: 0.020,
    unit: 'Gyr',
    planck2018: 13.787,
  },
];

interface CosmicParametersProps {
  onParamChange?: (hubble: number, darkEnergy: number, baryon: number) => void;
}

const CosmicParameters: React.FC<CosmicParametersProps> = ({ onParamChange }) => {
  const [params, setParams] = React.useState<CosmicParam[]>(COSMIC_PARAMS);

  const handleValueChange = (index: number, newValue: number) => {
    const updated = [...params];
    updated[index] = { ...updated[index], value: newValue };
    setParams(updated);

    if (onParamChange) {
      const h0 = updated.find((p) => p.symbol === 'H\u2080')?.value ?? 67.4;
      const ol = updated.find((p) => p.symbol === '\u03A9\u039B')?.value ?? 0.685;
      const ob = updated.find((p) => p.symbol === '\u03A9_b')?.value ?? 0.0493;
      onParamChange(h0, ol, ob);
    }
  };

  const paramValues = params.map((p) => p.value);

  return (
    <div className="space-y-4">
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-300 mb-4">
          Cosmological Parameters (Planck 2018)
        </h3>
        <div className="space-y-3">
          {params.map((param, idx) => {
            const isEditable = ['H\u2080', '\u03A9\u039B', '\u03A9_b'].includes(param.symbol);
            return (
              <div key={param.symbol} className="p-3 rounded-lg bg-slate-900/50 border border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="text-sm font-semibold text-slate-300">{param.name}</span>
                    <span className="text-xs text-slate-500 ml-2 font-mono">({param.symbol})</span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-mono font-bold text-cyan-400">
                      {param.value.toFixed(param.uncertainty < 0.01 ? 4 : param.uncertainty < 0.1 ? 3 : 1)}
                    </span>
                    <span className="text-xs text-slate-500 ml-1">
                      &plusmn; {param.uncertainty} {param.unit}
                    </span>
                  </div>
                </div>

                {isEditable && (
                  <div className="mb-2">
                    <input
                      type="range"
                      value={param.value}
                      onChange={(e) => handleValueChange(idx, parseFloat(e.target.value))}
                      min={param.planck2018 - param.uncertainty * 10}
                      max={param.planck2018 + param.uncertainty * 10}
                      step={param.uncertainty / 10}
                      className="w-full accent-cyan-500"
                    />
                  </div>
                )}

                <PrecisionBadge
                  computed={param.value}
                  reference={param.planck2018}
                  label={`vs Planck 2018`}
                  compact
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Derived quantities */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-300 mb-3">Derived Quantities</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-2 rounded bg-slate-900/50 border border-slate-700">
            <span className="text-xs text-slate-400">Hubble Time</span>
            <p className="text-sm font-mono text-cyan-400">
              {(1 / (params[0].value / 978)).toFixed(2)} Gyr
            </p>
          </div>
          <div className="p-2 rounded bg-slate-900/50 border border-slate-700">
            <span className="text-xs text-slate-400">Critical Density</span>
            <p className="text-sm font-mono text-cyan-400">
              {(3 * Math.pow(params[0].value * 3.24e-20, 2) / (8 * Math.PI * 6.674e-11) * 1e27).toFixed(2)} &times;10&sup3;&sup2; kg/m&sup3;
            </p>
          </div>
          <div className="p-2 rounded bg-slate-900/50 border border-slate-700">
            <span className="text-xs text-slate-400">Total &Omega;</span>
            <p className="text-sm font-mono text-cyan-400">
              {(params[1].value + params[2].value + params[3].value).toFixed(4)}
            </p>
          </div>
          <div className="p-2 rounded bg-slate-900/50 border border-slate-700">
            <span className="text-xs text-slate-400">Photon Decoupling z</span>
            <p className="text-sm font-mono text-cyan-400">1089.80</p>
          </div>
        </div>
      </div>

      {/* Entropy verification on parameter set */}
      <EntropyVerifier data={paramValues} label="Parameter Set Entropy" />
    </div>
  );
};

export default CosmicParameters;
