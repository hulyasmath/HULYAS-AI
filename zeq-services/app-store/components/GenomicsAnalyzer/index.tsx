import React, { useState, useMemo, useCallback } from 'react';
import { AppPageLayout } from '../shared/AppPageLayout';
import { useZeqSync } from '../SimulationVisualizer/useZeqSync';
import { Dna, BarChart3, GitBranch, Clock } from 'lucide-react';
import AlignmentMatrix from './AlignmentMatrix';
import PhylogeneticTree from './PhylogeneticTree';
import GenomicsMetrics from './GenomicsMetrics';

type Tab = 'alignment' | 'phylogeny' | 'statistics';
type Algorithm = 'needleman-wunsch' | 'smith-waterman';

export interface GenomicsParams {
  seq1: string;
  seq2: string;
  matchScore: number;
  mismatchPenalty: number;
  gapPenalty: number;
  algorithm: Algorithm;
}

function safe(v: number): number {
  return Number.isFinite(v) ? v : 0;
}

/** Needleman-Wunsch global alignment */
export function needlemanWunsch(
  s1: string,
  s2: string,
  match: number,
  mismatch: number,
  gap: number
): { score: number; aligned1: string; aligned2: string; matrix: number[][] } {
  const m = s1.length;
  const n = s2.length;
  const F: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  // Initialize
  for (let i = 0; i <= m; i++) F[i][0] = i * gap;
  for (let j = 0; j <= n; j++) F[0][j] = j * gap;

  // Fill
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const s = s1[i - 1] === s2[j - 1] ? match : mismatch;
      F[i][j] = Math.max(
        F[i - 1][j - 1] + s,
        F[i - 1][j] + gap,
        F[i][j - 1] + gap
      );
    }
  }

  // Traceback
  let aligned1 = '';
  let aligned2 = '';
  let i = m;
  let j = n;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0) {
      const s = s1[i - 1] === s2[j - 1] ? match : mismatch;
      if (F[i][j] === F[i - 1][j - 1] + s) {
        aligned1 = s1[i - 1] + aligned1;
        aligned2 = s2[j - 1] + aligned2;
        i--;
        j--;
        continue;
      }
    }
    if (i > 0 && F[i][j] === F[i - 1][j] + gap) {
      aligned1 = s1[i - 1] + aligned1;
      aligned2 = '-' + aligned2;
      i--;
    } else {
      aligned1 = '-' + aligned1;
      aligned2 = s2[j - 1] + aligned2;
      j--;
    }
  }

  return { score: F[m][n], aligned1, aligned2, matrix: F };
}

/** Smith-Waterman local alignment */
export function smithWaterman(
  s1: string,
  s2: string,
  match: number,
  mismatch: number,
  gap: number
): { score: number; aligned1: string; aligned2: string; matrix: number[][] } {
  const m = s1.length;
  const n = s2.length;
  const F: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  let maxScore = 0;
  let maxI = 0;
  let maxJ = 0;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const s = s1[i - 1] === s2[j - 1] ? match : mismatch;
      F[i][j] = Math.max(
        0,
        F[i - 1][j - 1] + s,
        F[i - 1][j] + gap,
        F[i][j - 1] + gap
      );
      if (F[i][j] > maxScore) {
        maxScore = F[i][j];
        maxI = i;
        maxJ = j;
      }
    }
  }

  // Traceback from max cell
  let aligned1 = '';
  let aligned2 = '';
  let i = maxI;
  let j = maxJ;
  while (i > 0 && j > 0 && F[i][j] > 0) {
    const s = s1[i - 1] === s2[j - 1] ? match : mismatch;
    if (F[i][j] === F[i - 1][j - 1] + s) {
      aligned1 = s1[i - 1] + aligned1;
      aligned2 = s2[j - 1] + aligned2;
      i--;
      j--;
    } else if (F[i][j] === F[i - 1][j] + gap) {
      aligned1 = s1[i - 1] + aligned1;
      aligned2 = '-' + aligned2;
      i--;
    } else {
      aligned1 = '-' + aligned1;
      aligned2 = s2[j - 1] + aligned2;
      j--;
    }
  }

  return { score: maxScore, aligned1, aligned2, matrix: F };
}

/** GC content */
export function gcContent(seq: string): number {
  if (!seq.length) return 0;
  let gc = 0;
  for (const c of seq.toUpperCase()) {
    if (c === 'G' || c === 'C') gc++;
  }
  return safe((gc / seq.length) * 100);
}

/** Jukes-Cantor distance */
export function jukesCantor(s1: string, s2: string): number {
  const len = Math.min(s1.length, s2.length);
  if (len === 0) return 0;
  let diff = 0;
  for (let i = 0; i < len; i++) {
    if (s1[i].toUpperCase() !== s2[i].toUpperCase()) diff++;
  }
  const p = diff / len;
  const arg = 1 - (4 / 3) * p;
  if (arg <= 0) return Infinity;
  return safe((-3 / 4) * Math.log(arg));
}

const PRESETS = {
  custom: { label: 'Custom', seq1: 'GATTACA', seq2: 'GCATGCU' },
  foxp2: {
    label: 'FOXP2 Fragment (Human vs Chimp)',
    seq1: 'ATGATGCAGGAATCTGCGACAGATCAGATTACAAGAAG',
    seq2: 'ATGATGCAGGAATCTGCGACAGATCAGATTACAAGAAC',
  },
  rrna: {
    label: '16S rRNA (E.coli vs Salmonella)',
    seq1: 'AAATTGAAGAGTTTGATCATGGCTCAGATTGAACGCTG',
    seq2: 'AAATTGAAGAGTTTGATCATGGCTCAGATTGAACGCTC',
  },
};

const GenomicsAnalyzer: React.FC = () => {
  const { syncValue, elapsedTime, pulseCount } = useZeqSync();
  const [activeTab, setActiveTab] = useState<Tab>('alignment');
  const [preset, setPreset] = useState<keyof typeof PRESETS>('custom');

  const [params, setParams] = useState<GenomicsParams>({
    seq1: 'GATTACA',
    seq2: 'GCATGCU',
    matchScore: 2,
    mismatchPenalty: -1,
    gapPenalty: -2,
    algorithm: 'needleman-wunsch',
  });

  const updateParam = useCallback(
    <K extends keyof GenomicsParams>(key: K, value: GenomicsParams[K]) => {
      setParams((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const handlePreset = useCallback(
    (key: keyof typeof PRESETS) => {
      setPreset(key);
      const p = PRESETS[key];
      setParams((prev) => ({ ...prev, seq1: p.seq1, seq2: p.seq2 }));
    },
    []
  );

  const alignmentResult = useMemo(() => {
    const s1 = params.seq1.toUpperCase().replace(/[^ATCGU]/g, '');
    const s2 = params.seq2.toUpperCase().replace(/[^ATCGU]/g, '');
    if (!s1.length || !s2.length) {
      return { score: 0, aligned1: '', aligned2: '', matrix: [[0]] };
    }
    if (params.algorithm === 'smith-waterman') {
      return smithWaterman(s1, s2, params.matchScore, params.mismatchPenalty, params.gapPenalty);
    }
    return needlemanWunsch(s1, s2, params.matchScore, params.mismatchPenalty, params.gapPenalty);
  }, [params]);

  const stats = useMemo(() => {
    const gc1 = gcContent(params.seq1);
    const gc2 = gcContent(params.seq2);
    const jcDist = jukesCantor(alignmentResult.aligned1, alignmentResult.aligned2);

    // Identity %
    let matches = 0;
    let total = 0;
    for (let i = 0; i < alignmentResult.aligned1.length; i++) {
      if (alignmentResult.aligned1[i] !== '-' && alignmentResult.aligned2[i] !== '-') {
        total++;
        if (alignmentResult.aligned1[i] === alignmentResult.aligned2[i]) matches++;
      }
    }
    const identity = total > 0 ? safe((matches / total) * 100) : 0;

    return { gc1, gc2, jcDist, identity };
  }, [params.seq1, params.seq2, alignmentResult]);

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'alignment', label: 'Alignment', icon: <Dna size={14} /> },
    { id: 'phylogeny', label: 'Phylogeny', icon: <GitBranch size={14} /> },
    { id: 'statistics', label: 'Statistics', icon: <BarChart3 size={14} /> },
  ];

  const sidebar = (
    <div className="space-y-4">
      {/* Preset Sequences */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-cyan-400 mb-3">Presets</h3>
        <div className="space-y-1">
          {Object.entries(PRESETS).map(([key, val]) => (
            <button
              key={key}
              onClick={() => handlePreset(key as keyof typeof PRESETS)}
              className={`w-full text-left px-2 py-1.5 rounded text-xs transition-colors ${
                preset === key
                  ? 'bg-cyan-500/20 text-cyan-400'
                  : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
              }`}
            >
              {val.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sequence Input */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 space-y-3">
        <h3 className="text-sm font-semibold text-cyan-400 mb-1">Sequences</h3>
        <label className="block text-xs text-slate-400">
          Sequence 1:
          <textarea
            value={params.seq1}
            onChange={(e) => updateParam('seq1', e.target.value.toUpperCase())}
            className="w-full mt-1 bg-slate-700 border border-slate-600 rounded px-2 py-1.5 text-xs text-emerald-400 font-mono resize-none"
            rows={3}
            spellCheck={false}
          />
        </label>
        <label className="block text-xs text-slate-400">
          Sequence 2:
          <textarea
            value={params.seq2}
            onChange={(e) => updateParam('seq2', e.target.value.toUpperCase())}
            className="w-full mt-1 bg-slate-700 border border-slate-600 rounded px-2 py-1.5 text-xs text-orange-400 font-mono resize-none"
            rows={3}
            spellCheck={false}
          />
        </label>
      </div>

      {/* Algorithm & Scoring */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 space-y-3">
        <h3 className="text-sm font-semibold text-cyan-400 mb-1">Algorithm</h3>
        <select
          value={params.algorithm}
          onChange={(e) => updateParam('algorithm', e.target.value as Algorithm)}
          className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1.5 text-sm text-white"
        >
          <option value="needleman-wunsch">Needleman-Wunsch (Global)</option>
          <option value="smith-waterman">Smith-Waterman (Local)</option>
        </select>

        <label className="block text-xs text-slate-400">
          Match: <span className="text-emerald-400 font-mono">+{params.matchScore}</span>
          <input type="range" min={1} max={5} step={1} value={params.matchScore}
            onChange={(e) => updateParam('matchScore', +e.target.value)}
            className="w-full mt-1 accent-emerald-400" />
        </label>
        <label className="block text-xs text-slate-400">
          Mismatch: <span className="text-red-400 font-mono">{params.mismatchPenalty}</span>
          <input type="range" min={-3} max={-1} step={1} value={params.mismatchPenalty}
            onChange={(e) => updateParam('mismatchPenalty', +e.target.value)}
            className="w-full mt-1 accent-red-400" />
        </label>
        <label className="block text-xs text-slate-400">
          Gap: <span className="text-amber-400 font-mono">{params.gapPenalty}</span>
          <input type="range" min={-5} max={-1} step={1} value={params.gapPenalty}
            onChange={(e) => updateParam('gapPenalty', +e.target.value)}
            className="w-full mt-1 accent-amber-400" />
        </label>
      </div>

      {/* Sync Info */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-2">
          <Clock size={14} className="text-cyan-400" />
          <span className="text-xs text-slate-400">HulyaPulse Sync</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-slate-500">Pulse</span>
            <p className="text-cyan-400 font-mono">{pulseCount}</p>
          </div>
          <div>
            <span className="text-slate-500">Sync</span>
            <p className="text-cyan-400 font-mono">{syncValue.toFixed(4)}</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <AppPageLayout
      title="Genomics Sequence Analyzer"
      description="Sequence alignment, phylogenetic analysis, and genomic statistics"
      domain="life-sciences"
      sidebar={sidebar}
    >
      {/* Tab Navigation */}
      <div className="flex gap-1 bg-slate-800/50 rounded-lg p-1 border border-slate-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm transition-colors ${
              activeTab === tab.id
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'alignment' && (
        <AlignmentMatrix
          params={params}
          result={alignmentResult}
          elapsedTime={elapsedTime}
        />
      )}
      {activeTab === 'phylogeny' && (
        <PhylogeneticTree
          params={params}
          stats={stats}
          elapsedTime={elapsedTime}
        />
      )}
      {activeTab === 'statistics' && (
        <GenomicsMetrics
          params={params}
          result={alignmentResult}
          stats={stats}
        />
      )}
    </AppPageLayout>
  );
};

export default GenomicsAnalyzer;
