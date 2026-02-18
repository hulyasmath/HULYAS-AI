import React, { useRef, useEffect, useMemo } from 'react';
import type { LayerInfo } from './index';

interface GradientFlowPlotProps {
  layerInfos: LayerInfo[];
}

export const GradientFlowPlot: React.FC<GradientFlowPlotProps> = ({ layerInfos }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const gradientData = useMemo(() => {
    if (layerInfos.length === 0) return [];

    // Compute cumulative gradient magnitude (product of per-layer magnitudes)
    const data: { layerIndex: number; label: string; magnitude: number; status: string }[] = [];
    let cumulative = 1.0;

    for (let i = layerInfos.length - 1; i >= 0; i--) {
      cumulative *= layerInfos[i].gradientMag;
      const safeMag = isFinite(cumulative) && !isNaN(cumulative) ? cumulative : 0;
      let status = 'normal';
      if (safeMag < 1e-7) status = 'vanishing';
      else if (safeMag > 1e3) status = 'exploding';

      data.unshift({
        layerIndex: i,
        label: `${layerInfos[i].config.type}(${layerInfos[i].config.units})`,
        magnitude: safeMag,
        status,
      });
    }
    return data;
  }, [layerInfos]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || gradientData.length === 0) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    const W = rect.width;
    const H = rect.height;
    const padL = 70;
    const padR = 20;
    const padT = 30;
    const padB = 60;
    const plotW = W - padL - padR;
    const plotH = H - padT - padB;

    // Clear
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, W, H);

    // Compute log-scale range
    const mags = gradientData.map(d => d.magnitude).filter(m => m > 0);
    const minLog = mags.length > 0 ? Math.floor(Math.log10(Math.min(...mags))) - 1 : -10;
    const maxLog = mags.length > 0 ? Math.ceil(Math.log10(Math.max(...mags))) + 1 : 5;
    const logRange = maxLog - minLog || 1;

    const toY = (logVal: number) => padT + plotH - ((logVal - minLog) / logRange) * plotH;

    // Grid lines
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let exp = minLog; exp <= maxLog; exp++) {
      const y = toY(exp);
      ctx.beginPath();
      ctx.moveTo(padL, y);
      ctx.lineTo(W - padR, y);
      ctx.stroke();

      ctx.fillStyle = '#64748b';
      ctx.font = '10px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`1e${exp}`, padL - 6, y + 4);
    }

    // Vanishing gradient band (below 1e-7)
    const vanishY = toY(-7);
    if (vanishY < padT + plotH) {
      ctx.fillStyle = 'rgba(239, 68, 68, 0.08)';
      ctx.fillRect(padL, vanishY, plotW, padT + plotH - vanishY);
      ctx.fillStyle = '#ef4444';
      ctx.font = '9px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('Vanishing Zone', padL + 4, Math.min(vanishY + 12, padT + plotH - 4));
    }

    // Exploding gradient band (above 1e3)
    const explodeY = toY(3);
    if (explodeY > padT) {
      ctx.fillStyle = 'rgba(251, 146, 60, 0.08)';
      ctx.fillRect(padL, padT, plotW, explodeY - padT);
      ctx.fillStyle = '#fb923c';
      ctx.font = '9px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('Exploding Zone', padL + 4, padT + 14);
    }

    // Plot bars
    const n = gradientData.length;
    const barW = Math.min(40, plotW / n - 8);

    for (let i = 0; i < n; i++) {
      const d = gradientData[i];
      const x = padL + (i + 0.5) * (plotW / n) - barW / 2;
      const logMag = d.magnitude > 0 ? Math.log10(d.magnitude) : minLog;
      const y = toY(logMag);
      const baseY = toY(0);
      const barH = Math.abs(baseY - y);

      // Bar color based on status
      let color = '#22d3ee'; // cyan
      if (d.status === 'vanishing') color = '#ef4444';
      else if (d.status === 'exploding') color = '#fb923c';

      ctx.fillStyle = color;
      ctx.fillRect(x, Math.min(y, baseY), barW, Math.max(1, barH));

      // Magnitude label above bar
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '9px monospace';
      ctx.textAlign = 'center';
      const labelY = Math.min(y, baseY) - 4;
      if (d.magnitude > 0) {
        ctx.fillText(d.magnitude.toExponential(1), x + barW / 2, labelY);
      }

      // Layer label below
      ctx.save();
      ctx.translate(x + barW / 2, padT + plotH + 12);
      ctx.rotate(Math.PI / 4);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '9px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(d.label, 0, 0);
      ctx.restore();
    }

    // Axes
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(padL, padT);
    ctx.lineTo(padL, padT + plotH);
    ctx.lineTo(W - padR, padT + plotH);
    ctx.stroke();

    // Y-axis label
    ctx.save();
    ctx.translate(14, padT + plotH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Gradient Magnitude (log scale)', 0, 0);
    ctx.restore();

    // Title
    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Gradient Flow Analysis', padL, 16);
  }, [gradientData]);

  if (layerInfos.length === 0) {
    return (
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8 text-center text-slate-400">
        Add layers to see gradient flow analysis.
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
      <canvas
        ref={canvasRef}
        className="w-full rounded"
        style={{ height: 360 }}
      />
      <div className="flex gap-4 mt-3 text-xs text-slate-400">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-cyan-400 inline-block" /> Normal
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-red-500 inline-block" /> Vanishing (&lt; 1e-7)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-orange-400 inline-block" /> Exploding (&gt; 1e3)
        </span>
      </div>
    </div>
  );
};
