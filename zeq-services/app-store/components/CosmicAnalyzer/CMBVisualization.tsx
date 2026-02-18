import React, { useRef, useEffect, useMemo } from 'react';
import { useZeqSync } from '../SimulationVisualizer/useZeqSync';

interface CMBVisualizationProps {
  resolution: number;
  fluctuationScale: number;
}

// Simple 2D noise generator (value noise with smoothing)
function generateNoiseGrid(width: number, height: number, seed: number, octaves: number = 4): number[][] {
  // Seeded pseudo-random
  const rand = (x: number, y: number, s: number) => {
    const n = Math.sin(x * 12.9898 + y * 78.233 + s * 43.1234) * 43758.5453;
    return n - Math.floor(n);
  };

  // Interpolation helper
  const lerp = (a: number, b: number, t: number) => a + t * (b - a);
  const smoothstep = (t: number) => t * t * (3 - 2 * t);

  const grid: number[][] = Array.from({ length: height }, () => new Array(width).fill(0));

  for (let oct = 0; oct < octaves; oct++) {
    const freq = Math.pow(2, oct);
    const amp = Math.pow(0.5, oct);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const fx = (x / width) * freq;
        const fy = (y / height) * freq;

        const ix = Math.floor(fx);
        const iy = Math.floor(fy);
        const tx = smoothstep(fx - ix);
        const ty = smoothstep(fy - iy);

        const v00 = rand(ix, iy, seed + oct);
        const v10 = rand(ix + 1, iy, seed + oct);
        const v01 = rand(ix, iy + 1, seed + oct);
        const v11 = rand(ix + 1, iy + 1, seed + oct);

        const v = lerp(lerp(v00, v10, tx), lerp(v01, v11, tx), ty);
        grid[y][x] += (v - 0.5) * amp;
      }
    }
  }

  return grid;
}

// Temperature to color (blue -> white -> red)
function tempToColor(delta: number, maxDelta: number): [number, number, number] {
  const t = Math.max(-1, Math.min(1, delta / maxDelta)); // -1 to 1
  if (t < 0) {
    // Cold: blue to white
    const f = 1 + t; // 0 to 1
    return [Math.round(f * 255), Math.round(f * 255), 255];
  } else {
    // Hot: white to red
    const f = 1 - t; // 1 to 0
    return [255, Math.round(f * 255), Math.round(f * 255)];
  }
}

const CMBVisualization: React.FC<CMBVisualizationProps> = ({ resolution, fluctuationScale }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { syncValue, pulseCount } = useZeqSync();

  const noiseGrid = useMemo(
    () => generateNoiseGrid(resolution, resolution, 42),
    [resolution]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const cellW = w / resolution;
    const cellH = h / resolution;

    // Temperature fluctuation: 2.725K +/- 200 microkelvin
    const T0 = 2.7255; // K
    const deltaT = 200e-6; // 200 microkelvin

    const imageData = ctx.createImageData(w, h);

    for (let py = 0; py < h; py++) {
      const gy = Math.min(Math.floor(py / cellH), resolution - 1);
      for (let px = 0; px < w; px++) {
        const gx = Math.min(Math.floor(px / cellW), resolution - 1);

        // Base fluctuation from noise
        let fluctuation = noiseGrid[gy][gx] * fluctuationScale;

        // Add time-varying component synced to HulyaPulse
        fluctuation += syncValue * 0.1 * Math.sin((gx + gy) * 0.3 + pulseCount * 0.1);

        const [r, g, b] = tempToColor(fluctuation * deltaT, deltaT);
        const idx = (py * w + px) * 4;
        imageData.data[idx] = r;
        imageData.data[idx + 1] = g;
        imageData.data[idx + 2] = b;
        imageData.data[idx + 3] = 255;
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }, [noiseGrid, resolution, fluctuationScale, syncValue, pulseCount]);

  return (
    <div className="bg-slate-900 rounded-lg border border-slate-700 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-300">
          CMB Temperature Fluctuation Map
        </h3>
        <span className="text-xs text-slate-500 font-mono">
          T&#8320; = 2.7255 K &plusmn; 200 &mu;K
        </span>
      </div>
      <canvas
        ref={canvasRef}
        width={400}
        height={200}
        className="w-full rounded border border-slate-700"
        style={{ imageRendering: 'pixelated' }}
      />
      {/* Color legend */}
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-1">
          <div className="w-4 h-3 rounded" style={{ backgroundColor: '#0000ff' }} />
          <span className="text-xs text-slate-500">Cold (-200 &mu;K)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-3 rounded" style={{ backgroundColor: '#ffffff' }} />
          <span className="text-xs text-slate-500">2.7255 K</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-3 rounded" style={{ backgroundColor: '#ff0000' }} />
          <span className="text-xs text-slate-500">Hot (+200 &mu;K)</span>
        </div>
      </div>
    </div>
  );
};

export default CMBVisualization;
