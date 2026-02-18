import React, { useRef, useEffect } from 'react';
import { surfaceElevation, orbitalRadius } from './index';

interface WaveCrossSectionProps {
  waveHeight: number;
  wavePeriod: number;
  waterDepth: number;
  waveProps: {
    k: number;
    wavelength: number;
    phaseSpeed: number;
    groupSpeed: number;
    omega: number;
  };
  syncValue: number;
  elapsedTime: number;
}

export const WaveCrossSection: React.FC<WaveCrossSectionProps> = ({
  waveHeight, wavePeriod, waterDepth, waveProps, syncValue, elapsedTime,
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
    const margin = { top: 30, right: 20, bottom: 40, left: 60 };
    const plotW = W - margin.left - margin.right;
    const plotH = H - margin.top - margin.bottom;

    // Background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, W, H);

    const { k, omega, wavelength } = waveProps;
    const t = elapsedTime;

    // Vertical scale: surface at 40% from top of plot
    const surfaceY = margin.top + plotH * 0.35;
    const depthScale = plotH * 0.6 / Math.min(waterDepth, 100); // scale depth to pixels
    const displayDepth = Math.min(waterDepth, 100);

    // Draw water body gradient
    const waterGrad = ctx.createLinearGradient(0, surfaceY, 0, surfaceY + displayDepth * depthScale);
    waterGrad.addColorStop(0, 'rgba(6, 182, 212, 0.15)');
    waterGrad.addColorStop(1, 'rgba(6, 182, 212, 0.02)');

    // Draw surface wave
    const numPoints = 200;
    const xRange = wavelength * 3; // show 3 wavelengths
    const xScale = plotW / xRange;

    // Water fill
    ctx.beginPath();
    ctx.moveTo(margin.left, surfaceY + plotH * 0.6);
    for (let i = 0; i <= numPoints; i++) {
      const xWorld = (i / numPoints) * xRange;
      const px = margin.left + xWorld * xScale;
      const eta = surfaceElevation(xWorld, t, waveHeight, k, omega);
      const py = surfaceY - eta * depthScale * 0.5;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.lineTo(margin.left + plotW, surfaceY + displayDepth * depthScale);
    ctx.lineTo(margin.left, surfaceY + displayDepth * depthScale);
    ctx.closePath();
    ctx.fillStyle = waterGrad;
    ctx.fill();

    // Surface line
    ctx.beginPath();
    ctx.strokeStyle = '#22d3ee';
    ctx.lineWidth = 2;
    for (let i = 0; i <= numPoints; i++) {
      const xWorld = (i / numPoints) * xRange;
      const px = margin.left + xWorld * xScale;
      const eta = surfaceElevation(xWorld, t, waveHeight, k, omega);
      const py = surfaceY - eta * depthScale * 0.5;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Draw orbital motion circles at various depths
    const orbitalDepths = [0, -displayDepth * 0.2, -displayDepth * 0.4, -displayDepth * 0.6, -displayDepth * 0.8];
    const orbX = margin.left + plotW * 0.5; // center of plot

    for (const zFrac of orbitalDepths) {
      const z = zFrac; // depth in meters (negative)
      const r = orbitalRadius(waveHeight, k, z, waterDepth);
      const rPixels = r * depthScale * 0.5;
      const depthPx = surfaceY - z * depthScale;

      if (rPixels > 1 && rPixels < plotW * 0.3) {
        // Orbital circle
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(251, 146, 60, 0.5)';
        ctx.lineWidth = 1;
        ctx.ellipse(orbX, depthPx, rPixels, rPixels, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Particle on orbit (animated)
        const angle = omega * t;
        const px = orbX + rPixels * Math.cos(angle);
        const py = depthPx - rPixels * Math.sin(angle);
        ctx.beginPath();
        ctx.fillStyle = '#fb923c';
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Stokes drift arrows
    for (let i = 0; i < 3; i++) {
      const arrowY = surfaceY + displayDepth * depthScale * (0.1 + i * 0.25);
      const arrowX = margin.left + plotW * 0.15;
      const arrowLen = 30 - i * 8;
      if (arrowLen > 5) {
        ctx.strokeStyle = '#a78bfa';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(arrowX, arrowY);
        ctx.lineTo(arrowX + arrowLen, arrowY);
        ctx.lineTo(arrowX + arrowLen - 5, arrowY - 3);
        ctx.moveTo(arrowX + arrowLen, arrowY);
        ctx.lineTo(arrowX + arrowLen - 5, arrowY + 3);
        ctx.stroke();
      }
    }
    ctx.fillStyle = '#a78bfa';
    ctx.font = '9px monospace';
    ctx.fillText('Stokes drift', margin.left + plotW * 0.15, surfaceY + displayDepth * depthScale * 0.08 - 5);

    // Wave parameter annotations
    // H annotation
    const hAnnX = margin.left + plotW * 0.8;
    ctx.strokeStyle = '#22d3ee';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 2]);
    ctx.beginPath();
    ctx.moveTo(hAnnX, surfaceY - waveHeight * depthScale * 0.25);
    ctx.lineTo(hAnnX, surfaceY + waveHeight * depthScale * 0.25);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#22d3ee';
    ctx.font = '10px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`H=${waveHeight}m`, hAnnX + 5, surfaceY);

    // L annotation
    const lStartX = margin.left + plotW * 0.3;
    const lEndX = lStartX + wavelength * xScale;
    if (lEndX < margin.left + plotW) {
      ctx.strokeStyle = '#fb923c';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(lStartX, surfaceY - 20);
      ctx.lineTo(lEndX, surfaceY - 20);
      ctx.stroke();
      // Arrows
      ctx.beginPath();
      ctx.moveTo(lStartX, surfaceY - 24);
      ctx.lineTo(lStartX, surfaceY - 16);
      ctx.moveTo(lEndX, surfaceY - 24);
      ctx.lineTo(lEndX, surfaceY - 16);
      ctx.stroke();
      ctx.fillStyle = '#fb923c';
      ctx.textAlign = 'center';
      ctx.fillText(`L=${wavelength.toFixed(1)}m`, (lStartX + lEndX) / 2, surfaceY - 25);
    }

    // T annotation
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`T=${wavePeriod}s`, margin.left + 5, margin.top + 15);

    // Seabed
    ctx.strokeStyle = '#8B7355';
    ctx.lineWidth = 2;
    const seabedY = surfaceY + displayDepth * depthScale;
    ctx.beginPath();
    ctx.moveTo(margin.left, seabedY);
    for (let i = 0; i <= plotW; i += 5) {
      ctx.lineTo(margin.left + i, seabedY + Math.sin(i * 0.05) * 3);
    }
    ctx.stroke();

    // Depth axis
    ctx.fillStyle = '#64748b';
    ctx.font = '10px monospace';
    ctx.textAlign = 'right';
    for (let d = 0; d <= displayDepth; d += Math.max(10, Math.ceil(displayDepth / 5))) {
      const y = surfaceY + d * depthScale;
      ctx.fillText(`${d}m`, margin.left - 5, y + 4);
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(margin.left, y);
      ctx.lineTo(margin.left + plotW, y);
      ctx.stroke();
    }

    // Y-axis label
    ctx.save();
    ctx.translate(15, surfaceY + displayDepth * depthScale * 0.5);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Depth (m)', 0, 0);
    ctx.restore();

    // Title
    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('Wave Cross-Section with Orbital Motion', margin.left, 18);

    // Sync pulse
    const pulseAlpha = 0.3 + Math.abs(syncValue) * 2;
    ctx.fillStyle = `rgba(34, 211, 238, ${Math.min(pulseAlpha, 0.8)})`;
    ctx.beginPath();
    ctx.arc(W - 20, 18, 4, 0, Math.PI * 2);
    ctx.fill();

    // Border
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.strokeRect(margin.left, margin.top, plotW, plotH);
  }, [waveHeight, wavePeriod, waterDepth, waveProps, syncValue, elapsedTime]);

  return (
    <div ref={containerRef} className="bg-slate-900/50 border border-slate-700 rounded-lg overflow-hidden" style={{ height: 500 }}>
      <canvas ref={canvasRef} />
    </div>
  );
};
