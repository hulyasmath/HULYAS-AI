import React, { useState, useMemo, useCallback } from 'react';
import { Zap, Plus, Minus, RotateCcw } from 'lucide-react';
import { AppPageLayout } from '../shared/AppPageLayout';
import { useZeqSync } from '../SimulationVisualizer/useZeqSync';
import { FieldLinesCanvas } from './FieldLinesCanvas';
import { AntennaPattern } from './AntennaPattern';
import { EMMetrics } from './EMMetrics';

type TabId = 'electrostatics' | 'antenna' | 'metrics';

export interface Charge {
  x: number;
  y: number;
  q: number; // nanocoulombs
}

export const K_COULOMB = 8.99e9;
export const MU_0 = 4 * Math.PI * 1e-7;
export const ETA_0 = 377; // free space impedance

export function computeEField(charges: Charge[], px: number, py: number): { Ex: number; Ey: number; V: number } {
  let Ex = 0, Ey = 0, V = 0;
  for (const c of charges) {
    const dx = px - c.x;
    const dy = py - c.y;
    const r2 = dx * dx + dy * dy;
    const r = Math.sqrt(r2);
    if (r < 0.01) continue; // avoid singularity
    const qSI = c.q * 1e-9;
    const E = K_COULOMB * qSI / r2;
    Ex += E * dx / r;
    Ey += E * dy / r;
    V += K_COULOMB * qSI / r;
  }
  return {
    Ex: isFinite(Ex) ? Ex : 0,
    Ey: isFinite(Ey) ? Ey : 0,
    V: isFinite(V) ? V : 0,
  };
}

const EMFields: React.FC = () => {
  const { syncValue, elapsedTime, pulseCount } = useZeqSync();

  const [activeTab, setActiveTab] = useState<TabId>('electrostatics');
  const [charges, setCharges] = useState<Charge[]>([
    { x: -1.0, y: 0, q: 5 },
    { x: 1.0, y: 0, q: -5 },
  ]);
  const [probeX, setProbeX] = useState(0.5);
  const [probeY, setProbeY] = useState(0.5);
  const [frequency, setFrequency] = useState(1e9); // 1 GHz
  const [wireCurrent, setWireCurrent] = useState(10); // Amps

  const addCharge = useCallback((positive: boolean) => {
    if (charges.length >= 5) return;
    setCharges((prev) => [
      ...prev,
      { x: (Math.random() - 0.5) * 3, y: (Math.random() - 0.5) * 3, q: positive ? 3 : -3 },
    ]);
  }, [charges.length]);

  const updateCharge = useCallback((idx: number, field: keyof Charge, value: number) => {
    setCharges((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  }, []);

  const removeCharge = useCallback((idx: number) => {
    setCharges((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  const handleReset = useCallback(() => {
    setCharges([
      { x: -1.0, y: 0, q: 5 },
      { x: 1.0, y: 0, q: -5 },
    ]);
    setProbeX(0.5);
    setProbeY(0.5);
    setFrequency(1e9);
    setWireCurrent(10);
  }, []);

  // Probe field
  const probeField = useMemo(
    () => computeEField(charges, probeX, probeY),
    [charges, probeX, probeY]
  );
  const probeMag = Math.sqrt(probeField.Ex * probeField.Ex + probeField.Ey * probeField.Ey);

  // Wavelength and wave parameters
  const wavelength = useMemo(() => 3e8 / frequency, [frequency]);
  const k = useMemo(() => 2 * Math.PI / wavelength, [wavelength]);
  const omega = useMemo(() => 2 * Math.PI * frequency, [frequency]);

  const tabs: { id: TabId; label: string }[] = [
    { id: 'electrostatics', label: 'E-Field' },
    { id: 'antenna', label: 'Antenna & Wave' },
    { id: 'metrics', label: 'Metrics' },
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

      {/* Charge controls */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3">
        <h3 className="text-xs font-semibold text-slate-300 mb-2 flex items-center justify-between">
          <span className="flex items-center gap-1">
            <Zap size={14} className="text-cyan-400" /> Charges ({charges.length}/5)
          </span>
          <button onClick={handleReset} className="text-slate-500 hover:text-slate-300">
            <RotateCcw size={12} />
          </button>
        </h3>
        <div className="flex gap-1 mb-2">
          <button onClick={() => addCharge(true)} disabled={charges.length >= 5}
            className="flex-1 flex items-center justify-center gap-1 text-xs py-1 rounded bg-red-500/20 text-red-400 border border-red-500/30 disabled:opacity-30">
            <Plus size={10} /> Positive
          </button>
          <button onClick={() => addCharge(false)} disabled={charges.length >= 5}
            className="flex-1 flex items-center justify-center gap-1 text-xs py-1 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 disabled:opacity-30">
            <Minus size={10} /> Negative
          </button>
        </div>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {charges.map((c, i) => (
            <div key={i} className="bg-slate-900/50 rounded p-2 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className={`font-mono font-bold ${c.q > 0 ? 'text-red-400' : 'text-blue-400'}`}>
                  Q{i + 1}: {c.q > 0 ? '+' : ''}{c.q} nC
                </span>
                <button onClick={() => removeCharge(i)} className="text-slate-500 hover:text-red-400 text-xs">x</button>
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-slate-500">x</label>
                  <input type="range" min={-3} max={3} step={0.1} value={c.x}
                    onChange={(e) => updateCharge(i, 'x', Number(e.target.value))}
                    className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500" />
                </div>
                <div className="flex-1">
                  <label className="text-slate-500">y</label>
                  <input type="range" min={-3} max={3} step={0.1} value={c.y}
                    onChange={(e) => updateCharge(i, 'y', Number(e.target.value))}
                    className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500" />
                </div>
              </div>
              <div>
                <label className="text-slate-500">q (nC): {c.q.toFixed(1)}</label>
                <input type="range" min={-10} max={10} step={0.5} value={c.q}
                  onChange={(e) => updateCharge(i, 'q', Number(e.target.value))}
                  className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Probe point */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 space-y-2">
        <h3 className="text-xs font-semibold text-slate-300">Probe Point</h3>
        <div>
          <label className="text-xs text-slate-400 flex justify-between">
            <span>x</span><span className="font-mono text-cyan-400">{probeX.toFixed(1)} m</span>
          </label>
          <input type="range" min={-3} max={3} step={0.1} value={probeX}
            onChange={(e) => setProbeX(Number(e.target.value))}
            className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500" />
        </div>
        <div>
          <label className="text-xs text-slate-400 flex justify-between">
            <span>y</span><span className="font-mono text-cyan-400">{probeY.toFixed(1)} m</span>
          </label>
          <input type="range" min={-3} max={3} step={0.1} value={probeY}
            onChange={(e) => setProbeY(Number(e.target.value))}
            className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500" />
        </div>
        <div className="text-xs">
          <span className="text-slate-400">|E| = </span>
          <span className="font-mono text-orange-400">{probeMag.toExponential(3)} N/C</span>
        </div>
      </div>

      {/* Wave/Antenna params */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 space-y-2">
        <h3 className="text-xs font-semibold text-slate-300">Wave / Antenna</h3>
        <div>
          <label className="text-xs text-slate-400 flex justify-between">
            <span>Frequency</span>
            <span className="font-mono text-cyan-400">{(frequency / 1e9).toFixed(2)} GHz</span>
          </label>
          <input type="range" min={1e8} max={1e10} step={1e8} value={frequency}
            onChange={(e) => setFrequency(Number(e.target.value))}
            className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500" />
        </div>
        <div>
          <label className="text-xs text-slate-400 flex justify-between">
            <span>Wire Current</span>
            <span className="font-mono text-cyan-400">{wireCurrent} A</span>
          </label>
          <input type="range" min={1} max={100} step={1} value={wireCurrent}
            onChange={(e) => setWireCurrent(Number(e.target.value))}
            className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500" />
        </div>
        <div className="text-xs text-slate-500">
          lambda = {wavelength.toFixed(3)} m | Pulse: {pulseCount}
        </div>
      </div>
    </div>
  );

  return (
    <AppPageLayout
      title="Electromagnetic Field Visualizer"
      description="Coulomb superposition, antenna patterns, EM wave propagation"
      domain="Electromagnetism"
      sidebar={sidebar}
    >
      {activeTab === 'electrostatics' && (
        <FieldLinesCanvas
          charges={charges}
          probeX={probeX}
          probeY={probeY}
          syncValue={syncValue}
        />
      )}
      {activeTab === 'antenna' && (
        <AntennaPattern
          frequency={frequency}
          wavelength={wavelength}
          k={k}
          omega={omega}
          elapsedTime={elapsedTime}
          syncValue={syncValue}
        />
      )}
      {activeTab === 'metrics' && (
        <EMMetrics
          charges={charges}
          probeField={probeField}
          probeMag={probeMag}
          probeX={probeX}
          probeY={probeY}
          frequency={frequency}
          wavelength={wavelength}
          wireCurrent={wireCurrent}
          syncValue={syncValue}
        />
      )}
    </AppPageLayout>
  );
};

export default EMFields;
