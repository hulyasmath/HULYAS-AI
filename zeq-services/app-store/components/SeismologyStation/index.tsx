import React, { useState, useMemo, useCallback } from 'react';
import { Activity, RotateCcw } from 'lucide-react';
import { AppPageLayout } from '../shared/AppPageLayout';
import { useZeqSync } from '../SimulationVisualizer/useZeqSync';
import { SeismogramCanvas } from './SeismogramCanvas';
import { EarthCrossSection } from './EarthCrossSection';
import { SeismoMetrics } from './SeismoMetrics';

type TabId = 'seismogram' | 'earth' | 'triangulation';

// Earth layer model
export interface EarthLayer {
  name: string;
  depthTop: number;  // km
  depthBot: number;  // km
  vp: number;        // km/s
  vs: number;        // km/s (0 = liquid)
  color: string;
}

export const EARTH_LAYERS: EarthLayer[] = [
  { name: 'Crust',       depthTop: 0,    depthBot: 35,   vp: 6.0,  vs: 3.5, color: '#8B7355' },
  { name: 'Upper Mantle', depthTop: 35,  depthBot: 410,  vp: 8.1,  vs: 4.5, color: '#CD853F' },
  { name: 'Lower Mantle', depthTop: 410, depthBot: 2890, vp: 13.0, vs: 7.0, color: '#FF8C00' },
  { name: 'Outer Core',   depthTop: 2890, depthBot: 5150, vp: 8.0, vs: 0,   color: '#FF4500' },
  { name: 'Inner Core',   depthTop: 5150, depthBot: 6371, vp: 11.0, vs: 3.6, color: '#FFD700' },
];

export interface Station {
  x: number;
  y: number;
  label: string;
}

// Ray tracing through layered Earth
function traceRay(epicentralDistKm: number, depthKm: number, waveType: 'P' | 'S'): number {
  // Simplified travel time through layered earth
  let totalTime = 0;
  let remainingDist = epicentralDistKm;

  for (const layer of EARTH_LAYERS) {
    const vel = waveType === 'P' ? layer.vp : layer.vs;
    if (vel === 0) continue; // S-waves can't traverse liquid

    const layerThickness = layer.depthBot - layer.depthTop;
    // Simplified: assume wave travels through relevant layers
    if (depthKm >= layer.depthTop) {
      const effectiveDepth = Math.min(depthKm, layer.depthBot) - layer.depthTop;
      if (effectiveDepth > 0) {
        // Vertical component time
        totalTime += effectiveDepth / vel;
      }
    }

    // Horizontal distance covered in this layer (proportional)
    if (remainingDist > 0) {
      const horizInLayer = Math.min(remainingDist, epicentralDistKm * layerThickness / 6371);
      const pathLength = Math.sqrt(horizInLayer * horizInLayer + layerThickness * layerThickness);
      if (vel > 0) {
        totalTime += pathLength / vel;
      }
      remainingDist -= horizInLayer;
    }
  }

  // Direct path approximation for shallow earthquakes
  if (depthKm <= 35) {
    const vel = waveType === 'P' ? 6.0 : 3.5;
    if (vel === 0) return Infinity;
    const directDist = Math.sqrt(epicentralDistKm * epicentralDistKm + depthKm * depthKm);
    const directTime = directDist / vel;
    return Math.min(totalTime, directTime);
  }

  return isFinite(totalTime) ? totalTime : 0;
}

// Compute P and S arrival times
export function computeArrivals(epicentralDistKm: number, depthKm: number): { tp: number; ts: number } {
  const tp = traceRay(epicentralDistKm, depthKm, 'P');
  const ts = traceRay(epicentralDistKm, depthKm, 'S');
  return {
    tp: isFinite(tp) && tp > 0 ? tp : epicentralDistKm / 6.0,
    ts: isFinite(ts) && ts > 0 ? ts : epicentralDistKm / 3.5,
  };
}

// Richter magnitude from amplitude and distance
export function richterMagnitude(amplitudeMm: number, distKm: number): number {
  const safeAmp = Math.max(amplitudeMm, 1e-6);
  const safeDist = Math.max(distKm, 1);
  // ML = log10(A) + 3*log10(8*Dt) - 2.92 (simplified Richter formula)
  const ml = Math.log10(safeAmp) + 1.11 * Math.log10(safeDist) + 0.00189 * safeDist - 2.09;
  return isFinite(ml) ? ml : 0;
}

// Moment magnitude from seismic moment
export function momentMagnitude(m0: number): number {
  if (m0 <= 0) return 0;
  const mw = (2 / 3) * Math.log10(m0) - 10.7;
  return isFinite(mw) ? mw : 0;
}

// Seismic moment from magnitude
export function seismicMoment(mw: number): number {
  return Math.pow(10, 1.5 * (mw + 10.7));
}

// Synthesize seismogram trace
export function synthesizeTrace(
  tp: number, ts: number, magnitude: number, duration: number, sampleRate: number
): number[] {
  const n = Math.floor(duration * sampleRate);
  const trace = new Array(n).fill(0);

  // Amplitude scaling from magnitude
  const ampP = Math.pow(10, (magnitude - 2) * 0.5) * 0.3;
  const ampS = ampP * 1.5;
  const alphaP = 0.5;
  const alphaS = 0.3;
  const fp = 1.0; // P-wave frequency
  const fs = 0.5; // S-wave frequency

  for (let i = 0; i < n; i++) {
    const t = i / sampleRate;

    // P-wave arrival
    if (t >= tp) {
      const dt = t - tp;
      trace[i] += ampP * Math.exp(-alphaP * dt) * Math.sin(2 * Math.PI * fp * dt);
    }

    // S-wave arrival
    if (t >= ts) {
      const dt = t - ts;
      trace[i] += ampS * Math.exp(-alphaS * dt) * Math.sin(2 * Math.PI * fs * dt);
    }

    // Add noise
    trace[i] += (Math.random() - 0.5) * 0.02 * ampP;

    if (!isFinite(trace[i])) trace[i] = 0;
  }

  return trace;
}

// Triangulate epicenter from 3 stations
export function triangulate(
  stations: Station[],
  distances: number[]
): { x: number; y: number } | null {
  if (stations.length < 3 || distances.length < 3) return null;

  // Least squares circle intersection
  const x1 = stations[0].x, y1 = stations[0].y, r1 = distances[0];
  const x2 = stations[1].x, y2 = stations[1].y, r2 = distances[1];
  const x3 = stations[2].x, y3 = stations[2].y, r3 = distances[2];

  const A = 2 * (x2 - x1);
  const B = 2 * (y2 - y1);
  const C = r1 * r1 - r2 * r2 - x1 * x1 + x2 * x2 - y1 * y1 + y2 * y2;
  const D = 2 * (x3 - x2);
  const E = 2 * (y3 - y2);
  const F = r2 * r2 - r3 * r3 - x2 * x2 + x3 * x3 - y2 * y2 + y3 * y3;

  const denom = A * E - B * D;
  if (Math.abs(denom) < 1e-10) return null;

  const px = (C * E - F * B) / denom;
  const py = (A * F - D * C) / denom;

  if (!isFinite(px) || !isFinite(py)) return null;
  return { x: px, y: py };
}

const DEFAULT_STATIONS: Station[] = [
  { x: 100, y: 80, label: 'STA-1' },
  { x: 350, y: 100, label: 'STA-2' },
  { x: 200, y: 300, label: 'STA-3' },
];

const SeismologyStation: React.FC = () => {
  const { syncValue, elapsedTime, pulseCount } = useZeqSync();

  const [activeTab, setActiveTab] = useState<TabId>('seismogram');
  const [magnitude, setMagnitude] = useState(5.5);
  const [depth, setDepth] = useState(30);
  const [epicentralDist, setEpicentralDist] = useState(200);
  const [stations] = useState<Station[]>(DEFAULT_STATIONS);

  const arrivals = useMemo(() => computeArrivals(epicentralDist, depth), [epicentralDist, depth]);

  const sampleRate = 20;
  const duration = useMemo(() => Math.max(arrivals.ts * 2, 60), [arrivals.ts]);

  const traces = useMemo(() => {
    return stations.map((_, i) => {
      const distFactor = 0.8 + i * 0.3;
      const a = computeArrivals(epicentralDist * distFactor, depth);
      return {
        data: synthesizeTrace(a.tp, a.ts, magnitude, duration, sampleRate),
        tp: a.tp,
        ts: a.ts,
      };
    });
  }, [stations, epicentralDist, depth, magnitude, duration]);

  const m0 = useMemo(() => seismicMoment(magnitude), [magnitude]);
  const mwComputed = useMemo(() => momentMagnitude(m0), [m0]);

  const stationDistances = useMemo(() => {
    return stations.map((_, i) => epicentralDist * (0.8 + i * 0.3));
  }, [stations, epicentralDist]);

  const epicenter = useMemo(() => triangulate(stations, stationDistances), [stations, stationDistances]);

  const refPSTime = useMemo(() => {
    // Reference: at 100km crustal, tp~16.7s, ts~28.6s
    return (100 / 3.5) - (100 / 6.0);
  }, []);

  const tabs: { id: TabId; label: string }[] = [
    { id: 'seismogram', label: 'Seismogram' },
    { id: 'earth', label: 'Earth Model' },
    { id: 'triangulation', label: 'Triangulation' },
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

      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 space-y-3">
        <h3 className="text-xs font-semibold text-slate-300 flex items-center gap-1">
          <Activity size={14} className="text-cyan-400" /> Earthquake Parameters
        </h3>

        <div>
          <label className="text-xs text-slate-400 flex justify-between">
            <span>Magnitude (Mw)</span>
            <span className="font-mono text-cyan-400">{magnitude.toFixed(1)}</span>
          </label>
          <input type="range" min={2.0} max={9.0} step={0.1} value={magnitude}
            onChange={(e) => setMagnitude(Number(e.target.value))}
            className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500" />
        </div>

        <div>
          <label className="text-xs text-slate-400 flex justify-between">
            <span>Depth (km)</span>
            <span className="font-mono text-cyan-400">{depth}</span>
          </label>
          <input type="range" min={5} max={700} step={5} value={depth}
            onChange={(e) => setDepth(Number(e.target.value))}
            className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500" />
        </div>

        <div>
          <label className="text-xs text-slate-400 flex justify-between">
            <span>Epicentral Distance (km)</span>
            <span className="font-mono text-cyan-400">{epicentralDist}</span>
          </label>
          <input type="range" min={10} max={10000} step={10} value={epicentralDist}
            onChange={(e) => setEpicentralDist(Number(e.target.value))}
            className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500" />
        </div>
      </div>

      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 space-y-2">
        <h3 className="text-xs font-semibold text-slate-300">Wave Arrivals</h3>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-slate-400">P-wave</span>
            <p className="font-mono text-cyan-400">{arrivals.tp.toFixed(1)}s</p>
          </div>
          <div>
            <span className="text-slate-400">S-wave</span>
            <p className="font-mono text-orange-400">{arrivals.ts.toFixed(1)}s</p>
          </div>
          <div>
            <span className="text-slate-400">P-S Diff</span>
            <p className="font-mono text-emerald-400">{(arrivals.ts - arrivals.tp).toFixed(1)}s</p>
          </div>
          <div>
            <span className="text-slate-400">Pulse</span>
            <p className="font-mono text-orange-400">{pulseCount}</p>
          </div>
        </div>
      </div>

      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 space-y-2">
        <h3 className="text-xs font-semibold text-slate-300">Layer Model</h3>
        {EARTH_LAYERS.map((layer) => (
          <div key={layer.name} className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: layer.color }} />
            <span className="text-slate-300 flex-1">{layer.name}</span>
            <span className="font-mono text-slate-500">{layer.depthTop}-{layer.depthBot}km</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <AppPageLayout
      title="Seismology Station"
      description="Earthquake simulation with ray tracing and triangulation"
      domain="Earth & Geosciences"
      sidebar={sidebar}
    >
      {activeTab === 'seismogram' && (
        <SeismogramCanvas
          traces={traces}
          stations={stations}
          duration={duration}
          sampleRate={sampleRate}
          syncValue={syncValue}
          elapsedTime={elapsedTime}
        />
      )}
      {activeTab === 'earth' && (
        <EarthCrossSection
          layers={EARTH_LAYERS}
          depth={depth}
          epicentralDist={epicentralDist}
          arrivals={arrivals}
          syncValue={syncValue}
        />
      )}
      {activeTab === 'triangulation' && (
        <SeismoMetrics
          arrivals={arrivals}
          magnitude={magnitude}
          depth={depth}
          epicentralDist={epicentralDist}
          m0={m0}
          mwComputed={mwComputed}
          stations={stations}
          stationDistances={stationDistances}
          epicenter={epicenter}
          refPSTime={refPSTime}
          syncValue={syncValue}
          traces={traces}
        />
      )}
    </AppPageLayout>
  );
};

export default SeismologyStation;
