import React, { useState, useMemo } from 'react';
import { Waves, Wind } from 'lucide-react';
import { AppPageLayout } from '../shared/AppPageLayout';
import { useZeqSync } from '../SimulationVisualizer/useZeqSync';
import { WaveCrossSection } from './WaveCrossSection';
import { TidalPrediction } from './TidalPrediction';
import { OceanMetrics } from './OceanMetrics';

type TabId = 'waves' | 'tides' | 'currents';

// Tidal harmonic constituents
export interface TidalConstituent {
  name: string;
  period: number;   // hours
  amplitude: number; // meters
  phase: number;     // radians
}

export const DEFAULT_CONSTITUENTS: TidalConstituent[] = [
  { name: 'M2', period: 12.42, amplitude: 1.0,  phase: 0 },
  { name: 'S2', period: 12.00, amplitude: 0.46, phase: Math.PI / 6 },
  { name: 'K1', period: 23.93, amplitude: 0.36, phase: Math.PI / 4 },
  { name: 'O1', period: 25.82, amplitude: 0.26, phase: Math.PI / 3 },
];

// Solve dispersion relation: omega^2 = g*k*tanh(k*d)
// Newton's method for k
export function solveDispersion(omega: number, depth: number, maxIter: number = 50): number {
  const g = 9.81;
  // Initial guess: deep water k = omega^2/g
  let k = omega * omega / g;
  if (k <= 0) return 1e-6;

  for (let i = 0; i < maxIter; i++) {
    const kd = k * depth;
    const tanhKd = Math.tanh(Math.min(kd, 20));
    const f = omega * omega - g * k * tanhKd;
    const sechKd = 1 / Math.cosh(Math.min(kd, 20));
    const df = -g * tanhKd - g * k * depth * sechKd * sechKd;

    if (Math.abs(df) < 1e-15) break;
    const dk = -f / df;
    k = k + dk;
    if (k <= 0) k = 1e-6;
    if (Math.abs(dk) < 1e-10) break;
  }

  return isFinite(k) && k > 0 ? k : omega * omega / g;
}

// Airy wave theory computations
export function computeWaveProperties(waveHeight: number, wavePeriod: number, waterDepth: number) {
  const g = 9.81;
  const omega = (2 * Math.PI) / wavePeriod;
  const k = solveDispersion(omega, waterDepth);
  const wavelength = (2 * Math.PI) / k;
  const phaseSpeed = omega / k;
  const kd = k * waterDepth;
  const groupSpeed = phaseSpeed * 0.5 * (1 + (2 * kd) / Math.sinh(Math.min(2 * kd, 40)));
  const energyFlux = 0.5 * 1025 * g * (waveHeight / 2) * (waveHeight / 2) * groupSpeed; // W/m
  const stokesDrift = (Math.PI * waveHeight) * (Math.PI * waveHeight) / (8 * wavePeriod * wavelength);

  return {
    k: isFinite(k) ? k : 0,
    wavelength: isFinite(wavelength) ? wavelength : 0,
    phaseSpeed: isFinite(phaseSpeed) ? phaseSpeed : 0,
    groupSpeed: isFinite(groupSpeed) ? groupSpeed : 0,
    energyFlux: isFinite(energyFlux) ? energyFlux : 0,
    stokesDrift: isFinite(stokesDrift) ? stokesDrift : 0,
    omega,
  };
}

// Surface elevation
export function surfaceElevation(x: number, t: number, H: number, k: number, omega: number): number {
  const eta = (H / 2) * Math.cos(k * x - omega * t);
  return isFinite(eta) ? eta : 0;
}

// Orbital radius at depth z (z negative below surface)
export function orbitalRadius(H: number, k: number, z: number, d: number): number {
  const kd = k * d;
  const sinhKd = Math.sinh(Math.min(kd, 20));
  if (Math.abs(sinhKd) < 1e-10) return 0;
  const r = (H / 2) * Math.cosh(Math.min(k * (z + d), 20)) / sinhKd;
  return isFinite(r) ? r : 0;
}

// Tidal prediction
export function tidalHeight(tHours: number, constituents: TidalConstituent[]): number {
  let h = 0;
  for (const c of constituents) {
    h += c.amplitude * Math.cos((2 * Math.PI * tHours) / c.period - c.phase);
  }
  return isFinite(h) ? h : 0;
}

// Ekman spiral
export function ekmanProfile(
  z: number, windSpeed: number, latitude: number
): { u: number; v: number } {
  const omega = 7.29e-5;
  const f = 2 * omega * Math.sin((latitude * Math.PI) / 180);
  const absF = Math.abs(f) || 1e-10;
  const Az = 0.1; // eddy viscosity m^2/s
  const De = Math.sqrt((2 * Az) / absF);

  const V0 = windSpeed * 0.03; // surface current ~3% of wind
  const zDe = z / De;

  const u = V0 * Math.exp(zDe) * Math.cos(Math.PI / 4 + zDe);
  const v = V0 * Math.exp(zDe) * Math.sin(Math.PI / 4 + zDe);

  return {
    u: isFinite(u) ? u : 0,
    v: isFinite(v) ? v : 0,
  };
}

export function ekmanDepth(latitude: number): number {
  const omega = 7.29e-5;
  const f = 2 * omega * Math.sin((latitude * Math.PI) / 180);
  const absF = Math.abs(f) || 1e-10;
  const Az = 0.1;
  const De = Math.sqrt((2 * Az) / absF);
  return isFinite(De) ? De : 100;
}

const OceanDynamics: React.FC = () => {
  const { syncValue, elapsedTime, pulseCount } = useZeqSync();

  const [activeTab, setActiveTab] = useState<TabId>('waves');
  const [waveHeight, setWaveHeight] = useState(2.0);
  const [wavePeriod, setWavePeriod] = useState(10);
  const [waterDepth, setWaterDepth] = useState(100);
  const [latitude, setLatitude] = useState(45);
  const [windSpeed, setWindSpeed] = useState(15);
  const [constituents, setConstituents] = useState<TidalConstituent[]>(DEFAULT_CONSTITUENTS);

  const waveProps = useMemo(
    () => computeWaveProperties(waveHeight, wavePeriod, waterDepth),
    [waveHeight, wavePeriod, waterDepth]
  );

  const ekDepth = useMemo(() => ekmanDepth(latitude), [latitude]);

  const updateConstituentAmplitude = (index: number, amplitude: number) => {
    setConstituents((prev) => prev.map((c, i) => (i === index ? { ...c, amplitude } : c)));
  };

  const tabs: { id: TabId; label: string }[] = [
    { id: 'waves', label: 'Waves' },
    { id: 'tides', label: 'Tides' },
    { id: 'currents', label: 'Currents' },
  ];

  const sidebar = (
    <div className="space-y-4">
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3">
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 text-xs py-1.5 px-2 rounded transition-colors ${
                activeTab === tab.id
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Wave Parameters */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 space-y-3">
        <h3 className="text-xs font-semibold text-slate-300 flex items-center gap-1">
          <Waves size={14} className="text-cyan-400" /> Wave Parameters
        </h3>

        <div>
          <label className="text-xs text-slate-400 flex justify-between">
            <span>Wave Height H (m)</span>
            <span className="font-mono text-cyan-400">{waveHeight.toFixed(1)}</span>
          </label>
          <input type="range" min={0.5} max={10} step={0.5} value={waveHeight}
            onChange={(e) => setWaveHeight(Number(e.target.value))}
            className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500" />
        </div>

        <div>
          <label className="text-xs text-slate-400 flex justify-between">
            <span>Wave Period T (s)</span>
            <span className="font-mono text-cyan-400">{wavePeriod}</span>
          </label>
          <input type="range" min={3} max={20} step={1} value={wavePeriod}
            onChange={(e) => setWavePeriod(Number(e.target.value))}
            className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500" />
        </div>

        <div>
          <label className="text-xs text-slate-400 flex justify-between">
            <span>Water Depth d (m)</span>
            <span className="font-mono text-cyan-400">{waterDepth}</span>
          </label>
          <input type="range" min={5} max={5000} step={5} value={waterDepth}
            onChange={(e) => setWaterDepth(Number(e.target.value))}
            className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500" />
        </div>
      </div>

      {/* Ekman / Wind */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 space-y-3">
        <h3 className="text-xs font-semibold text-slate-300 flex items-center gap-1">
          <Wind size={14} className="text-orange-400" /> Wind / Ekman
        </h3>

        <div>
          <label className="text-xs text-slate-400 flex justify-between">
            <span>Latitude</span>
            <span className="font-mono text-cyan-400">{latitude}&deg;</span>
          </label>
          <input type="range" min={1} max={90} step={1} value={latitude}
            onChange={(e) => setLatitude(Number(e.target.value))}
            className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500" />
        </div>

        <div>
          <label className="text-xs text-slate-400 flex justify-between">
            <span>Wind Speed (m/s)</span>
            <span className="font-mono text-cyan-400">{windSpeed}</span>
          </label>
          <input type="range" min={5} max={30} step={1} value={windSpeed}
            onChange={(e) => setWindSpeed(Number(e.target.value))}
            className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500" />
        </div>
      </div>

      {/* Tidal constituents */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 space-y-3">
        <h3 className="text-xs font-semibold text-slate-300">Tidal Constituents</h3>
        {constituents.map((c, i) => (
          <div key={c.name}>
            <label className="text-xs text-slate-400 flex justify-between">
              <span>{c.name} (T={c.period}h)</span>
              <span className="font-mono text-cyan-400">{c.amplitude.toFixed(2)}m</span>
            </label>
            <input type="range" min={0} max={2} step={0.05} value={c.amplitude}
              onChange={(e) => updateConstituentAmplitude(i, Number(e.target.value))}
              className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500" />
          </div>
        ))}
      </div>

      {/* Quick stats */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 space-y-2">
        <h3 className="text-xs font-semibold text-slate-300">Quick Stats</h3>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-slate-400">Wavelength</span>
            <p className="font-mono text-cyan-400">{waveProps.wavelength.toFixed(1)}m</p>
          </div>
          <div>
            <span className="text-slate-400">Phase Speed</span>
            <p className="font-mono text-orange-400">{waveProps.phaseSpeed.toFixed(2)} m/s</p>
          </div>
          <div>
            <span className="text-slate-400">Ekman Depth</span>
            <p className="font-mono text-cyan-400">{ekDepth.toFixed(1)}m</p>
          </div>
          <div>
            <span className="text-slate-400">Pulse</span>
            <p className="font-mono text-orange-400">{pulseCount}</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <AppPageLayout
      title="Ocean Dynamics Lab"
      description="Wave mechanics, tidal prediction, and ocean currents"
      domain="Earth & Geosciences"
      sidebar={sidebar}
    >
      {activeTab === 'waves' && (
        <WaveCrossSection
          waveHeight={waveHeight}
          wavePeriod={wavePeriod}
          waterDepth={waterDepth}
          waveProps={waveProps}
          syncValue={syncValue}
          elapsedTime={elapsedTime}
        />
      )}
      {activeTab === 'tides' && (
        <TidalPrediction
          constituents={constituents}
          latitude={latitude}
          windSpeed={windSpeed}
          syncValue={syncValue}
          elapsedTime={elapsedTime}
        />
      )}
      {activeTab === 'currents' && (
        <OceanMetrics
          waveProps={waveProps}
          waveHeight={waveHeight}
          wavePeriod={wavePeriod}
          waterDepth={waterDepth}
          latitude={latitude}
          windSpeed={windSpeed}
          ekDepth={ekDepth}
          constituents={constituents}
          syncValue={syncValue}
        />
      )}
    </AppPageLayout>
  );
};

export default OceanDynamics;
