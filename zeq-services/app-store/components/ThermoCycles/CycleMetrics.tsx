import React, { useMemo } from 'react';
import { Zap, Thermometer, ArrowDownUp } from 'lucide-react';
import { PrecisionBadge } from '../shared/PrecisionBadge';
import { EntropyVerifier } from '../shared/EntropyVerifier';
import { KolmogorovChecker } from '../shared/KolmogorovChecker';
import type { CycleState, CycleType, FluidType, FLUIDS } from './index';

interface CycleMetricsProps {
  cycle: CycleState;
  cycleType: CycleType;
  Th: number;
  Tc: number;
  compressionRatio: number;
  pressureRatio: number;
  fluid: FluidType;
}

function safeNum(v: number): number {
  return isFinite(v) && !isNaN(v) ? v : 0;
}

const FLUID_DATA: Record<FluidType, { gamma: number; cp: number }> = {
  air: { gamma: 1.4, cp: 1005 },
  helium: { gamma: 1.67, cp: 5193 },
};

export const CycleMetrics: React.FC<CycleMetricsProps> = ({
  cycle, cycleType, Th, Tc, compressionRatio, pressureRatio, fluid,
}) => {
  const { gamma } = FLUID_DATA[fluid];

  // Reference efficiency calculations
  const refEfficiency = useMemo(() => {
    switch (cycleType) {
      case 'carnot':
        return safeNum(1 - Tc / Th);
      case 'otto':
        return safeNum(1 - 1 / Math.pow(compressionRatio, gamma - 1));
      case 'diesel': {
        const T2 = Tc * Math.pow(compressionRatio, gamma - 1);
        const rc = T2 > 0 ? Th / T2 : 1;
        return safeNum(1 - (1 / Math.pow(compressionRatio, gamma - 1)) * (Math.pow(rc, gamma) - 1) / (gamma * (rc - 1)));
      }
      case 'brayton':
        return safeNum(1 - 1 / Math.pow(pressureRatio, (gamma - 1) / gamma));
      case 'rankine': {
        const { cp } = FLUID_DATA[fluid];
        const T2 = Tc * Math.pow(pressureRatio, (gamma - 1) / gamma);
        const h3 = cp * Th;
        const h4 = cp * (Th / Math.pow(pressureRatio, (gamma - 1) / gamma));
        const h1 = cp * Tc;
        return safeNum((h3 - h4) / (h3 - h1));
      }
    }
  }, [cycleType, Th, Tc, compressionRatio, pressureRatio, gamma, fluid]);

  // Carnot limit
  const carnotEfficiency = useMemo(() => safeNum(1 - Tc / Th), [Th, Tc]);

  // Data for entropy verifier
  const thermoData = useMemo(() => {
    return cycle.points.flatMap((p) => [p.P, p.V, p.T, p.S].filter(isFinite));
  }, [cycle]);

  // State for Kolmogorov
  const stateString = useMemo(() => {
    return JSON.stringify({
      cycle: cycleType,
      eff: cycle.efficiency.toFixed(6),
      W: cycle.workOutput.toFixed(2),
      Qin: cycle.heatInput.toFixed(2),
      Qout: cycle.heatRejection.toFixed(2),
      Th, Tc, r: compressionRatio, rp: pressureRatio,
      fluid,
      points: cycle.points.map((p) => ({
        P: p.P.toFixed(2),
        V: p.V.toFixed(4),
        T: p.T.toFixed(1),
        S: p.S.toFixed(4),
      })),
    });
  }, [cycle, cycleType, Th, Tc, compressionRatio, pressureRatio, fluid]);

  const formatEnergy = (v: number) => {
    const abs = Math.abs(v);
    if (abs >= 1e6) return (v / 1e6).toFixed(2) + ' MJ/kg';
    if (abs >= 1e3) return (v / 1e3).toFixed(2) + ' kJ/kg';
    return v.toFixed(2) + ' J/kg';
  };

  return (
    <div className="space-y-4">
      {/* Primary efficiency */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
          <Zap size={16} className="text-orange-400" /> Cycle Performance
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-900/50 rounded-lg p-3 text-center">
            <span className="text-xs text-slate-400">Thermal Efficiency</span>
            <p className="text-2xl font-mono font-bold text-orange-400">
              {(cycle.efficiency * 100).toFixed(2)}%
            </p>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-3 text-center">
            <span className="text-xs text-slate-400">Carnot Limit</span>
            <p className="text-2xl font-mono font-bold text-cyan-400">
              {(carnotEfficiency * 100).toFixed(2)}%
            </p>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-3 text-center">
            <span className="text-xs text-slate-400">Relative Efficiency</span>
            <p className="text-2xl font-mono font-bold text-slate-200">
              {carnotEfficiency > 0 ? ((cycle.efficiency / carnotEfficiency) * 100).toFixed(1) : '0'}%
            </p>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-3 text-center">
            <span className="text-xs text-slate-400">Second Law Eff.</span>
            <p className="text-2xl font-mono font-bold text-slate-200">
              {carnotEfficiency > 0 ? ((cycle.efficiency / carnotEfficiency) * 100).toFixed(1) : '0'}%
            </p>
          </div>
        </div>
      </div>

      {/* Energy balance */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
          <Thermometer size={16} className="text-cyan-400" /> Energy Balance
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-slate-900/50 rounded-lg p-3">
            <div className="flex items-center gap-1 text-xs text-slate-400 mb-1">
              <ArrowDownUp size={12} className="text-red-400" /> Heat Input (Q_H)
            </div>
            <p className="text-lg font-mono font-bold text-red-400">{formatEnergy(cycle.heatInput)}</p>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-3">
            <div className="flex items-center gap-1 text-xs text-slate-400 mb-1">
              <ArrowDownUp size={12} className="text-blue-400" /> Heat Rejected (Q_C)
            </div>
            <p className="text-lg font-mono font-bold text-blue-400">{formatEnergy(cycle.heatRejection)}</p>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-3">
            <div className="flex items-center gap-1 text-xs text-slate-400 mb-1">
              <Zap size={12} className="text-orange-400" /> Net Work (W)
            </div>
            <p className="text-lg font-mono font-bold text-orange-400">{formatEnergy(cycle.workOutput)}</p>
          </div>
        </div>
      </div>

      {/* State points table */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-200 mb-3">State Points</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-slate-400 border-b border-slate-700">
                <th className="py-2 px-3 text-left">State</th>
                <th className="py-2 px-3 text-right">P (Pa)</th>
                <th className="py-2 px-3 text-right">V (m3/kg)</th>
                <th className="py-2 px-3 text-right">T (K)</th>
                <th className="py-2 px-3 text-right">S (J/kg-K)</th>
              </tr>
            </thead>
            <tbody>
              {cycle.points.map((pt, i) => (
                <tr key={i} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                  <td className="py-2 px-3 font-mono font-bold text-white">{i + 1}</td>
                  <td className="py-2 px-3 text-right font-mono text-cyan-400">{pt.P.toExponential(3)}</td>
                  <td className="py-2 px-3 text-right font-mono text-cyan-400">{pt.V.toFixed(4)}</td>
                  <td className="py-2 px-3 text-right font-mono text-orange-400">{pt.T.toFixed(1)}</td>
                  <td className="py-2 px-3 text-right font-mono text-slate-300">{pt.S.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Process descriptions */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-200 mb-3">Processes</h3>
        <div className="space-y-2">
          {cycle.processes.map((proc, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: proc.color }} />
              <span className="text-slate-300">{proc.label}</span>
              <span className="text-slate-500 ml-auto capitalize">{proc.type}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Verification */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 space-y-3">
        <h3 className="text-sm font-semibold text-slate-200 mb-2">Verification</h3>
        <PrecisionBadge
          computed={cycle.efficiency}
          reference={refEfficiency}
          label={`${cycleType.charAt(0).toUpperCase() + cycleType.slice(1)} Efficiency`}
        />
        {cycleType !== 'carnot' && (
          <PrecisionBadge
            computed={cycle.efficiency}
            reference={carnotEfficiency}
            label="vs Carnot Limit (must be lower)"
          />
        )}
        <EntropyVerifier data={thermoData} label="Thermodynamic State Distribution" />
        <KolmogorovChecker data={stateString} label="Cycle State Complexity" />
      </div>
    </div>
  );
};
