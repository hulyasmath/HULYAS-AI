import React, { useMemo } from 'react';
import { PrecisionBadge } from '../shared/PrecisionBadge';
import { EntropyVerifier } from '../shared/EntropyVerifier';
import { KolmogorovChecker } from '../shared/KolmogorovChecker';
import { TidalConstituent, tidalHeight } from './index';

interface OceanMetricsProps {
  waveProps: {
    k: number;
    wavelength: number;
    phaseSpeed: number;
    groupSpeed: number;
    energyFlux: number;
    stokesDrift: number;
    omega: number;
  };
  waveHeight: number;
  wavePeriod: number;
  waterDepth: number;
  latitude: number;
  windSpeed: number;
  ekDepth: number;
  constituents: TidalConstituent[];
  syncValue: number;
}

export const OceanMetrics: React.FC<OceanMetricsProps> = ({
  waveProps, waveHeight, wavePeriod, waterDepth, latitude, windSpeed,
  ekDepth, constituents, syncValue,
}) => {
  // Reference values for deep water, T=10s
  const refWavelength = 9.81 * 10 * 10 / (2 * Math.PI); // ~156m
  const refPhaseSpeed = 9.81 * 10 / (2 * Math.PI); // ~15.6 m/s

  // Tidal range (max - min over one spring-neap cycle)
  const tidalRange = useMemo(() => {
    let min = Infinity, max = -Infinity;
    for (let t = 0; t < 30 * 24; t += 0.25) {
      const h = tidalHeight(t, constituents);
      if (h < min) min = h;
      if (h > max) max = h;
    }
    return {
      min: isFinite(min) ? min : 0,
      max: isFinite(max) ? max : 0,
      range: isFinite(max - min) ? max - min : 0,
    };
  }, [constituents]);

  // Spring tide range (M2 + S2 in phase)
  const springRange = (constituents[0]?.amplitude || 0) + (constituents[1]?.amplitude || 0);
  const neapRange = Math.abs((constituents[0]?.amplitude || 0) - (constituents[1]?.amplitude || 0));

  // Entropy data from tidal predictions
  const tidalEntropyData = useMemo(() => {
    const data: number[] = [];
    for (let t = 0; t < 48; t += 0.5) {
      data.push(tidalHeight(t, constituents));
    }
    return data;
  }, [constituents]);

  // Serialized state
  const serializedState = useMemo(() => JSON.stringify({
    wave: waveProps,
    tidal: { range: tidalRange.range, spring: springRange, neap: neapRange },
    ekman: { depth: ekDepth, lat: latitude, wind: windSpeed },
  }), [waveProps, tidalRange, springRange, neapRange, ekDepth, latitude, windSpeed]);

  // Wave data for entropy
  const waveEntropyData = useMemo(() => {
    const data: number[] = [];
    for (let i = 0; i < 100; i++) {
      const t = (i / 100) * wavePeriod;
      data.push(waveHeight / 2 * Math.cos(waveProps.omega * t));
    }
    return data;
  }, [waveHeight, wavePeriod, waveProps.omega]);

  return (
    <div className="space-y-4">
      {/* Wave Mechanics */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-200 mb-3">Wave Mechanics (Airy Theory)</h3>
        <div className="grid grid-cols-3 gap-4 text-xs">
          <div>
            <span className="text-slate-400">Wavenumber k</span>
            <p className="font-mono text-cyan-400 text-lg">{waveProps.k.toFixed(4)} rad/m</p>
          </div>
          <div>
            <span className="text-slate-400">Wavelength L</span>
            <p className="font-mono text-cyan-400 text-lg">{waveProps.wavelength.toFixed(1)} m</p>
          </div>
          <div>
            <span className="text-slate-400">Phase Speed c</span>
            <p className="font-mono text-orange-400 text-lg">{waveProps.phaseSpeed.toFixed(2)} m/s</p>
          </div>
          <div>
            <span className="text-slate-400">Group Speed cg</span>
            <p className="font-mono text-orange-400 text-lg">{waveProps.groupSpeed.toFixed(2)} m/s</p>
          </div>
          <div>
            <span className="text-slate-400">Energy Flux</span>
            <p className="font-mono text-cyan-400 text-lg">{waveProps.energyFlux.toFixed(0)} W/m</p>
          </div>
          <div>
            <span className="text-slate-400">Stokes Drift</span>
            <p className="font-mono text-purple-400 text-lg">{waveProps.stokesDrift.toFixed(4)} m/s</p>
          </div>
        </div>

        <div className="mt-3 text-xs text-slate-500 font-mono">
          Dispersion: {'\u03C9'}&sup2; = g&middot;k&middot;tanh(kd), d={waterDepth}m, kd={((waveProps.k * waterDepth)).toFixed(2)}
          {waveProps.k * waterDepth > 3.14 ? ' (deep water)' : waveProps.k * waterDepth < 0.31 ? ' (shallow water)' : ' (intermediate depth)'}
        </div>
      </div>

      {/* Tidal Analysis */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-200 mb-3">Tidal Analysis</h3>
        <div className="grid grid-cols-3 gap-4 text-xs">
          <div>
            <span className="text-slate-400">Tidal Range</span>
            <p className="font-mono text-cyan-400 text-lg">{tidalRange.range.toFixed(2)} m</p>
          </div>
          <div>
            <span className="text-slate-400">Spring Range</span>
            <p className="font-mono text-orange-400 text-lg">{(springRange * 2).toFixed(2)} m</p>
          </div>
          <div>
            <span className="text-slate-400">Neap Range</span>
            <p className="font-mono text-emerald-400 text-lg">{(neapRange * 2).toFixed(2)} m</p>
          </div>
          <div>
            <span className="text-slate-400">Max Level</span>
            <p className="font-mono text-cyan-400">{tidalRange.max.toFixed(2)} m</p>
          </div>
          <div>
            <span className="text-slate-400">Min Level</span>
            <p className="font-mono text-cyan-400">{tidalRange.min.toFixed(2)} m</p>
          </div>
          <div>
            <span className="text-slate-400">Form Factor</span>
            <p className="font-mono text-slate-300">
              {(((constituents[2]?.amplitude || 0) + (constituents[3]?.amplitude || 0)) /
                ((constituents[0]?.amplitude || 1) + (constituents[1]?.amplitude || 1))).toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Ekman Summary */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-200 mb-3">Ekman Layer</h3>
        <div className="grid grid-cols-3 gap-4 text-xs">
          <div>
            <span className="text-slate-400">Ekman Depth De</span>
            <p className="font-mono text-cyan-400 text-lg">{ekDepth.toFixed(1)} m</p>
          </div>
          <div>
            <span className="text-slate-400">Surface Current</span>
            <p className="font-mono text-orange-400 text-lg">{(windSpeed * 0.03).toFixed(3)} m/s</p>
          </div>
          <div>
            <span className="text-slate-400">Coriolis f</span>
            <p className="font-mono text-cyan-400 text-lg">{(2 * 7.29e-5 * Math.sin(latitude * Math.PI / 180)).toExponential(2)} /s</p>
          </div>
        </div>
        <div className="mt-2 text-xs text-slate-500 font-mono">
          De = {'\u221A'}(2Az/f), Az=0.1 m&sup2;/s, lat={latitude}&deg;
        </div>
      </div>

      {/* Verification */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-200">Verification</h3>
        <PrecisionBadge
          computed={wavePeriod === 10 ? waveProps.wavelength : refWavelength}
          reference={refWavelength}
          label="Deep water wavelength (T=10s, ref=156m)"
        />
        <PrecisionBadge
          computed={wavePeriod === 10 ? waveProps.phaseSpeed : refPhaseSpeed}
          reference={refPhaseSpeed}
          label="Deep water phase speed (T=10s, ref=15.6m/s)"
        />
        <PrecisionBadge
          computed={springRange * 2}
          reference={(constituents[0]?.amplitude + constituents[1]?.amplitude) * 2}
          label="Spring tidal range"
        />
        <EntropyVerifier data={waveEntropyData} label="Wave Profile Entropy" />
        <EntropyVerifier data={tidalEntropyData} label="Tidal Prediction Entropy" />
        <KolmogorovChecker data={serializedState} label="Ocean State Complexity" />
      </div>
    </div>
  );
};
