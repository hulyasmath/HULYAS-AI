import React, { useRef, useEffect, useCallback } from 'react';
import type { LBMState } from './index';

interface FlowFieldCanvasProps {
  lbm: LBMState | null;
  renderTrigger: number;
  syncValue: number;
}

function velocityColor(speed: number, maxSpeed: number): [number, number, number] {
  const t = maxSpeed > 0 ? Math.min(speed / maxSpeed, 1) : 0;
  // Blue (slow) -> Cyan -> Green -> Yellow -> Red (fast)
  let r = 0, g = 0, b = 0;
  if (t < 0.25) {
    b = 200;
    g = Math.floor(t * 4 * 200);
  } else if (t < 0.5) {
    g = 200;
    b = Math.floor((1 - (t - 0.25) * 4) * 200);
  } else if (t < 0.75) {
    g = 200;
    r = Math.floor((t - 0.5) * 4 * 255);
  } else {
    r = 255;
    g = Math.floor((1 - (t - 0.75) * 4) * 200);
  }
  return [r, g, b];
}

export const FlowFieldCanvas: React.FC<FlowFieldCanvasProps> = ({ lbm, renderTrigger, syncValue }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || !lbm) return;

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    const { nx, ny, ux, uy, obstacle } = lbm;
    const cellW = rect.width / nx;
    const cellH = rect.height / ny;

    // Find max speed
    let maxSpeed = 0;
    for (let i = 0; i < ux.length; i++) {
      const s = Math.sqrt(ux[i] * ux[i] + uy[i] * uy[i]);
      if (isFinite(s) && s > maxSpeed) maxSpeed = s;
    }
    if (maxSpeed === 0) maxSpeed = 0.001;

    // Draw velocity magnitude heatmap
    const imgData = ctx.createImageData(Math.ceil(rect.width), Math.ceil(rect.height));
    for (let py = 0; py < Math.ceil(rect.height); py++) {
      for (let px = 0; px < Math.ceil(rect.width); px++) {
        const gx = Math.floor(px / cellW);
        const gy = Math.floor(py / cellH);
        if (gx >= nx || gy >= ny) continue;
        const idx = gy * nx + gx;
        const pidx = (py * Math.ceil(rect.width) + px) * 4;

        if (obstacle[idx]) {
          imgData.data[pidx] = 60;
          imgData.data[pidx + 1] = 60;
          imgData.data[pidx + 2] = 70;
          imgData.data[pidx + 3] = 255;
        } else {
          const speed = Math.sqrt(ux[idx] * ux[idx] + uy[idx] * uy[idx]);
          const [r, g, b] = velocityColor(speed, maxSpeed);
          imgData.data[pidx] = r;
          imgData.data[pidx + 1] = g;
          imgData.data[pidx + 2] = b;
          imgData.data[pidx + 3] = 255;
        }
      }
    }
    ctx.putImageData(imgData, 0, 0);

    // Draw velocity vectors (sampled)
    const arrowStep = Math.max(3, Math.floor(nx / 25));
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 1;
    for (let gy = arrowStep; gy < ny; gy += arrowStep) {
      for (let gx = arrowStep; gx < nx; gx += arrowStep) {
        const idx = gy * nx + gx;
        if (obstacle[idx]) continue;
        const vx = ux[idx];
        const vy = uy[idx];
        const speed = Math.sqrt(vx * vx + vy * vy);
        if (speed < 1e-6) continue;

        const cx = (gx + 0.5) * cellW;
        const cy = (gy + 0.5) * cellH;
        const scale = cellW * arrowStep * 0.4 / maxSpeed;
        const dx = vx * scale;
        const dy = vy * scale;

        ctx.beginPath();
        ctx.moveTo(cx - dx * 0.5, cy - dy * 0.5);
        ctx.lineTo(cx + dx * 0.5, cy + dy * 0.5);
        ctx.stroke();

        // Arrowhead
        const angle = Math.atan2(dy, dx);
        const headLen = 3;
        ctx.beginPath();
        ctx.moveTo(cx + dx * 0.5, cy + dy * 0.5);
        ctx.lineTo(cx + dx * 0.5 - headLen * Math.cos(angle - 0.4), cy + dy * 0.5 - headLen * Math.sin(angle - 0.4));
        ctx.moveTo(cx + dx * 0.5, cy + dy * 0.5);
        ctx.lineTo(cx + dx * 0.5 - headLen * Math.cos(angle + 0.4), cy + dy * 0.5 - headLen * Math.sin(angle + 0.4));
        ctx.stroke();
      }
    }

    // Color bar legend
    const barW = 120, barH = 12, barX = rect.width - barW - 15, barY = 15;
    const gradient = ctx.createLinearGradient(barX, barY, barX + barW, barY);
    const stops = [0, 0.25, 0.5, 0.75, 1];
    for (const s of stops) {
      const [r, g, b] = velocityColor(s * maxSpeed, maxSpeed);
      gradient.addColorStop(s, `rgb(${r},${g},${b})`);
    }
    ctx.fillStyle = gradient;
    ctx.fillRect(barX, barY, barW, barH);
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.strokeRect(barX, barY, barW, barH);
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = '10px monospace';
    ctx.fillText('0', barX, barY + barH + 12);
    ctx.fillText(`|u|=${maxSpeed.toFixed(3)}`, barX + barW - 55, barY + barH + 12);
  }, [lbm, renderTrigger, syncValue]);

  useEffect(() => {
    draw();
  }, [draw]);

  useEffect(() => {
    const onResize = () => draw();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [draw]);

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-slate-200 mb-3">Flow Field - Velocity Magnitude</h3>
      <div ref={containerRef} className="w-full" style={{ aspectRatio: '2 / 1' }}>
        <canvas ref={canvasRef} className="w-full h-full rounded" />
      </div>
      <p className="text-xs text-slate-500 mt-2">
        D2Q9 LBM: velocity magnitude heatmap (blue=slow, red=fast), velocity vectors, obstacles (gray)
      </p>
    </div>
  );
};
