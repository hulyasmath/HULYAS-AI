import React, { useMemo } from 'react';
import type { LayerInfo, LayerType } from './index';

interface ArchitectureDiagramProps {
  layerInfos: LayerInfo[];
  inputShape: number[];
}

const LAYER_COLORS: Record<LayerType, { fill: string; stroke: string; text: string }> = {
  conv2d: { fill: '#1e3a5f', stroke: '#3b82f6', text: '#93c5fd' },
  dense: { fill: '#1a3a2a', stroke: '#22c55e', text: '#86efac' },
  lstm: { fill: '#2d1a4e', stroke: '#a855f7', text: '#d8b4fe' },
  maxpool: { fill: '#3d2a0a', stroke: '#f97316', text: '#fdba74' },
};

const LAYER_WIDTH = 80;
const GAP = 40;
const HEADER = 40;

export const ArchitectureDiagram: React.FC<ArchitectureDiagramProps> = ({ layerInfos, inputShape }) => {
  const diagram = useMemo(() => {
    if (layerInfos.length === 0) return { width: 300, height: 200, layers: [] };

    const maxParams = Math.max(1, ...layerInfos.map(l => l.params));
    const layers = layerInfos.map((info, i) => {
      const height = Math.max(50, Math.min(180, 50 + (info.params / maxParams) * 130));
      const x = 60 + i * (LAYER_WIDTH + GAP);
      return { ...info, x, height };
    });

    const width = Math.max(400, 60 + layerInfos.length * (LAYER_WIDTH + GAP) + 60);
    const maxH = Math.max(200, ...layers.map(l => l.height));
    const height = maxH + HEADER + 100;

    return { width, height, layers, maxH };
  }, [layerInfos]);

  const formatDim = (dim: number[]) => dim.join('x');

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 overflow-x-auto">
      <h3 className="text-sm font-semibold text-slate-200 mb-3">Network Architecture</h3>
      {layerInfos.length === 0 ? (
        <p className="text-slate-400 text-sm">Add layers to see the architecture diagram.</p>
      ) : (
        <svg
          width={diagram.width}
          height={diagram.height}
          viewBox={`0 0 ${diagram.width} ${diagram.height}`}
          className="mx-auto"
        >
          {/* Input node */}
          <rect x={5} y={HEADER + (diagram.maxH! - 40) / 2} width={40} height={40} rx={6}
            fill="#1e293b" stroke="#64748b" strokeWidth={1.5} />
          <text x={25} y={HEADER + (diagram.maxH! - 40) / 2 + 16} textAnchor="middle"
            fill="#94a3b8" fontSize={9} fontFamily="monospace">Input</text>
          <text x={25} y={HEADER + (diagram.maxH! - 40) / 2 + 30} textAnchor="middle"
            fill="#67e8f9" fontSize={8} fontFamily="monospace">{formatDim(inputShape)}</text>

          {/* Connection from input to first layer */}
          {diagram.layers.length > 0 && (
            <line
              x1={45} y1={HEADER + diagram.maxH! / 2}
              x2={diagram.layers[0].x} y2={HEADER + diagram.maxH! / 2}
              stroke="#475569" strokeWidth={1.5} strokeDasharray="4 2"
            />
          )}

          {/* Layers */}
          {diagram.layers.map((layer, i) => {
            const colors = LAYER_COLORS[layer.config.type];
            const yOffset = HEADER + (diagram.maxH! - layer.height) / 2;

            return (
              <g key={layer.config.id}>
                {/* Connection to next layer */}
                {i < diagram.layers.length - 1 && (
                  <line
                    x1={layer.x + LAYER_WIDTH}
                    y1={HEADER + diagram.maxH! / 2}
                    x2={diagram.layers[i + 1].x}
                    y2={HEADER + diagram.maxH! / 2}
                    stroke="#475569" strokeWidth={1.5}
                    markerEnd="url(#arrow)"
                  />
                )}

                {/* Layer block */}
                <rect
                  x={layer.x} y={yOffset}
                  width={LAYER_WIDTH} height={layer.height}
                  rx={6} fill={colors.fill} stroke={colors.stroke} strokeWidth={1.5}
                />

                {/* Layer type label */}
                <text x={layer.x + LAYER_WIDTH / 2} y={yOffset + 16}
                  textAnchor="middle" fill={colors.text} fontSize={10} fontWeight="bold">
                  {layer.config.type.toUpperCase()}
                </text>

                {/* Units / filters */}
                <text x={layer.x + LAYER_WIDTH / 2} y={yOffset + 30}
                  textAnchor="middle" fill="#cbd5e1" fontSize={9} fontFamily="monospace">
                  {layer.config.type === 'conv2d' ? `${layer.config.units}f ${layer.config.kernelSize}x${layer.config.kernelSize}` :
                   layer.config.type === 'maxpool' ? `${layer.config.units}x${layer.config.units}` :
                   `${layer.config.units}u`}
                </text>

                {/* Params */}
                <text x={layer.x + LAYER_WIDTH / 2} y={yOffset + 44}
                  textAnchor="middle" fill="#94a3b8" fontSize={8} fontFamily="monospace">
                  {layer.params > 1000 ? `${(layer.params / 1000).toFixed(1)}K` : `${layer.params}`} params
                </text>

                {/* Output dim below */}
                <text x={layer.x + LAYER_WIDTH / 2} y={yOffset + layer.height + 14}
                  textAnchor="middle" fill="#67e8f9" fontSize={8} fontFamily="monospace">
                  {formatDim(layer.outputDim)}
                </text>
              </g>
            );
          })}

          {/* Arrow marker */}
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX={9} refY={5}
              markerWidth={6} markerHeight={6} orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#475569" />
            </marker>
          </defs>
        </svg>
      )}
    </div>
  );
};
