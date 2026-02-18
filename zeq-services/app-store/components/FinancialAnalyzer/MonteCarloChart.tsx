import React, { useRef, useEffect, useMemo } from 'react';
import { useZeqSync } from '../SimulationVisualizer/useZeqSync';
import { EntropyVerifier } from '../shared/EntropyVerifier';
import { KolmogorovChecker } from '../shared/KolmogorovChecker';
import { SimulationResult } from './index';

interface MonteCarloChartProps {
  simulation: SimulationResult;
}

const CANVAS_W = 800;
const CANVAS_H = 400;
const PAD = { top: 20, right: 20, bottom: 40, left: 70 };

const MonteCarloChart: React.FC<MonteCarloChartProps> = ({ simulation }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { pulseCount } = useZeqSync();

  // Determine how many steps to reveal based on animation
  const totalSteps = simulation.meanPath.length - 1;
  const revealedSteps = Math.min(totalSteps, Math.floor(pulseCount * 3) + 1);

  // Compute axis ranges
  const allValues = useMemo(() => {
    const vals: number[] = [];
    for (const path of simulation.paths) {
      for (let t = 0; t <= revealedSteps; t++) {
        vals.push(path[t]);
      }
    }
    return vals;
  }, [simulation.paths, revealedSteps]);

  const yMin = Math.min(...allValues) * 0.95;
  const yMax = Math.max(...allValues) * 1.05;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = CANVAS_W;
    const h = CANVAS_H;
    const plotW = w - PAD.left - PAD.right;
    const plotH = h - PAD.top - PAD.bottom;

    ctx.clearRect(0, 0, w, h);

    // Background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);

    // Grid
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = PAD.top + (plotH / 5) * i;
      ctx.beginPath();
      ctx.moveTo(PAD.left, y);
      ctx.lineTo(w - PAD.right, y);
      ctx.stroke();

      const val = yMax - ((yMax - yMin) / 5) * i;
      ctx.fillStyle = '#64748b';
      ctx.font = '10px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`$${(val / 1000).toFixed(0)}k`, PAD.left - 8, y + 3);
    }

    // X-axis labels
    const stepsPerYear = totalSteps / simulation.years;
    for (let yr = 0; yr <= simulation.years; yr++) {
      const x = PAD.left + (plotW / totalSteps) * (yr * stepsPerYear);
      ctx.fillStyle = '#64748b';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${yr}y`, x, h - PAD.bottom + 16);
    }

    const xScale = (t: number) => PAD.left + (t / totalSteps) * plotW;
    const yScale = (v: number) => PAD.top + plotH - ((v - yMin) / (yMax - yMin)) * plotH;

    // Draw individual paths (low opacity)
    for (const path of simulation.paths) {
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(34, 211, 238, 0.08)';
      ctx.lineWidth = 0.5;
      for (let t = 0; t <= revealedSteps; t++) {
        const x = xScale(t);
        const y = yScale(path[t]);
        t === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // 5th-95th percentile band
    ctx.beginPath();
    for (let t = 0; t <= revealedSteps; t++) {
      const x = xScale(t);
      const y = yScale(simulation.p95Path[t]);
      t === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    for (let t = revealedSteps; t >= 0; t--) {
      const x = xScale(t);
      const y = yScale(simulation.p5Path[t]);
      ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = 'rgba(34, 211, 238, 0.1)';
    ctx.fill();

    // P5 and P95 lines
    const drawLine = (data: number[], color: string, dash: number[] = []) => {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.setLineDash(dash);
      for (let t = 0; t <= revealedSteps; t++) {
        const x = xScale(t);
        const y = yScale(data[t]);
        t === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    };

    drawLine(simulation.p5Path, '#f87171', [4, 4]);
    drawLine(simulation.p95Path, '#4ade80', [4, 4]);
    drawLine(simulation.meanPath, '#22d3ee', []);

    // Legend
    const legendY = PAD.top + 10;
    const items = [
      { label: 'Mean', color: '#22d3ee', dash: false },
      { label: '95th %', color: '#4ade80', dash: true },
      { label: '5th %', color: '#f87171', dash: true },
    ];
    items.forEach((item, i) => {
      const x = PAD.left + 10 + i * 90;
      ctx.beginPath();
      ctx.strokeStyle = item.color;
      ctx.lineWidth = 2;
      if (item.dash) ctx.setLineDash([4, 3]);
      ctx.moveTo(x, legendY);
      ctx.lineTo(x + 20, legendY);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(item.label, x + 24, legendY + 4);
    });
  }, [simulation, revealedSteps, totalSteps, yMin, yMax]);

  const finalValues = useMemo(() => simulation.finalValues, [simulation]);
  const dataStr = useMemo(() => simulation.finalValues.map(v => v.toFixed(2)).join(','), [simulation]);

  return (
    <div className="space-y-4">
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-200 mb-3">
          Monte Carlo Simulation - 100 Paths, {simulation.years} Years
        </h3>
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          className="w-full rounded border border-slate-700"
          style={{ imageRendering: 'auto' }}
        />
        <div className="flex gap-4 mt-3 text-xs text-slate-400">
          <span>Final Mean: <span className="text-cyan-400 font-mono">${(simulation.meanPath[simulation.meanPath.length - 1] / 1000).toFixed(1)}k</span></span>
          <span>5th %: <span className="text-red-400 font-mono">${(simulation.p5Path[simulation.p5Path.length - 1] / 1000).toFixed(1)}k</span></span>
          <span>95th %: <span className="text-emerald-400 font-mono">${(simulation.p95Path[simulation.p95Path.length - 1] / 1000).toFixed(1)}k</span></span>
        </div>
      </div>

      <EntropyVerifier data={finalValues} label="Simulation Entropy" />
      <KolmogorovChecker data={dataStr} label="Simulation Complexity" />
    </div>
  );
};

export default MonteCarloChart;
