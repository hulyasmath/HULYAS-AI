import React, { useState, useMemo, useCallback } from 'react';
import { Wind, RotateCcw } from 'lucide-react';
import { AppPageLayout } from '../shared/AppPageLayout';
import { useZeqSync } from '../SimulationVisualizer/useZeqSync';
import { FlowFieldCanvas } from './FlowFieldCanvas';
import { PressureDistribution } from './PressureDistribution';
import { AeroMetrics } from './AeroMetrics';

/** NACA 4-digit airfoil generator */
function nacaAirfoil(
  m: number,
  p: number,
  t: number,
  nPoints: number = 80,
): { upper: { x: number; y: number }[]; lower: { x: number; y: number }[] } {
  const upper: { x: number; y: number }[] = [];
  const lower: { x: number; y: number }[] = [];

  for (let i = 0; i <= nPoints; i++) {
    const x = (1 - Math.cos((i * Math.PI) / nPoints)) / 2; // cosine spacing

    // Thickness distribution
    const yt =
      5 *
      t *
      (0.2969 * Math.sqrt(x) -
        0.126 * x -
        0.3516 * x * x +
        0.2843 * x * x * x -
        0.1015 * x * x * x * x);

    // Camber line
    let yc = 0;
    let dyc = 0;
    if (p > 0) {
      if (x <= p) {
        yc = (m / (p * p)) * (2 * p * x - x * x);
        dyc = (2 * m / (p * p)) * (p - x);
      } else {
        yc = (m / ((1 - p) * (1 - p))) * (1 - 2 * p + 2 * p * x - x * x);
        dyc = (2 * m / ((1 - p) * (1 - p))) * (p - x);
      }
    }

    const theta = Math.atan(dyc);
    upper.push({
      x: x - yt * Math.sin(theta),
      y: yc + yt * Math.cos(theta),
    });
    lower.push({
      x: x + yt * Math.sin(theta),
      y: yc - yt * Math.cos(theta),
    });
  }
  return { upper, lower };
}

const AeroWindTunnel: React.FC = () => {
  const { syncValue, elapsedTime, pulseCount } = useZeqSync();

  // NACA parameters
  const [nacaM, setNacaM] = useState(2); // max camber %
  const [nacaP, setNacaP] = useState(4); // max camber position (tenths of chord)
  const [nacaT, setNacaT] = useState(12); // thickness %
  const [aoa, setAoa] = useState(5); // angle of attack (degrees)
  const [velocity, setVelocity] = useState(50); // m/s

  const handleReset = useCallback(() => {
    setNacaM(2);
    setNacaP(4);
    setNacaT(12);
    setAoa(5);
    setVelocity(50);
  }, []);

  // Parsed NACA parameters (as fractions)
  const m = nacaM / 100;
  const p = nacaP / 10;
  const t = nacaT / 100;

  const airfoilProfile = useMemo(() => nacaAirfoil(m, p, t), [m, p, t]);

  const aoaRad = (aoa * Math.PI) / 180;

  // Thin airfoil theory: Cl = 2*pi*alpha
  const cl = useMemo(() => {
    const val = 2 * Math.PI * aoaRad;
    return isFinite(val) ? val : 0;
  }, [aoaRad]);

  // Reynolds number (standard air: nu = 1.5e-5 m^2/s, chord = 1m)
  const reynolds = useMemo(() => {
    const nu = 1.5e-5;
    const val = (velocity * 1.0) / nu;
    return isFinite(val) ? val : 0;
  }, [velocity]);

  // Cd from Blasius (flat plate laminar): Cd = 1.328 / sqrt(Re)
  const cd = useMemo(() => {
    const re = reynolds > 0 ? reynolds : 1;
    const val = 1.328 / Math.sqrt(re);
    return isFinite(val) ? val : 0;
  }, [reynolds]);

  const nacaString = `${nacaM}${nacaP}${nacaT.toString().padStart(2, '0')}`;

  const sidebar = (
    <div className="space-y-4">
      {/* NACA inputs */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 space-y-3">
        <h3 className="text-sm font-medium text-slate-200 flex items-center gap-2">
          <Wind size={14} className="text-cyan-400" />
          NACA {nacaString}
        </h3>
        <div>
          <label className="text-xs text-slate-400">Max Camber (M): {nacaM}%</label>
          <input
            type="range"
            min={0}
            max={9}
            step={1}
            value={nacaM}
            onChange={(e) => setNacaM(Number(e.target.value))}
            className="w-full accent-cyan-400"
          />
        </div>
        <div>
          <label className="text-xs text-slate-400">Camber Position (P): {nacaP}/10 chord</label>
          <input
            type="range"
            min={0}
            max={9}
            step={1}
            value={nacaP}
            onChange={(e) => setNacaP(Number(e.target.value))}
            className="w-full accent-cyan-400"
          />
        </div>
        <div>
          <label className="text-xs text-slate-400">Thickness (T): {nacaT}%</label>
          <input
            type="range"
            min={1}
            max={30}
            step={1}
            value={nacaT}
            onChange={(e) => setNacaT(Number(e.target.value))}
            className="w-full accent-cyan-400"
          />
        </div>
      </div>

      {/* Flow conditions */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 space-y-3">
        <h3 className="text-sm font-medium text-slate-200">Flow Conditions</h3>
        <div>
          <label className="text-xs text-slate-400">Angle of Attack: {aoa}&deg;</label>
          <input
            type="range"
            min={-10}
            max={20}
            step={0.5}
            value={aoa}
            onChange={(e) => setAoa(Number(e.target.value))}
            className="w-full accent-orange-400"
          />
        </div>
        <div>
          <label className="text-xs text-slate-400">Velocity: {velocity} m/s</label>
          <input
            type="range"
            min={10}
            max={100}
            step={5}
            value={velocity}
            onChange={(e) => setVelocity(Number(e.target.value))}
            className="w-full accent-orange-400"
          />
        </div>
      </div>

      {/* Quick readouts */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-slate-400">Cl</span>
          <span className="font-mono text-cyan-400">{cl.toFixed(4)}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-slate-400">Cd</span>
          <span className="font-mono text-orange-400">{cd.toFixed(6)}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-slate-400">L/D</span>
          <span className="font-mono text-emerald-400">{cd > 0 ? (cl / cd).toFixed(1) : '--'}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-slate-400">Re</span>
          <span className="font-mono text-slate-300">{reynolds.toExponential(2)}</span>
        </div>
      </div>

      {/* Reset */}
      <button
        onClick={handleReset}
        className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 rounded-lg text-sm text-slate-300 transition-colors"
      >
        <RotateCcw size={14} />
        Reset Defaults
      </button>

      {/* Sync */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-2 text-xs text-slate-500">
        <span className="font-mono">Pulse #{pulseCount} | sync={syncValue.toFixed(4)}</span>
      </div>
    </div>
  );

  return (
    <AppPageLayout
      title="Aerodynamics Wind Tunnel"
      description="NACA airfoil analysis with panel method flow and pressure distribution"
      domain="Aerospace Engineering"
      sidebar={sidebar}
    >
      <FlowFieldCanvas
        airfoil={airfoilProfile}
        aoa={aoaRad}
        velocity={velocity}
        elapsedTime={elapsedTime}
        syncValue={syncValue}
      />

      <PressureDistribution
        airfoil={airfoilProfile}
        aoa={aoaRad}
        velocity={velocity}
        reynolds={reynolds}
      />

      <AeroMetrics
        cl={cl}
        cd={cd}
        aoa={aoa}
        aoaRad={aoaRad}
        velocity={velocity}
        reynolds={reynolds}
        nacaString={nacaString}
        m={m}
        p={p}
        t={t}
        syncValue={syncValue}
      />
    </AppPageLayout>
  );
};

export default AeroWindTunnel;
