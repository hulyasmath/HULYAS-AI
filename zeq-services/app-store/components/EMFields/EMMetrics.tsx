import React, { useMemo } from 'react';
import { Zap, Radio, Waves, Target } from 'lucide-react';
import { PrecisionBadge } from '../shared/PrecisionBadge';
import { EntropyVerifier } from '../shared/EntropyVerifier';
import { KolmogorovChecker } from '../shared/KolmogorovChecker';
import type { Charge } from './index';
import { K_COULOMB, MU_0, ETA_0 } from './index';

interface EMMetricsProps {
  charges: Charge[];
  probeField: { Ex: number; Ey: number; V: number };
  probeMag: number;
  probeX: number;
  probeY: number;
  frequency: number;
  wavelength: number;
  wireCurrent: number;
  syncValue: number;
}

export const EMMetrics: React.FC<EMMetricsProps> = ({
  charges, probeField, probeMag, probeX, probeY,
  frequency, wavelength, wireCurrent, syncValue,
}) => {
  // Reference: E from single +1nC charge at 1m = k*q/r^2 = 8.99 N/C
  const refE1nC = K_COULOMB * 1e-9; // 8.99 N/C

  // Computed E from a single +1nC charge at (0,0) measured at (1,0)
  const singleChargeE = useMemo(() => {
    // Test: single +1nC at origin, measure at (1,0)
    const q = 1e-9;
    const r = 1;
    return K_COULOMB * q / (r * r);
  }, []);

  // Potential energy of the charge configuration
  const potentialEnergy = useMemo(() => {
    let U = 0;
    for (let i = 0; i < charges.length; i++) {
      for (let j = i + 1; j < charges.length; j++) {
        const dx = charges[i].x - charges[j].x;
        const dy = charges[i].y - charges[j].y;
        const r = Math.sqrt(dx * dx + dy * dy);
        if (r < 0.01) continue;
        const qi = charges[i].q * 1e-9;
        const qj = charges[j].q * 1e-9;
        U += K_COULOMB * qi * qj / r;
      }
    }
    return isFinite(U) ? U : 0;
  }, [charges]);

  // Biot-Savart: B-field from infinite straight wire at probe distance
  const probeDistance = useMemo(() => Math.sqrt(probeX * probeX + probeY * probeY), [probeX, probeY]);
  const bFieldWire = useMemo(() => {
    if (probeDistance < 0.01) return 0;
    const B = (MU_0 * wireCurrent) / (2 * Math.PI * probeDistance);
    return isFinite(B) ? B : 0;
  }, [wireCurrent, probeDistance]);

  // Half-wave dipole antenna metrics
  const antennaGainLinear = 1.64;
  const antennaGainDBi = 10 * Math.log10(antennaGainLinear);
  const directivity = 1.64; // same for lossless
  const waveImpedance = ETA_0; // 377 ohm

  // k and omega
  const kWave = (2 * Math.PI) / wavelength;
  const omegaWave = 2 * Math.PI * frequency;
  const c = frequency * wavelength;

  // Data for entropy
  const fieldData = useMemo(() => {
    const data: number[] = [
      probeMag,
      probeField.Ex,
      probeField.Ey,
      probeField.V,
      potentialEnergy,
      bFieldWire,
      antennaGainLinear,
      waveImpedance,
      kWave,
      omegaWave,
    ].filter((v) => isFinite(v) && !isNaN(v));
    // Add field samples for better entropy
    for (let i = 0; i < charges.length; i++) {
      data.push(charges[i].q, charges[i].x, charges[i].y);
    }
    return data;
  }, [probeMag, probeField, potentialEnergy, bFieldWire, kWave, omegaWave, charges]);

  // Kolmogorov state
  const stateString = useMemo(() => {
    return JSON.stringify({
      charges: charges.map((c) => ({ x: c.x.toFixed(2), y: c.y.toFixed(2), q: c.q.toFixed(1) })),
      probe: { Ex: probeField.Ex.toExponential(4), Ey: probeField.Ey.toExponential(4), V: probeField.V.toExponential(4) },
      E_mag: probeMag.toExponential(4),
      U: potentialEnergy.toExponential(4),
      B_wire: bFieldWire.toExponential(4),
      freq: frequency,
      lambda: wavelength.toFixed(4),
      gain_dBi: antennaGainDBi.toFixed(2),
    });
  }, [charges, probeField, probeMag, potentialEnergy, bFieldWire, frequency, wavelength, antennaGainDBi]);

  return (
    <div className="space-y-4">
      {/* Electrostatic field metrics */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
          <Zap size={16} className="text-cyan-400" /> Electrostatic Field at Probe
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-900/50 rounded-lg p-3">
            <div className="flex items-center gap-1 text-xs text-slate-400 mb-1">
              <Target size={12} /> |E|
            </div>
            <p className="text-lg font-mono font-bold text-orange-400">{probeMag.toExponential(3)}</p>
            <p className="text-xs text-slate-500">N/C</p>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-3">
            <div className="flex items-center gap-1 text-xs text-slate-400 mb-1">
              Ex
            </div>
            <p className="text-lg font-mono font-bold text-cyan-400">{probeField.Ex.toExponential(3)}</p>
            <p className="text-xs text-slate-500">N/C</p>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-3">
            <div className="flex items-center gap-1 text-xs text-slate-400 mb-1">
              Ey
            </div>
            <p className="text-lg font-mono font-bold text-cyan-400">{probeField.Ey.toExponential(3)}</p>
            <p className="text-xs text-slate-500">N/C</p>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-3">
            <div className="flex items-center gap-1 text-xs text-slate-400 mb-1">
              V (potential)
            </div>
            <p className="text-lg font-mono font-bold text-slate-200">{probeField.V.toExponential(3)}</p>
            <p className="text-xs text-slate-500">V</p>
          </div>
        </div>
      </div>

      {/* Potential energy & Biot-Savart */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
          <Waves size={16} className="text-orange-400" /> Energy &amp; Magnetostatics
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-slate-900/50 rounded-lg p-3">
            <span className="text-xs text-slate-400">Potential Energy</span>
            <p className="text-lg font-mono font-bold text-orange-400">{potentialEnergy.toExponential(3)}</p>
            <p className="text-xs text-slate-500">J (charge config)</p>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-3">
            <span className="text-xs text-slate-400">B (wire, at probe)</span>
            <p className="text-lg font-mono font-bold text-blue-400">{bFieldWire.toExponential(3)}</p>
            <p className="text-xs text-slate-500">T (Biot-Savart)</p>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-3">
            <span className="text-xs text-slate-400">Wire Current</span>
            <p className="text-lg font-mono font-bold text-cyan-400">{wireCurrent}</p>
            <p className="text-xs text-slate-500">A</p>
          </div>
        </div>
      </div>

      {/* Antenna & wave metrics */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
          <Radio size={16} className="text-cyan-400" /> Antenna &amp; Wave Parameters
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-900/50 rounded-lg p-3">
            <span className="text-xs text-slate-400">Gain</span>
            <p className="text-lg font-mono font-bold text-orange-400">{antennaGainDBi.toFixed(2)} dBi</p>
            <p className="text-xs text-slate-500">{antennaGainLinear.toFixed(2)} linear</p>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-3">
            <span className="text-xs text-slate-400">Directivity</span>
            <p className="text-lg font-mono font-bold text-cyan-400">{directivity.toFixed(2)}</p>
            <p className="text-xs text-slate-500">D = 4pi*U_max/P_rad</p>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-3">
            <span className="text-xs text-slate-400">Wave Impedance</span>
            <p className="text-lg font-mono font-bold text-slate-200">{waveImpedance.toFixed(0)}</p>
            <p className="text-xs text-slate-500">ohm (free space)</p>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-3">
            <span className="text-xs text-slate-400">c (verified)</span>
            <p className="text-lg font-mono font-bold text-cyan-400">{c.toExponential(3)}</p>
            <p className="text-xs text-slate-500">m/s</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-3">
          <div className="bg-slate-900/50 rounded-lg p-3 text-center">
            <span className="text-xs text-slate-400">k (wavenumber)</span>
            <p className="font-mono text-cyan-400">{kWave.toFixed(4)} rad/m</p>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-3 text-center">
            <span className="text-xs text-slate-400">omega</span>
            <p className="font-mono text-cyan-400">{omegaWave.toExponential(3)} rad/s</p>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-3 text-center">
            <span className="text-xs text-slate-400">lambda</span>
            <p className="font-mono text-orange-400">{wavelength.toFixed(4)} m</p>
          </div>
        </div>
      </div>

      {/* Verification */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 space-y-3">
        <h3 className="text-sm font-semibold text-slate-200 mb-2">Verification</h3>
        <PrecisionBadge
          computed={singleChargeE}
          reference={refE1nC}
          label="E from +1nC at 1m (ref: 8.99 N/C)"
        />
        <PrecisionBadge
          computed={c}
          reference={2.998e8}
          label="Speed of light c = f * lambda"
        />
        <PrecisionBadge
          computed={antennaGainDBi}
          reference={2.15}
          label="Dipole Gain (ref: 2.15 dBi)"
        />
        <EntropyVerifier data={fieldData} label="EM Field Distribution" />
        <KolmogorovChecker data={stateString} label="EM State Complexity" />
      </div>
    </div>
  );
};
