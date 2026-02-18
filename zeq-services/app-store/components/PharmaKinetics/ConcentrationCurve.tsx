import React, { useRef, useEffect, useMemo } from 'react';
import type { PKParams } from './index';

interface Props {
  params: PKParams;
  timeSeries: { times: number[]; concentrations: number[] };
  pkResults: { cmax: number; tmax: number; auc: number };
  elapsedTime: number;
}

const ConcentrationCurve: React.FC<Props> = ({ params, timeSeries, pkResults, elapsedTime }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { times, concentrations } = timeSeries;

  const bounds = useMemo(() => {
    const tMax = times[times.length - 1] || 1;
    let cMax = 0;
    for (const c of concentrations) {
      if (c > cMax) cMax = c;
    }
    cMax = Math.max(cMax, params.mtc * 1.2, 1);
    return { tMax, cMax };
  }, [times, concentrations, params.mtc]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();
    const w = rect.width;
    const h = 420;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const pad = { top: 30, right: 30, bottom: 50, left: 60 };
    const plotW = w - pad.left - pad.right;
    const plotH = h - pad.top - pad.bottom;

    const toX = (t: number) => pad.left + (t / bounds.tMax) * plotW;
    const toY = (c: number) => pad.top + plotH - (c / bounds.cMax) * plotH;

    // Clear
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);

    // Grid
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 0.5;
    const numGridY = 5;
    for (let i = 0; i <= numGridY; i++) {
      const y = pad.top + (i / numGridY) * plotH;
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(w - pad.right, y);
      ctx.stroke();
    }
    const numGridX = 8;
    for (let i = 0; i <= numGridX; i++) {
      const x = pad.left + (i / numGridX) * plotW;
      ctx.beginPath();
      ctx.moveTo(x, pad.top);
      ctx.lineTo(x, pad.top + plotH);
      ctx.stroke();
    }

    // Therapeutic window (green band between MEC and MTC)
    const mecY = toY(params.mec);
    const mtcY = toY(params.mtc);
    ctx.fillStyle = 'rgba(34, 197, 94, 0.08)';
    ctx.fillRect(pad.left, mtcY, plotW, mecY - mtcY);

    // MEC line
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(pad.left, mecY);
    ctx.lineTo(w - pad.right, mecY);
    ctx.stroke();
    ctx.fillStyle = '#22c55e';
    ctx.font = '10px monospace';
    ctx.fillText('MEC', w - pad.right + 4, mecY + 3);

    // MTC line
    ctx.strokeStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(pad.left, mtcY);
    ctx.lineTo(w - pad.right, mtcY);
    ctx.stroke();
    ctx.fillStyle = '#ef4444';
    ctx.fillText('MTC', w - pad.right + 4, mtcY + 3);
    ctx.setLineDash([]);

    // Dosing markers
    ctx.strokeStyle = '#f97316';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 3]);
    for (let i = 0; i < params.numDoses; i++) {
      const tx = toX(i * params.dosingInterval);
      ctx.beginPath();
      ctx.moveTo(tx, pad.top);
      ctx.lineTo(tx, pad.top + plotH);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // Concentration curve
    ctx.strokeStyle = '#22d3ee';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < times.length; i++) {
      const x = toX(times[i]);
      const y = toY(concentrations[i]);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Fill under curve (translucent)
    ctx.fillStyle = 'rgba(34, 211, 238, 0.05)';
    ctx.beginPath();
    ctx.moveTo(toX(times[0]), toY(0));
    for (let i = 0; i < times.length; i++) {
      ctx.lineTo(toX(times[i]), toY(concentrations[i]));
    }
    ctx.lineTo(toX(times[times.length - 1]), toY(0));
    ctx.closePath();
    ctx.fill();

    // Cmax / Tmax marker
    const cmaxX = toX(pkResults.tmax);
    const cmaxY = toY(pkResults.cmax);
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.arc(cmaxX, cmaxY, 5, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillStyle = '#f97316';
    ctx.font = 'bold 11px monospace';
    ctx.fillText(`Cmax=${pkResults.cmax.toFixed(2)}`, cmaxX + 8, cmaxY - 8);
    ctx.font = '10px monospace';
    ctx.fillText(`Tmax=${pkResults.tmax.toFixed(2)}h`, cmaxX + 8, cmaxY + 6);

    // Animated time indicator
    const totalTime = bounds.tMax;
    const animT = (elapsedTime % (totalTime * 2)) * 0.5;
    if (animT <= totalTime) {
      const ax = toX(animT);
      ctx.strokeStyle = 'rgba(249, 115, 22, 0.6)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(ax, pad.top);
      ctx.lineTo(ax, pad.top + plotH);
      ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad.left, pad.top);
    ctx.lineTo(pad.left, pad.top + plotH);
    ctx.lineTo(w - pad.right, pad.top + plotH);
    ctx.stroke();

    // Axis labels
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    for (let i = 0; i <= numGridX; i++) {
      const t = (i / numGridX) * bounds.tMax;
      ctx.fillText(t.toFixed(0) + 'h', pad.left + (i / numGridX) * plotW, h - pad.bottom + 18);
    }
    ctx.textAlign = 'right';
    for (let i = 0; i <= numGridY; i++) {
      const c = ((numGridY - i) / numGridY) * bounds.cMax;
      ctx.fillText(c.toFixed(1), pad.left - 8, pad.top + (i / numGridY) * plotH + 4);
    }

    // Axis titles
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Time (hours)', w / 2, h - 5);
    ctx.save();
    ctx.translate(14, h / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Concentration (mg/L)', 0, 0);
    ctx.restore();

    // Title
    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Plasma Concentration vs Time', pad.left, 18);
  }, [times, concentrations, bounds, params, pkResults, elapsedTime]);

  return (
    <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-4">
      <div ref={containerRef} className="w-full">
        <canvas ref={canvasRef} className="w-full rounded" />
      </div>
      <div className="flex items-center gap-6 mt-3 text-xs text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-cyan-400 inline-block" /> Concentration
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-emerald-500 inline-block" style={{ borderBottom: '1px dashed' }} /> MEC
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-red-500 inline-block" style={{ borderBottom: '1px dashed' }} /> MTC
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 bg-orange-400 rounded-full inline-block" /> Cmax/Tmax
        </span>
      </div>
    </div>
  );
};

export default ConcentrationCurve;
