import React, { useState, useCallback, useMemo, useRef } from 'react';
import { Gamepad2, Grid3X3, TrendingUp, BarChart3 } from 'lucide-react';
import { AppPageLayout } from '../shared/AppPageLayout';
import { GridWorldView } from './GridWorldView';
import { TrainingCurves } from './TrainingCurves';
import { RLMetrics } from './RLMetrics';

export type Algorithm = 'qlearning' | 'sarsa';
export type CellType = 'empty' | 'wall' | 'goal' | 'pit';

export interface GridCell {
  type: CellType;
  qValues: [number, number, number, number]; // [up, down, left, right]
}

export interface TrainingEpisode {
  reward: number;
  steps: number;
  tdError: number;
  epsilon: number;
}

type TabId = 'gridworld' | 'training' | 'metrics';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'gridworld', label: 'Grid World', icon: <Grid3X3 size={16} /> },
  { id: 'training', label: 'Training Curves', icon: <TrendingUp size={16} /> },
  { id: 'metrics', label: 'Metrics', icon: <BarChart3 size={16} /> },
];

function initGrid(size: number): GridCell[][] {
  const grid: GridCell[][] = [];
  for (let r = 0; r < size; r++) {
    const row: GridCell[] = [];
    for (let c = 0; c < size; c++) {
      row.push({ type: 'empty', qValues: [0, 0, 0, 0] });
    }
    grid.push(row);
  }
  // Goal at bottom-right
  grid[size - 1][size - 1].type = 'goal';
  // A couple of walls and pits for interest
  if (size >= 4) {
    grid[1][1].type = 'wall';
    grid[2][3 % size].type = 'pit';
  }
  return grid;
}

// Direction deltas: [up, down, left, right]
const DR = [-1, 1, 0, 0];
const DC = [0, 0, -1, 1];

function getReward(cell: CellType): number {
  if (cell === 'goal') return 10;
  if (cell === 'pit') return -10;
  return -1;
}

const RLPlayground: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('gridworld');
  const [gridSize, setGridSize] = useState(5);
  const [grid, setGrid] = useState<GridCell[][]>(() => initGrid(5));
  const [algorithm, setAlgorithm] = useState<Algorithm>('qlearning');
  const [alpha, setAlpha] = useState(0.1);
  const [gamma, setGamma] = useState(0.95);
  const [epsilonStart, setEpsilonStart] = useState(1.0);
  const [epsilonDecay, setEpsilonDecay] = useState(0.995);
  const [epsilonMin, setEpsilonMin] = useState(0.01);
  const [batchSize, setBatchSize] = useState(10);
  const [episodes, setEpisodes] = useState<TrainingEpisode[]>([]);
  const [agentPos, setAgentPos] = useState<[number, number]>([0, 0]);
  const [isTraining, setIsTraining] = useState(false);
  const epsilonRef = useRef(1.0);
  const trainIntervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetGrid = useCallback((size: number) => {
    setGridSize(size);
    setGrid(initGrid(size));
    setEpisodes([]);
    setAgentPos([0, 0]);
    epsilonRef.current = epsilonStart;
    if (trainIntervalRef.current) {
      clearTimeout(trainIntervalRef.current);
      trainIntervalRef.current = null;
    }
    setIsTraining(false);
  }, [epsilonStart]);

  const toggleCell = useCallback((r: number, c: number) => {
    if (isTraining) return;
    setGrid(prev => {
      const next = prev.map(row => row.map(cell => ({ ...cell })));
      const cycle: CellType[] = ['empty', 'wall', 'pit', 'goal'];
      const curr = cycle.indexOf(next[r][c].type);
      next[r][c].type = cycle[(curr + 1) % cycle.length];
      return next;
    });
  }, [isTraining]);

  const runBatch = useCallback(() => {
    setGrid(prevGrid => {
      const g = prevGrid.map(row => row.map(cell => ({
        type: cell.type,
        qValues: [...cell.qValues] as [number, number, number, number],
      })));
      const size = g.length;
      const newEpisodes: TrainingEpisode[] = [];

      for (let ep = 0; ep < batchSize; ep++) {
        let r = 0, c = 0;
        let totalReward = 0;
        let steps = 0;
        let maxTdError = 0;
        const eps = epsilonRef.current;

        // Epsilon-greedy action selection
        const selectAction = (row: number, col: number): number => {
          if (Math.random() < eps) return Math.floor(Math.random() * 4);
          const q = g[row][col].qValues;
          let bestA = 0;
          for (let a = 1; a < 4; a++) {
            if (q[a] > q[bestA]) bestA = a;
          }
          return bestA;
        };

        let action = selectAction(r, c);

        while (steps < size * size * 4) {
          const nr = Math.max(0, Math.min(size - 1, r + DR[action]));
          const nc = Math.max(0, Math.min(size - 1, c + DC[action]));

          // If wall, stay in place
          const nextR = g[nr][nc].type === 'wall' ? r : nr;
          const nextC = g[nr][nc].type === 'wall' ? c : nc;
          const reward = getReward(g[nextR][nextC].type);
          totalReward += reward;

          if (algorithm === 'qlearning') {
            const maxQ = Math.max(...g[nextR][nextC].qValues);
            const safeMaxQ = isFinite(maxQ) ? maxQ : 0;
            const td = reward + gamma * safeMaxQ - g[r][c].qValues[action];
            g[r][c].qValues[action] += alpha * td;
            maxTdError = Math.max(maxTdError, Math.abs(td));
          } else {
            // SARSA
            const nextAction = selectAction(nextR, nextC);
            const nextQ = isFinite(g[nextR][nextC].qValues[nextAction]) ? g[nextR][nextC].qValues[nextAction] : 0;
            const td = reward + gamma * nextQ - g[r][c].qValues[action];
            g[r][c].qValues[action] += alpha * td;
            maxTdError = Math.max(maxTdError, Math.abs(td));
            action = nextAction;
          }

          r = nextR;
          c = nextC;
          steps++;

          if (g[r][c].type === 'goal' || g[r][c].type === 'pit') break;

          if (algorithm === 'qlearning') {
            action = selectAction(r, c);
          }
        }

        // Decay epsilon
        epsilonRef.current = Math.max(epsilonMin, epsilonRef.current * epsilonDecay);

        newEpisodes.push({
          reward: totalReward,
          steps,
          tdError: isFinite(maxTdError) ? maxTdError : 0,
          epsilon: epsilonRef.current,
        });
      }

      setEpisodes(prev => [...prev, ...newEpisodes]);
      setAgentPos([0, 0]);
      return g;
    });
  }, [algorithm, alpha, gamma, epsilonDecay, epsilonMin, batchSize]);

  const startTraining = useCallback(() => {
    setIsTraining(true);
    const tick = () => {
      runBatch();
      trainIntervalRef.current = setTimeout(tick, 100);
    };
    tick();
  }, [runBatch]);

  const stopTraining = useCallback(() => {
    setIsTraining(false);
    if (trainIntervalRef.current) {
      clearTimeout(trainIntervalRef.current);
      trainIntervalRef.current = null;
    }
  }, []);

  const sidebar = (
    <div className="space-y-4">
      {/* Grid Config */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <Gamepad2 size={16} className="text-cyan-400" />
          <h3 className="text-sm font-semibold text-slate-200">Grid World</h3>
        </div>
        <div className="space-y-2">
          <div>
            <label className="text-xs text-slate-400">Grid Size: {gridSize}x{gridSize}</label>
            <input type="range" min={4} max={8} value={gridSize}
              onChange={e => resetGrid(parseInt(e.target.value))}
              className="w-full accent-cyan-500" />
          </div>
          <p className="text-xs text-slate-500">Click cells to cycle: empty / wall / pit / goal</p>
        </div>
      </div>

      {/* Algorithm */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-200 mb-2">Algorithm</h3>
        <div className="flex gap-2">
          {(['qlearning', 'sarsa'] as Algorithm[]).map(alg => (
            <button key={alg} onClick={() => setAlgorithm(alg)}
              className={`flex-1 text-xs py-1.5 rounded transition-colors ${
                algorithm === alg
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'bg-slate-700/50 text-slate-400 border border-slate-600'
              }`}>
              {alg === 'qlearning' ? 'Q-Learning' : 'SARSA'}
            </button>
          ))}
        </div>
      </div>

      {/* Hyperparameters */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 space-y-2">
        <h3 className="text-sm font-semibold text-slate-200 mb-2">Hyperparameters</h3>
        {[
          { label: 'Learning Rate (alpha)', value: alpha, set: setAlpha, min: 0.01, max: 1, step: 0.01 },
          { label: 'Discount (gamma)', value: gamma, set: setGamma, min: 0.5, max: 0.99, step: 0.01 },
          { label: 'Epsilon Decay', value: epsilonDecay, set: setEpsilonDecay, min: 0.99, max: 0.999, step: 0.001 },
          { label: 'Epsilon Min', value: epsilonMin, set: setEpsilonMin, min: 0.01, max: 0.2, step: 0.01 },
        ].map(p => (
          <div key={p.label}>
            <div className="flex justify-between">
              <label className="text-xs text-slate-400">{p.label}</label>
              <span className="text-xs font-mono text-slate-300">{p.value}</span>
            </div>
            <input type="range" min={p.min} max={p.max} step={p.step} value={p.value}
              onChange={e => p.set(parseFloat(e.target.value))}
              className="w-full accent-cyan-500" />
          </div>
        ))}
        <div>
          <div className="flex justify-between">
            <label className="text-xs text-slate-400">Episodes/Batch</label>
            <span className="text-xs font-mono text-slate-300">{batchSize}</span>
          </div>
          <input type="range" min={1} max={100} value={batchSize}
            onChange={e => setBatchSize(parseInt(e.target.value))}
            className="w-full accent-cyan-500" />
        </div>
      </div>

      {/* Controls */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 space-y-2">
        <h3 className="text-sm font-semibold text-slate-200 mb-2">Training</h3>
        <div className="flex gap-2">
          {isTraining ? (
            <button onClick={stopTraining}
              className="flex-1 py-2 text-sm rounded bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-colors">
              Stop
            </button>
          ) : (
            <button onClick={startTraining}
              className="flex-1 py-2 text-sm rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/30 transition-colors">
              Train
            </button>
          )}
          <button onClick={runBatch}
            className="flex-1 py-2 text-sm rounded bg-slate-700/50 text-slate-300 border border-slate-600 hover:bg-slate-700 transition-colors">
            Step
          </button>
        </div>
        <button onClick={() => resetGrid(gridSize)}
          className="w-full py-1.5 text-xs rounded bg-slate-700/50 text-slate-400 border border-slate-600 hover:bg-slate-700 transition-colors">
          Reset
        </button>
        <p className="text-xs text-slate-500 font-mono">
          Episodes: {episodes.length} | Epsilon: {epsilonRef.current.toFixed(4)}
        </p>
      </div>
    </div>
  );

  return (
    <AppPageLayout
      title="Reinforcement Learning Playground"
      description="Interactive Q-learning and SARSA on configurable grid worlds"
      domain="Machine Learning"
      sidebar={sidebar}
    >
      <div className="flex gap-1 bg-slate-800/50 border border-slate-700 rounded-lg p-1">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
            }`}>
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'gridworld' && (
        <GridWorldView grid={grid} agentPos={agentPos} onCellClick={toggleCell} />
      )}
      {activeTab === 'training' && (
        <TrainingCurves episodes={episodes} />
      )}
      {activeTab === 'metrics' && (
        <RLMetrics grid={grid} episodes={episodes} algorithm={algorithm} gridSize={gridSize} />
      )}
    </AppPageLayout>
  );
};

export default RLPlayground;
