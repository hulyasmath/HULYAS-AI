import React, { useState, useMemo, useCallback } from 'react';
import { TrafficCone, RotateCcw } from 'lucide-react';
import { AppPageLayout } from '../shared/AppPageLayout';
import { useZeqSync } from '../SimulationVisualizer/useZeqSync';
import { NetworkGraph } from './NetworkGraph';
import { DensityHeatmap } from './DensityHeatmap';
import { TrafficMetrics } from './TrafficMetrics';

export interface Intersection {
  id: number;
  x: number;
  y: number;
  greenPhase: number; // fraction of cycle that is green for main direction
}

export interface Road {
  from: number;
  to: number;
  density: number;     // vehicles/km
  freeFlowSpeed: number; // km/h
  length: number;      // km
}

function buildGrid(
  gridSize: number,
  freeFlowSpeed: number,
): { intersections: Intersection[]; roads: Road[] } {
  const intersections: Intersection[] = [];
  const roads: Road[] = [];
  const spacing = 0.5; // km between intersections

  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      const id = r * gridSize + c;
      intersections.push({
        id,
        x: c * spacing,
        y: r * spacing,
        greenPhase: 0.5,
      });

      // Horizontal road
      if (c < gridSize - 1) {
        roads.push({
          from: id,
          to: id + 1,
          density: 30 + Math.random() * 40,
          freeFlowSpeed,
          length: spacing,
        });
        roads.push({
          from: id + 1,
          to: id,
          density: 30 + Math.random() * 40,
          freeFlowSpeed,
          length: spacing,
        });
      }
      // Vertical road
      if (r < gridSize - 1) {
        roads.push({
          from: id,
          to: id + gridSize,
          density: 25 + Math.random() * 35,
          freeFlowSpeed,
          length: spacing,
        });
        roads.push({
          from: id + gridSize,
          to: id,
          density: 25 + Math.random() * 35,
          freeFlowSpeed,
          length: spacing,
        });
      }
    }
  }
  return { intersections, roads };
}

const TrafficOptimizer: React.FC = () => {
  const { syncValue, elapsedTime, pulseCount } = useZeqSync();

  const [gridSize, setGridSize] = useState(4);
  const [freeFlowSpeed, setFreeFlowSpeed] = useState(60);
  const [maxDensity, setMaxDensity] = useState(150);
  const [signalCycle, setSignalCycle] = useState(60);
  const [greenSplit, setGreenSplit] = useState(0.5);
  const [lostTime, setLostTime] = useState(8);

  // Critical flow ratios for each phase
  const [y1, setY1] = useState(0.4);
  const [y2, setY2] = useState(0.4);

  const handleReset = useCallback(() => {
    setGridSize(4);
    setFreeFlowSpeed(60);
    setMaxDensity(150);
    setSignalCycle(60);
    setGreenSplit(0.5);
    setLostTime(8);
    setY1(0.4);
    setY2(0.4);
  }, []);

  const network = useMemo(
    () => buildGrid(gridSize, freeFlowSpeed),
    [gridSize, freeFlowSpeed],
  );

  // Webster optimal cycle time: C_opt = (1.5*L + 5) / (1 - sum(yi))
  const websterOptimal = useMemo(() => {
    const sumY = y1 + y2;
    if (sumY >= 1) return 120; // saturation
    const val = (1.5 * lostTime + 5) / (1 - sumY);
    return isFinite(val) && val > 0 ? Math.min(val, 200) : 120;
  }, [lostTime, y1, y2]);

  const sidebar = (
    <div className="space-y-4">
      {/* Network config */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 space-y-3">
        <h3 className="text-sm font-medium text-slate-200 flex items-center gap-2">
          <TrafficCone size={14} className="text-cyan-400" />
          Network Configuration
        </h3>
        <div>
          <label className="text-xs text-slate-400">Grid: {gridSize}x{gridSize}</label>
          <input
            type="range"
            min={3}
            max={6}
            step={1}
            value={gridSize}
            onChange={(e) => setGridSize(Number(e.target.value))}
            className="w-full accent-cyan-400"
          />
        </div>
        <div>
          <label className="text-xs text-slate-400">Free Flow Speed: {freeFlowSpeed} km/h</label>
          <input
            type="range"
            min={40}
            max={80}
            step={5}
            value={freeFlowSpeed}
            onChange={(e) => setFreeFlowSpeed(Number(e.target.value))}
            className="w-full accent-cyan-400"
          />
        </div>
        <div>
          <label className="text-xs text-slate-400">Max Density: {maxDensity} veh/km</label>
          <input
            type="range"
            min={100}
            max={250}
            step={10}
            value={maxDensity}
            onChange={(e) => setMaxDensity(Number(e.target.value))}
            className="w-full accent-cyan-400"
          />
        </div>
      </div>

      {/* Signal timing */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 space-y-3">
        <h3 className="text-sm font-medium text-slate-200">Signal Timing</h3>
        <div>
          <label className="text-xs text-slate-400">Cycle Length: {signalCycle}s</label>
          <input
            type="range"
            min={30}
            max={120}
            step={5}
            value={signalCycle}
            onChange={(e) => setSignalCycle(Number(e.target.value))}
            className="w-full accent-orange-400"
          />
        </div>
        <div>
          <label className="text-xs text-slate-400">Green Split: {(greenSplit * 100).toFixed(0)}%</label>
          <input
            type="range"
            min={0.2}
            max={0.8}
            step={0.05}
            value={greenSplit}
            onChange={(e) => setGreenSplit(Number(e.target.value))}
            className="w-full accent-orange-400"
          />
        </div>
        <div>
          <label className="text-xs text-slate-400">Lost Time (L): {lostTime}s</label>
          <input
            type="range"
            min={4}
            max={16}
            step={1}
            value={lostTime}
            onChange={(e) => setLostTime(Number(e.target.value))}
            className="w-full accent-orange-400"
          />
        </div>
      </div>

      {/* Flow ratios */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 space-y-3">
        <h3 className="text-sm font-medium text-slate-200">Critical Flow Ratios</h3>
        <div>
          <label className="text-xs text-slate-400">y1: {y1.toFixed(2)}</label>
          <input
            type="range"
            min={0.1}
            max={0.6}
            step={0.05}
            value={y1}
            onChange={(e) => setY1(Number(e.target.value))}
            className="w-full accent-cyan-400"
          />
        </div>
        <div>
          <label className="text-xs text-slate-400">y2: {y2.toFixed(2)}</label>
          <input
            type="range"
            min={0.1}
            max={0.6}
            step={0.05}
            value={y2}
            onChange={(e) => setY2(Number(e.target.value))}
            className="w-full accent-cyan-400"
          />
        </div>
        <div className="text-xs text-slate-500 font-mono">
          Webster C_opt = {websterOptimal.toFixed(1)}s
        </div>
      </div>

      {/* Reset */}
      <button
        onClick={handleReset}
        className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 rounded-lg text-sm text-slate-300 transition-colors"
      >
        <RotateCcw size={14} />
        Reset Defaults
      </button>

      {/* Sync */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-2 text-xs text-slate-500">
        <span className="font-mono">Pulse #{pulseCount} | sync={syncValue.toFixed(4)}</span>
      </div>
    </div>
  );

  return (
    <AppPageLayout
      title="Traffic Flow Optimizer"
      description="LWR traffic model, Dijkstra routing, and Webster signal optimization"
      domain="Transportation Engineering"
      sidebar={sidebar}
    >
      <NetworkGraph
        intersections={network.intersections}
        roads={network.roads}
        gridSize={gridSize}
        maxDensity={maxDensity}
        signalCycle={signalCycle}
        greenSplit={greenSplit}
        elapsedTime={elapsedTime}
        syncValue={syncValue}
      />

      <DensityHeatmap
        freeFlowSpeed={freeFlowSpeed}
        maxDensity={maxDensity}
        elapsedTime={elapsedTime}
      />

      <TrafficMetrics
        roads={network.roads}
        intersections={network.intersections}
        gridSize={gridSize}
        freeFlowSpeed={freeFlowSpeed}
        maxDensity={maxDensity}
        signalCycle={signalCycle}
        greenSplit={greenSplit}
        websterOptimal={websterOptimal}
        lostTime={lostTime}
        y1={y1}
        y2={y2}
        syncValue={syncValue}
      />
    </AppPageLayout>
  );
};

export default TrafficOptimizer;
