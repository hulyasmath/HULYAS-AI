import React, { useRef, useEffect, useMemo } from 'react';
import type { GenomicsParams } from './index';

interface Props {
  params: GenomicsParams;
  result: {
    score: number;
    aligned1: string;
    aligned2: string;
    matrix: number[][];
  };
  elapsedTime: number;
}

const NUCLEOTIDE_COLORS: Record<string, string> = {
  A: '#22c55e', // green
  T: '#ef4444', // red
  C: '#3b82f6', // blue
  G: '#f59e0b', // amber
  U: '#ef4444', // red (RNA)
  '-': '#64748b', // gray
};

const AlignmentMatrix: React.FC<Props> = ({ params, result, elapsedTime }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const seq1 = params.seq1.toUpperCase().replace(/[^ATCGU]/g, '');
  const seq2 = params.seq2.toUpperCase().replace(/[^ATCGU]/g, '');

  // Compute traceback path
  const tracebackPath = useMemo(() => {
    const path: [number, number][] = [];
    const { matrix } = result;
    const m = seq1.length;
    const n = seq2.length;
    const isLocal = params.algorithm === 'smith-waterman';

    let i: number, j: number;

    if (isLocal) {
      // Find max cell
      let maxVal = 0;
      i = 0;
      j = 0;
      for (let ii = 0; ii <= m; ii++) {
        for (let jj = 0; jj <= n; jj++) {
          if (matrix[ii][jj] > maxVal) {
            maxVal = matrix[ii][jj];
            i = ii;
            j = jj;
          }
        }
      }
    } else {
      i = m;
      j = n;
    }

    path.push([i, j]);
    while (i > 0 || j > 0) {
      if (isLocal && matrix[i][j] === 0) break;
      if (i > 0 && j > 0) {
        const s = seq1[i - 1] === seq2[j - 1] ? params.matchScore : params.mismatchPenalty;
        if (matrix[i][j] === matrix[i - 1][j - 1] + s) {
          i--;
          j--;
          path.push([i, j]);
          continue;
        }
      }
      if (i > 0 && matrix[i][j] === matrix[i - 1][j] + params.gapPenalty) {
        i--;
        path.push([i, j]);
      } else {
        j--;
        path.push([i, j]);
      }
    }
    return new Set(path.map(([a, b]) => `${a},${b}`));
  }, [result, seq1, seq2, params]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();
    const w = rect.width;

    const cellSize = Math.min(28, Math.max(14, (w - 80) / (Math.max(seq1.length, seq2.length) + 2)));
    const matrixW = (seq2.length + 2) * cellSize + 60;
    const matrixH = (seq1.length + 2) * cellSize + 60;
    const totalH = matrixH + 120; // extra space for aligned sequences

    canvas.width = w * dpr;
    canvas.height = totalH * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${totalH}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, totalH);

    const ox = 50;
    const oy = 40;

    // Find min/max for color scaling
    const { matrix } = result;
    let minVal = 0;
    let maxVal = 0;
    for (let i = 0; i <= seq1.length; i++) {
      for (let j = 0; j <= seq2.length; j++) {
        if (matrix[i][j] < minVal) minVal = matrix[i][j];
        if (matrix[i][j] > maxVal) maxVal = matrix[i][j];
      }
    }
    const range = maxVal - minVal || 1;

    // Draw matrix heatmap
    for (let i = 0; i <= seq1.length; i++) {
      for (let j = 0; j <= seq2.length; j++) {
        const x = ox + (j + 1) * cellSize;
        const y = oy + (i + 1) * cellSize;
        const val = matrix[i][j];
        const norm = (val - minVal) / range;

        // Color: dark blue -> cyan
        const r = Math.floor(15 + norm * 20);
        const g = Math.floor(23 + norm * 180);
        const b = Math.floor(42 + norm * 196);

        const isOnPath = tracebackPath.has(`${i},${j}`);

        ctx.fillStyle = isOnPath
          ? `rgba(249, 115, 22, ${0.3 + norm * 0.5})`
          : `rgb(${r},${g},${b})`;
        ctx.fillRect(x, y, cellSize - 1, cellSize - 1);

        if (isOnPath) {
          ctx.strokeStyle = '#f97316';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(x, y, cellSize - 1, cellSize - 1);
        }

        // Score text (only if cells are big enough)
        if (cellSize >= 20) {
          ctx.fillStyle = isOnPath ? '#fff' : '#94a3b8';
          ctx.font = `${Math.max(8, cellSize * 0.35)}px monospace`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(String(val), x + cellSize / 2, y + cellSize / 2);
        }
      }
    }

    // Sequence labels
    ctx.font = `bold ${Math.max(10, cellSize * 0.45)}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Top: seq2
    for (let j = 0; j < seq2.length; j++) {
      const c = seq2[j].toUpperCase();
      ctx.fillStyle = NUCLEOTIDE_COLORS[c] || '#94a3b8';
      ctx.fillText(c, ox + (j + 2) * cellSize + cellSize / 2 - 0.5, oy + cellSize / 2);
    }

    // Left: seq1
    ctx.textAlign = 'center';
    for (let i = 0; i < seq1.length; i++) {
      const c = seq1[i].toUpperCase();
      ctx.fillStyle = NUCLEOTIDE_COLORS[c] || '#94a3b8';
      ctx.fillText(c, ox + cellSize / 2, oy + (i + 2) * cellSize + cellSize / 2 - 0.5);
    }

    // Title
    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(
      `${params.algorithm === 'smith-waterman' ? 'Smith-Waterman' : 'Needleman-Wunsch'} Score Matrix`,
      10,
      20
    );
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px sans-serif';
    ctx.fillText(`Score: ${result.score}`, 10, 35);

    // Draw aligned sequences below matrix
    const seqY = matrixH + 10;
    ctx.fillStyle = '#cbd5e1';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Aligned Sequences:', 10, seqY);

    const charW = 14;
    const startX = 10;

    // Alignment row 1
    for (let i = 0; i < result.aligned1.length; i++) {
      const c = result.aligned1[i];
      const isMatch = c === result.aligned2[i] && c !== '-';
      const isMismatch = c !== result.aligned2[i] && c !== '-' && result.aligned2[i] !== '-';

      ctx.fillStyle = isMatch
        ? '#22c55e'
        : isMismatch
          ? '#ef4444'
          : NUCLEOTIDE_COLORS[c] || '#64748b';
      ctx.font = 'bold 13px monospace';
      ctx.fillText(c, startX + i * charW, seqY + 22);
    }

    // Match indicators
    for (let i = 0; i < result.aligned1.length; i++) {
      const c1 = result.aligned1[i];
      const c2 = result.aligned2[i];
      ctx.fillStyle = c1 === c2 && c1 !== '-' ? '#22c55e' : c1 !== '-' && c2 !== '-' ? '#ef4444' : '#334155';
      ctx.font = '13px monospace';
      ctx.fillText(c1 === c2 && c1 !== '-' ? '|' : c1 !== '-' && c2 !== '-' ? 'x' : ' ', startX + i * charW, seqY + 38);
    }

    // Alignment row 2
    for (let i = 0; i < result.aligned2.length; i++) {
      const c = result.aligned2[i];
      const isMatch = c === result.aligned1[i] && c !== '-';
      const isMismatch = c !== result.aligned1[i] && c !== '-' && result.aligned1[i] !== '-';

      ctx.fillStyle = isMatch
        ? '#22c55e'
        : isMismatch
          ? '#ef4444'
          : NUCLEOTIDE_COLORS[c] || '#64748b';
      ctx.font = 'bold 13px monospace';
      ctx.fillText(c, startX + i * charW, seqY + 54);
    }

    // Animated highlight along traceback
    const pathArr = Array.from(tracebackPath).map((s) => s.split(',').map(Number));
    if (pathArr.length > 0) {
      const idx = Math.floor((elapsedTime * 3) % pathArr.length);
      const [pi, pj] = pathArr[idx];
      const hx = ox + (pj + 1) * cellSize;
      const hy = oy + (pi + 1) * cellSize;
      ctx.strokeStyle = 'rgba(34, 211, 238, 0.8)';
      ctx.lineWidth = 2;
      ctx.strokeRect(hx - 1, hy - 1, cellSize + 1, cellSize + 1);
    }
  }, [params, result, seq1, seq2, tracebackPath, elapsedTime]);

  return (
    <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-4">
      <div ref={containerRef} className="w-full overflow-x-auto">
        <canvas ref={canvasRef} className="rounded" />
      </div>
      <div className="flex items-center gap-6 mt-3 text-xs text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded" style={{ backgroundColor: 'rgba(249, 115, 22, 0.5)' }} /> Traceback Path
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-emerald-500 inline-block" /> Match
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-red-500 inline-block" /> Mismatch
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-slate-500 inline-block" /> Gap
        </span>
      </div>
    </div>
  );
};

export default AlignmentMatrix;
