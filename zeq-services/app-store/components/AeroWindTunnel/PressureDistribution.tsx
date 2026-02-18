import React, { useRef, useEffect, useMemo } from 'react';

interface AirfoilProfile {
  upper: { x: number; y: number }[];
  lower: { x: number; y: number }[];
}

interface PressureDistributionProps {
  airfoil: AirfoilProfile;
  aoa: number;
  velocity: number;
  reynolds: number;
}

export const PressureDistribution: React.FC<PressureDistributionProps> = ({
  airfoil,
  aoa,
  velocity,
  reynolds,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Compute Cp distribution (simplified thin-airfoil + thickness effect)
  const cpData = useMemo(() => {
    const upperCp: { x: number; cp: number }[] = [];
    const lowerCp: { x: number; cp: number }[] = [];

    for (const pt of airfoil.upper) {
      const xc = Math.max(0.001, pt.x);
      // Upper surface: suction peak near leading edge
      const cpVal = -2 * Math.sin(aoa) * Math.sqrt((1 - xc) / xc) - 0.3 * (1 - xc);
      upperCp.push({ x: xc, cp: isFinite(cpVal) ? Math.max(-6, cpVal) : 0 });
    }

    for (const pt of airfoil.lower) {
      const xc = Math.max(0.001, pt.x);
      // Lower surface: positive Cp
      const cpVal = 2 * Math.sin(aoa) * Math.sqrt((1 - xc) / xc) * 0.4 + 0.1 * (1 - xc);
      lowerCp.push({ x: xc, cp: isFinite(cpVal) ? Math.min(2, cpVal) : 0 });
    }

    return { upperCp, lowerCp };
  }, [airfoil, aoa]);

  // Blasius boundary layer thickness
  const blasiusData = useMemo(() => {
    const nu = 1.5e-5;
    const points: { x: number; delta: number }[] = [];
    for (let i = 1; i <= 50; i++) {
      const x = i / 50;
      const Rex = (velocity * x) / nu;
      const delta = Rex > 0 ? (5 * x) / Math.sqrt(Rex) : 0;
      points.push({ x, delta: isFinite(delta) ? delta : 0 });
    }
    return points;
  }, [velocity]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    const pad = { top: 30, right: 20, bottom: 40, left: 55 };
    const plotW = w - pad.left - pad.right;
    const plotH = h - pad.top - pad.bottom;

    ctx.fillStyle = 'rgba(15,23,42,0.8)';
    ctx.fillRect(0, 0, w, h);

    // Determine Cp range
    const allCp = [
      ...cpData.upperCp.map((d) => d.cp),
      ...cpData.lowerCp.map((d) => d.cp),
    ];
    let cpMin = Math.min(...allCp, -1);
    let cpMax = Math.max(...allCp, 1);
    // Note: Cp axis is inverted (negative up) in aero convention
    const cpRange = cpMax - cpMin;
    if (cpRange < 0.1) {
      cpMin -= 1;
      cpMax += 1;
    }

    const toX = (xc: number) => pad.left + xc * plotW;
    // Inverted: negative Cp goes up
    const toY = (cp: number) => pad.top + ((cp - cpMin) / (cpMax - cpMin)) * plotH;

    // Grid
    ctx.strokeStyle = 'rgba(148,163,184,0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = pad.top + (i / 5) * plotH;
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(pad.left + plotW, y);
      ctx.stroke();
    }
    for (let i = 0; i <= 10; i++) {
      const x = pad.left + (i / 10) * plotW;
      ctx.beginPath();
      ctx.moveTo(x, pad.top);
      ctx.lineTo(x, pad.top + plotH);
      ctx.stroke();
    }

    // Zero Cp line
    const zeroY = toY(0);
    if (zeroY > pad.top && zeroY < pad.top + plotH) {
      ctx.strokeStyle = 'rgba(148,163,184,0.4)';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(pad.left, zeroY);
      ctx.lineTo(pad.left + plotW, zeroY);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Plot upper Cp
    ctx.strokeStyle = 'rgba(34,211,238,0.9)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < cpData.upperCp.length; i++) {
      const d = cpData.upperCp[i];
      const x = toX(d.x);
      const y = toY(d.cp);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Plot lower Cp
    ctx.strokeStyle = 'rgba(251,146,60,0.9)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < cpData.lowerCp.length; i++) {
      const d = cpData.lowerCp[i];
      const x = toX(d.x);
      const y = toY(d.cp);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Boundary layer thickness (secondary scale, top-right)
    if (blasiusData.length > 0) {
      const maxDelta = Math.max(...blasiusData.map((d) => d.delta), 0.001);
      ctx.strokeStyle = 'rgba(167,139,250,0.6)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      for (let i = 0; i < blasiusData.length; i++) {
        const d = blasiusData[i];
        const x = toX(d.x);
        const y = pad.top + plotH - (d.delta / maxDelta) * plotH * 0.3;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // BL legend
      ctx.fillStyle = 'rgba(167,139,250,0.6)';
      ctx.font = '9px monospace';
      ctx.fillText(`BL \u03B4 (max=${(maxDelta * 1000).toFixed(2)}mm)`, pad.left + plotW - 160, pad.top + plotH - 5);
    }

    // Axes labels
    ctx.fillStyle = 'rgba(148,163,184,0.6)';
    ctx.font = '11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('x/c (Chord Position)', w / 2, h - 5);

    ctx.save();
    ctx.translate(12, h / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Cp (Pressure Coefficient)', 0, 0);
    ctx.restore();

    // Tick labels
    ctx.textAlign = 'center';
    for (let i = 0; i <= 10; i++) {
      const xc = i / 10;
      ctx.fillText(xc.toFixed(1), toX(xc), pad.top + plotH + 18);
    }
    ctx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
      const cp = cpMin + (i / 5) * (cpMax - cpMin);
      ctx.fillText(cp.toFixed(1), pad.left - 5, toY(cp) + 4);
    }

    // Legend
    ctx.fillStyle = 'rgba(34,211,238,0.9)';
    ctx.fillRect(pad.left + plotW - 120, pad.top + 5, 12, 3);
    ctx.fillStyle = 'rgba(148,163,184,0.7)';
    ctx.textAlign = 'left';
    ctx.font = '10px monospace';
    ctx.fillText('Upper', pad.left + plotW - 104, pad.top + 10);

    ctx.fillStyle = 'rgba(251,146,60,0.9)';
    ctx.fillRect(pad.left + plotW - 120, pad.top + 20, 12, 3);
    ctx.fillStyle = 'rgba(148,163,184,0.7)';
    ctx.fillText('Lower', pad.left + plotW - 104, pad.top + 25);

    // Title
    ctx.fillStyle = 'rgba(226,232,240,0.8)';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('Cp Distribution & Blasius BL', pad.left, pad.top - 10);
    ctx.font = '10px monospace';
    ctx.fillStyle = 'rgba(148,163,184,0.5)';
    ctx.fillText(`Re = ${reynolds.toExponential(2)}`, pad.left + plotW - 100, pad.top - 10);
  }, [cpData, blasiusData, reynolds]);

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
      <h3 className="text-sm font-medium text-slate-200 mb-3">
        Pressure Coefficient Distribution
      </h3>
      <canvas
        ref={canvasRef}
        className="w-full rounded"
        style={{ height: 320 }}
      />
    </div>
  );
};
