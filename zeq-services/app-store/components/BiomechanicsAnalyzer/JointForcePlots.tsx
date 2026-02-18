import React, { useRef, useEffect } from 'react';
import type { BiomechParams } from './index';

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
  elapsedTime: number;
}

function drawPlot(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  w: number,
  h: number,
  title: string,
  yLabel: string,
  datasets: { data: number[]; color: string; label: string }[],
  phases: number[],
  currentPhase: number
) {
  const pad = { top: 25, right: 10, bottom: 30, left: 55 };
  const plotW = w - pad.left - pad.right;
  const plotH = h - pad.top - pad.bottom;

  // Find data range
  let minY = 0;
  let maxY = 0;
  for (const ds of datasets) {
    for (const v of ds.data) {
      if (v < minY) minY = v;
      if (v > maxY) maxY = v;
    }
  }
  const rangeY = maxY - minY || 1;
  minY -= rangeY * 0.1;
  maxY += rangeY * 0.1;
  const totalRange = maxY - minY;

  const toX = (p: number) => x0 + pad.left + (p / 100) * plotW;
  const toY = (v: number) => x0 ? y0 + pad.top + plotH - ((v - minY) / totalRange) * plotH : y0 + pad.top + plotH - ((v - minY) / totalRange) * plotH;
  const toYAbs = (v: number) => y0 + pad.top + plotH - ((v - minY) / totalRange) * plotH;

  // Background
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(x0, y0, w, h);

  // Grid
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 0.5;
  for (let i = 0; i <= 5; i++) {
    const gy = y0 + pad.top + (i / 5) * plotH;
    ctx.beginPath();
    ctx.moveTo(x0 + pad.left, gy);
    ctx.lineTo(x0 + pad.left + plotW, gy);
    ctx.stroke();
  }

  // Stance/swing divider
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  const divX = toX(60);
  ctx.beginPath();
  ctx.moveTo(divX, y0 + pad.top);
  ctx.lineTo(divX, y0 + pad.top + plotH);
  ctx.stroke();
  ctx.setLineDash([]);

  // Zero line
  if (minY < 0 && maxY > 0) {
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(x0 + pad.left, toYAbs(0));
    ctx.lineTo(x0 + pad.left + plotW, toYAbs(0));
    ctx.stroke();
  }

  // Data curves
  for (const ds of datasets) {
    ctx.strokeStyle = ds.color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < phases.length; i++) {
      const px = toX(phases[i]);
      const py = toYAbs(ds.data[i]);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
  }

  // Current phase indicator
  const cpx = toX(currentPhase);
  ctx.strokeStyle = 'rgba(255,255,255,0.4)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cpx, y0 + pad.top);
  ctx.lineTo(cpx, y0 + pad.top + plotH);
  ctx.stroke();

  // Axes
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x0 + pad.left, y0 + pad.top);
  ctx.lineTo(x0 + pad.left, y0 + pad.top + plotH);
  ctx.lineTo(x0 + pad.left + plotW, y0 + pad.top + plotH);
  ctx.stroke();

  // Labels
  ctx.fillStyle = '#e2e8f0';
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(title, x0 + pad.left, y0 + 14);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '9px sans-serif';
  ctx.textAlign = 'center';
  for (let i = 0; i <= 5; i++) {
    const p = (i / 5) * 100;
    ctx.fillText(`${p}%`, toX(p), y0 + h - 5);
  }

  ctx.textAlign = 'right';
  ctx.font = '9px monospace';
  for (let i = 0; i <= 4; i++) {
    const v = minY + (1 - i / 4) * totalRange;
    ctx.fillText(v.toFixed(0), x0 + pad.left - 4, y0 + pad.top + (i / 4) * plotH + 3);
  }

  // Y-axis label
  ctx.save();
  ctx.translate(x0 + 10, y0 + pad.top + plotH / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillStyle = '#94a3b8';
  ctx.font = '9px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(yLabel, 0, 0);
  ctx.restore();

  // Legend
  const legendX = x0 + pad.left + plotW - 10;
  datasets.forEach((ds, idx) => {
    const ly = y0 + pad.top + 8 + idx * 14;
    ctx.fillStyle = ds.color;
    ctx.fillRect(legendX - 50, ly - 4, 10, 3);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '9px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(ds.label, legendX - 36, ly);
  });
}

const JointForcePlots: React.FC<Props> = ({ params, gaitData, elapsedTime }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();
    const w = rect.width;
    const plotH = 200;
    const totalH = plotH * 3 + 20;

    canvas.width = w * dpr;
    canvas.height = totalH * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${totalH}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, totalH);

    const animPhase = (elapsedTime * 30) % 100;

    // Plot 1: Joint Angles
    drawPlot(ctx, 0, 0, w, plotH, 'Joint Angles over Gait Cycle', 'Degrees', [
      { data: gaitData.hipAngles, color: '#22d3ee', label: 'Hip' },
      { data: gaitData.kneeAngles, color: '#f97316', label: 'Knee' },
      { data: gaitData.ankleAngles, color: '#a855f7', label: 'Ankle' },
    ], gaitData.phases, params.gaitPhase);

    // Plot 2: Ground Reaction Forces
    drawPlot(ctx, 0, plotH + 5, w, plotH, 'Ground Reaction Forces', 'Force (N)', [
      { data: gaitData.grfZ, color: '#22c55e', label: 'Vertical' },
      { data: gaitData.grfX, color: '#ef4444', label: 'A-P' },
    ], gaitData.phases, params.gaitPhase);

    // Plot 3: Joint Moments
    drawPlot(ctx, 0, (plotH + 5) * 2, w, plotH, 'Joint Moments', 'Nm', [
      { data: gaitData.hipMoments, color: '#22d3ee', label: 'Hip' },
      { data: gaitData.kneeMoments, color: '#f97316', label: 'Knee' },
      { data: gaitData.ankleMoments, color: '#a855f7', label: 'Ankle' },
    ], gaitData.phases, params.gaitPhase);

  }, [params, gaitData, elapsedTime]);

  return (
    <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-4">
      <div ref={containerRef} className="w-full">
        <canvas ref={canvasRef} className="w-full rounded" />
      </div>
      <div className="flex items-center gap-6 mt-3 text-xs text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-cyan-400 inline-block" /> Hip
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-orange-400 inline-block" /> Knee
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-purple-400 inline-block" /> Ankle
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-emerald-500 inline-block" /> GRF Vertical
        </span>
      </div>
    </div>
  );
};

export default JointForcePlots;
