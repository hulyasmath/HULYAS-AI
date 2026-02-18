import React from 'react';
import { Plus, Trash2, Play } from 'lucide-react';

export interface Asset {
  name: string;
  weight: number;
  expectedReturn: number;
  volatility: number;
}

interface PortfolioInputProps {
  assets: Asset[];
  onChange: (assets: Asset[]) => void;
  onRun: () => void;
}

function clamp(val: string, min: number, max: number): number {
  const n = parseFloat(val);
  if (isNaN(n) || !isFinite(n)) return min;
  return Math.max(min, Math.min(max, n));
}

const PortfolioInput: React.FC<PortfolioInputProps> = ({ assets, onChange, onRun }) => {
  const totalWeight = assets.reduce((s, a) => s + a.weight, 0);
  const weightValid = Math.abs(totalWeight - 100) < 0.01;

  const updateAsset = (index: number, field: keyof Asset, value: string) => {
    const updated = [...assets];
    if (field === 'name') {
      updated[index] = { ...updated[index], name: value };
    } else {
      const maxes: Record<string, number> = { weight: 100, expectedReturn: 200, volatility: 200 };
      updated[index] = { ...updated[index], [field]: clamp(value, 0, maxes[field] || 100) };
    }
    onChange(updated);
  };

  const addAsset = () => {
    onChange([...assets, { name: `Asset ${assets.length + 1}`, weight: 0, expectedReturn: 8, volatility: 15 }]);
  };

  const removeAsset = (index: number) => {
    onChange(assets.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-200">Portfolio Assets</h3>
          <button
            onClick={addAsset}
            className="flex items-center gap-1 px-3 py-1.5 text-xs bg-slate-700/50 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-600 transition-colors"
          >
            <Plus size={12} />
            Add Asset
          </button>
        </div>

        {/* Header */}
        <div className="grid grid-cols-12 gap-2 mb-2 text-xs text-slate-400 px-1">
          <div className="col-span-3">Name</div>
          <div className="col-span-2">Weight %</div>
          <div className="col-span-3">Exp. Return %</div>
          <div className="col-span-3">Volatility %</div>
          <div className="col-span-1"></div>
        </div>

        {/* Asset rows */}
        <div className="space-y-2">
          {assets.map((asset, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 items-center">
              <div className="col-span-3">
                <input
                  type="text"
                  value={asset.name}
                  onChange={e => updateAsset(i, 'name', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-600 rounded px-2 py-1.5 text-sm text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>
              <div className="col-span-2">
                <input
                  type="number"
                  value={asset.weight}
                  onChange={e => updateAsset(i, 'weight', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-600 rounded px-2 py-1.5 text-sm text-white focus:border-cyan-400 focus:outline-none"
                  min={0}
                  max={100}
                />
              </div>
              <div className="col-span-3">
                <input
                  type="number"
                  value={asset.expectedReturn}
                  onChange={e => updateAsset(i, 'expectedReturn', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-600 rounded px-2 py-1.5 text-sm text-white focus:border-cyan-400 focus:outline-none"
                  min={-100}
                  max={200}
                  step={0.1}
                />
              </div>
              <div className="col-span-3">
                <input
                  type="number"
                  value={asset.volatility}
                  onChange={e => updateAsset(i, 'volatility', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-600 rounded px-2 py-1.5 text-sm text-white focus:border-cyan-400 focus:outline-none"
                  min={0}
                  max={200}
                  step={0.1}
                />
              </div>
              <div className="col-span-1 flex justify-center">
                <button
                  onClick={() => removeAsset(i)}
                  className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                  disabled={assets.length <= 1}
                  title="Remove asset"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Weight total */}
        <div className={`mt-3 pt-3 border-t border-slate-700 flex items-center justify-between text-sm ${weightValid ? 'text-emerald-400' : 'text-red-400'}`}>
          <span>Total Weight: {totalWeight.toFixed(1)}%</span>
          {!weightValid && <span className="text-xs">Must equal 100%</span>}
        </div>
      </div>

      <button
        onClick={onRun}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg border border-cyan-500/30 transition-colors font-medium"
      >
        <Play size={16} />
        Run Monte Carlo Simulation (100 paths, 10 years)
      </button>
    </div>
  );
};

export default PortfolioInput;
