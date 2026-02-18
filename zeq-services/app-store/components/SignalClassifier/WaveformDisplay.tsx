import React, { useRef, useEffect, useMemo } from 'react';
import { fft } from './index';
import type { SignalType } from './index';

interface WaveformDisplayProps {
  signal: number[];
  sampleRate: number;
  signalType: SignalType;
}

export const WaveformDisplay: React.FC<WaveformDisplayProps> = ({ signal, sampleRate, signalType }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const powerSpectrum = useMemo(() => {
    if (signal.length === 0) return [];
    return fft(signal).power;
  }, [signal]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || signal.length === 0) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    const W = rect.width;
    const H = rect.height;
    const halfH = H / 2 - 20;
    const padL = 50;
    const padR = 20;
    const plotW = W - padL - padR;

    // Clear
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, W, H);

    // ---- Time Domain (top half) ----
    const topY = 15;
    const topH = halfH;

    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`Time Domain - ${signalType.toUpperCase()}`, padL, topY);

    // Background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(padL, topY + 5, plotW, topH);

    // Grid
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 0.5;
    const midY = topY + 5 + topH / 2;
    ctx.beginPath();
    ctx.moveTo(padL, midY);
    ctx.lineTo(padL + plotW, midY);
    ctx.stroke();

    // Y-axis labels for time domain
    ctx.fillStyle = '#64748b';
    ctx.font = '8px monospace';
    ctx.textAlign = 'right';
    ctx.fillText('1.0', padL - 4, topY + 12);
    ctx.fillText('0.0', padL - 4, midY + 3);
    ctx.fillText('-1.0', padL - 4, topY + 5 + topH - 2);

    // Find signal range for scaling
    let sigMin = 0, sigMax = 0;
    for (const v of signal) {
      if (v < sigMin) sigMin = v;
      if (v > sigMax) sigMax = v;
    }
    const sigRange = Math.max(Math.abs(sigMin), Math.abs(sigMax)) || 1;

    // Draw waveform
    ctx.beginPath();
    ctx.strokeStyle = '#22d3ee';
    ctx.lineWidth = 1.5;
    const step = Math.max(1, Math.floor(signal.length / plotW));
    for (let i = 0; i < signal.length; i += step) {
      const x = padL + (i / signal.length) * plotW;
      const normalized = signal[i] / sigRange;
      const y = midY - normalized * (topH / 2 - 4);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // X-axis label
    const duration = signal.length / sampleRate;
    ctx.fillStyle = '#94a3b8';
    ctx.font = '9px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Time (${duration.toFixed(2)}s, ${signal.length} samples @ ${sampleRate}Hz)`, padL + plotW / 2, topY + 5 + topH + 14);

    // ---- Frequency Domain (bottom half) ----
    const botY = H / 2 + 15;
    const botH = halfH;

    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('FFT Power Spectrum', padL, botY);

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(padL, botY + 5, plotW, botH);

    if (powerSpectrum.length > 0) {
      // Find max power for scaling (exclude DC)
      let maxPower = 0;
      for (let i = 1; i < powerSpectrum.length; i++) {
        if (powerSpectrum[i] > maxPower) maxPower = powerSpectrum[i];
      }
      if (maxPower === 0) maxPower = 1;

      // Y-axis
      ctx.fillStyle = '#64748b';
      ctx.font = '8px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(maxPower.toFixed(1), padL - 4, botY + 12);
      ctx.fillText('0', padL - 4, botY + 5 + botH - 2);

      // Draw bars
      const nBins = Math.min(powerSpectrum.length, Math.floor(plotW));
      const binWidth = plotW / nBins;
      const freqRes = sampleRate / (powerSpectrum.length * 2);

      for (let i = 1; i < nBins; i++) {
        const x = padL + i * binWidth;
        const barH = (powerSpectrum[i] / maxPower) * (botH - 4);
        const barY = botY + 5 + botH - barH;

        // Color by frequency band
        const freq = i * freqRes;
        let color = '#22d3ee';
        if (freq < 4) color = '#a855f7';       // delta
        else if (freq < 8) color = '#3b82f6';   // theta
        else if (freq < 13) color = '#22c55e';   // alpha
        else if (freq < 30) color = '#f97316';   // beta
        else color = '#ef4444';                   // gamma

        ctx.fillStyle = color;
        ctx.fillRect(x, barY, Math.max(1, binWidth - 1), barH);
      }

      // Frequency axis ticks
      ctx.fillStyle = '#64748b';
      ctx.font = '8px monospace';
      ctx.textAlign = 'center';
      const maxFreq = sampleRate / 2;
      for (let f = 0; f <= maxFreq; f += Math.ceil(maxFreq / 5)) {
        const x = padL + (f / maxFreq) * plotW;
        ctx.fillText(`${f}`, x, botY + 5 + botH + 12);
      }

      ctx.fillStyle = '#94a3b8';
      ctx.font = '9px sans-serif';
      ctx.fillText('Frequency (Hz)', padL + plotW / 2, botY + 5 + botH + 24);
    }

    // Axes
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1;
    // Time domain axis
    ctx.beginPath();
    ctx.moveTo(padL, topY + 5);
    ctx.lineTo(padL, topY + 5 + topH);
    ctx.lineTo(padL + plotW, topY + 5 + topH);
    ctx.stroke();
    // Freq domain axis
    ctx.beginPath();
    ctx.moveTo(padL, botY + 5);
    ctx.lineTo(padL, botY + 5 + botH);
    ctx.lineTo(padL + plotW, botY + 5 + botH);
    ctx.stroke();
  }, [signal, powerSpectrum, sampleRate, signalType]);

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
      <canvas
        ref={canvasRef}
        className="w-full rounded"
        style={{ height: 440 }}
      />
      <div className="flex gap-4 mt-2 text-xs text-slate-400 flex-wrap">
        <span className="flex items-center gap-1">
          <span className="w-3 h-1.5 rounded inline-block bg-purple-500" /> Delta (0-4Hz)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-1.5 rounded inline-block bg-blue-500" /> Theta (4-8Hz)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-1.5 rounded inline-block bg-green-500" /> Alpha (8-13Hz)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-1.5 rounded inline-block bg-orange-500" /> Beta (13-30Hz)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-1.5 rounded inline-block bg-red-500" /> Gamma (30+Hz)
        </span>
      </div>
    </div>
  );
};
