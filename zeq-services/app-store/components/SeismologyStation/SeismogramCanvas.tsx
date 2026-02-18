import React, { useRef, useEffect } from 'react';
import { Station } from './index';

interface SeismogramCanvasProps {
  traces: { data: number[]; tp: number; ts: number }[];
  stations: Station[];
  duration: number;
  sampleRate: number;
  syncValue: number;
  elapsedTime: number;
}

export const SeismogramCanvas: React.FC<SeismogramCanvasProps> = ({
  traces, stations, duration, sampleRate, syncValue, elapsedTime,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    const W = rect.width;
    const H = rect.height;
    const margin = { top: 40, right: 30, bottom: 50, left: 80 };
    const plotW = W - margin.left - margin.right;
    const plotH = H - margin.top - margin.bottom;

    // Background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, W, H);

    // Title
    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px monospace';
    ctx.fillText('Multi-Station Seismogram', margin.left, 20);

    // Sync indicator
    const pulseAlpha = 0.3 + Math.abs(syncValue) * 2;
    ctx.fillStyle = `rgba(34, 211, 238, ${Math.min(pulseAlpha, 0.8)})`;
    ctx.beginPath();
    ctx.arc(W - 20, 20, 4, 0, Math.PI * 2);
    ctx.fill();

    const traceCount = traces.length;
    const traceHeight = plotH / traceCount;

    // Time axis
    const timeScale = plotW / duration;

    // Grid lines
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 0.5;
    const timeStep = Math.max(5, Math.ceil(duration / 20) * 5);
    for (let t = 0; t <= duration; t += timeStep) {
      const x = margin.left + t * timeScale;
      ctx.beginPath();
      ctx.moveTo(x, margin.top);
      ctx.lineTo(x, margin.top + plotH);
      ctx.stroke();

      ctx.fillStyle = '#64748b';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${t}s`, x, H - margin.bottom + 15);
    }

    // X-axis label
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Time (seconds)', W / 2, H - 10);

    // Draw each trace
    for (let s = 0; s < traceCount; s++) {
      const trace = traces[s];
      const data = trace.data;
      const baseY = margin.top + s * traceHeight + traceHeight / 2;

      // Station label
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '11px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(stations[s]?.label || `STA-${s + 1}`, margin.left - 10, baseY + 4);

      // Find max amplitude for scaling
      let maxAmp = 0;
      for (let i = 0; i < data.length; i++) {
        const a = Math.abs(data[i]);
        if (isFinite(a) && a > maxAmp) maxAmp = a;
      }
      if (maxAmp === 0) maxAmp = 1;
      const ampScale = (traceHeight * 0.4) / maxAmp;

      // Baseline
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(margin.left, baseY);
      ctx.lineTo(margin.left + plotW, baseY);
      ctx.stroke();

      // Waveform
      ctx.strokeStyle = '#22d3ee';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      let started = false;
      for (let i = 0; i < data.length; i++) {
        const t = i / sampleRate;
        const x = margin.left + t * timeScale;
        const y = baseY - data[i] * ampScale;
        if (x < margin.left || x > margin.left + plotW) continue;
        if (!started) { ctx.moveTo(x, y); started = true; } else { ctx.lineTo(x, y); }
      }
      ctx.stroke();

      // P-wave arrival marker
      if (trace.tp > 0 && trace.tp < duration) {
        const px = margin.left + trace.tp * timeScale;
        ctx.strokeStyle = '#22d3ee';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 3]);
        ctx.beginPath();
        ctx.moveTo(px, baseY - traceHeight * 0.4);
        ctx.lineTo(px, baseY + traceHeight * 0.4);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#22d3ee';
        ctx.font = '9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('P', px, baseY - traceHeight * 0.4 - 3);
      }

      // S-wave arrival marker
      if (trace.ts > 0 && trace.ts < duration) {
        const sx = margin.left + trace.ts * timeScale;
        ctx.strokeStyle = '#fb923c';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 3]);
        ctx.beginPath();
        ctx.moveTo(sx, baseY - traceHeight * 0.4);
        ctx.lineTo(sx, baseY + traceHeight * 0.4);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#fb923c';
        ctx.font = '9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('S', sx, baseY - traceHeight * 0.4 - 3);
      }

      // Separator line
      if (s < traceCount - 1) {
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        const sepY = margin.top + (s + 1) * traceHeight;
        ctx.moveTo(margin.left, sepY);
        ctx.lineTo(margin.left + plotW, sepY);
        ctx.stroke();
      }
    }

    // Border
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.strokeRect(margin.left, margin.top, plotW, plotH);
  }, [traces, stations, duration, sampleRate, syncValue, elapsedTime]);

  return (
    <div ref={containerRef} className="bg-slate-900/50 border border-slate-700 rounded-lg overflow-hidden" style={{ height: 500 }}>
      <canvas ref={canvasRef} />
    </div>
  );
};
