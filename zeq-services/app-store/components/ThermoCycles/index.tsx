import React, { useState, useMemo, useCallback } from 'react';
import { Flame, RotateCcw } from 'lucide-react';
import { AppPageLayout } from '../shared/AppPageLayout';
import { useZeqSync } from '../SimulationVisualizer/useZeqSync';
import { PVDiagram } from './PVDiagram';
import { TSDiagram } from './TSDiagram';
import { CycleMetrics } from './CycleMetrics';

type TabId = 'pv' | 'ts' | 'metrics';
export type CycleType = 'carnot' | 'otto' | 'diesel' | 'rankine' | 'brayton';
export type FluidType = 'air' | 'helium';

export interface CycleState {
  points: { P: number; V: number; T: number; S: number }[];
  processes: { type: string; color: string; label: string }[];
  efficiency: number;
  workOutput: number;
  heatInput: number;
  heatRejection: number;
}

export const FLUIDS: Record<FluidType, { gamma: number; cp: number; R: number; label: string }> = {
  air: { gamma: 1.4, cp: 1005, R: 287, label: 'Air' },
  helium: { gamma: 1.67, cp: 5193, R: 2077, label: 'Helium' },
};

function safeNum(v: number): number {
  return isFinite(v) && !isNaN(v) ? v : 0;
}

export function computeCycle(
  type: CycleType, Th: number, Tc: number,
  compressionRatio: number, pressureRatio: number,
  fluid: FluidType
): CycleState {
  const { gamma, cp, R } = FLUIDS[fluid];
  const cv = cp / gamma;

  switch (type) {
    case 'carnot': {
      const V1 = 1.0;
      const P1 = R * Tc / V1;
      const S1 = cv * Math.log(Tc) + R * Math.log(V1);

      // 1->2: Isothermal expansion at Tc? No: Carnot is Th isothermal expansion, adiabatic expansion, Tc isothermal compression, adiabatic compression
      // State 1: start at Tc, compressed
      const T1 = Tc;
      const T2 = Tc; // Actually let's do: 1(Tc,V1) -> 2(Th) adiabatic compression -> 3(Th) isothermal expansion -> 4(Tc) adiabatic expansion -> 1

      // Standard Carnot: 1(Th,V1) -> 2(Th,V2) isothermal expansion -> 3(Tc,V3) adiabatic expansion -> 4(Tc,V4) isothermal compression -> 1(Th,V1) adiabatic compression
      const T_1 = Th;
      const V_1 = 1.0;
      const P_1 = safeNum(R * T_1 / V_1);

      // 1->2: Isothermal expansion at Th
      const V_2 = V_1 * compressionRatio;
      const P_2 = safeNum(R * T_1 / V_2);
      const S_1 = safeNum(cv * Math.log(Math.max(T_1, 1)) + R * Math.log(Math.max(V_1, 1e-10)));
      const S_2 = safeNum(S_1 + R * Math.log(Math.max(V_2 / V_1, 1e-10)));

      // 2->3: Adiabatic expansion (Th -> Tc)
      const T_3 = Tc;
      const V_3 = safeNum(V_2 * Math.pow(Th / Tc, 1 / (gamma - 1)));
      const P_3 = safeNum(R * T_3 / V_3);
      const S_3 = S_2; // isentropic

      // 3->4: Isothermal compression at Tc
      const V_4 = safeNum(V_1 * Math.pow(Th / Tc, 1 / (gamma - 1)));
      const P_4 = safeNum(R * T_3 / V_4);
      const S_4 = S_1; // returns to S_1

      const efficiency = safeNum(1 - Tc / Th);
      const Qh = safeNum(R * Th * Math.log(Math.max(V_2 / V_1, 1e-10)));
      const Qc = safeNum(R * Tc * Math.log(Math.max(V_3 / V_4, 1e-10)));
      const W = safeNum(Qh - Qc);

      return {
        points: [
          { P: P_1, V: V_1, T: T_1, S: S_1 },
          { P: P_2, V: V_2, T: Th, S: S_2 },
          { P: P_3, V: V_3, T: T_3, S: S_3 },
          { P: P_4, V: V_4, T: Tc, S: S_4 },
        ],
        processes: [
          { type: 'isothermal', color: '#60a5fa', label: '1-2 Isothermal Exp.' },
          { type: 'adiabatic', color: '#f87171', label: '2-3 Adiabatic Exp.' },
          { type: 'isothermal', color: '#60a5fa', label: '3-4 Isothermal Comp.' },
          { type: 'adiabatic', color: '#f87171', label: '4-1 Adiabatic Comp.' },
        ],
        efficiency,
        workOutput: W,
        heatInput: Qh,
        heatRejection: Qc,
      };
    }

    case 'otto': {
      const V1 = compressionRatio;
      const T1 = Tc;
      const P1 = safeNum(R * T1 / V1);
      const S1 = safeNum(cv * Math.log(Math.max(T1, 1)) + R * Math.log(Math.max(V1, 1e-10)));

      // 1->2: Adiabatic compression
      const V2 = 1.0;
      const T2 = safeNum(T1 * Math.pow(compressionRatio, gamma - 1));
      const P2 = safeNum(R * T2 / V2);
      const S2 = S1;

      // 2->3: Isochoric heat addition
      const V3 = V2;
      const T3 = Th;
      const P3 = safeNum(R * T3 / V3);
      const S3 = safeNum(S2 + cv * Math.log(Math.max(T3 / T2, 1e-10)));

      // 3->4: Adiabatic expansion
      const V4 = V1;
      const T4 = safeNum(T3 * Math.pow(1 / compressionRatio, gamma - 1));
      const P4 = safeNum(R * T4 / V4);
      const S4 = S3;

      const efficiency = safeNum(1 - 1 / Math.pow(compressionRatio, gamma - 1));
      const Qin = safeNum(cv * (T3 - T2));
      const Qout = safeNum(cv * (T4 - T1));
      const W = safeNum(Qin - Qout);

      return {
        points: [
          { P: P1, V: V1, T: T1, S: S1 },
          { P: P2, V: V2, T: T2, S: S2 },
          { P: P3, V: V3, T: T3, S: S3 },
          { P: P4, V: V4, T: T4, S: S4 },
        ],
        processes: [
          { type: 'adiabatic', color: '#f87171', label: '1-2 Adiabatic Comp.' },
          { type: 'isochoric', color: '#fb923c', label: '2-3 Isochoric Heat Add.' },
          { type: 'adiabatic', color: '#f87171', label: '3-4 Adiabatic Exp.' },
          { type: 'isochoric', color: '#fb923c', label: '4-1 Isochoric Heat Rej.' },
        ],
        efficiency,
        workOutput: W,
        heatInput: Qin,
        heatRejection: Qout,
      };
    }

    case 'diesel': {
      const V1 = compressionRatio;
      const T1 = Tc;
      const P1 = safeNum(R * T1 / V1);
      const S1 = safeNum(cv * Math.log(Math.max(T1, 1)) + R * Math.log(Math.max(V1, 1e-10)));

      // 1->2: Adiabatic compression
      const V2 = 1.0;
      const T2 = safeNum(T1 * Math.pow(compressionRatio, gamma - 1));
      const P2 = safeNum(R * T2 / V2);
      const S2 = S1;

      // 2->3: Isobaric heat addition
      const T3 = Th;
      const V3 = safeNum(V2 * (T3 / T2));
      const P3 = P2;
      const rc = safeNum(V3 / V2); // cutoff ratio
      const S3 = safeNum(S2 + cp * Math.log(Math.max(T3 / T2, 1e-10)));

      // 3->4: Adiabatic expansion
      const V4 = V1;
      const T4 = safeNum(T3 * Math.pow(V3 / V4, gamma - 1));
      const P4 = safeNum(R * T4 / V4);
      const S4 = S3;

      const efficiency = safeNum(1 - (1 / Math.pow(compressionRatio, gamma - 1)) * (Math.pow(rc, gamma) - 1) / (gamma * (rc - 1)));
      const Qin = safeNum(cp * (T3 - T2));
      const Qout = safeNum(cv * (T4 - T1));
      const W = safeNum(Qin - Qout);

      return {
        points: [
          { P: P1, V: V1, T: T1, S: S1 },
          { P: P2, V: V2, T: T2, S: S2 },
          { P: P3, V: V3, T: T3, S: S3 },
          { P: P4, V: V4, T: T4, S: S4 },
        ],
        processes: [
          { type: 'adiabatic', color: '#f87171', label: '1-2 Adiabatic Comp.' },
          { type: 'isobaric', color: '#4ade80', label: '2-3 Isobaric Heat Add.' },
          { type: 'adiabatic', color: '#f87171', label: '3-4 Adiabatic Exp.' },
          { type: 'isochoric', color: '#fb923c', label: '4-1 Isochoric Heat Rej.' },
        ],
        efficiency,
        workOutput: W,
        heatInput: Qin,
        heatRejection: Qout,
      };
    }

    case 'brayton': {
      const T1 = Tc;
      const P1 = 101325; // 1 atm
      const V1 = safeNum(R * T1 / P1);
      const S1 = safeNum(cv * Math.log(Math.max(T1, 1)));

      // 1->2: Isentropic compression
      const P2 = P1 * pressureRatio;
      const T2 = safeNum(T1 * Math.pow(pressureRatio, (gamma - 1) / gamma));
      const V2 = safeNum(R * T2 / P2);
      const S2 = S1;

      // 2->3: Isobaric heat addition
      const T3 = Th;
      const P3 = P2;
      const V3 = safeNum(R * T3 / P3);
      const S3 = safeNum(S2 + cp * Math.log(Math.max(T3 / T2, 1e-10)));

      // 3->4: Isentropic expansion
      const T4 = safeNum(T3 / Math.pow(pressureRatio, (gamma - 1) / gamma));
      const P4 = P1;
      const V4 = safeNum(R * T4 / P4);
      const S4 = S3;

      const efficiency = safeNum(1 - 1 / Math.pow(pressureRatio, (gamma - 1) / gamma));
      const Qin = safeNum(cp * (T3 - T2));
      const Qout = safeNum(cp * (T4 - T1));
      const W = safeNum(Qin - Qout);

      return {
        points: [
          { P: P1, V: V1, T: T1, S: S1 },
          { P: P2, V: V2, T: T2, S: S2 },
          { P: P3, V: V3, T: T3, S: S3 },
          { P: P4, V: V4, T: T4, S: S4 },
        ],
        processes: [
          { type: 'adiabatic', color: '#f87171', label: '1-2 Isentropic Comp.' },
          { type: 'isobaric', color: '#4ade80', label: '2-3 Isobaric Heat Add.' },
          { type: 'adiabatic', color: '#f87171', label: '3-4 Isentropic Exp.' },
          { type: 'isobaric', color: '#4ade80', label: '4-1 Isobaric Heat Rej.' },
        ],
        efficiency,
        workOutput: W,
        heatInput: Qin,
        heatRejection: Qout,
      };
    }

    case 'rankine': {
      // Simplified ideal gas approximation for Rankine
      const T1 = Tc;
      const P1 = 10000; // low pressure condenser
      const V1 = safeNum(R * T1 / P1);
      const S1 = safeNum(cv * Math.log(Math.max(T1, 1)));

      // 1->2: Isentropic pump (compression)
      const P2 = P1 * pressureRatio;
      const T2 = safeNum(T1 * Math.pow(pressureRatio, (gamma - 1) / gamma));
      const V2 = safeNum(R * T2 / P2);
      const S2 = S1;

      // 2->3: Isobaric boiler (heat addition)
      const T3 = Th;
      const P3 = P2;
      const V3 = safeNum(R * T3 / P3);
      const S3 = safeNum(S2 + cp * Math.log(Math.max(T3 / T2, 1e-10)));

      // 3->4: Isentropic turbine (expansion)
      const T4 = safeNum(T3 / Math.pow(pressureRatio, (gamma - 1) / gamma));
      const P4 = P1;
      const V4 = safeNum(R * T4 / P4);
      const S4 = S3;

      const h3 = cp * T3;
      const h4 = cp * T4;
      const h1 = cp * T1;
      const efficiency = safeNum((h3 - h4) / (h3 - h1));
      const Qin = safeNum(cp * (T3 - T2));
      const Qout = safeNum(cp * (T4 - T1));
      const W = safeNum(Qin - Qout);

      return {
        points: [
          { P: P1, V: V1, T: T1, S: S1 },
          { P: P2, V: V2, T: T2, S: S2 },
          { P: P3, V: V3, T: T3, S: S3 },
          { P: P4, V: V4, T: T4, S: S4 },
        ],
        processes: [
          { type: 'adiabatic', color: '#f87171', label: '1-2 Pump (Isentropic)' },
          { type: 'isobaric', color: '#4ade80', label: '2-3 Boiler (Isobaric)' },
          { type: 'adiabatic', color: '#f87171', label: '3-4 Turbine (Isentropic)' },
          { type: 'isobaric', color: '#4ade80', label: '4-1 Condenser (Isobaric)' },
        ],
        efficiency,
        workOutput: W,
        heatInput: Qin,
        heatRejection: Qout,
      };
    }
  }
}

const CYCLE_LABELS: Record<CycleType, string> = {
  carnot: 'Carnot',
  otto: 'Otto',
  diesel: 'Diesel',
  rankine: 'Rankine',
  brayton: 'Brayton',
};

const ThermoCycles: React.FC = () => {
  const { syncValue, elapsedTime, pulseCount } = useZeqSync();

  const [activeTab, setActiveTab] = useState<TabId>('pv');
  const [cycleType, setCycleType] = useState<CycleType>('carnot');
  const [Th, setTh] = useState(600);
  const [Tc, setTc] = useState(300);
  const [compressionRatio, setCompressionRatio] = useState(8);
  const [pressureRatio, setPressureRatio] = useState(10);
  const [fluid, setFluid] = useState<FluidType>('air');

  const handleReset = useCallback(() => {
    setTh(600);
    setTc(300);
    setCompressionRatio(8);
    setPressureRatio(10);
    setFluid('air');
  }, []);

  const cycle = useMemo(
    () => computeCycle(cycleType, Th, Tc, compressionRatio, pressureRatio, fluid),
    [cycleType, Th, Tc, compressionRatio, pressureRatio, fluid]
  );

  const showCompressionRatio = cycleType === 'carnot' || cycleType === 'otto' || cycleType === 'diesel';
  const showPressureRatio = cycleType === 'brayton' || cycleType === 'rankine';

  const tabs: { id: TabId; label: string }[] = [
    { id: 'pv', label: 'P-V Diagram' },
    { id: 'ts', label: 'T-S Diagram' },
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

      {/* Cycle selector */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3">
        <h3 className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1">
          <Flame size={14} className="text-orange-400" /> Cycle Type
        </h3>
        <div className="grid grid-cols-2 gap-1">
          {(Object.keys(CYCLE_LABELS) as CycleType[]).map((c) => (
            <button
              key={c}
              onClick={() => setCycleType(c)}
              className={`text-xs py-1.5 px-2 rounded transition-colors ${
                cycleType === c
                  ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                  : 'bg-slate-700/50 text-slate-400 hover:text-slate-200'
              }`}
            >
              {CYCLE_LABELS[c]}
            </button>
          ))}
        </div>
      </div>

      {/* Working fluid */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3">
        <h3 className="text-xs font-semibold text-slate-300 mb-2">Working Fluid</h3>
        <div className="flex gap-1">
          {(Object.keys(FLUIDS) as FluidType[]).map((f) => (
            <button
              key={f}
              onClick={() => setFluid(f)}
              className={`flex-1 text-xs py-1.5 rounded ${
                fluid === f
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'bg-slate-700/50 text-slate-400'
              }`}
            >
              {FLUIDS[f].label} (gamma={FLUIDS[f].gamma})
            </button>
          ))}
        </div>
      </div>

      {/* Parameters */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 space-y-3">
        <h3 className="text-xs font-semibold text-slate-300 flex items-center justify-between">
          Parameters
          <button onClick={handleReset} className="text-slate-500 hover:text-slate-300">
            <RotateCcw size={12} />
          </button>
        </h3>

        <div>
          <label className="text-xs text-slate-400 flex justify-between">
            <span>T_hot (K)</span>
            <span className="font-mono text-orange-400">{Th}</span>
          </label>
          <input type="range" min={300} max={2000} step={10} value={Th}
            onChange={(e) => setTh(Math.max(Number(e.target.value), Tc + 10))}
            className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500" />
        </div>

        <div>
          <label className="text-xs text-slate-400 flex justify-between">
            <span>T_cold (K)</span>
            <span className="font-mono text-cyan-400">{Tc}</span>
          </label>
          <input type="range" min={200} max={400} step={5} value={Tc}
            onChange={(e) => setTc(Math.min(Number(e.target.value), Th - 10))}
            className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500" />
        </div>

        {showCompressionRatio && (
          <div>
            <label className="text-xs text-slate-400 flex justify-between">
              <span>Compression Ratio</span>
              <span className="font-mono text-cyan-400">{compressionRatio}</span>
            </label>
            <input type="range" min={2} max={20} step={0.5} value={compressionRatio}
              onChange={(e) => setCompressionRatio(Number(e.target.value))}
              className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500" />
          </div>
        )}

        {showPressureRatio && (
          <div>
            <label className="text-xs text-slate-400 flex justify-between">
              <span>Pressure Ratio</span>
              <span className="font-mono text-cyan-400">{pressureRatio}</span>
            </label>
            <input type="range" min={2} max={40} step={1} value={pressureRatio}
              onChange={(e) => setPressureRatio(Number(e.target.value))}
              className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500" />
          </div>
        )}
      </div>

      {/* Quick efficiency */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3">
        <h3 className="text-xs font-semibold text-slate-300 mb-1">Efficiency</h3>
        <p className="text-2xl font-mono font-bold text-orange-400">
          {(cycle.efficiency * 100).toFixed(2)}%
        </p>
        <p className="text-xs text-slate-500">Pulse: {pulseCount}</p>
      </div>
    </div>
  );

  return (
    <AppPageLayout
      title="Thermodynamic Cycle Analyzer"
      description={`${CYCLE_LABELS[cycleType]} Cycle - ${FLUIDS[fluid].label}`}
      domain="Thermodynamics"
      sidebar={sidebar}
    >
      {activeTab === 'pv' && (
        <PVDiagram cycle={cycle} cycleType={cycleType} elapsedTime={elapsedTime} syncValue={syncValue} />
      )}
      {activeTab === 'ts' && (
        <TSDiagram cycle={cycle} cycleType={cycleType} elapsedTime={elapsedTime} />
      )}
      {activeTab === 'metrics' && (
        <CycleMetrics
          cycle={cycle}
          cycleType={cycleType}
          Th={Th}
          Tc={Tc}
          compressionRatio={compressionRatio}
          pressureRatio={pressureRatio}
          fluid={fluid}
        />
      )}
    </AppPageLayout>
  );
};

export default ThermoCycles;
