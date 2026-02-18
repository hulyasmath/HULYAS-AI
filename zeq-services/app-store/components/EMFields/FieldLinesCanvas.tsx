import React, { useRef, useEffect, useCallback } from 'react';
import type { Charge } from './index';
import { computeEField } from './index';

interface FieldLinesCanvasProps {
  charges: Charge[];
  probeX: number;
  probeY: number;
  syncValue: number;
}

export const FieldLinesCanvas: React.FC<FieldLinesCanvasProps> = ({ charges, probeX, probeY, syncValue }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const draw = useCallback(() => {
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

    const w = rect.width;
    const h = rect.height;
    const cx = w / 2;
    const cy = h / 2;
    const scale = Math.min(w, h) / 7; // maps ~3.5m to half the canvas

    const toScreen = (x: number, y: number): [number, number] => [cx + x * scale, cy - y * scale];
    const toWorld = (sx: number, sy: number): [number, number] => [(sx - cx) / scale, (cy - sy) / scale];

    // Background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);

    // Equipotential contours (dashed)
    const gridRes = 80;
    const potentials: number[][] = [];
    let minV = Infinity, maxV = -Infinity;
    for (let iy = 0; iy < gridRes; iy++) {
      const row: number[] = [];
      for (let ix = 0; ix < gridRes; ix++) {
        const [wx, wy] = toWorld(ix * w / gridRes, iy * h / gridRes);
        const { V } = computeEField(charges, wx, wy);
        const clamped = Math.max(-1000, Math.min(1000, V));
        row.push(clamped);
        if (clamped < minV) minV = clamped;
        if (clamped > maxV) maxV = clamped;
      }
      potentials.push(row);
    }

    // Draw equipotential as colored background
    const cellW = w / gridRes;
    const cellH = h / gridRes;
    for (let iy = 0; iy < gridRes; iy++) {
      for (let ix = 0; ix < gridRes; ix++) {
        const v = potentials[iy][ix];
        const range = Math.max(Math.abs(minV), Math.abs(maxV), 1);
        const t = v / range; // -1 to 1
        let r: number, g: number, b: number;
        if (t > 0) {
          r = Math.floor(30 + 60 * t);
          g = 20;
          b = 20;
        } else {
          r = 20;
          g = 20;
          b = Math.floor(30 + 60 * (-t));
        }
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(ix * cellW, iy * cellH, cellW + 1, cellH + 1);
      }
    }

    // Equipotential contour lines (dashed)
    const levels = [-50, -20, -10, -5, 5, 10, 20, 50];
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 0.5;
    for (const level of levels) {
      ctx.strokeStyle = level > 0 ? 'rgba(255,120,120,0.4)' : 'rgba(120,120,255,0.4)';
      ctx.beginPath();
      for (let iy = 0; iy < gridRes - 1; iy++) {
        for (let ix = 0; ix < gridRes - 1; ix++) {
          const v00 = potentials[iy][ix];
          const v10 = potentials[iy][ix + 1];
          const v01 = potentials[iy + 1][ix];
          const v11 = potentials[iy + 1][ix + 1];

          let caseIdx = 0;
          if (v00 >= level) caseIdx |= 1;
          if (v10 >= level) caseIdx |= 2;
          if (v11 >= level) caseIdx |= 4;
          if (v01 >= level) caseIdx |= 8;

          if (caseIdx === 0 || caseIdx === 15) continue;

          const x0 = ix * cellW;
          const y0 = iy * cellH;
          const lerp = (a: number, b: number) => {
            const d = b - a;
            return d !== 0 ? (level - a) / d : 0.5;
          };

          const pts: [number, number][] = [
            [x0 + lerp(v00, v10) * cellW, y0],
            [x0 + cellW, y0 + lerp(v10, v11) * cellH],
            [x0 + lerp(v01, v11) * cellW, y0 + cellH],
            [x0, y0 + lerp(v00, v01) * cellH],
          ];

          const drawSeg = (a: [number, number], b: [number, number]) => {
            ctx.moveTo(a[0], a[1]);
            ctx.lineTo(b[0], b[1]);
          };

          switch (caseIdx) {
            case 1: case 14: drawSeg(pts[3], pts[0]); break;
            case 2: case 13: drawSeg(pts[0], pts[1]); break;
            case 3: case 12: drawSeg(pts[3], pts[1]); break;
            case 4: case 11: drawSeg(pts[1], pts[2]); break;
            case 5: drawSeg(pts[3], pts[0]); drawSeg(pts[1], pts[2]); break;
            case 6: case 9: drawSeg(pts[0], pts[2]); break;
            case 7: case 8: drawSeg(pts[3], pts[2]); break;
            case 10: drawSeg(pts[0], pts[3]); drawSeg(pts[2], pts[1]); break;
          }
        }
      }
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // Field lines: integrate from positive charges using RK4
    const positiveCharges = charges.filter((c) => c.q > 0);
    const negativeCharges = charges.filter((c) => c.q < 0);
    const sources = positiveCharges.length > 0 ? positiveCharges : negativeCharges;
    const linesPerCharge = 12;
    const maxSteps = 300;
    const ds = 0.03;

    for (const src of sources) {
      for (let li = 0; li < linesPerCharge; li++) {
        const angle = (2 * Math.PI * li) / linesPerCharge;
        let x = src.x + 0.05 * Math.cos(angle);
        let y = src.y + 0.05 * Math.sin(angle);
        const direction = src.q > 0 ? 1 : -1;

        ctx.strokeStyle = 'rgba(34,211,238,0.6)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        const [sx, sy] = toScreen(x, y);
        ctx.moveTo(sx, sy);

        let terminated = false;
        for (let step = 0; step < maxSteps; step++) {
          const { Ex, Ey } = computeEField(charges, x, y);
          const mag = Math.sqrt(Ex * Ex + Ey * Ey);
          if (mag < 1e-3 || !isFinite(mag)) break;

          // RK4
          const dx1 = direction * Ex / mag;
          const dy1 = direction * Ey / mag;

          const { Ex: Ex2, Ey: Ey2 } = computeEField(charges, x + 0.5 * ds * dx1, y + 0.5 * ds * dy1);
          const mag2 = Math.sqrt(Ex2 * Ex2 + Ey2 * Ey2) || 1;
          const dx2 = direction * Ex2 / mag2;
          const dy2 = direction * Ey2 / mag2;

          const { Ex: Ex3, Ey: Ey3 } = computeEField(charges, x + 0.5 * ds * dx2, y + 0.5 * ds * dy2);
          const mag3 = Math.sqrt(Ex3 * Ex3 + Ey3 * Ey3) || 1;
          const dx3 = direction * Ex3 / mag3;
          const dy3 = direction * Ey3 / mag3;

          const { Ex: Ex4, Ey: Ey4 } = computeEField(charges, x + ds * dx3, y + ds * dy3);
          const mag4 = Math.sqrt(Ex4 * Ex4 + Ey4 * Ey4) || 1;
          const dx4 = direction * Ex4 / mag4;
          const dy4 = direction * Ey4 / mag4;

          x += ds * (dx1 + 2 * dx2 + 2 * dx3 + dx4) / 6;
          y += ds * (dy1 + 2 * dy2 + 2 * dy3 + dy4) / 6;

          // Check if near a sink charge
          for (const c of charges) {
            if (c === src) continue;
            const dr = Math.sqrt((x - c.x) ** 2 + (y - c.y) ** 2);
            if (dr < 0.08) { terminated = true; break; }
          }
          if (terminated) break;

          // Check bounds
          if (Math.abs(x) > 4 || Math.abs(y) > 4) break;

          const [lx, ly] = toScreen(x, y);
          ctx.lineTo(lx, ly);
        }
        ctx.stroke();
      }
    }

    // Draw charges
    for (const c of charges) {
      const [sx, sy] = toScreen(c.x, c.y);
      const r = 10;
      ctx.beginPath();
      ctx.arc(sx, sy, r, 0, 2 * Math.PI);
      ctx.fillStyle = c.q > 0 ? '#ef4444' : '#3b82f6';
      ctx.fill();
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.stroke();

      // +/- label
      ctx.fillStyle = 'white';
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(c.q > 0 ? '+' : '-', sx, sy);
    }

    // Draw probe point
    const [px, py] = toScreen(probeX, probeY);
    ctx.beginPath();
    ctx.arc(px, py, 5, 0, 2 * Math.PI);
    ctx.fillStyle = '#22d3ee';
    ctx.fill();
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Probe field arrow
    const { Ex: pEx, Ey: pEy } = computeEField(charges, probeX, probeY);
    const pMag = Math.sqrt(pEx * pEx + pEy * pEy);
    if (pMag > 0.1) {
      const arrowLen = Math.min(40, Math.log10(pMag + 1) * 20);
      const ax = pEx / pMag * arrowLen;
      const ay = -pEy / pMag * arrowLen; // flip y for screen
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px + ax, py + ay);
      ctx.stroke();

      const angle = Math.atan2(ay, ax);
      const headLen = 6;
      ctx.beginPath();
      ctx.moveTo(px + ax, py + ay);
      ctx.lineTo(px + ax - headLen * Math.cos(angle - 0.4), py + ay - headLen * Math.sin(angle - 0.4));
      ctx.moveTo(px + ax, py + ay);
      ctx.lineTo(px + ax - headLen * Math.cos(angle + 0.4), py + ay - headLen * Math.sin(angle + 0.4));
      ctx.stroke();
    }

    // Labels
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '10px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('E-field lines (cyan) | Equipotentials (dashed)', 10, h - 10);
  }, [charges, probeX, probeY, syncValue]);

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
      <h3 className="text-sm font-semibold text-slate-200 mb-3">Electric Field Visualization</h3>
      <div ref={containerRef} className="w-full" style={{ aspectRatio: '4 / 3' }}>
        <canvas ref={canvasRef} className="w-full h-full rounded" />
      </div>
      <p className="text-xs text-slate-500 mt-2">
        Coulomb superposition: field lines from positive to negative charges, equipotential contours (dashed), probe point (cyan dot)
      </p>
    </div>
  );
};
