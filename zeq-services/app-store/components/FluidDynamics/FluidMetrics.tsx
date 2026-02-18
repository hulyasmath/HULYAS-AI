import React, { useMemo } from 'react';
import { Activity, Gauge, Wind, RotateCw } from 'lucide-react';
import { PrecisionBadge } from '../shared/PrecisionBadge';
import { EntropyVerifier } from '../shared/EntropyVerifier';
import { KolmogorovChecker } from '../shared/KolmogorovChecker';
import type { LBMState } from './index';

interface FluidMetricsProps {
  reynolds: number;
  dragCoeff: number;
  maxVelocity: number;
  vorticityStats: { min: number; max: number; mean: number };
  tau: number;
  inletVel: number;
  obstDiameter: number;
  nu: number;
  stepCount: number;
  lbm: LBMState | null;
  syncValue: number;
}

export const FluidMetrics: React.FC<FluidMetricsProps> = ({
  reynolds, dragCoeff, maxVelocity, vorticityStats,
  tau, inletVel, obstDiameter, nu, stepCount, lbm, syncValue,
}) => {
  // Reference: Re = U*D/nu
  const refReynolds = useMemo(() => {
    const re = inletVel * obstDiameter / nu;
    return isFinite(re) ? re : 0;
  }, [inletVel, obstDiameter, nu]);

  // Velocity field data for entropy
  const velocityData = useMemo(() => {
    if (!lbm) return [];
    const data: number[] = [];
    const step = Math.max(1, Math.floor(lbm.ux.length / 500));
    for (let i = 0; i < lbm.ux.length; i += step) {
      const v = Math.sqrt(lbm.ux[i] * lbm.ux[i] + lbm.uy[i] * lbm.uy[i]);
      if (isFinite(v)) data.push(v);
    }
    return data;
  }, [lbm]);

  // Serialized state for Kolmogorov
  const stateString = useMemo(() => {
    return JSON.stringify({
      re: reynolds.toFixed(4),
      cd: dragCoeff.toFixed(4),
      maxV: maxVelocity.toFixed(4),
      tau: tau.toFixed(4),
      steps: stepCount,
      vortMin: vorticityStats.min.toFixed(4),
      vortMax: vorticityStats.max.toFixed(4),
    });
  }, [reynolds, dragCoeff, maxVelocity, tau, stepCount, vorticityStats]);

  return (
    <div className="space-y-4">
      {/* Primary metrics */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
          <Gauge size={16} className="text-cyan-400" /> Flow Metrics
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-900/50 rounded-lg p-3">
            <div className="flex items-center gap-1 text-xs text-slate-400 mb-1">
              <Activity size={12} /> Reynolds Number
            </div>
            <p className="text-lg font-mono font-bold text-orange-400">{reynolds.toFixed(1)}</p>
            <p className="text-xs text-slate-500">Re = U*D/v</p>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-3">
            <div className="flex items-center gap-1 text-xs text-slate-400 mb-1">
              <Wind size={12} /> Drag Coefficient
            </div>
            <p className="text-lg font-mono font-bold text-cyan-400">{dragCoeff.toFixed(4)}</p>
            <p className="text-xs text-slate-500">Cd = 2Fd/(rho*U^2*D)</p>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-3">
            <div className="flex items-center gap-1 text-xs text-slate-400 mb-1">
              <Gauge size={12} /> Max Velocity
            </div>
            <p className="text-lg font-mono font-bold text-cyan-400">{maxVelocity.toFixed(4)}</p>
            <p className="text-xs text-slate-500">lattice units</p>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-3">
            <div className="flex items-center gap-1 text-xs text-slate-400 mb-1">
              <RotateCw size={12} /> Simulation Steps
            </div>
            <p className="text-lg font-mono font-bold text-slate-200">{stepCount}</p>
            <p className="text-xs text-slate-500">LBM iterations</p>
          </div>
        </div>
      </div>

      {/* Vorticity statistics */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
          <RotateCw size={16} className="text-orange-400" /> Vorticity Statistics
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-slate-900/50 rounded-lg p-3 text-center">
            <span className="text-xs text-slate-400">Min (CCW)</span>
            <p className="text-lg font-mono font-bold text-blue-400">{vorticityStats.min.toFixed(4)}</p>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-3 text-center">
            <span className="text-xs text-slate-400">Mean</span>
            <p className="text-lg font-mono font-bold text-slate-300">{vorticityStats.mean.toFixed(6)}</p>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-3 text-center">
            <span className="text-xs text-slate-400">Max (CW)</span>
            <p className="text-lg font-mono font-bold text-red-400">{vorticityStats.max.toFixed(4)}</p>
          </div>
        </div>
      </div>

      {/* Simulation parameters */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-200 mb-3">Simulation Parameters</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-slate-400">Relaxation (tau)</span>
            <p className="font-mono text-cyan-400">{tau.toFixed(3)}</p>
          </div>
          <div>
            <span className="text-slate-400">Kinematic Viscosity</span>
            <p className="font-mono text-cyan-400">{nu.toFixed(5)}</p>
          </div>
          <div>
            <span className="text-slate-400">Inlet Velocity</span>
            <p className="font-mono text-cyan-400">{inletVel.toFixed(4)}</p>
          </div>
          <div>
            <span className="text-slate-400">Obstacle Diameter</span>
            <p className="font-mono text-cyan-400">{obstDiameter} cells</p>
          </div>
        </div>
      </div>

      {/* Verification badges */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 space-y-3">
        <h3 className="text-sm font-semibold text-slate-200 mb-2">Verification</h3>
        <PrecisionBadge computed={reynolds} reference={refReynolds} label="Reynolds Number (Re = U*D/v)" />
        <EntropyVerifier data={velocityData} label="Velocity Field Distribution" />
        <KolmogorovChecker data={stateString} label="Simulation State Complexity" />
      </div>
    </div>
  );
};
