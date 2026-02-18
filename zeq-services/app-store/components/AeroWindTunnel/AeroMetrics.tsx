import React, { useMemo } from 'react';
import { PrecisionBadge } from '../shared/PrecisionBadge';
import { EntropyVerifier } from '../shared/EntropyVerifier';
import { KolmogorovChecker } from '../shared/KolmogorovChecker';

interface AeroMetricsProps {
  cl: number;
  cd: number;
  aoa: number;
  aoaRad: number;
  velocity: number;
  reynolds: number;
  nacaString: string;
  m: number;
  p: number;
  t: number;
  syncValue: number;
}

export const AeroMetrics: React.FC<AeroMetricsProps> = ({
  cl,
  cd,
  aoa,
  aoaRad,
  velocity,
  reynolds,
  nacaString,
  m,
  p,
  t,
  syncValue,
}) => {
  const liftForce = useMemo(() => {
    // L = 0.5 * rho * V^2 * S * Cl (rho=1.225 kg/m^3, S=1 m^2)
    const val = 0.5 * 1.225 * velocity * velocity * 1.0 * cl;
    return isFinite(val) ? val : 0;
  }, [velocity, cl]);

  const dragForce = useMemo(() => {
    const val = 0.5 * 1.225 * velocity * velocity * 1.0 * cd;
    return isFinite(val) ? val : 0;
  }, [velocity, cd]);

  const liftToDrag = useMemo(() => {
    return cd > 0 ? cl / cd : 0;
  }, [cl, cd]);

  // Reference: NACA 0012 at 5 deg AoA: Cl = 2*pi*5*pi/180 = 0.5483
  const referenceCl = useMemo(() => {
    return 2 * Math.PI * aoaRad;
  }, [aoaRad]);

  // Boundary layer thickness at trailing edge
  const blThicknessTE = useMemo(() => {
    const nu = 1.5e-5;
    const Rex = (velocity * 1.0) / nu;
    const val = Rex > 0 ? (5 * 1.0) / Math.sqrt(Rex) : 0;
    return isFinite(val) ? val : 0;
  }, [velocity]);

  const entropyData = useMemo(
    () => [cl, cd, liftForce, dragForce, reynolds, blThicknessTE, syncValue, aoa],
    [cl, cd, liftForce, dragForce, reynolds, blThicknessTE, syncValue, aoa],
  );

  const stateString = useMemo(
    () =>
      JSON.stringify({
        nacaString,
        m,
        p,
        t,
        aoa,
        velocity,
        cl,
        cd,
        reynolds,
      }),
    [nacaString, m, p, t, aoa, velocity, cl, cd, reynolds],
  );

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 space-y-4">
      <h3 className="text-sm font-medium text-slate-200">Aerodynamic Results</h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-slate-900/50 rounded p-2">
          <span className="text-xs text-slate-400">Lift Coefficient (Cl)</span>
          <p className="font-mono text-cyan-400 text-sm">{cl.toFixed(4)}</p>
        </div>
        <div className="bg-slate-900/50 rounded p-2">
          <span className="text-xs text-slate-400">Drag Coefficient (Cd)</span>
          <p className="font-mono text-orange-400 text-sm">{cd.toFixed(6)}</p>
        </div>
        <div className="bg-slate-900/50 rounded p-2">
          <span className="text-xs text-slate-400">Lift Force</span>
          <p className="font-mono text-cyan-400 text-sm">{liftForce.toFixed(1)} N</p>
        </div>
        <div className="bg-slate-900/50 rounded p-2">
          <span className="text-xs text-slate-400">Drag Force</span>
          <p className="font-mono text-orange-400 text-sm">{dragForce.toFixed(2)} N</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-slate-900/50 rounded p-2">
          <span className="text-xs text-slate-400">L/D Ratio</span>
          <p className="font-mono text-emerald-400 text-sm">{liftToDrag.toFixed(1)}</p>
        </div>
        <div className="bg-slate-900/50 rounded p-2">
          <span className="text-xs text-slate-400">Reynolds Number</span>
          <p className="font-mono text-slate-300 text-sm">{reynolds.toExponential(2)}</p>
        </div>
        <div className="bg-slate-900/50 rounded p-2">
          <span className="text-xs text-slate-400">BL Thickness (TE)</span>
          <p className="font-mono text-violet-400 text-sm">{(blThicknessTE * 1000).toFixed(2)} mm</p>
        </div>
        <div className="bg-slate-900/50 rounded p-2">
          <span className="text-xs text-slate-400">NACA Profile</span>
          <p className="font-mono text-slate-200 text-sm">{nacaString}</p>
        </div>
      </div>

      {/* Verification badges */}
      <div className="space-y-2">
        <PrecisionBadge
          computed={cl}
          reference={referenceCl}
          label="Cl vs Thin Airfoil Theory (2&pi;&alpha;)"
        />
        <EntropyVerifier data={entropyData} label="Aero State Entropy" />
        <KolmogorovChecker data={stateString} label="Config Complexity" />
      </div>
    </div>
  );
};
