import React from 'react';
import { Sliders, RotateCcw, ArrowRightLeft } from 'lucide-react';
import { JointAngles, LinkLengths, KinematicsMode } from './KinematicsSolver';

interface JointControlsProps {
  angles: JointAngles;
  links: LinkLengths;
  mode: KinematicsMode;
  targetX: number;
  targetY: number;
  onAnglesChange: (angles: JointAngles) => void;
  onLinksChange: (links: LinkLengths) => void;
  onModeChange: (mode: KinematicsMode) => void;
  onTargetChange: (x: number, y: number) => void;
  onReset: () => void;
}

export const JointControls: React.FC<JointControlsProps> = ({
  angles,
  links,
  mode,
  targetX,
  targetY,
  onAnglesChange,
  onLinksChange,
  onModeChange,
  onTargetChange,
  onReset,
}) => {
  const handleAngle = (joint: keyof JointAngles, value: string) => {
    const num = parseFloat(value);
    if (!isNaN(num)) {
      onAnglesChange({ ...angles, [joint]: num });
    }
  };

  const handleLink = (link: keyof LinkLengths, value: string) => {
    const num = parseFloat(value);
    if (!isNaN(num) && num > 0 && num <= 10) {
      onLinksChange({ ...links, [link]: num });
    }
  };

  const handleTarget = (axis: 'x' | 'y', value: string) => {
    const num = parseFloat(value);
    if (!isNaN(num)) {
      onTargetChange(
        axis === 'x' ? num : targetX,
        axis === 'y' ? num : targetY
      );
    }
  };

  const jointColors = ['text-cyan-400', 'text-blue-400', 'text-purple-400'];
  const jointLabels = ['Joint 1 (theta1)', 'Joint 2 (theta2)', 'Joint 3 (theta3)'];
  const angleKeys: (keyof JointAngles)[] = ['theta1', 'theta2', 'theta3'];
  const linkKeys: (keyof LinkLengths)[] = ['L1', 'L2', 'L3'];

  return (
    <div className="space-y-4">
      {/* Mode Toggle */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <ArrowRightLeft size={16} className="text-cyan-400" />
          <h3 className="text-sm font-semibold text-slate-200">Kinematics Mode</h3>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onModeChange('forward')}
            className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-colors ${
              mode === 'forward'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                : 'bg-slate-900 text-slate-400 border border-slate-600 hover:border-slate-500'
            }`}
          >
            Forward (FK)
          </button>
          <button
            onClick={() => onModeChange('inverse')}
            className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-colors ${
              mode === 'inverse'
                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                : 'bg-slate-900 text-slate-400 border border-slate-600 hover:border-slate-500'
            }`}
          >
            Inverse (IK)
          </button>
        </div>
      </div>

      {/* Joint Angle Sliders */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <Sliders size={16} className="text-cyan-400" />
          <h3 className="text-sm font-semibold text-slate-200">Joint Angles</h3>
        </div>

        {angleKeys.map((key, i) => (
          <div key={key}>
            <div className="flex items-center justify-between mb-1">
              <label className={`text-xs ${jointColors[i]}`}>{jointLabels[i]}</label>
              <span className="text-xs font-mono text-slate-300">{angles[key].toFixed(1)}deg</span>
            </div>
            <input
              type="range"
              min={0}
              max={360}
              step={1}
              value={angles[key]}
              onChange={e => handleAngle(key, e.target.value)}
              disabled={mode === 'inverse'}
              className="w-full h-1.5 bg-slate-700 rounded-lg cursor-pointer accent-cyan-500 disabled:opacity-40"
            />
          </div>
        ))}
      </div>

      {/* Link Lengths */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 space-y-3">
        <h3 className="text-sm font-semibold text-slate-200">Link Lengths</h3>
        {linkKeys.map((key, i) => (
          <div key={key}>
            <div className="flex items-center justify-between mb-1">
              <label className={`text-xs ${jointColors[i]}`}>Link {i + 1} ({key})</label>
              <span className="text-xs font-mono text-slate-300">{links[key].toFixed(1)}</span>
            </div>
            <input
              type="number"
              value={links[key]}
              onChange={e => handleLink(key, e.target.value)}
              min={0.5}
              max={5}
              step={0.1}
              className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-1.5 text-sm text-white font-mono focus:border-cyan-400 focus:outline-none"
            />
          </div>
        ))}
      </div>

      {/* Target Position (IK mode) */}
      {mode === 'inverse' && (
        <div className="bg-slate-800/50 border border-orange-500/30 rounded-lg p-4 space-y-3">
          <h3 className="text-sm font-semibold text-orange-400">Target Position (IK)</h3>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Target X</label>
              <input
                type="number"
                value={targetX}
                onChange={e => handleTarget('x', e.target.value)}
                step={0.1}
                className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-1.5 text-sm text-white font-mono focus:border-orange-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Target Y</label>
              <input
                type="number"
                value={targetY}
                onChange={e => handleTarget('y', e.target.value)}
                step={0.1}
                className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-1.5 text-sm text-white font-mono focus:border-orange-400 focus:outline-none"
              />
            </div>
          </div>
          <div className="text-xs text-slate-500">
            Max reach: {(links.L1 + links.L2).toFixed(1)} (2-link IK)
          </div>
        </div>
      )}

      {/* Reset */}
      <button
        onClick={onReset}
        className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors text-sm"
      >
        <RotateCcw size={14} />
        Reset All
      </button>
    </div>
  );
};
