import React from 'react';
import { Sun, Wind, Zap, Leaf } from 'lucide-react';
import { PrecisionBadge } from '../shared/PrecisionBadge';

interface EnergySource {
  name: string;
  icon: React.ReactNode;
  capacityFactor: number;       // 0-1
  carbonIntensity: number;      // gCO2/kWh
  eroi: number;                 // Energy Return on Investment
  referenceCapacity: number;    // reference value for precision
  referenceCarbonIntensity: number;
  color: string;
}

const ENERGY_SOURCES: EnergySource[] = [
  {
    name: 'Solar PV',
    icon: <Sun size={16} className="text-amber-400" />,
    capacityFactor: 0.20,
    carbonIntensity: 46,
    eroi: 10,
    referenceCapacity: 0.20,
    referenceCarbonIntensity: 46,
    color: 'text-amber-400',
  },
  {
    name: 'Onshore Wind',
    icon: <Wind size={16} className="text-cyan-400" />,
    capacityFactor: 0.35,
    carbonIntensity: 11,
    eroi: 18,
    referenceCapacity: 0.35,
    referenceCarbonIntensity: 11,
    color: 'text-cyan-400',
  },
  {
    name: 'Natural Gas',
    icon: <Zap size={16} className="text-orange-400" />,
    capacityFactor: 0.57,
    carbonIntensity: 490,
    eroi: 28,
    referenceCapacity: 0.57,
    referenceCarbonIntensity: 490,
    color: 'text-orange-400',
  },
  {
    name: 'Coal',
    icon: <Zap size={16} className="text-red-400" />,
    capacityFactor: 0.63,
    carbonIntensity: 820,
    eroi: 30,
    referenceCapacity: 0.63,
    referenceCarbonIntensity: 820,
    color: 'text-red-400',
  },
  {
    name: 'Nuclear',
    icon: <Zap size={16} className="text-emerald-400" />,
    capacityFactor: 0.90,
    carbonIntensity: 12,
    eroi: 75,
    referenceCapacity: 0.90,
    referenceCarbonIntensity: 12,
    color: 'text-emerald-400',
  },
];

export const EnergyMetrics: React.FC = () => {
  const maxCarbon = Math.max(...ENERGY_SOURCES.map(s => s.carbonIntensity));
  const maxEROI = Math.max(...ENERGY_SOURCES.map(s => s.eroi));

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Leaf size={18} className="text-emerald-400" />
        <h3 className="text-sm font-semibold text-slate-200">Energy Source Comparison</h3>
      </div>

      {/* Table header */}
      <div className="grid grid-cols-5 gap-2 text-xs text-slate-400 font-medium px-2">
        <span>Source</span>
        <span className="text-center">Capacity Factor</span>
        <span className="text-center">Carbon Intensity</span>
        <span className="text-center">EROI</span>
        <span className="text-center">Precision</span>
      </div>

      {/* Energy source rows */}
      {ENERGY_SOURCES.map(source => (
        <div
          key={source.name}
          className="grid grid-cols-5 gap-2 items-center bg-slate-900/50 rounded-lg p-2"
        >
          {/* Name */}
          <div className="flex items-center gap-2">
            {source.icon}
            <span className={`text-sm font-medium ${source.color}`}>{source.name}</span>
          </div>

          {/* Capacity Factor */}
          <div className="text-center">
            <div className="text-sm font-mono text-slate-300">{(source.capacityFactor * 100).toFixed(0)}%</div>
            <div className="w-full h-1.5 bg-slate-700 rounded-full mt-1 overflow-hidden">
              <div
                className="h-full rounded-full bg-cyan-500"
                style={{ width: `${source.capacityFactor * 100}%` }}
              />
            </div>
          </div>

          {/* Carbon Intensity */}
          <div className="text-center">
            <div className={`text-sm font-mono ${source.carbonIntensity > 200 ? 'text-red-400' : 'text-emerald-400'}`}>
              {source.carbonIntensity}
            </div>
            <div className="text-xs text-slate-500">gCO2/kWh</div>
            <div className="w-full h-1.5 bg-slate-700 rounded-full mt-1 overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${(source.carbonIntensity / maxCarbon) * 100}%`,
                  backgroundColor: source.carbonIntensity > 200 ? '#ef4444' : '#22c55e',
                }}
              />
            </div>
          </div>

          {/* EROI */}
          <div className="text-center">
            <div className="text-sm font-mono text-amber-400">{source.eroi}:1</div>
            <div className="w-full h-1.5 bg-slate-700 rounded-full mt-1 overflow-hidden">
              <div
                className="h-full rounded-full bg-amber-500"
                style={{ width: `${(source.eroi / maxEROI) * 100}%` }}
              />
            </div>
          </div>

          {/* Precision */}
          <div className="flex justify-center">
            <PrecisionBadge
              computed={source.capacityFactor}
              reference={source.referenceCapacity}
              compact
            />
          </div>
        </div>
      ))}

      <div className="text-xs text-slate-500 border-t border-slate-700 pt-2">
        EROI = Energy Return on Investment | Capacity factor = actual output / maximum output
      </div>
    </div>
  );
};
