import React, { useRef, useEffect, useMemo } from 'react';
import { TidalConstituent, tidalHeight, ekmanProfile, ekmanDepth } from './index';

interface TidalPredictionProps {
  constituents: TidalConstituent[];
  latitude: number;
  windSpeed: number;
  syncValue: number;
  elapsedTime: number;
}

export const TidalPrediction: React.FC<TidalPredictionProps> = ({
  constituents, latitude, windSpeed, syncValue, elapsedTime,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Precompute 30-day tidal data
  const tidalData = useMemo(() => {
    const hours = 30 * 24; // 30 days
    const dt = 0.5; // 30-min intervals
    const n = Math.floor(hours / dt);
    const combined: number[] = [];
    const individual: number[][] = constituents.map(() => []);

    for (let i = 0; i < n; i++) {
      const t = i * dt;
      let total = 0;
      for (let j = 0; j < constituents.length; j++) {
        const c = constituents[j];
        const h = c.amplitude * Math.cos((2 * Math.PI * t) / c.period - c.phase);
        individual[j].push(isFinite(h) ? h : 0);
        total += isFinite(h) ? h : 0;
      }
      combined.push(total);
    }

    return { combined, individual, dt, n };
  }, [constituents]);

  // Ekman spiral data
  const ekmanData = useMemo(() => {
    const De = ekmanDepth(latitude);
    const depths: number[] = [];
    const vectors: { u: number; v: number }[] = [];
    const numLayers = 20;
    for (let i = 0; i <= numLayers; i++) {
      const z = -(i / numLayers) * De * 1.5;
      depths.push(z);
      vectors.push(ekmanProfile(z, windSpeed, latitude));
    }
    return { depths, vectors, De };
  }, [latitude, windSpeed]);

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

    // Background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, W, H);

    // Layout: top 60% = tidal chart, bottom 40% = Ekman spiral
    const tidalH = H * 0.58;
    const ekmanH = H * 0.38;
    const gap = H * 0.04;

    // --- TIDAL PREDICTION CHART ---
    const tm = { top: 30, right: 20, bottom: 25, left: 55 };
    const tpW = W - tm.left - tm.right;
    const tpH = tidalH - tm.top - tm.bottom;

    // Find y range
    let yMin = Infinity, yMax = -Infinity;
    for (const v of tidalData.combined) {
      if (v < yMin) yMin = v;
      if (v > yMax) yMax = v;
    }
    const yPad = (yMax - yMin) * 0.1 || 1;
    yMin -= yPad;
    yMax += yPad;

    const xScale = tpW / (tidalData.n * tidalData.dt);
    const yScale = tpH / (yMax - yMin);
    const toX = (t: number) => tm.left + t * xScale;
    const toY = (h: number) => tm.top + (yMax - h) * yScale;

    // Title
    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px monospace';
    ctx.fillText('30-Day Tidal Prediction', tm.left, 18);

    // Grid
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 0.5;
    for (let day = 0; day <= 30; day += 5) {
      const x = toX(day * 24);
      ctx.beginPath();
      ctx.moveTo(x, tm.top);
      ctx.lineTo(x, tm.top + tpH);
      ctx.stroke();
      ctx.fillStyle = '#64748b';
      ctx.font = '9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`Day ${day}`, x, tm.top + tpH + 14);
    }

    // Zero line
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    const zeroY = toY(0);
    ctx.moveTo(tm.left, zeroY);
    ctx.lineTo(tm.left + tpW, zeroY);
    ctx.stroke();

    // Y-axis labels
    const ySteps = 5;
    for (let i = 0; i <= ySteps; i++) {
      const val = yMin + (yMax - yMin) * (i / ySteps);
      const y = toY(val);
      ctx.fillStyle = '#64748b';
      ctx.font = '9px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`${val.toFixed(1)}m`, tm.left - 5, y + 3);
    }

    // Individual constituent traces (lighter)
    const constColors = ['rgba(34,211,238,0.3)', 'rgba(251,146,60,0.3)', 'rgba(167,139,250,0.3)', 'rgba(52,211,153,0.3)'];
    for (let c = 0; c < tidalData.individual.length; c++) {
      const trace = tidalData.individual[c];
      ctx.beginPath();
      ctx.strokeStyle = constColors[c] || 'rgba(148,163,184,0.2)';
      ctx.lineWidth = 0.8;
      for (let i = 0; i < trace.length; i++) {
        const t = i * tidalData.dt;
        const x = toX(t);
        const y = toY(trace[i]);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // Combined tidal trace
    ctx.beginPath();
    ctx.strokeStyle = '#22d3ee';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < tidalData.combined.length; i++) {
      const t = i * tidalData.dt;
      const x = toX(t);
      const y = toY(tidalData.combined[i]);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Spring/Neap labels
    // Spring tides occur when M2 and S2 are in phase (~every 14.77 days)
    const springDays = [0, 14.77, 29.53];
    for (const sd of springDays) {
      if (sd <= 30) {
        const x = toX(sd * 24);
        ctx.fillStyle = '#fb923c';
        ctx.font = '8px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('Spring', x, tm.top - 5);
        ctx.strokeStyle = 'rgba(251,146,60,0.3)';
        ctx.lineWidth = 0.5;
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.moveTo(x, tm.top);
        ctx.lineTo(x, tm.top + tpH);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }
    const neapDays = [7.38, 22.15];
    for (const nd of neapDays) {
      const x = toX(nd * 24);
      ctx.fillStyle = '#67e8f9';
      ctx.font = '8px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('Neap', x, tm.top - 5);
    }

    // Legend
    const legendX = tm.left + tpW - 150;
    const legendY = tm.top + 10;
    const legendItems = constituents.map((c, i) => ({ name: c.name, color: constColors[i] }));
    legendItems.push({ name: 'Combined', color: '#22d3ee' });
    for (let i = 0; i < legendItems.length; i++) {
      ctx.fillStyle = legendItems[i].color;
      ctx.fillRect(legendX, legendY + i * 12, 10, 2);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '8px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(legendItems[i].name, legendX + 14, legendY + i * 12 + 4);
    }

    // Border
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.strokeRect(tm.left, tm.top, tpW, tpH);

    // --- EKMAN SPIRAL DIAGRAM ---
    const ekmanTop = tidalH + gap;
    const ekCx = W * 0.5;
    const ekCy = ekmanTop + ekmanH * 0.5;
    const ekR = Math.min(W * 0.35, ekmanH * 0.4);

    // Title
    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('Ekman Spiral', tm.left, ekmanTop + 15);

    // Find max vector magnitude for scaling
    let maxMag = 0;
    for (const v of ekmanData.vectors) {
      const mag = Math.sqrt(v.u * v.u + v.v * v.v);
      if (isFinite(mag) && mag > maxMag) maxMag = mag;
    }
    if (maxMag === 0) maxMag = 1;
    const vecScale = ekR / maxMag;

    // Draw axes
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(ekCx - ekR - 20, ekCy);
    ctx.lineTo(ekCx + ekR + 20, ekCy);
    ctx.moveTo(ekCx, ekCy - ekR - 20);
    ctx.lineTo(ekCx, ekCy + ekR + 20);
    ctx.stroke();

    ctx.fillStyle = '#64748b';
    ctx.font = '9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('East', ekCx + ekR + 25, ekCy + 3);
    ctx.fillText('North', ekCx, ekCy - ekR - 25);

    // Wind direction arrow
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(ekCx, ekCy);
    ctx.lineTo(ekCx, ekCy - ekR * 0.8);
    ctx.stroke();
    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.moveTo(ekCx, ekCy - ekR * 0.8);
    ctx.lineTo(ekCx - 4, ekCy - ekR * 0.8 + 8);
    ctx.lineTo(ekCx + 4, ekCy - ekR * 0.8 + 8);
    ctx.fill();
    ctx.font = '9px monospace';
    ctx.fillText('Wind', ekCx + 15, ekCy - ekR * 0.75);

    // Draw spiral vectors
    const depthColors: string[] = [];
    for (let i = 0; i < ekmanData.vectors.length; i++) {
      const frac = i / ekmanData.vectors.length;
      const r = Math.floor(34 + frac * 50);
      const g = Math.floor(211 - frac * 100);
      const b = Math.floor(238 - frac * 80);
      depthColors.push(`rgb(${r},${g},${b})`);
    }

    // Connect tips with a curve
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(34,211,238,0.5)';
    ctx.lineWidth = 1;
    for (let i = 0; i < ekmanData.vectors.length; i++) {
      const v = ekmanData.vectors[i];
      const tipX = ekCx + v.u * vecScale;
      const tipY = ekCy - v.v * vecScale;
      if (i === 0) ctx.moveTo(tipX, tipY);
      else ctx.lineTo(tipX, tipY);
    }
    ctx.stroke();

    // Draw individual vectors
    for (let i = 0; i < ekmanData.vectors.length; i++) {
      const v = ekmanData.vectors[i];
      const tipX = ekCx + v.u * vecScale;
      const tipY = ekCy - v.v * vecScale;

      ctx.strokeStyle = depthColors[i];
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(ekCx, ekCy);
      ctx.lineTo(tipX, tipY);
      ctx.stroke();

      ctx.fillStyle = depthColors[i];
      ctx.beginPath();
      ctx.arc(tipX, tipY, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Depth info
    ctx.fillStyle = '#64748b';
    ctx.font = '9px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`De = ${ekmanData.De.toFixed(1)}m`, ekCx + ekR + 10, ekCy - 10);
    ctx.fillText(`Lat = ${latitude}\u00B0`, ekCx + ekR + 10, ekCy + 5);
    ctx.fillText(`Wind = ${windSpeed} m/s`, ekCx + ekR + 10, ekCy + 20);

    // Surface current label
    if (ekmanData.vectors.length > 0) {
      const surf = ekmanData.vectors[0];
      const surfMag = Math.sqrt(surf.u * surf.u + surf.v * surf.v);
      ctx.fillText(`Surface: ${surfMag.toFixed(3)} m/s`, ekCx + ekR + 10, ekCy + 40);
      ctx.fillText('45\u00B0 to wind (NH)', ekCx + ekR + 10, ekCy + 55);
    }

    // Pulse indicator
    const pulseAlpha = 0.3 + Math.abs(syncValue) * 2;
    ctx.fillStyle = `rgba(34, 211, 238, ${Math.min(pulseAlpha, 0.8)})`;
    ctx.beginPath();
    ctx.arc(W - 20, 18, 4, 0, Math.PI * 2);
    ctx.fill();
  }, [tidalData, ekmanData, constituents, latitude, windSpeed, syncValue, elapsedTime]);

  return (
    <div ref={containerRef} className="bg-slate-900/50 border border-slate-700 rounded-lg overflow-hidden" style={{ height: 550 }}>
      <canvas ref={canvasRef} />
    </div>
  );
};
