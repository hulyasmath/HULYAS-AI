import React, { useState, useCallback } from 'react';
import { Rocket, RotateCcw } from 'lucide-react';

export interface MissionParams {
  departureAlt: number;
  arrivalAlt: number;
  mass: number;
  inclination: number;
}

interface MissionConfigProps {
  onCompute: (params: MissionParams) => void;
}

const DEFAULTS: MissionParams = {
  departureAlt: 200,
  arrivalAlt: 35786,
  mass: 1000,
  inclination: 0,
};

function clampPositive(val: string): number {
  const n = parseFloat(val);
  if (isNaN(n) || !isFinite(n) || n < 0) return 0;
  return n;
}

const MissionConfig: React.FC<MissionConfigProps> = ({ onCompute }) => {
  const [params, setParams] = useState<MissionParams>(DEFAULTS);
  const [errors, setErrors] = useState<Partial<Record<keyof MissionParams, string>>>({});

  const validate = useCallback((p: MissionParams): boolean => {
    const errs: Partial<Record<keyof MissionParams, string>> = {};
    if (p.departureAlt <= 0 || p.departureAlt > 1e6) errs.departureAlt = 'Must be 1-1,000,000 km';
    if (p.arrivalAlt <= 0 || p.arrivalAlt > 1e6) errs.arrivalAlt = 'Must be 1-1,000,000 km';
    if (p.departureAlt === p.arrivalAlt) errs.arrivalAlt = 'Must differ from departure';
    if (p.mass <= 0 || p.mass > 1e8) errs.mass = 'Must be 1-100,000,000 kg';
    if (p.inclination < 0 || p.inclination > 180) errs.inclination = 'Must be 0-180 degrees';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }, []);

  const handleChange = (field: keyof MissionParams, value: string) => {
    const num = clampPositive(value);
    setParams(prev => ({ ...prev, [field]: num }));
  };

  const handleSubmit = () => {
    if (validate(params)) {
      onCompute(params);
    }
  };

  const handleReset = () => {
    setParams(DEFAULTS);
    setErrors({});
  };

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 space-y-4">
      <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
        <Rocket size={16} className="text-cyan-400" />
        Mission Parameters
      </h3>

      <div className="space-y-3">
        <div>
          <label className="block text-xs text-slate-400 mb-1">Departure Orbit (km)</label>
          <input
            type="number"
            value={params.departureAlt || ''}
            onChange={e => handleChange('departureAlt', e.target.value)}
            className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-1.5 text-sm text-white focus:border-cyan-400 focus:outline-none"
            placeholder="200"
            min={1}
          />
          {errors.departureAlt && <p className="text-xs text-red-400 mt-1">{errors.departureAlt}</p>}
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-1">Arrival Orbit (km)</label>
          <input
            type="number"
            value={params.arrivalAlt || ''}
            onChange={e => handleChange('arrivalAlt', e.target.value)}
            className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-1.5 text-sm text-white focus:border-cyan-400 focus:outline-none"
            placeholder="35786 (GEO)"
            min={1}
          />
          {errors.arrivalAlt && <p className="text-xs text-red-400 mt-1">{errors.arrivalAlt}</p>}
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-1">Spacecraft Mass (kg)</label>
          <input
            type="number"
            value={params.mass || ''}
            onChange={e => handleChange('mass', e.target.value)}
            className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-1.5 text-sm text-white focus:border-cyan-400 focus:outline-none"
            placeholder="1000"
            min={1}
          />
          {errors.mass && <p className="text-xs text-red-400 mt-1">{errors.mass}</p>}
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-1">Inclination Change (deg)</label>
          <input
            type="number"
            value={params.inclination}
            onChange={e => handleChange('inclination', e.target.value)}
            className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-1.5 text-sm text-white focus:border-cyan-400 focus:outline-none"
            placeholder="0"
            min={0}
            max={180}
          />
          {errors.inclination && <p className="text-xs text-red-400 mt-1">{errors.inclination}</p>}
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleSubmit}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg border border-cyan-500/30 transition-colors text-sm font-medium"
        >
          <Rocket size={14} />
          Calculate Transfer
        </button>
        <button
          onClick={handleReset}
          className="px-3 py-2 bg-slate-700/50 hover:bg-slate-700 text-slate-400 rounded-lg border border-slate-600 transition-colors"
          title="Reset to defaults"
        >
          <RotateCcw size={14} />
        </button>
      </div>
    </div>
  );
};

export default MissionConfig;
