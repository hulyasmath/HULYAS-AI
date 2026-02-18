import React, { useMemo } from 'react';
import type { GenomicsParams } from './index';
import { jukesCantor } from './index';

interface Props {
  params: GenomicsParams;
  stats: { gc1: number; gc2: number; jcDist: number; identity: number };
  elapsedTime: number;
}

interface TreeNode {
  label: string;
  left?: TreeNode;
  right?: TreeNode;
  branchLength: number;
  x?: number;
  y?: number;
}

/** Simple neighbor-joining with 4 sequences derived from input */
function buildTree(seq1: string, seq2: string): TreeNode {
  // Create 4 "species" from input sequences
  const seqs = [
    { label: 'Seq1', seq: seq1 },
    { label: 'Seq2', seq: seq2 },
    { label: 'Seq1-mut', seq: mutate(seq1, 0.15) },
    { label: 'Seq2-mut', seq: mutate(seq2, 0.2) },
  ];

  // Distance matrix
  const n = seqs.length;
  const D: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const d = jukesCantor(seqs[i].seq, seqs[j].seq);
      const dSafe = Number.isFinite(d) ? d : 2;
      D[i][j] = dSafe;
      D[j][i] = dSafe;
    }
  }

  // Neighbor-joining
  const active = seqs.map((s, i) => i);
  const nodes: TreeNode[] = seqs.map((s) => ({ label: s.label, branchLength: 0 }));

  while (active.length > 2) {
    const m = active.length;

    // Compute Q matrix
    let minQ = Infinity;
    let minI = 0;
    let minJ = 1;

    for (let a = 0; a < m; a++) {
      for (let b = a + 1; b < m; b++) {
        const i = active[a];
        const j = active[b];
        let sumI = 0;
        let sumJ = 0;
        for (const k of active) {
          sumI += D[i][k];
          sumJ += D[j][k];
        }
        const q = (m - 2) * D[i][j] - sumI - sumJ;
        if (q < minQ) {
          minQ = q;
          minI = a;
          minJ = b;
        }
      }
    }

    const iIdx = active[minI];
    const jIdx = active[minJ];

    // Branch lengths
    let sumI = 0;
    let sumJ = 0;
    for (const k of active) {
      sumI += D[iIdx][k];
      sumJ += D[jIdx][k];
    }
    const denom = 2 * (m - 2) || 1;
    const li = D[iIdx][jIdx] / 2 + (sumI - sumJ) / denom;
    const lj = D[iIdx][jIdx] - li;

    // Create new node
    const newNode: TreeNode = {
      label: `Node${nodes.length}`,
      left: { ...nodes[iIdx], branchLength: Math.max(0, li) },
      right: { ...nodes[jIdx], branchLength: Math.max(0, lj) },
      branchLength: 0,
    };

    // Update distance matrix
    const newIdx = nodes.length;
    nodes.push(newNode);

    const newRow = new Array(newIdx + 1).fill(0);
    for (let k = 0; k < newIdx; k++) {
      newRow[k] = 0;
    }
    for (const k of active) {
      if (k === iIdx || k === jIdx) continue;
      const d = (D[iIdx][k] + D[jIdx][k] - D[iIdx][jIdx]) / 2;
      newRow[k] = Math.max(0, d);
    }

    // Expand D
    for (let r = 0; r < D.length; r++) {
      D[r].push(newRow[r] || 0);
    }
    D.push([...newRow, 0]);

    // Update active
    active.splice(minJ, 1);
    active.splice(minI, 1);
    active.push(newIdx);
  }

  if (active.length === 2) {
    const dist = D[active[0]][active[1]] / 2;
    return {
      label: 'Root',
      left: { ...nodes[active[0]], branchLength: Math.max(0, dist) },
      right: { ...nodes[active[1]], branchLength: Math.max(0, dist) },
      branchLength: 0,
    };
  }

  return nodes[active[0]];
}

function mutate(seq: string, rate: number): string {
  const bases = 'ATCG';
  let result = '';
  for (const c of seq) {
    if (Math.random() < rate) {
      let newBase = c;
      while (newBase === c) {
        newBase = bases[Math.floor(Math.random() * 4)];
      }
      result += newBase;
    } else {
      result += c;
    }
  }
  return result;
}

function layoutTree(node: TreeNode, x: number, y: number, ySpacing: number, depth: number): { leafCount: number } {
  if (!node.left && !node.right) {
    node.x = x;
    node.y = y;
    return { leafCount: 1 };
  }

  let currentY = y;
  let totalLeaves = 0;

  if (node.left) {
    const leftResult = layoutTree(node.left, x + 80, currentY, ySpacing, depth + 1);
    totalLeaves += leftResult.leafCount;
    currentY = y + leftResult.leafCount * ySpacing;
  }
  if (node.right) {
    const rightResult = layoutTree(node.right, x + 80, currentY, ySpacing, depth + 1);
    totalLeaves += rightResult.leafCount;
  }

  node.x = x;
  const topY = node.left?.y ?? y;
  const bottomY = node.right?.y ?? y;
  node.y = (topY + bottomY) / 2;

  return { leafCount: totalLeaves };
}

function renderTreeEdges(node: TreeNode, elapsedTime: number): React.ReactNode[] {
  const elements: React.ReactNode[] = [];
  if (!node.x || !node.y) return elements;

  const drawChild = (child: TreeNode, key: string) => {
    if (!child.x || !child.y) return;
    // Horizontal line from parent to child's x level
    elements.push(
      <line key={`h-${key}`}
        x1={node.x} y1={node.y}
        x2={node.x} y2={child.y}
        stroke="#334155" strokeWidth={1.5} />
    );
    elements.push(
      <line key={`v-${key}`}
        x1={node.x} y1={child.y}
        x2={child.x} y2={child.y}
        stroke="#22d3ee" strokeWidth={1.5} />
    );
    // Branch length label
    if (child.branchLength > 0.001) {
      elements.push(
        <text key={`bl-${key}`}
          x={(node.x + child.x) / 2}
          y={child.y - 6}
          textAnchor="middle" fill="#94a3b8" fontSize={9} className="font-mono">
          {child.branchLength.toFixed(3)}
        </text>
      );
    }
  };

  if (node.left) {
    drawChild(node.left, `l-${node.label}`);
    elements.push(...renderTreeEdges(node.left, elapsedTime));
  }
  if (node.right) {
    drawChild(node.right, `r-${node.label}`);
    elements.push(...renderTreeEdges(node.right, elapsedTime));
  }

  return elements;
}

function renderTreeNodes(node: TreeNode, elapsedTime: number): React.ReactNode[] {
  const elements: React.ReactNode[] = [];
  if (!node.x || !node.y) return elements;

  const isLeaf = !node.left && !node.right;
  const pulse = Math.sin(elapsedTime * 2 + (node.x || 0) * 0.1);

  elements.push(
    <g key={`node-${node.label}`}>
      <circle
        cx={node.x} cy={node.y}
        r={isLeaf ? 5 : 3}
        fill={isLeaf ? '#22d3ee' : '#f97316'}
        opacity={0.8 + pulse * 0.2}
      />
      {isLeaf && (
        <text
          x={(node.x || 0) + 10} y={(node.y || 0) + 4}
          fill="#e2e8f0" fontSize={11} fontWeight="bold">
          {node.label}
        </text>
      )}
    </g>
  );

  if (node.left) elements.push(...renderTreeNodes(node.left, elapsedTime));
  if (node.right) elements.push(...renderTreeNodes(node.right, elapsedTime));

  return elements;
}

const PhylogeneticTree: React.FC<Props> = ({ params, stats, elapsedTime }) => {
  const tree = useMemo(() => {
    const s1 = params.seq1.toUpperCase().replace(/[^ATCGU]/g, '');
    const s2 = params.seq2.toUpperCase().replace(/[^ATCGU]/g, '');
    if (s1.length < 2 || s2.length < 2) return null;
    const t = buildTree(s1, s2);
    layoutTree(t, 40, 40, 60, 0);
    return t;
  }, [params.seq1, params.seq2]);

  if (!tree) {
    return (
      <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-8 text-center text-slate-400">
        Sequences too short for phylogenetic analysis. Enter at least 2 nucleotides each.
      </div>
    );
  }

  return (
    <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-slate-200 mb-3">
        Neighbor-Joining Phylogenetic Tree
        <span className="ml-2 text-xs text-slate-500">Jukes-Cantor distances</span>
      </h3>

      <svg viewBox="0 0 500 300" className="w-full" style={{ maxHeight: 350 }}>
        <rect width="500" height="300" fill="#0f172a" rx={8} />

        {/* Scale bar */}
        <line x1={350} y1={280} x2={450} y2={280} stroke="#64748b" strokeWidth={1} />
        <text x={400} y={295} textAnchor="middle" fill="#94a3b8" fontSize={9} className="font-mono">
          0.1 substitutions/site
        </text>

        {renderTreeEdges(tree, elapsedTime)}
        {renderTreeNodes(tree, elapsedTime)}
      </svg>

      <div className="grid grid-cols-3 gap-3 mt-4">
        <div className="bg-slate-900/50 rounded-lg p-3 text-center">
          <span className="text-xs text-slate-400 block">J-C Distance</span>
          <span className="text-lg font-mono font-bold text-cyan-400">
            {Number.isFinite(stats.jcDist) ? stats.jcDist.toFixed(4) : 'N/A'}
          </span>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-3 text-center">
          <span className="text-xs text-slate-400 block">Identity</span>
          <span className="text-lg font-mono font-bold text-emerald-400">
            {stats.identity.toFixed(1)}%
          </span>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-3 text-center">
          <span className="text-xs text-slate-400 block">Species</span>
          <span className="text-lg font-mono font-bold text-orange-400">4</span>
        </div>
      </div>
    </div>
  );
};

export default PhylogeneticTree;
