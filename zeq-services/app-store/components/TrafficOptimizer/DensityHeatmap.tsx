import React, { useRef, useEffect, useMemo } from 'react';

interface DensityHeatmapProps {
  freeFlowSpeed: number; // km/h
  maxDensity: number;    // veh/km
  elapsedTime: number;
}

/**
 * LWR (Lighthill-Whitham-Richards) traffic model
 * Fundamental diagram: v(rho) = vf * (1 - rho/rho_max)
 * Flow: q = rho * v(rho) = rho * vf * (1 - rho/rho_max)
 * Godunov scheme for conservation law: drho/dt + dq/dx = 0
 */
function lwrSimulation(
  freeFlowSpeed: number,
  maxDensity: number,
  nX: number,
  nT: number,
): number[][] {
  const vf = freeFlowSpeed / 3.6; // convert to m/s
  const dx = 10; // meters per cell
  const dt = 0.5; // seconds per step

  // Fundamental diagram flow function
  const flux = (rho: number) => {
    const v = vf * (1 - rho / maxDensity);
    return rho * Math.max(v, 0);
  };

  // Godunov numerical flux
  const godunovFlux = (rhoL: number, rhoR: number): number => {
    if (rhoL <= rhoR) {
      // Possibly a rarefaction: min of flux
      const rhoCrit = maxDensity / 2;
      if (rhoL >= rhoCrit) return flux(rhoL);
      if (rhoR <= rhoCrit) return flux(rhoR);
      return flux(rhoCrit); // sonic point
    } else {
      // Shock: max of flux
      return Math.max(flux(rhoL), flux(rhoR));
    }
  };

  // Initialize density: high density region in center
  const density: number[][] = [];
  const initial: number[] = new Array(nX).fill(0);
  for (let i = 0; i < nX; i++) {
    const x = i / nX;
    if (x > 0.3 && x < 0.5) {
      initial[i] = maxDensity * 0.8; // jam
    } else if (x > 0.7 && x < 0.8) {
      initial[i] = maxDensity * 0.5; // moderate
    } else {
      initial[i] = maxDensity * 0.15; // free flow
    }
  }
  density.push([...initial]);

  let current = [...initial];
  for (let t = 1; t < nT; t++) {
    const next = [...current];
    for (let i = 1; i < nX - 1; i++) {
      const fRight = godunovFlux(current[i], current[i + 1]);
      const fLeft = godunovFlux(current[i - 1], current[i]);
      next[i] = current[i] - (dt / dx) * (fRight - fLeft);
      // Clamp
      next[i] = Math.max(0, Math.min(maxDensity, next[i]));
      if (!isFinite(next[i])) next[i] = 0;
    }
    current = next;
    // Store every 4th timestep for display
    if (t % 4 === 0) {
      density.push([...current]);
    }
  }

  return density;
}

export const DensityHeatmap: React.FC<DensityHeatmapProps> = ({
  freeFlowSpeed,
  maxDensity,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const nX = 100;
  const nT = 400;

  const simData = useMemo(
    () => lwrSimulation(freeFlowSpeed, maxDensity, nX, nT),
    [freeFlowSpeed, maxDensity],
  );

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
    const pad = { top: 30, right: 60, bottom: 40, left: 55 };
    const plotW = w - pad.left - pad.right;
    const plotH = h - pad.top - pad.bottom;

    ctx.fillStyle = 'rgba(15,23,42,0.8)';
    ctx.fillRect(0, 0, w, h);

    const rows = simData.length;
    const cols = nX;
    const cellW = plotW / cols;
    const cellH = plotH / rows;

    // Draw heatmap
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const density = simData[r][c];
        const ratio = Math.min(density / maxDensity, 1);

        // Color gradient: green -> yellow -> red
        let red, green, blue;
        if (ratio < 0.33) {
          const t = ratio / 0.33;
          red = Math.floor(34 + 200 * t);
          green = Math.floor(197 - 50 * t);
          blue = 34;
        } else if (ratio < 0.66) {
          const t = (ratio - 0.33) / 0.33;
          red = Math.floor(234 + 20 * t);
          green = Math.floor(147 - 100 * t);
          blue = 34;
        } else {
          const t = (ratio - 0.66) / 0.34;
          red = Math.floor(254);
          green = Math.floor(47 - 47 * t);
          blue = Math.floor(34 + 30 * t);
        }

        ctx.fillStyle = `rgba(${red},${green},${blue},0.9)`;
        ctx.fillRect(
          pad.left + c * cellW,
          pad.top + r * cellH,
          cellW + 0.5,
          cellH + 0.5,
        );
      }
    }

    // Axes
    ctx.fillStyle = 'rgba(148,163,184,0.6)';
    ctx.font = '11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Position (x)', w / 2, h - 5);

    ctx.save();
    ctx.translate(12, h / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Time (t)', 0, 0);
    ctx.restore();

    // Tick labels
    for (let i = 0; i <= 5; i++) {
      const x = pad.left + (i / 5) * plotW;
      ctx.fillText(`${(i * 20).toFixed(0)}%`, x, pad.top + plotH + 18);
    }
    ctx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
      const y = pad.top + (i / 5) * plotH;
      const timeLabel = ((i / 5) * nT * 0.5).toFixed(0);
      ctx.fillText(`${timeLabel}s`, pad.left - 5, y + 4);
    }

    // Color bar
    const barX = w - pad.right + 10;
    const barW = 15;
    for (let i = 0; i < plotH; i++) {
      const ratio = 1 - i / plotH;
      let r2, g2;
      if (ratio < 0.33) {
        const t = ratio / 0.33;
        r2 = Math.floor(34 + 200 * t);
        g2 = Math.floor(197 - 50 * t);
      } else if (ratio < 0.66) {
        const t = (ratio - 0.33) / 0.33;
        r2 = Math.floor(234 + 20 * t);
        g2 = Math.floor(147 - 100 * t);
      } else {
        const t = (ratio - 0.66) / 0.34;
        r2 = 254;
        g2 = Math.floor(47 - 47 * t);
      }
      ctx.fillStyle = `rgba(${r2},${g2},34,0.9)`;
      ctx.fillRect(barX, pad.top + i, barW, 1);
    }

    ctx.fillStyle = 'rgba(148,163,184,0.6)';
    ctx.font = '9px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`${maxDensity}`, barX + barW + 3, pad.top + 8);
    ctx.fillText('0', barX + barW + 3, pad.top + plotH);
    ctx.fillText('veh/km', barX + barW + 3, pad.top + plotH / 2);

    // Title
    ctx.fillStyle = 'rgba(226,232,240,0.8)';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('LWR Space-Time Density Heatmap', pad.left, pad.top - 10);
  }, [simData, maxDensity]);

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
      <h3 className="text-sm font-medium text-slate-200 mb-3">
        LWR Wave Propagation (Godunov Scheme)
      </h3>
      <canvas
        ref={canvasRef}
        className="w-full rounded"
        style={{ height: 320 }}
      />
    </div>
  );
};
