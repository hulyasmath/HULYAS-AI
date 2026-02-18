import React, { useState, useCallback, useMemo } from 'react';
import { Layers, GitBranch, TrendingDown, BarChart3 } from 'lucide-react';
import { AppPageLayout } from '../shared/AppPageLayout';
import { ArchitectureDiagram } from './ArchitectureDiagram';
import { GradientFlowPlot } from './GradientFlowPlot';
import { ArchitectMetrics } from './ArchitectMetrics';

export type LayerType = 'conv2d' | 'dense' | 'lstm' | 'maxpool';

export interface LayerConfig {
  id: number;
  type: LayerType;
  units: number;       // filters for conv2d, units for dense/lstm, pool_size for maxpool
  kernelSize: number;  // kernel for conv2d, ignored for dense/lstm, stride for maxpool
  activation: string;
}

export interface LayerInfo {
  config: LayerConfig;
  inputDim: number[];
  outputDim: number[];
  params: number;
  flops: number;
  gradientMag: number;
}

type TabId = 'architecture' | 'gradient' | 'metrics';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'architecture', label: 'Architecture', icon: <GitBranch size={16} /> },
  { id: 'gradient', label: 'Gradient Flow', icon: <TrendingDown size={16} /> },
  { id: 'metrics', label: 'Metrics', icon: <BarChart3 size={16} /> },
];

const DEFAULT_LAYERS: LayerConfig[] = [
  { id: 1, type: 'conv2d', units: 32, kernelSize: 3, activation: 'relu' },
  { id: 2, type: 'maxpool', units: 2, kernelSize: 2, activation: 'none' },
  { id: 3, type: 'conv2d', units: 64, kernelSize: 3, activation: 'relu' },
  { id: 4, type: 'maxpool', units: 2, kernelSize: 2, activation: 'none' },
  { id: 5, type: 'dense', units: 128, kernelSize: 0, activation: 'relu' },
  { id: 6, type: 'dense', units: 10, kernelSize: 0, activation: 'softmax' },
];

function computeLayerInfos(layers: LayerConfig[], inputShape: number[]): LayerInfo[] {
  const infos: LayerInfo[] = [];
  let currentDim = [...inputShape]; // [H, W, C]

  for (const config of layers) {
    const inputDim = [...currentDim];
    let outputDim: number[];
    let params = 0;
    let flops = 0;

    switch (config.type) {
      case 'conv2d': {
        const [h, w, c] = currentDim;
        const k = config.kernelSize;
        const outH = Math.max(1, Math.floor((h - k + 2 * 0) / 1 + 1));
        const outW = Math.max(1, Math.floor((w - k + 2 * 0) / 1 + 1));
        const outC = config.units;
        params = k * k * c * outC + outC;
        flops = 2 * k * k * c * outC * outH * outW;
        outputDim = [outH, outW, outC];
        break;
      }
      case 'dense': {
        const flatIn = currentDim.reduce((a, b) => a * b, 1);
        params = flatIn * config.units + config.units;
        flops = 2 * flatIn * config.units;
        outputDim = [config.units];
        break;
      }
      case 'lstm': {
        const flatIn = currentDim.reduce((a, b) => a * b, 1);
        params = 4 * (flatIn * config.units + config.units * config.units + config.units);
        flops = 8 * flatIn * config.units;
        outputDim = [config.units];
        break;
      }
      case 'maxpool': {
        const [h, w, c] = currentDim.length >= 3 ? currentDim : [currentDim[0], currentDim[0], 1];
        const poolSize = config.units;
        const stride = config.kernelSize || poolSize;
        const outH = Math.max(1, Math.floor((h - poolSize) / stride + 1));
        const outW = Math.max(1, Math.floor((w - poolSize) / stride + 1));
        params = 0;
        flops = poolSize * poolSize * c * outH * outW;
        outputDim = [outH, outW, c];
        break;
      }
      default:
        outputDim = [...currentDim];
    }

    // Estimate gradient magnitude based on layer type
    let gradientMag = 1.0;
    if (config.type === 'conv2d') {
      gradientMag = Math.sqrt(2.0 / (config.kernelSize * config.kernelSize * (currentDim[2] || 1)));
    } else if (config.type === 'dense') {
      const flatIn = currentDim.reduce((a, b) => a * b, 1);
      gradientMag = Math.sqrt(2.0 / flatIn);
    } else if (config.type === 'lstm') {
      gradientMag = 0.95; // LSTM designed to preserve gradients
    } else {
      gradientMag = 1.0;
    }

    if (!isFinite(params)) params = 0;
    if (!isFinite(flops)) flops = 0;
    if (!isFinite(gradientMag) || isNaN(gradientMag)) gradientMag = 1.0;

    infos.push({ config, inputDim, outputDim, params, flops, gradientMag });
    currentDim = outputDim;
  }

  return infos;
}

let nextId = 100;

const NeuralArchitect: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('architecture');
  const [layers, setLayers] = useState<LayerConfig[]>(DEFAULT_LAYERS);
  const [inputShape, setInputShape] = useState<number[]>([28, 28, 1]);

  const layerInfos = useMemo(() => computeLayerInfos(layers, inputShape), [layers, inputShape]);

  const addLayer = useCallback((type: LayerType) => {
    const defaults: Record<LayerType, Omit<LayerConfig, 'id'>> = {
      conv2d: { type: 'conv2d', units: 32, kernelSize: 3, activation: 'relu' },
      dense: { type: 'dense', units: 64, kernelSize: 0, activation: 'relu' },
      lstm: { type: 'lstm', units: 64, kernelSize: 0, activation: 'tanh' },
      maxpool: { type: 'maxpool', units: 2, kernelSize: 2, activation: 'none' },
    };
    setLayers(prev => [...prev, { id: nextId++, ...defaults[type] }]);
  }, []);

  const removeLayer = useCallback((id: number) => {
    setLayers(prev => prev.filter(l => l.id !== id));
  }, []);

  const updateLayer = useCallback((id: number, field: keyof LayerConfig, value: string | number) => {
    setLayers(prev => prev.map(l => l.id === id ? { ...l, [field]: value } : l));
  }, []);

  const handleInputChange = useCallback((idx: number, val: string) => {
    const num = parseInt(val, 10);
    if (!isNaN(num) && num > 0 && num <= 512) {
      setInputShape(prev => {
        const next = [...prev];
        next[idx] = num;
        return next;
      });
    }
  }, []);

  const sidebar = (
    <div className="space-y-4">
      {/* Input Shape */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <Layers size={16} className="text-cyan-400" />
          <h3 className="text-sm font-semibold text-slate-200">Input Shape</h3>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {['H', 'W', 'C'].map((label, i) => (
            <div key={label}>
              <label className="text-xs text-slate-400">{label}</label>
              <input
                type="number"
                value={inputShape[i]}
                onChange={e => handleInputChange(i, e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1 text-sm font-mono text-white"
                min={1}
                max={512}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Layer List */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-200 mb-3">Layers ({layers.length})</h3>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {layers.map((layer, i) => {
            const typeColors: Record<LayerType, string> = {
              conv2d: 'border-blue-500/50 bg-blue-500/10',
              dense: 'border-green-500/50 bg-green-500/10',
              lstm: 'border-purple-500/50 bg-purple-500/10',
              maxpool: 'border-orange-500/50 bg-orange-500/10',
            };
            return (
              <div key={layer.id} className={`border rounded p-2 ${typeColors[layer.type]}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-mono text-slate-300">
                    {i + 1}. {layer.type.toUpperCase()}
                  </span>
                  <button
                    onClick={() => removeLayer(layer.id)}
                    className="text-red-400 hover:text-red-300 text-xs"
                  >
                    Remove
                  </button>
                </div>
                {layer.type !== 'maxpool' && (
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={layer.units}
                      onChange={e => updateLayer(layer.id, 'units', parseInt(e.target.value) || 1)}
                      className="w-16 bg-slate-700 border border-slate-600 rounded px-1 py-0.5 text-xs font-mono text-white"
                      min={1}
                    />
                    <span className="text-xs text-slate-400 self-center">
                      {layer.type === 'conv2d' ? 'filters' : 'units'}
                    </span>
                  </div>
                )}
                {layer.type === 'conv2d' && (
                  <div className="flex gap-2 mt-1">
                    <input
                      type="number"
                      value={layer.kernelSize}
                      onChange={e => updateLayer(layer.id, 'kernelSize', parseInt(e.target.value) || 1)}
                      className="w-16 bg-slate-700 border border-slate-600 rounded px-1 py-0.5 text-xs font-mono text-white"
                      min={1}
                      max={11}
                    />
                    <span className="text-xs text-slate-400 self-center">kernel</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Add Layer Buttons */}
        <div className="grid grid-cols-2 gap-2 mt-3">
          {(['conv2d', 'dense', 'lstm', 'maxpool'] as LayerType[]).map(type => {
            const colors: Record<LayerType, string> = {
              conv2d: 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-400',
              dense: 'bg-green-500/20 hover:bg-green-500/30 text-green-400',
              lstm: 'bg-purple-500/20 hover:bg-purple-500/30 text-purple-400',
              maxpool: 'bg-orange-500/20 hover:bg-orange-500/30 text-orange-400',
            };
            return (
              <button
                key={type}
                onClick={() => addLayer(type)}
                className={`text-xs py-1 rounded ${colors[type]} transition-colors`}
              >
                + {type.toUpperCase()}
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Presets */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-200 mb-2">Presets</h3>
        <div className="space-y-1">
          <button
            onClick={() => {
              setInputShape([28, 28, 1]);
              setLayers(DEFAULT_LAYERS);
            }}
            className="w-full text-left text-xs text-cyan-400 hover:text-cyan-300 py-1"
          >
            MNIST CNN (28x28x1)
          </button>
          <button
            onClick={() => {
              setInputShape([224, 224, 3]);
              setLayers([
                { id: nextId++, type: 'conv2d', units: 64, kernelSize: 3, activation: 'relu' },
                { id: nextId++, type: 'conv2d', units: 64, kernelSize: 3, activation: 'relu' },
                { id: nextId++, type: 'maxpool', units: 2, kernelSize: 2, activation: 'none' },
                { id: nextId++, type: 'conv2d', units: 128, kernelSize: 3, activation: 'relu' },
                { id: nextId++, type: 'maxpool', units: 2, kernelSize: 2, activation: 'none' },
                { id: nextId++, type: 'dense', units: 256, kernelSize: 0, activation: 'relu' },
                { id: nextId++, type: 'dense', units: 10, kernelSize: 0, activation: 'softmax' },
              ]);
            }}
            className="w-full text-left text-xs text-cyan-400 hover:text-cyan-300 py-1"
          >
            VGG-like (224x224x3)
          </button>
          <button
            onClick={() => {
              setInputShape([100]);
              setLayers([
                { id: nextId++, type: 'lstm', units: 128, kernelSize: 0, activation: 'tanh' },
                { id: nextId++, type: 'lstm', units: 64, kernelSize: 0, activation: 'tanh' },
                { id: nextId++, type: 'dense', units: 10, kernelSize: 0, activation: 'softmax' },
              ]);
            }}
            className="w-full text-left text-xs text-cyan-400 hover:text-cyan-300 py-1"
          >
            LSTM Sequence (100)
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <AppPageLayout
      title="Neural Architecture Designer"
      description="Build, visualize, and analyze neural network architectures"
      domain="Machine Learning"
      sidebar={sidebar}
    >
      {/* Tab Bar */}
      <div className="flex gap-1 bg-slate-800/50 border border-slate-700 rounded-lg p-1">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'architecture' && (
        <ArchitectureDiagram layerInfos={layerInfos} inputShape={inputShape} />
      )}
      {activeTab === 'gradient' && (
        <GradientFlowPlot layerInfos={layerInfos} />
      )}
      {activeTab === 'metrics' && (
        <ArchitectMetrics layerInfos={layerInfos} inputShape={inputShape} />
      )}
    </AppPageLayout>
  );
};

export default NeuralArchitect;
