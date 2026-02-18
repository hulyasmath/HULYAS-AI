import React, { useMemo } from 'react';
import { BarChart3, Target, TrendingUp } from 'lucide-react';
import { useZeqSync } from '../SimulationVisualizer/useZeqSync';
import { PrecisionBadge } from '../shared/PrecisionBadge';
import { EntropyVerifier } from '../shared/EntropyVerifier';
import { KolmogorovChecker } from '../shared/KolmogorovChecker';
import type { GridCell, TrainingEpisode, Algorithm } from './index';

interface RLMetricsProps {
  grid: GridCell[][];
  episodes: TrainingEpisode[];
  algorithm: Algorithm;
  gridSize: number;
}

export const RLMetrics: React.FC<RLMetricsProps> = ({ grid, episodes, algorithm, gridSize }) => {
  const { syncValue, elapsedTime, pulseCount } = useZeqSync();

  const stats = useMemo(() => {
    // Q-table statistics
    const allQ: number[] = [];
    let nonZero = 0;
    for (const row of grid) {
      for (const cell of row) {
        for (const q of cell.qValues) {
          const v = isFinite(q) ? q : 0;
          allQ.push(v);
          if (v !== 0) nonZero++;
        }
      }
    }

    const meanQ = allQ.length > 0 ? allQ.reduce((a, b) => a + b, 0) / allQ.length : 0;
    const maxQ = allQ.length > 0 ? Math.max(...allQ) : 0;
    const minQ = allQ.length > 0 ? Math.min(...allQ) : 0;

    // Convergence check: look at last 20 episodes
    const last20 = episodes.slice(-20);
    const avgTdLast20 = last20.length > 0
      ? last20.reduce((s, e) => s + e.tdError, 0) / last20.length
      : Infinity;
    const isConverged = last20.length >= 20 && avgTdLast20 < 0.1;

    // Recent reward average
    const last50 = episodes.slice(-50);
    const avgReward = last50.length > 0
      ? last50.reduce((s, e) => s + e.reward, 0) / last50.length
      : 0;
    const avgSteps = last50.length > 0
      ? last50.reduce((s, e) => s + e.steps, 0) / last50.length
      : 0;

    // Optimal path for default grid: from (0,0) to (size-1,size-1) minimum steps
    const optimalSteps = (gridSize - 1) * 2; // Manhattan distance, no walls

    return {
      allQ, meanQ, maxQ, minQ, nonZero,
      totalStates: grid.length * grid[0].length,
      totalEpisodes: episodes.length,
      avgTdLast20, isConverged,
      avgReward, avgSteps, optimalSteps,
    };
  }, [grid, episodes, gridSize]);

  const qValueArray = useMemo(() => stats.allQ.filter(q => q !== 0), [stats.allQ]);
  const serializedState = useMemo(() => JSON.stringify({
    gridSize,
    algorithm,
    episodes: stats.totalEpisodes,
    meanQ: stats.meanQ,
    maxQ: stats.maxQ,
    converged: stats.isConverged,
    sync: syncValue,
  }), [gridSize, algorithm, stats, syncValue]);

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 size={16} className="text-cyan-400" />
            <span className="text-xs text-slate-400">Total Episodes</span>
          </div>
          <p className="text-2xl font-bold font-mono text-white">{stats.totalEpisodes}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={16} className="text-orange-400" />
            <span className="text-xs text-slate-400">Avg Reward (last 50)</span>
          </div>
          <p className="text-2xl font-bold font-mono text-white">
            {isFinite(stats.avgReward) ? stats.avgReward.toFixed(1) : '0'}
          </p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target size={16} className="text-emerald-400" />
            <span className="text-xs text-slate-400">Convergence</span>
          </div>
          <p className={`text-lg font-bold ${stats.isConverged ? 'text-emerald-400' : 'text-amber-400'}`}>
            {stats.isConverged ? 'Converged' : 'Training...'}
          </p>
          <p className="text-xs text-slate-400 font-mono">TD err: {stats.avgTdLast20.toFixed(4)}</p>
        </div>
      </div>

      {/* Q-Table Statistics */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-200 mb-3">Q-Table Statistics</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-400">States</span>
            <span className="font-mono text-slate-200">{stats.totalStates}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">State-Action Pairs</span>
            <span className="font-mono text-slate-200">{stats.totalStates * 4}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Non-Zero Q Values</span>
            <span className="font-mono text-slate-200">{stats.nonZero}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Coverage</span>
            <span className="font-mono text-cyan-400">
              {((stats.nonZero / (stats.totalStates * 4)) * 100).toFixed(1)}%
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Max Q</span>
            <span className="font-mono text-emerald-400">{stats.maxQ.toFixed(3)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Min Q</span>
            <span className="font-mono text-red-400">{stats.minQ.toFixed(3)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Mean Q</span>
            <span className="font-mono text-slate-200">{stats.meanQ.toFixed(3)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Algorithm</span>
            <span className="font-mono text-cyan-400">
              {algorithm === 'qlearning' ? 'Q-Learning' : 'SARSA'}
            </span>
          </div>
        </div>
      </div>

      {/* Performance */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-200 mb-3">Performance</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-400">Avg Steps (last 50)</span>
            <span className="font-mono text-slate-200">{stats.avgSteps.toFixed(1)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Optimal Steps</span>
            <span className="font-mono text-emerald-400">{stats.optimalSteps}</span>
          </div>
        </div>
      </div>

      {/* Sync footer */}
      <div className="text-xs text-slate-500 text-right font-mono">
        HulyaPulse sync: {syncValue.toFixed(6)} | t={elapsedTime.toFixed(1)}s | pulse #{pulseCount}
      </div>

      {/* Verification Badges */}
      <div className="space-y-3">
        <PrecisionBadge
          computed={stats.avgSteps}
          reference={stats.optimalSteps}
          label="Avg Steps vs Optimal Path"
        />
        <EntropyVerifier data={qValueArray} label="Q-Value Distribution Entropy" />
        <KolmogorovChecker data={serializedState} label="RL State Complexity" />
      </div>
    </div>
  );
};
