import React, { useRef, useEffect, useCallback } from 'react';
import type { LBMState } from './index';

interface VorticityMapProps {
  lbm: LBMState | null;
  renderTrigger: number;
}

function vorticityColor(val: number, maxAbs: number): [number, number, number] {
  if (maxAbs === 0) return [240, 240, 240];
  const t = Math.max(-1, Math.min(1, val / maxAbs));
  // Blue (negative) -> White (zero) -> Red (positive)
  if (t < 0) {
    const s = -t;
    return [Math.floor(240 * (1 - s)), Math.floor(240 * (1 - s)), Math.floor(240 - s * 20)];
  } else {
    const s = t;
    return [Math.floor(240 - s * 20), Math.floor(240 * (1 - s)), Math.floor(240 * (1 - s))];
  }
}

export const VorticityMap: React.FC<VorticityMapProps> = ({ lbm, renderTrigger }) => {
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

    const { nx, ny, vorticity, obstacle } = lbm;
    const cellW = rect.width / nx;
    const cellH = rect.height / ny;

    // Find max absolute vorticity
    let maxAbs = 0;
    for (let i = 0; i < vorticity.length; i++) {
      const a = Math.abs(vorticity[i]);
      if (isFinite(a) && a > maxAbs) maxAbs = a;
    }
    if (maxAbs === 0) maxAbs = 0.001;

    // Draw vorticity colormap
    const imgData = ctx.createImageData(Math.ceil(rect.width), Math.ceil(rect.height));
    for (let py = 0; py < Math.ceil(rect.height); py++) {
      for (let px = 0; px < Math.ceil(rect.width); px++) {
        const gx = Math.floor(px / cellW);
        const gy = Math.floor(py / cellH);
        if (gx >= nx || gy >= ny) continue;
        const idx = gy * nx + gx;
        const pidx = (py * Math.ceil(rect.width) + px) * 4;

        if (obstacle[idx]) {
          imgData.data[pidx] = 40;
          imgData.data[pidx + 1] = 40;
          imgData.data[pidx + 2] = 50;
          imgData.data[pidx + 3] = 255;
        } else {
          const [r, g, b] = vorticityColor(vorticity[idx], maxAbs);
          imgData.data[pidx] = r;
          imgData.data[pidx + 1] = g;
          imgData.data[pidx + 2] = b;
          imgData.data[pidx + 3] = 255;
        }
      }
    }
    ctx.putImageData(imgData, 0, 0);

    // Marching squares isolines for vorticity
    const levels = [-0.6, -0.3, -0.1, 0.1, 0.3, 0.6].map((l) => l * maxAbs);

    for (const level of levels) {
      ctx.strokeStyle = level < 0
        ? 'rgba(100,150,255,0.6)'
        : 'rgba(255,100,100,0.6)';
      ctx.lineWidth = 1;
      ctx.beginPath();

      for (let gy = 0; gy < ny - 1; gy++) {
        for (let gx = 0; gx < nx - 1; gx++) {
          if (obstacle[gy * nx + gx] || obstacle[gy * nx + gx + 1] ||
              obstacle[(gy + 1) * nx + gx] || obstacle[(gy + 1) * nx + gx + 1]) continue;

          const v00 = vorticity[gy * nx + gx];
          const v10 = vorticity[gy * nx + gx + 1];
          const v01 = vorticity[(gy + 1) * nx + gx];
          const v11 = vorticity[(gy + 1) * nx + gx + 1];

          // Marching squares case index
          let caseIdx = 0;
          if (v00 >= level) caseIdx |= 1;
          if (v10 >= level) caseIdx |= 2;
          if (v11 >= level) caseIdx |= 4;
          if (v01 >= level) caseIdx |= 8;

          if (caseIdx === 0 || caseIdx === 15) continue;

          const x0 = gx * cellW;
          const y0 = gy * cellH;

          // Interpolation helpers
          const lerp = (a: number, b: number) => {
            const d = b - a;
            return d !== 0 ? (level - a) / d : 0.5;
          };

          // Edge interpolation points
          const top = lerp(v00, v10);
          const bottom = lerp(v01, v11);
          const left = lerp(v00, v01);
          const right = lerp(v10, v11);

          const pts: [number, number][] = [
            [x0 + top * cellW, y0],         // top edge
            [x0 + cellW, y0 + right * cellH], // right edge
            [x0 + bottom * cellW, y0 + cellH], // bottom edge
            [x0, y0 + left * cellH],          // left edge
          ];

          // Simple line segments based on marching squares cases
          const segments: [number, number][][] = [];
          switch (caseIdx) {
            case 1: case 14: segments.push([pts[3], pts[0]]); break;
            case 2: case 13: segments.push([pts[0], pts[1]]); break;
            case 3: case 12: segments.push([pts[3], pts[1]]); break;
            case 4: case 11: segments.push([pts[1], pts[2]]); break;
            case 5: segments.push([pts[3], pts[0]], [pts[1], pts[2]]); break;
            case 6: case 9: segments.push([pts[0], pts[2]]); break;
            case 7: case 8: segments.push([pts[3], pts[2]]); break;
            case 10: segments.push([pts[0], pts[3]], [pts[2], pts[1]]); break;
          }

          for (const seg of segments) {
            ctx.moveTo(seg[0][0], seg[0][1]);
            ctx.lineTo(seg[1][0], seg[1][1]);
          }
        }
      }
      ctx.stroke();
    }

    // Color bar
    const barW = 120, barH = 12, barX = rect.width - barW - 15, barY = 15;
    const gradient = ctx.createLinearGradient(barX, barY, barX + barW, barY);
    gradient.addColorStop(0, 'rgb(0,0,220)');
    gradient.addColorStop(0.5, 'rgb(240,240,240)');
    gradient.addColorStop(1, 'rgb(220,0,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(barX, barY, barW, barH);
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.strokeRect(barX, barY, barW, barH);
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = '10px monospace';
    ctx.fillText(`-${maxAbs.toFixed(3)}`, barX - 2, barY + barH + 12);
    ctx.fillText(`+${maxAbs.toFixed(3)}`, barX + barW - 40, barY + barH + 12);
  }, [lbm, renderTrigger]);

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
      <h3 className="text-sm font-semibold text-slate-200 mb-3">Vorticity Field</h3>
      <div ref={containerRef} className="w-full" style={{ aspectRatio: '2 / 1' }}>
        <canvas ref={canvasRef} className="w-full h-full rounded" />
      </div>
      <p className="text-xs text-slate-500 mt-2">
        Vorticity colormap (blue=negative, white=zero, red=positive) with marching squares isolines
      </p>
    </div>
  );
};
