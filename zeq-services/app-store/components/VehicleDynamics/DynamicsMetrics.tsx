import React, { useMemo } from 'react';
import { PrecisionBadge } from '../shared/PrecisionBadge';
import { EntropyVerifier } from '../shared/EntropyVerifier';
import { KolmogorovChecker } from '../shared/KolmogorovChecker';

interface DynamicsMetricsProps {
  mass: number;
  speedMs: number;
  turnRadius: number;
  lateralAccel: number;
  slipAngle: number;
  springRate: number;
  dampingCoeff: number;
  unsprungMass: number;
  deceleration: number;
  cgHeight: number;
  wheelbase: number;
  activeTab: string;
  syncValue: number;
}

/** Pacejka Magic Formula (normalized) */
function pacejka(alpha: number): number {
  const B = 10;
  const C = 1.9;
  const D = 1.0;
  const E = 0.97;
  const ba = B * alpha;
  const val = D * Math.sin(C * Math.atan(ba - E * (ba - Math.atan(ba))));
  return isFinite(val) ? val : 0;
}

export const DynamicsMetrics: React.FC<DynamicsMetricsProps> = ({
  mass,
  speedMs,
  turnRadius,
  lateralAccel,
  slipAngle,
  springRate,
  dampingCoeff,
  unsprungMass,
  deceleration,
  cgHeight,
  wheelbase,
  activeTab,
  syncValue,
}) => {
  const tireForce = useMemo(() => pacejka(slipAngle), [slipAngle]);

  const lateralForce = useMemo(() => mass * lateralAccel, [mass, lateralAccel]);

  const loadTransfer = useMemo(() => {
    const wb = wheelbase > 0 ? wheelbase : 1;
    const val = (mass * deceleration * cgHeight) / wb;
    return isFinite(val) ? val : 0;
  }, [mass, deceleration, cgHeight, wheelbase]);

  // Reference: 1500kg at 100km/h, R=100m => a = v^2/R = (27.78)^2/100 = 7.716 m/s^2
  const referenceLatAccel = useMemo(() => {
    const r = turnRadius > 0 ? turnRadius : 1;
    return (speedMs * speedMs) / r;
  }, [speedMs, turnRadius]);

  // Natural frequency of suspension
  const sprungMass = mass * 0.75;
  const naturalFreq = useMemo(() => {
    const val = Math.sqrt(springRate / sprungMass) / (2 * Math.PI);
    return isFinite(val) ? val : 0;
  }, [springRate, sprungMass]);

  // Damping ratio
  const dampingRatio = useMemo(() => {
    const cc = 2 * Math.sqrt(springRate * sprungMass);
    const val = dampingCoeff / (cc > 0 ? cc : 1);
    return isFinite(val) ? val : 0;
  }, [springRate, dampingCoeff, sprungMass]);

  // Entropy data
  const entropyData = useMemo(
    () => [
      lateralAccel,
      slipAngle,
      tireForce,
      loadTransfer,
      naturalFreq,
      dampingRatio,
      syncValue,
      speedMs,
    ],
    [lateralAccel, slipAngle, tireForce, loadTransfer, naturalFreq, dampingRatio, syncValue, speedMs],
  );

  const stateString = useMemo(
    () =>
      JSON.stringify({
        mass,
        speedMs,
        turnRadius,
        lateralAccel,
        slipAngle,
        tireForce,
        springRate,
        dampingCoeff,
        unsprungMass,
        activeTab,
      }),
    [mass, speedMs, turnRadius, lateralAccel, slipAngle, tireForce, springRate, dampingCoeff, unsprungMass, activeTab],
  );

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 space-y-4">
      <h3 className="text-sm font-medium text-slate-200">Dynamics Results</h3>

      {/* Key metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-slate-900/50 rounded p-2">
          <span className="text-xs text-slate-400">Lateral Accel</span>
          <p className="font-mono text-cyan-400 text-sm">{lateralAccel.toFixed(3)} m/s&sup2;</p>
        </div>
        <div className="bg-slate-900/50 rounded p-2">
          <span className="text-xs text-slate-400">Slip Angle</span>
          <p className="font-mono text-cyan-400 text-sm">{((slipAngle * 180) / Math.PI).toFixed(3)}&deg;</p>
        </div>
        <div className="bg-slate-900/50 rounded p-2">
          <span className="text-xs text-slate-400">Pacejka Force</span>
          <p className="font-mono text-orange-400 text-sm">{tireForce.toFixed(4)}</p>
        </div>
        <div className="bg-slate-900/50 rounded p-2">
          <span className="text-xs text-slate-400">Lateral Force</span>
          <p className="font-mono text-orange-400 text-sm">{lateralForce.toFixed(0)} N</p>
        </div>
      </div>

      {activeTab === 'suspension' && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="bg-slate-900/50 rounded p-2">
            <span className="text-xs text-slate-400">Natural Freq</span>
            <p className="font-mono text-cyan-400 text-sm">{naturalFreq.toFixed(2)} Hz</p>
          </div>
          <div className="bg-slate-900/50 rounded p-2">
            <span className="text-xs text-slate-400">Damping Ratio</span>
            <p className="font-mono text-cyan-400 text-sm">{dampingRatio.toFixed(3)}</p>
          </div>
          <div className="bg-slate-900/50 rounded p-2">
            <span className="text-xs text-slate-400">
              {dampingRatio < 1 ? 'Underdamped' : dampingRatio === 1 ? 'Critically Damped' : 'Overdamped'}
            </span>
            <p className={`font-mono text-sm ${dampingRatio < 0.3 ? 'text-red-400' : dampingRatio < 0.7 ? 'text-amber-400' : 'text-emerald-400'}`}>
              &zeta; = {dampingRatio.toFixed(3)}
            </p>
          </div>
        </div>
      )}

      {activeTab === 'braking' && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="bg-slate-900/50 rounded p-2">
            <span className="text-xs text-slate-400">Load Transfer</span>
            <p className="font-mono text-orange-400 text-sm">{loadTransfer.toFixed(0)} N</p>
          </div>
          <div className="bg-slate-900/50 rounded p-2">
            <span className="text-xs text-slate-400">Front Axle Load</span>
            <p className="font-mono text-cyan-400 text-sm">{((mass * 9.81) / 2 + loadTransfer / 2).toFixed(0)} N</p>
          </div>
          <div className="bg-slate-900/50 rounded p-2">
            <span className="text-xs text-slate-400">Rear Axle Load</span>
            <p className="font-mono text-cyan-400 text-sm">{((mass * 9.81) / 2 - loadTransfer / 2).toFixed(0)} N</p>
          </div>
        </div>
      )}

      {/* Verification badges */}
      <div className="space-y-2">
        <PrecisionBadge
          computed={lateralAccel}
          reference={referenceLatAccel}
          label="Lateral Acceleration (v&sup2;/R)"
        />
        <EntropyVerifier data={entropyData} label="Dynamics State Entropy" />
        <KolmogorovChecker data={stateString} label="State Complexity" />
      </div>
    </div>
  );
};
