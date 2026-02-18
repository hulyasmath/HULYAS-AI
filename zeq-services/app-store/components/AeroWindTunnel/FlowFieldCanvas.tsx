import React, { useRef, useEffect } from 'react';

interface AirfoilProfile {
  upper: { x: number; y: number }[];
  lower: { x: number; y: number }[];
}

interface FlowFieldCanvasProps {
  airfoil: AirfoilProfile;
  aoa: number;       // radians
  velocity: number;  // m/s
  elapsedTime: number;
  syncValue: number;
}

export const FlowFieldCanvas: React.FC<FlowFieldCanvasProps> = ({
  airfoil,
  aoa,
  velocity,
  elapsedTime,
  syncValue,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

    // Clear
    ctx.fillStyle = 'rgba(15,23,42,0.9)';
    ctx.fillRect(0, 0, w, h);

    const pad = 40;
    const plotW = w - 2 * pad;
    const plotH = h - 2 * pad;
    const cx = pad + plotW * 0.35;
    const cy = pad + plotH * 0.5;
    const scale = plotW * 0.45;

    // Transform airfoil point (apply AoA rotation)
    const transformPt = (pt: { x: number; y: number }) => {
      const cosA = Math.cos(-aoa);
      const sinA = Math.sin(-aoa);
      const rx = pt.x * cosA - pt.y * sinA;
      const ry = pt.x * sinA + pt.y * cosA;
      return { x: cx + rx * scale, y: cy - ry * scale };
    };

    // Draw airfoil shape
    ctx.beginPath();
    for (let i = 0; i < airfoil.upper.length; i++) {
      const p = transformPt(airfoil.upper[i]);
      i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y);
    }
    for (let i = airfoil.lower.length - 1; i >= 0; i--) {
      const p = transformPt(airfoil.lower[i]);
      ctx.lineTo(p.x, p.y);
    }
    ctx.closePath();
    ctx.fillStyle = 'rgba(34,211,238,0.15)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(34,211,238,0.8)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Chord line
    const le = transformPt({ x: 0, y: 0 });
    const te = transformPt({ x: 1, y: 0 });
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = 'rgba(148,163,184,0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(le.x, le.y);
    ctx.lineTo(te.x, te.y);
    ctx.stroke();
    ctx.setLineDash([]);

    // Streamlines (simplified uniform flow + AoA deflection)
    const nStreams = 16;
    const streamSteps = 120;
    const dt = 0.012;

    // Animated offset
    const timeOffset = (elapsedTime * 0.3 + syncValue * 0.5) % 2;

    for (let s = 0; s < nStreams; s++) {
      const y0 = pad + (s / (nStreams - 1)) * plotH;
      let px = pad - 20 + timeOffset * 30;
      let py = y0;

      ctx.beginPath();
      ctx.moveTo(px, py);

      const cosA = Math.cos(aoa);
      const sinA = Math.sin(aoa);
      const baseVx = velocity * 0.5;

      for (let step = 0; step < streamSteps; step++) {
        // Check distance to airfoil center
        const dx = (px - cx) / scale;
        const dy = -(py - cy) / scale;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Deflection near airfoil (simplified doublet effect)
        let vx = baseVx;
        let vy = 0;

        if (dist > 0.05 && dist < 2.0) {
          const r2 = dist * dist;
          const strength = 0.03 * velocity / 50;
          // Doublet perturbation
          vx += strength * (dy * dy - dx * dx) / (r2 * r2 + 0.001) * baseVx;
          vy += strength * (-2 * dx * dy) / (r2 * r2 + 0.001) * baseVx;

          // AoA circulation effect (deflect down above, up below)
          const circulation = sinA * 0.8;
          vy += circulation * baseVx / (dist + 0.3);
        }

        px += vx * dt;
        py -= vy * dt;

        // Clip
        if (px < 0 || px > w || py < 0 || py > h) break;

        ctx.lineTo(px, py);
      }

      // Color based on vertical position relative to airfoil
      const relY = (y0 - cy) / plotH;
      if (relY < -0.1) {
        ctx.strokeStyle = 'rgba(251,146,60,0.3)'; // above - faster (low pressure)
      } else if (relY > 0.1) {
        ctx.strokeStyle = 'rgba(34,211,238,0.25)'; // below - slower (high pressure)
      } else {
        ctx.strokeStyle = 'rgba(148,163,184,0.2)';
      }
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Pressure coefficient coloring on airfoil surface
    const drawCpColor = (pts: { x: number; y: number }[], isUpper: boolean) => {
      for (let i = 0; i < pts.length - 1; i++) {
        const p1 = transformPt(pts[i]);
        const p2 = transformPt(pts[i + 1]);

        // Simplified Cp based on position and AoA
        const xc = pts[i].x;
        let cp: number;
        if (isUpper) {
          cp = -2 * Math.sin(aoa) * (1 - xc) - 0.5 * (1 - xc);
        } else {
          cp = 2 * Math.sin(aoa) * (1 - xc) * 0.5;
        }
        cp = Math.max(-3, Math.min(1, cp));

        // Map Cp to color: negative = red (suction), positive = blue (pressure)
        const norm = (cp + 3) / 4;
        const r = Math.floor(255 * (1 - norm));
        const b = Math.floor(255 * norm);

        ctx.strokeStyle = `rgba(${r},80,${b},0.8)`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }
    };

    drawCpColor(airfoil.upper, true);
    drawCpColor(airfoil.lower, false);

    // Labels
    ctx.fillStyle = 'rgba(148,163,184,0.6)';
    ctx.font = '11px monospace';
    ctx.fillText('Flow Field Visualization', 10, 18);
    ctx.fillText(`AoA: ${((aoa * 180) / Math.PI).toFixed(1)}\u00B0 | V: ${velocity} m/s`, 10, h - 10);

    // Cp legend
    const legendX = w - 100;
    const legendY = 20;
    const legendH = 60;
    const grad = ctx.createLinearGradient(legendX, legendY, legendX, legendY + legendH);
    grad.addColorStop(0, 'rgba(255,80,80,0.8)');
    grad.addColorStop(0.5, 'rgba(180,80,180,0.6)');
    grad.addColorStop(1, 'rgba(80,80,255,0.8)');
    ctx.fillStyle = grad;
    ctx.fillRect(legendX, legendY, 12, legendH);
    ctx.fillStyle = 'rgba(148,163,184,0.5)';
    ctx.font = '9px monospace';
    ctx.fillText('Cp = -3', legendX + 16, legendY + 8);
    ctx.fillText('Cp = +1', legendX + 16, legendY + legendH);
  }, [airfoil, aoa, velocity, elapsedTime, syncValue]);

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
      <h3 className="text-sm font-medium text-slate-200 mb-3">Wind Tunnel Flow Field</h3>
      <canvas
        ref={canvasRef}
        className="w-full rounded"
        style={{ height: 380 }}
      />
    </div>
  );
};
