import React, { useState, useMemo, useCallback } from 'react';
import { AppPageLayout } from '../shared/AppPageLayout';
import { useZeqSync } from '../SimulationVisualizer/useZeqSync';
import { Bone, TrendingUp, Activity, Clock } from 'lucide-react';
import SkeletonView from './SkeletonView';
import JointForcePlots from './JointForcePlots';
import BiomechMetrics from './BiomechMetrics';

type Tab = 'skeleton' | 'forces' | 'muscles';

export interface BiomechParams {
  mass: number;       // kg
  height: number;     // m
  strideLength: number; // m
  walkingSpeed: number; // m/s
  cadence: number;    // steps/min
  gaitPhase: number;  // 0-100%
}

function safe(v: number): number {
  return Number.isFinite(v) ? v : 0;
}

const G = 9.81;

/** Gait cycle kinematics (simplified sinusoidal model) */
export function getJointAngles(phase: number): {
  hip: number; knee: number; ankle: number;
} {
  const t = phase / 100; // 0 to 1
  const hip = 20 * Math.sin(2 * Math.PI * t + Math.PI / 6);
  const knee = 30 - 30 * Math.cos(2 * Math.PI * t);
  const ankle = 10 * Math.sin(2 * Math.PI * t - Math.PI / 3);
  return { hip: safe(hip), knee: safe(knee), ankle: safe(ankle) };
}

/** Ground reaction force */
export function getGRF(phase: number, bodyWeight: number): { fz: number; fx: number } {
  const p = phase / 100;
  if (p <= 0.6) {
    // Stance phase: double-hump pattern
    const fz = bodyWeight * (1.2 - 0.4 * Math.cos(4 * Math.PI * p / 0.6));
    const fx = bodyWeight * 0.15 * Math.sin(2 * Math.PI * p / 0.6);
    return { fz: safe(fz), fx: safe(fx) };
  }
  // Swing phase
  return { fz: 0, fx: 0 };
}

/** Joint angular velocities (numerical derivative) */
export function getJointAngularVelocities(phase: number): {
  hip: number; knee: number; ankle: number;
} {
  const dt = 0.5;
  const a1 = getJointAngles(phase);
  const a2 = getJointAngles(Math.min(100, phase + dt));
  return {
    hip: safe((a2.hip - a1.hip) / (dt / 100)),
    knee: safe((a2.knee - a1.knee) / (dt / 100)),
    ankle: safe((a2.ankle - a1.ankle) / (dt / 100)),
  };
}

/** Simplified joint moments via inverse dynamics */
export function getJointMoments(
  phase: number,
  mass: number,
  height: number
): { hip: number; knee: number; ankle: number } {
  const bw = mass * G;
  const grf = getGRF(phase, bw);
  const angles = getJointAngles(phase);

  // Segment lengths
  const thighL = 0.245 * height;
  const shankL = 0.246 * height;
  const footL = 0.152 * height;

  // Segment masses (fraction of body mass)
  const footMass = 0.0145 * mass;
  const shankMass = 0.0465 * mass;
  const thighMass = 0.1 * mass;

  // Ankle moment: GRF * lever arm at ankle
  const ankleArm = footL * 0.5 * Math.cos((angles.ankle * Math.PI) / 180);
  const ankleMoment = grf.fz * ankleArm - footMass * G * footL * 0.5;

  // Knee moment: propagate from ankle
  const kneeArm = shankL * Math.sin((angles.knee * Math.PI) / 180) * 0.5;
  const kneeMoment = ankleMoment + grf.fz * kneeArm - shankMass * G * shankL * 0.5;

  // Hip moment: propagate from knee
  const hipArm = thighL * Math.sin((angles.hip * Math.PI) / 180) * 0.5;
  const hipMoment = kneeMoment + grf.fz * hipArm - thighMass * G * thighL * 0.5;

  return {
    ankle: safe(ankleMoment),
    knee: safe(kneeMoment),
    hip: safe(hipMoment),
  };
}

/** Hill muscle model - force-length relationship */
export function hillForceLength(normalizedLength: number): number {
  const l = normalizedLength;
  return safe(Math.exp(-(((l - 1) / 0.5) ** 2)));
}

/** Hill muscle model - force-velocity */
export function hillForceVelocity(normalizedVelocity: number, vmax: number): number {
  const v = normalizedVelocity;
  if (v >= 0) {
    // Concentric
    return safe((1 - v / vmax) / (1 + v / (vmax * 0.25)));
  }
  // Eccentric
  return safe(1.5 - 0.5 * ((1 + v / vmax) / (1 - v / (vmax * 0.5))));
}

/** Generate full gait cycle data */
export function generateGaitData(params: BiomechParams): {
  phases: number[];
  hipAngles: number[];
  kneeAngles: number[];
  ankleAngles: number[];
  grfZ: number[];
  grfX: number[];
  hipMoments: number[];
  kneeMoments: number[];
  ankleMoments: number[];
} {
  const phases: number[] = [];
  const hipAngles: number[] = [];
  const kneeAngles: number[] = [];
  const ankleAngles: number[] = [];
  const grfZ: number[] = [];
  const grfX: number[] = [];
  const hipMoments: number[] = [];
  const kneeMoments: number[] = [];
  const ankleMoments: number[] = [];

  const bw = params.mass * G;

  for (let p = 0; p <= 100; p += 1) {
    phases.push(p);
    const angles = getJointAngles(p);
    hipAngles.push(angles.hip);
    kneeAngles.push(angles.knee);
    ankleAngles.push(angles.ankle);

    const grf = getGRF(p, bw);
    grfZ.push(grf.fz);
    grfX.push(grf.fx);

    const moments = getJointMoments(p, params.mass, params.height);
    hipMoments.push(moments.hip);
    kneeMoments.push(moments.knee);
    ankleMoments.push(moments.ankle);
  }

  return {
    phases, hipAngles, kneeAngles, ankleAngles,
    grfZ, grfX, hipMoments, kneeMoments, ankleMoments,
  };
}

const BiomechanicsAnalyzer: React.FC = () => {
  const { syncValue, elapsedTime, pulseCount } = useZeqSync();
  const [activeTab, setActiveTab] = useState<Tab>('skeleton');

  const [params, setParams] = useState<BiomechParams>({
    mass: 70,
    height: 1.75,
    strideLength: 1.4,
    walkingSpeed: 1.3,
    cadence: 110,
    gaitPhase: 25,
  });

  const updateParam = useCallback(
    <K extends keyof BiomechParams>(key: K, value: BiomechParams[K]) => {
      setParams((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const gaitData = useMemo(() => generateGaitData(params), [params]);

  // Animate gait phase
  const animatedPhase = useMemo(() => {
    return (elapsedTime * 30) % 100;
  }, [elapsedTime]);

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'skeleton', label: 'Skeleton', icon: <Bone size={14} /> },
    { id: 'forces', label: 'Forces', icon: <TrendingUp size={14} /> },
    { id: 'muscles', label: 'Muscles', icon: <Activity size={14} /> },
  ];

  const sidebar = (
    <div className="space-y-4">
      {/* Gait Phase */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-cyan-400 mb-3">Gait Phase</h3>
        <label className="block text-xs text-slate-400">
          Phase: <span className="text-orange-400 font-mono">{params.gaitPhase.toFixed(0)}%</span>
          <input type="range" min={0} max={100} step={1} value={params.gaitPhase}
            onChange={(e) => updateParam('gaitPhase', +e.target.value)}
            className="w-full mt-1 accent-cyan-400" />
        </label>
        <div className="flex justify-between text-xs text-slate-500 mt-1">
          <span>Heel Strike</span>
          <span className={params.gaitPhase <= 60 ? 'text-emerald-400' : 'text-slate-500'}>
            Stance {params.gaitPhase <= 60 ? '(active)' : ''}
          </span>
          <span className={params.gaitPhase > 60 ? 'text-orange-400' : 'text-slate-500'}>
            Swing {params.gaitPhase > 60 ? '(active)' : ''}
          </span>
        </div>
        {/* Phase bar */}
        <div className="mt-2 h-2 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${params.gaitPhase}%`,
              background: params.gaitPhase <= 60
                ? 'linear-gradient(90deg, #22d3ee, #22c55e)'
                : 'linear-gradient(90deg, #22d3ee, #f97316)',
            }}
          />
        </div>
      </div>

      {/* Body Parameters */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 space-y-3">
        <h3 className="text-sm font-semibold text-cyan-400 mb-1">Body Parameters</h3>
        <label className="block text-xs text-slate-400">
          Mass: <span className="text-orange-400 font-mono">{params.mass} kg</span>
          <input type="range" min={40} max={120} step={1} value={params.mass}
            onChange={(e) => updateParam('mass', +e.target.value)}
            className="w-full mt-1 accent-cyan-400" />
        </label>
        <label className="block text-xs text-slate-400">
          Height: <span className="text-orange-400 font-mono">{params.height.toFixed(2)} m</span>
          <input type="range" min={1.4} max={2.0} step={0.01} value={params.height}
            onChange={(e) => updateParam('height', +e.target.value)}
            className="w-full mt-1 accent-cyan-400" />
        </label>
        <label className="block text-xs text-slate-400">
          Stride: <span className="text-orange-400 font-mono">{params.strideLength.toFixed(2)} m</span>
          <input type="range" min={0.8} max={1.8} step={0.05} value={params.strideLength}
            onChange={(e) => updateParam('strideLength', +e.target.value)}
            className="w-full mt-1 accent-cyan-400" />
        </label>
      </div>

      {/* Walking Parameters */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 space-y-3">
        <h3 className="text-sm font-semibold text-cyan-400 mb-1">Walking</h3>
        <label className="block text-xs text-slate-400">
          Speed: <span className="text-orange-400 font-mono">{params.walkingSpeed.toFixed(1)} m/s</span>
          <input type="range" min={0.8} max={2.0} step={0.1} value={params.walkingSpeed}
            onChange={(e) => updateParam('walkingSpeed', +e.target.value)}
            className="w-full mt-1 accent-cyan-400" />
        </label>
        <label className="block text-xs text-slate-400">
          Cadence: <span className="text-orange-400 font-mono">{params.cadence} steps/min</span>
          <input type="range" min={80} max={140} step={2} value={params.cadence}
            onChange={(e) => updateParam('cadence', +e.target.value)}
            className="w-full mt-1 accent-cyan-400" />
        </label>
      </div>

      {/* Current Joint Angles */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-cyan-400 mb-2">Joint Angles at {params.gaitPhase}%</h3>
        {(() => {
          const angles = getJointAngles(params.gaitPhase);
          return (
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <span className="text-slate-400">Hip</span>
                <p className="text-cyan-400 font-mono">{angles.hip.toFixed(1)}&deg;</p>
              </div>
              <div>
                <span className="text-slate-400">Knee</span>
                <p className="text-orange-400 font-mono">{angles.knee.toFixed(1)}&deg;</p>
              </div>
              <div>
                <span className="text-slate-400">Ankle</span>
                <p className="text-emerald-400 font-mono">{angles.ankle.toFixed(1)}&deg;</p>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Sync Info */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-2">
          <Clock size={14} className="text-cyan-400" />
          <span className="text-xs text-slate-400">HulyaPulse Sync</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-slate-500">Pulse</span>
            <p className="text-cyan-400 font-mono">{pulseCount}</p>
          </div>
          <div>
            <span className="text-slate-500">Sync</span>
            <p className="text-cyan-400 font-mono">{syncValue.toFixed(4)}</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <AppPageLayout
      title="Biomechanics Analyzer"
      description="Gait cycle analysis with inverse dynamics and muscle modeling"
      domain="life-sciences"
      sidebar={sidebar}
    >
      {/* Tab Navigation */}
      <div className="flex gap-1 bg-slate-800/50 rounded-lg p-1 border border-slate-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm transition-colors ${
              activeTab === tab.id
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'skeleton' && (
        <SkeletonView
          params={params}
          animatedPhase={animatedPhase}
          elapsedTime={elapsedTime}
        />
      )}
      {activeTab === 'forces' && (
        <JointForcePlots
          params={params}
          gaitData={gaitData}
          elapsedTime={elapsedTime}
        />
      )}
      {activeTab === 'muscles' && (
        <BiomechMetrics
          params={params}
          gaitData={gaitData}
        />
      )}
    </AppPageLayout>
  );
};

export default BiomechanicsAnalyzer;
