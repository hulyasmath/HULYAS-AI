import React, { useRef, useEffect, useCallback } from 'react';
import { useZeqSync } from '../SimulationVisualizer/useZeqSync';

export interface EEGBandAmplitudes {
  delta: number;  // 0.5-4 Hz
  theta: number;  // 4-8 Hz
  alpha: number;  // 8-12 Hz
  beta: number;   // 12-30 Hz
  gamma: number;  // 30-100 Hz
}

interface EEGWaveformProps {
  amplitudes: EEGBandAmplitudes;
  sampleRate?: number;
  displaySeconds?: number;
  onSamplesGenerated?: (samples: number[]) => void;
}

const DEFAULT_AMPLITUDES: EEGBandAmplitudes = {
  delta: 20,
  theta: 10,
  alpha: 15,
  beta: 5,
  gamma: 2,
};

/** Generate simulated EEG signal as sum of frequency bands */
export function generateEEGSignal(
  t: number,
  amplitudes: EEGBandAmplitudes,
  alphaModulation: number = 0
): number {
  const { delta, theta, alpha, beta, gamma } = amplitudes;
  // Each band uses a representative frequency
  const sig =
    delta * Math.sin(2 * Math.PI * 2 * t) +
    theta * Math.sin(2 * Math.PI * 6 * t) +
    (alpha + alphaModulation * 5) * Math.sin(2 * Math.PI * 10 * t) +
    beta * Math.sin(2 * Math.PI * 20 * t) +
    gamma * Math.sin(2 * Math.PI * 40 * t);
  return sig;
}

export const EEGWaveform: React.FC<EEGWaveformProps> = ({
  amplitudes = DEFAULT_AMPLITUDES,
  sampleRate = 256,
  displaySeconds = 4,
  onSamplesGenerated,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { syncValue, elapsedTime } = useZeqSync({ amplitude: 0.1 });
  const samplesRef = useRef<number[]>([]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const totalSamples = sampleRate * displaySeconds;

    // Generate samples
    const samples: number[] = [];
    for (let i = 0; i < totalSamples; i++) {
      const t = elapsedTime - displaySeconds + (i / sampleRate);
      samples.push(generateEEGSignal(t, amplitudes, syncValue));
    }
    samplesRef.current = samples;
    onSamplesGenerated?.(samples);

    // Clear
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);

    // Grid
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    // Horizontal center
    ctx.beginPath();
    ctx.moveTo(0, h / 2);
    ctx.lineTo(w, h / 2);
    ctx.stroke();
    // Time markers
    for (let s = 0; s <= displaySeconds; s++) {
      const x = (s / displaySeconds) * w;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    // Amplitude markers
    const ampMarks = [-50, -25, 25, 50];
    for (const amp of ampMarks) {
      const y = h / 2 - (amp / 60) * (h / 2);
      ctx.beginPath();
      ctx.setLineDash([4, 4]);
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw waveform
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 1.5;
    ctx.shadowColor = '#22c55e';
    ctx.shadowBlur = 4;
    ctx.beginPath();
    for (let i = 0; i < totalSamples; i++) {
      const x = (i / totalSamples) * w;
      const y = h / 2 - (samples[i] / 60) * (h / 2);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Axis labels
    ctx.fillStyle = '#64748b';
    ctx.font = '10px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('uV', 4, 12);
    for (const amp of [-50, 0, 50]) {
      const y = h / 2 - (amp / 60) * (h / 2);
      ctx.fillText(`${amp}`, 4, y - 2);
    }
    ctx.textAlign = 'center';
    for (let s = 0; s <= displaySeconds; s++) {
      const x = (s / displaySeconds) * w;
      ctx.fillText(`${s}s`, x, h - 4);
    }

    // Sync indicator
    ctx.fillStyle = '#22d3ee';
    ctx.font = '10px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`sync: ${syncValue.toFixed(3)}`, w - 4, 12);
  }, [amplitudes, syncValue, elapsedTime, sampleRate, displaySeconds, onSamplesGenerated]);

  useEffect(() => {
    draw();
  }, [draw]);

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-slate-200 mb-3">EEG Waveform</h3>
      <canvas
        ref={canvasRef}
        width={700}
        height={240}
        className="w-full rounded border border-slate-600"
        style={{ imageRendering: 'auto' }}
      />
      <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
        <span>Sample Rate: {sampleRate} Hz</span>
        <span>Window: {displaySeconds}s</span>
        <span className="text-cyan-400">Alpha modulated by HulyaPulse</span>
      </div>
    </div>
  );
};
