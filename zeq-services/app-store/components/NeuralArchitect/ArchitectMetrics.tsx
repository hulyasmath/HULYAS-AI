import React, { useMemo } from 'react';
import { Cpu, HardDrive, Zap } from 'lucide-react';
import { useZeqSync } from '../SimulationVisualizer/useZeqSync';
import { PrecisionBadge } from '../shared/PrecisionBadge';
import { EntropyVerifier } from '../shared/EntropyVerifier';
import { KolmogorovChecker } from '../shared/KolmogorovChecker';
import type { LayerInfo } from './index';

interface ArchitectMetricsProps {
  layerInfos: LayerInfo[];
  inputShape: number[];
}

export const ArchitectMetrics: React.FC<ArchitectMetricsProps> = ({ layerInfos, inputShape }) => {
  const { syncValue, elapsedTime, pulseCount } = useZeqSync();

  const stats = useMemo(() => {
    const totalParams = layerInfos.reduce((s, l) => s + l.params, 0);
    const totalFlops = layerInfos.reduce((s, l) => s + l.flops, 0);
    // Memory estimate: params * 4 bytes (float32) + activations
    const paramMemory = totalParams * 4;
    const activationMemory = layerInfos.reduce((s, l) => {
      const outputSize = l.outputDim.reduce((a, b) => a * b, 1);
      return s + outputSize * 4; // float32
    }, 0);
    const totalMemory = paramMemory + activationMemory;

    // Per-layer breakdown
    const perLayer = layerInfos.map(l => ({
      type: l.config.type,
      units: l.config.units,
      params: l.params,
      flops: l.flops,
      outputDim: l.outputDim.join('x'),
      pctParams: totalParams > 0 ? (l.params / totalParams) * 100 : 0,
    }));

    // Reference: MNIST default arch total params
    // Conv2D(32,3x3,in=1): 3*3*1*32+32 = 320
    // Pool: 0
    // Conv2D(64,3x3,in=32): 3*3*32*64+64 = 18496
    // Pool: 0
    // Dense(128, in=1600): 1600*128+128 = 204928
    // Dense(10, in=128): 128*10+10 = 1290
    // Total = 225034
    const referenceParams = 225034;

    return { totalParams, totalFlops, totalMemory, paramMemory, activationMemory, perLayer, referenceParams };
  }, [layerInfos]);

  const formatNumber = (n: number): string => {
    if (!isFinite(n) || isNaN(n)) return '0';
    if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
    if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
    if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
    return n.toString();
  };

  const formatBytes = (b: number): string => {
    if (b >= 1e9) return `${(b / 1e9).toFixed(2)} GB`;
    if (b >= 1e6) return `${(b / 1e6).toFixed(2)} MB`;
    if (b >= 1e3) return `${(b / 1e3).toFixed(1)} KB`;
    return `${b} B`;
  };

  const paramsArray = useMemo(() => layerInfos.map(l => l.params), [layerInfos]);
  const serializedState = useMemo(() => JSON.stringify({
    inputShape,
    layers: layerInfos.map(l => ({
      type: l.config.type,
      units: l.config.units,
      params: l.params,
      output: l.outputDim,
    })),
    totalParams: stats.totalParams,
    sync: syncValue,
  }), [inputShape, layerInfos, stats.totalParams, syncValue]);

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Cpu size={16} className="text-cyan-400" />
            <span className="text-xs text-slate-400">Total Parameters</span>
          </div>
          <p className="text-2xl font-bold font-mono text-white">{formatNumber(stats.totalParams)}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap size={16} className="text-orange-400" />
            <span className="text-xs text-slate-400">Total FLOPs</span>
          </div>
          <p className="text-2xl font-bold font-mono text-white">{formatNumber(stats.totalFlops)}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <HardDrive size={16} className="text-emerald-400" />
            <span className="text-xs text-slate-400">Memory Estimate</span>
          </div>
          <p className="text-2xl font-bold font-mono text-white">{formatBytes(stats.totalMemory)}</p>
          <div className="text-xs text-slate-400 mt-1">
            Params: {formatBytes(stats.paramMemory)} | Act: {formatBytes(stats.activationMemory)}
          </div>
        </div>
      </div>

      {/* Per-layer table */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-200 mb-3">Per-Layer Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-slate-400 border-b border-slate-700">
                <th className="text-left py-2 pr-3">#</th>
                <th className="text-left py-2 pr-3">Type</th>
                <th className="text-right py-2 pr-3">Units</th>
                <th className="text-right py-2 pr-3">Params</th>
                <th className="text-right py-2 pr-3">FLOPs</th>
                <th className="text-right py-2 pr-3">Output</th>
                <th className="text-right py-2">% Params</th>
              </tr>
            </thead>
            <tbody>
              {stats.perLayer.map((row, i) => (
                <tr key={i} className="border-b border-slate-800 text-slate-300">
                  <td className="py-1.5 pr-3 font-mono">{i + 1}</td>
                  <td className="py-1.5 pr-3 font-mono uppercase">{row.type}</td>
                  <td className="py-1.5 pr-3 font-mono text-right">{row.units}</td>
                  <td className="py-1.5 pr-3 font-mono text-right">{formatNumber(row.params)}</td>
                  <td className="py-1.5 pr-3 font-mono text-right">{formatNumber(row.flops)}</td>
                  <td className="py-1.5 pr-3 font-mono text-right">{row.outputDim}</td>
                  <td className="py-1.5 font-mono text-right">
                    <div className="flex items-center justify-end gap-1">
                      <div className="w-12 h-1.5 bg-slate-700 rounded overflow-hidden">
                        <div
                          className="h-full bg-cyan-400 rounded"
                          style={{ width: `${Math.min(100, row.pctParams)}%` }}
                        />
                      </div>
                      <span>{row.pctParams.toFixed(1)}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ZeqSync footer */}
      <div className="text-xs text-slate-500 text-right font-mono">
        HulyaPulse sync: {syncValue.toFixed(6)} | t={elapsedTime.toFixed(1)}s | pulse #{pulseCount}
      </div>

      {/* Verification Badges */}
      <div className="space-y-3">
        <PrecisionBadge
          computed={stats.totalParams}
          reference={stats.referenceParams}
          label="Total Params vs MNIST Reference"
        />
        <EntropyVerifier data={paramsArray} label="Parameter Distribution Entropy" />
        <KolmogorovChecker data={serializedState} label="Architecture State Complexity" />
      </div>
    </div>
  );
};
