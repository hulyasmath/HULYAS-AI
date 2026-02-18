import React, { useMemo } from 'react';
import { PrecisionBadge } from '../shared/PrecisionBadge';
import { EntropyVerifier } from '../shared/EntropyVerifier';
import { KolmogorovChecker } from '../shared/KolmogorovChecker';
import { Intersection, Road } from './index';

interface TrafficMetricsProps {
  roads: Road[];
  intersections: Intersection[];
  gridSize: number;
  freeFlowSpeed: number;
  maxDensity: number;
  signalCycle: number;
  greenSplit: number;
  websterOptimal: number;
  lostTime: number;
  y1: number;
  y2: number;
  syncValue: number;
}

/** Dijkstra shortest path from source to all nodes */
function dijkstra(
  intersections: Intersection[],
  roads: Road[],
  source: number,
): Map<number, number> {
  const dist = new Map<number, number>();
  const visited = new Set<number>();

  for (const node of intersections) {
    dist.set(node.id, Infinity);
  }
  dist.set(source, 0);

  // Build adjacency
  const adj = new Map<number, { to: number; weight: number }[]>();
  for (const road of roads) {
    if (!adj.has(road.from)) adj.set(road.from, []);
    // Travel time = length / speed, where speed depends on density
    const v = (road.freeFlowSpeed / 3.6) * Math.max(1 - road.density / 250, 0.1);
    const tt = road.length > 0 && v > 0 ? (road.length * 1000) / v : Infinity;
    adj.get(road.from)!.push({ to: road.to, weight: isFinite(tt) ? tt : 9999 });
  }

  // Simple priority queue (array-based for small graphs)
  const pq: { id: number; d: number }[] = [{ id: source, d: 0 }];

  while (pq.length > 0) {
    pq.sort((a, b) => a.d - b.d);
    const { id: u } = pq.shift()!;
    if (visited.has(u)) continue;
    visited.add(u);

    const neighbors = adj.get(u) || [];
    for (const edge of neighbors) {
      const alt = (dist.get(u) || 0) + edge.weight;
      if (alt < (dist.get(edge.to) || Infinity)) {
        dist.set(edge.to, alt);
        pq.push({ id: edge.to, d: alt });
      }
    }
  }

  return dist;
}

export const TrafficMetrics: React.FC<TrafficMetricsProps> = ({
  roads,
  intersections,
  gridSize,
  freeFlowSpeed,
  maxDensity,
  signalCycle,
  greenSplit,
  websterOptimal,
  lostTime,
  y1,
  y2,
  syncValue,
}) => {
  // Average density across all roads
  const avgDensity = useMemo(() => {
    if (roads.length === 0) return 0;
    const sum = roads.reduce((s, r) => s + r.density, 0);
    return sum / roads.length;
  }, [roads]);

  // Average flow: q = rho * v(rho) = rho * vf * (1 - rho/rho_max)
  const avgFlow = useMemo(() => {
    if (roads.length === 0) return 0;
    const vf = freeFlowSpeed; // km/h
    const sum = roads.reduce((s, r) => {
      const q = r.density * vf * Math.max(1 - r.density / maxDensity, 0);
      return s + (isFinite(q) ? q : 0);
    }, 0);
    return sum / roads.length;
  }, [roads, freeFlowSpeed, maxDensity]);

  // Shortest path travel times from node 0
  const shortestPaths = useMemo(
    () => dijkstra(intersections, roads, 0),
    [intersections, roads],
  );

  // Average travel time to all nodes
  const avgTravelTime = useMemo(() => {
    const times = Array.from(shortestPaths.values()).filter((t) => isFinite(t) && t > 0);
    if (times.length === 0) return 0;
    return times.reduce((s, t) => s + t, 0) / times.length;
  }, [shortestPaths]);

  // Max travel time (to farthest node)
  const maxTravelTime = useMemo(() => {
    const times = Array.from(shortestPaths.values()).filter((t) => isFinite(t));
    return times.length > 0 ? Math.max(...times) : 0;
  }, [shortestPaths]);

  // Throughput: total flow across all roads
  const throughput = useMemo(() => {
    const vf = freeFlowSpeed;
    return roads.reduce((s, r) => {
      const q = r.density * vf * Math.max(1 - r.density / maxDensity, 0);
      return s + (isFinite(q) ? q : 0);
    }, 0);
  }, [roads, freeFlowSpeed, maxDensity]);

  // Queue length estimate (roads with density > 70% of max)
  const queueLength = useMemo(() => {
    return roads.filter((r) => r.density > maxDensity * 0.7).length;
  }, [roads, maxDensity]);

  // Entropy data
  const entropyData = useMemo(
    () => [
      avgDensity,
      avgFlow,
      avgTravelTime,
      throughput,
      websterOptimal,
      signalCycle,
      syncValue,
      greenSplit,
    ],
    [avgDensity, avgFlow, avgTravelTime, throughput, websterOptimal, signalCycle, syncValue, greenSplit],
  );

  const stateString = useMemo(
    () =>
      JSON.stringify({
        gridSize,
        freeFlowSpeed,
        maxDensity,
        signalCycle,
        greenSplit,
        avgDensity: avgDensity.toFixed(2),
        avgFlow: avgFlow.toFixed(2),
        websterOptimal: websterOptimal.toFixed(1),
      }),
    [gridSize, freeFlowSpeed, maxDensity, signalCycle, greenSplit, avgDensity, avgFlow, websterOptimal],
  );

  // Reference Webster: For y1=y2=0.4, L=8s: C_opt = (1.5*8+5)/(1-0.8) = 85s
  const referenceWebster = useMemo(() => {
    const sumY = y1 + y2;
    if (sumY >= 1) return 120;
    const val = (1.5 * lostTime + 5) / (1 - sumY);
    return isFinite(val) && val > 0 ? val : 120;
  }, [lostTime, y1, y2]);

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 space-y-4">
      <h3 className="text-sm font-medium text-slate-200">Traffic Analysis Results</h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-slate-900/50 rounded p-2">
          <span className="text-xs text-slate-400">Avg Density</span>
          <p className="font-mono text-cyan-400 text-sm">{avgDensity.toFixed(1)} veh/km</p>
        </div>
        <div className="bg-slate-900/50 rounded p-2">
          <span className="text-xs text-slate-400">Avg Flow</span>
          <p className="font-mono text-cyan-400 text-sm">{avgFlow.toFixed(0)} veh/h</p>
        </div>
        <div className="bg-slate-900/50 rounded p-2">
          <span className="text-xs text-slate-400">Avg Travel Time</span>
          <p className="font-mono text-orange-400 text-sm">{avgTravelTime.toFixed(1)} s</p>
        </div>
        <div className="bg-slate-900/50 rounded p-2">
          <span className="text-xs text-slate-400">Max Travel Time</span>
          <p className="font-mono text-orange-400 text-sm">{maxTravelTime.toFixed(1)} s</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-slate-900/50 rounded p-2">
          <span className="text-xs text-slate-400">Total Throughput</span>
          <p className="font-mono text-emerald-400 text-sm">{throughput.toFixed(0)} veh&#183;km/h</p>
        </div>
        <div className="bg-slate-900/50 rounded p-2">
          <span className="text-xs text-slate-400">Congested Roads</span>
          <p className={`font-mono text-sm ${queueLength > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
            {queueLength} / {roads.filter((r) => r.from < r.to).length}
          </p>
        </div>
        <div className="bg-slate-900/50 rounded p-2">
          <span className="text-xs text-slate-400">Webster C_opt</span>
          <p className="font-mono text-cyan-400 text-sm">{websterOptimal.toFixed(1)} s</p>
        </div>
        <div className="bg-slate-900/50 rounded p-2">
          <span className="text-xs text-slate-400">Current Cycle</span>
          <p className={`font-mono text-sm ${Math.abs(signalCycle - websterOptimal) < 10 ? 'text-emerald-400' : 'text-amber-400'}`}>
            {signalCycle} s
          </p>
        </div>
      </div>

      {/* Dijkstra path info */}
      <div className="bg-slate-900/50 rounded p-2">
        <span className="text-xs text-slate-400">Dijkstra Shortest Paths from Node 0</span>
        <div className="flex flex-wrap gap-2 mt-1">
          {Array.from(shortestPaths.entries())
            .filter(([id]) => id > 0)
            .slice(0, 8)
            .map(([id, time]) => (
              <span key={id} className="text-xs font-mono px-2 py-0.5 bg-slate-800 rounded text-slate-300">
                {'\u2192'}{id}: {isFinite(time) ? time.toFixed(1) : '--'}s
              </span>
            ))}
          {intersections.length > 9 && (
            <span className="text-xs text-slate-500">+{intersections.length - 9} more</span>
          )}
        </div>
      </div>

      {/* Verification badges */}
      <div className="space-y-2">
        <PrecisionBadge
          computed={websterOptimal}
          reference={referenceWebster}
          label="Webster Optimal Cycle"
        />
        <EntropyVerifier data={entropyData} label="Traffic State Entropy" />
        <KolmogorovChecker data={stateString} label="Network Complexity" />
      </div>
    </div>
  );
};
