import React, { useMemo } from 'react';
import { PrecisionBadge } from '../shared/PrecisionBadge';
import { EntropyVerifier } from '../shared/EntropyVerifier';
import { KolmogorovChecker } from '../shared/KolmogorovChecker';
import {
  type BiomechParams,
  getJointAngles,
  getGRF,
  getJointMoments,
  hillForceLength,
  hillForceVelocity,
} from './index';

interface GaitData {
  phases: number[];
  hipAngles: number[];
  kneeAngles: number[];
  ankleAngles: number[];
  grfZ: number[];
  grfX: number[];
  hipMoments: number[];
  kneeMoments: number[];
  ankleMoments: number[];
}

interface Props {
  params: BiomechParams;
  gaitData: GaitData;
}

const G = 9.81;

function safe(v: number): number {
  return Number.isFinite(v) ? v : 0;
}

const BiomechMetrics: React.FC<Props> = ({ params, gaitData }) => {
  const bw = params.mass * G;

  // Peak values
  const peaks = useMemo(() => {
    let peakGRFz = 0;
    let peakHipMoment = 0;
    let peakKneeMoment = 0;
    let peakAnkleMoment = 0;

    for (let i = 0; i < gaitData.phases.length; i++) {
      peakGRFz = Math.max(peakGRFz, gaitData.grfZ[i]);
      peakHipMoment = Math.max(peakHipMoment, Math.abs(gaitData.hipMoments[i]));
      peakKneeMoment = Math.max(peakKneeMoment, Math.abs(gaitData.kneeMoments[i]));
      peakAnkleMoment = Math.max(peakAnkleMoment, Math.abs(gaitData.ankleMoments[i]));
    }

    return {
      grfZ: safe(peakGRFz),
      hipMoment: safe(peakHipMoment),
      kneeMoment: safe(peakKneeMoment),
      ankleMoment: safe(peakAnkleMoment),
    };
  }, [gaitData]);

  // Stride parameters
  const strideParams = useMemo(() => {
    const strideDuration = 60 / (params.cadence / 2); // seconds
    const stanceTime = strideDuration * 0.6;
    const swingTime = strideDuration * 0.4;
    const stepLength = params.strideLength / 2;
    return { strideDuration, stanceTime, swingTime, stepLength };
  }, [params]);

  // Muscle activations at current phase
  const muscleActivations = useMemo(() => {
    const phase = params.gaitPhase;
    const p = phase / 100;

    // Simplified activation patterns based on gait phase
    const gluteusMax = phase <= 30 ? 0.8 * Math.sin((Math.PI * phase) / 30) : 0.1;
    const quadriceps = phase <= 40 ? 0.7 * Math.sin((Math.PI * phase) / 40) : phase > 70 ? 0.5 * Math.sin((Math.PI * (phase - 70)) / 30) : 0.05;
    const hamstrings = phase <= 15 ? 0.6 : phase > 80 ? 0.7 * Math.sin((Math.PI * (phase - 80)) / 20) : 0.1;
    const gastrocnemius = phase >= 20 && phase <= 50 ? 0.9 * Math.sin((Math.PI * (phase - 20)) / 30) : 0.05;
    const tibialisAnterior = phase >= 55 && phase <= 75 ? 0.6 * Math.sin((Math.PI * (phase - 55)) / 20) : phase <= 10 ? 0.4 : 0.05;

    return {
      gluteusMax: safe(Math.min(1, Math.max(0, gluteusMax))),
      quadriceps: safe(Math.min(1, Math.max(0, quadriceps))),
      hamstrings: safe(Math.min(1, Math.max(0, hamstrings))),
      gastrocnemius: safe(Math.min(1, Math.max(0, gastrocnemius))),
      tibialisAnterior: safe(Math.min(1, Math.max(0, tibialisAnterior))),
    };
  }, [params.gaitPhase]);

  // Hill model outputs
  const hillOutputs = useMemo(() => {
    const normLength = 0.9 + 0.2 * Math.sin((2 * Math.PI * params.gaitPhase) / 100);
    const normVelocity = 0.3 * Math.cos((2 * Math.PI * params.gaitPhase) / 100);
    const vmax = 10;

    return {
      forceLength: hillForceLength(normLength),
      forceVelocity: hillForceVelocity(normVelocity, vmax),
      normLength,
      normVelocity,
    };
  }, [params.gaitPhase]);

  // Reference peak GRF
  const refPeakGRF = 1.2 * bw;

  const serializedState = useMemo(
    () =>
      JSON.stringify({
        mass: params.mass,
        height: params.height,
        phase: params.gaitPhase,
        peakGRF: peaks.grfZ,
        activations: muscleActivations,
      }),
    [params, peaks, muscleActivations]
  );

  const muscles = [
    { name: 'Gluteus Maximus', activation: muscleActivations.gluteusMax, color: 'bg-cyan-400' },
    { name: 'Quadriceps', activation: muscleActivations.quadriceps, color: 'bg-orange-400' },
    { name: 'Hamstrings', activation: muscleActivations.hamstrings, color: 'bg-purple-400' },
    { name: 'Gastrocnemius', activation: muscleActivations.gastrocnemius, color: 'bg-emerald-400' },
    { name: 'Tibialis Anterior', activation: muscleActivations.tibialisAnterior, color: 'bg-amber-400' },
  ];

  return (
    <div className="space-y-4">
      {/* Peak Joint Metrics */}
      <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-cyan-400 mb-4">Peak Values Over Gait Cycle</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-900/50 rounded-lg p-3">
            <span className="text-xs text-slate-400 block mb-1">Peak GRF (Fz)</span>
            <span className="text-lg font-mono font-bold text-emerald-400">{peaks.grfZ.toFixed(0)}</span>
            <span className="text-xs text-slate-500 ml-1">N</span>
            <span className="text-xs text-slate-500 block">{safe(peaks.grfZ / bw).toFixed(2)} BW</span>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-3">
            <span className="text-xs text-slate-400 block mb-1">Peak Hip Moment</span>
            <span className="text-lg font-mono font-bold text-cyan-400">{peaks.hipMoment.toFixed(1)}</span>
            <span className="text-xs text-slate-500 ml-1">Nm</span>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-3">
            <span className="text-xs text-slate-400 block mb-1">Peak Knee Moment</span>
            <span className="text-lg font-mono font-bold text-orange-400">{peaks.kneeMoment.toFixed(1)}</span>
            <span className="text-xs text-slate-500 ml-1">Nm</span>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-3">
            <span className="text-xs text-slate-400 block mb-1">Peak Ankle Moment</span>
            <span className="text-lg font-mono font-bold text-purple-400">{peaks.ankleMoment.toFixed(1)}</span>
            <span className="text-xs text-slate-500 ml-1">Nm</span>
          </div>
        </div>
      </div>

      {/* Muscle Activations */}
      <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-cyan-400 mb-4">
          Muscle Activations at {params.gaitPhase}%
        </h3>
        <div className="space-y-3">
          {muscles.map((m) => (
            <div key={m.name} className="flex items-center gap-3">
              <span className="text-xs text-slate-300 w-36 flex-shrink-0">{m.name}</span>
              <div className="flex-1 h-4 bg-slate-900/50 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${m.color} transition-all duration-300`}
                  style={{ width: `${m.activation * 100}%`, opacity: 0.3 + m.activation * 0.7 }}
                />
              </div>
              <span className="text-xs font-mono text-slate-400 w-12 text-right">
                {(m.activation * 100).toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Hill Muscle Model */}
      <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-cyan-400 mb-4">Hill Muscle Model</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-900/50 rounded-lg p-3">
            <span className="text-xs text-slate-400 block mb-1">Norm. Length</span>
            <span className="text-lg font-mono font-bold text-slate-300">{hillOutputs.normLength.toFixed(3)}</span>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-3">
            <span className="text-xs text-slate-400 block mb-1">Force-Length Factor</span>
            <span className="text-lg font-mono font-bold text-cyan-400">{hillOutputs.forceLength.toFixed(3)}</span>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-3">
            <span className="text-xs text-slate-400 block mb-1">Norm. Velocity</span>
            <span className="text-lg font-mono font-bold text-slate-300">{hillOutputs.normVelocity.toFixed(3)}</span>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-3">
            <span className="text-xs text-slate-400 block mb-1">Force-Velocity Factor</span>
            <span className="text-lg font-mono font-bold text-orange-400">{hillOutputs.forceVelocity.toFixed(3)}</span>
          </div>
        </div>
      </div>

      {/* Stride Parameters */}
      <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-cyan-400 mb-4">Stride Parameters</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-900/50 rounded-lg p-3">
            <span className="text-xs text-slate-400 block mb-1">Stride Duration</span>
            <span className="text-lg font-mono font-bold text-slate-300">{strideParams.strideDuration.toFixed(2)}</span>
            <span className="text-xs text-slate-500 ml-1">s</span>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-3">
            <span className="text-xs text-slate-400 block mb-1">Stance Time</span>
            <span className="text-lg font-mono font-bold text-emerald-400">{strideParams.stanceTime.toFixed(2)}</span>
            <span className="text-xs text-slate-500 ml-1">s</span>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-3">
            <span className="text-xs text-slate-400 block mb-1">Swing Time</span>
            <span className="text-lg font-mono font-bold text-orange-400">{strideParams.swingTime.toFixed(2)}</span>
            <span className="text-xs text-slate-500 ml-1">s</span>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-3">
            <span className="text-xs text-slate-400 block mb-1">Step Length</span>
            <span className="text-lg font-mono font-bold text-slate-300">{strideParams.stepLength.toFixed(2)}</span>
            <span className="text-xs text-slate-500 ml-1">m</span>
          </div>
        </div>
      </div>

      {/* Precision Verification */}
      <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-cyan-400 mb-3">Precision Verification</h3>
        <div className="space-y-2">
          <PrecisionBadge
            computed={peaks.grfZ}
            reference={refPeakGRF}
            label="Peak GRF (computed vs 1.2*BW reference)"
          />
          <PrecisionBadge
            computed={hillForceLength(1.0)}
            reference={1.0}
            label="Hill F-L at optimal length (should be 1.0)"
          />
          <PrecisionBadge
            computed={strideParams.stanceTime + strideParams.swingTime}
            reference={strideParams.strideDuration}
            label="Stance + Swing = Stride Duration"
          />
        </div>
      </div>

      {/* Entropy & Kolmogorov */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <EntropyVerifier data={gaitData.grfZ} label="GRF Profile Entropy" />
        <KolmogorovChecker data={serializedState} label="Biomech State Complexity" />
      </div>
    </div>
  );
};

export default BiomechMetrics;
