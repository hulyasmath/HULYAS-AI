import React from 'react';
import { Activity } from 'lucide-react';
import { useZeqSync, HULYAPULSE_HZ } from '../SimulationVisualizer/useZeqSync';

interface HulyaPulseIndicatorProps {
  compact?: boolean;
}

export const HulyaPulseIndicator: React.FC<HulyaPulseIndicatorProps> = ({ compact = false }) => {
  const { syncValue, pulseCount, running } = useZeqSync();
  const intensity = Math.abs(syncValue) * 10; // Normalize to 0-1 range
  const opacity = 0.4 + intensity * 0.6;

  if (compact) {
    return (
      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400">
        <Activity size={12} style={{ opacity }} />
        {HULYAPULSE_HZ} Hz
      </span>
    );
  }

  return (
    <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-800/50 border border-cyan-500/20">
      <div className="relative">
        <Activity size={20} className="text-cyan-400" style={{ opacity }} />
        <div
          className="absolute inset-0 rounded-full bg-cyan-400/30 animate-ping"
          style={{ animationDuration: `${1000 / HULYAPULSE_HZ}ms` }}
        />
      </div>
      <div className="text-sm">
        <div className="text-cyan-400 font-mono font-bold">{HULYAPULSE_HZ} Hz</div>
        <div className="text-slate-400 text-xs">
          Pulse #{pulseCount} {running ? '' : '(paused)'}
        </div>
      </div>
      <div className="ml-auto">
        <div className="w-16 h-2 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-cyan-300 rounded-full transition-all duration-75"
            style={{ width: `${(0.5 + syncValue * 5) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};
