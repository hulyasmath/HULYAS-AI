import React, { useRef, useEffect } from 'react';
import type { TrainingEpisode } from './index';

interface TrainingCurvesProps {
  episodes: TrainingEpisode[];
}

function drawChart(
  ctx: CanvasRenderingContext2D,
  data: number[],
  x: number, y: number, w: number, h: number,
  color: string, title: string, yLabel: string,
  smoothWindow: number = 1
) {
  if (data.length === 0) {
    ctx.fillStyle = '#475569';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('No data yet', x + w / 2, y + h / 2);
    return;
  }

  // Smooth data
  const smoothed: number[] = [];
  for (let i = 0; i < data.length; i++) {
    const start = Math.max(0, i - smoothWindow + 1);
    let sum = 0;
    for (let j = start; j <= i; j++) sum += data[j];
    smoothed.push(sum / (i - start + 1));
  }

  const safeData = smoothed.map(v => (isFinite(v) && !isNaN(v)) ? v : 0);
  const minVal = Math.min(...safeData);
  const maxVal = Math.max(...safeData);
  const range = maxVal - minVal || 1;

  // Title
  ctx.fillStyle = '#e2e8f0';
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(title, x, y - 6);

  // Background
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(x, y, w, h);

  // Grid
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 0.5;
  for (let i = 0; i <= 4; i++) {
    const gy = y + (i / 4) * h;
    ctx.beginPath();
    ctx.moveTo(x, gy);
    ctx.lineTo(x + w, gy);
    ctx.stroke();

    const val = maxVal - (i / 4) * range;
    ctx.fillStyle = '#64748b';
    ctx.font = '8px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(val.toFixed(1), x - 3, gy + 3);
  }

  // Plot line
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  for (let i = 0; i < safeData.length; i++) {
    const px = x + (i / Math.max(1, safeData.length - 1)) * w;
    const py = y + h - ((safeData[i] - minVal) / range) * h;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.stroke();

  // Y-axis label
  ctx.save();
  ctx.translate(x - 30, y + h / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillStyle = '#94a3b8';
  ctx.font = '9px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(yLabel, 0, 0);
  ctx.restore();
}

export const TrainingCurves: React.FC<TrainingCurvesProps> = ({ episodes }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    const W = rect.width;
    const H = rect.height;

    // Clear
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, W, H);

    const chartW = W - 80;
    const chartH = (H - 60) / 4 - 15;
    const startX = 55;

    const rewards = episodes.map(e => e.reward);
    const steps = episodes.map(e => e.steps);
    const tdErrors = episodes.map(e => e.tdError);
    const epsilons = episodes.map(e => e.epsilon);

    drawChart(ctx, rewards, startX, 25, chartW, chartH, '#22d3ee', 'Episode Reward', 'Reward', 10);
    drawChart(ctx, tdErrors, startX, 25 + chartH + 30, chartW, chartH, '#f97316', 'TD Error', 'TD Error', 10);
    drawChart(ctx, epsilons, startX, 25 + (chartH + 30) * 2, chartW, chartH, '#a855f7', 'Epsilon Decay', 'Epsilon', 1);
    drawChart(ctx, steps, startX, 25 + (chartH + 30) * 3, chartW, chartH, '#22c55e', 'Steps per Episode', 'Steps', 10);

    // X-axis label
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Episode (${episodes.length} total)`, W / 2, H - 4);
  }, [episodes]);

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
      <canvas
        ref={canvasRef}
        className="w-full rounded"
        style={{ height: 500 }}
      />
    </div>
  );
};
