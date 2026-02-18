import React, { useMemo } from 'react';
import { Material } from './MaterialSelector';
import { useZeqSync } from '../SimulationVisualizer/useZeqSync';

interface StressStrainCurveProps {
  material: Material;
}

interface DataPoint {
  strain: number;
  stress: number;
}

function generateStressStrainCurve(mat: Material): {
  points: DataPoint[];
  yieldIdx: number;
  utsIdx: number;
  fractureIdx: number;
} {
  const points: DataPoint[] = [];
  const E = mat.youngsModulus * 1000; // Convert GPa to MPa for calculation
  const sigmaY = mat.yieldStrength;
  const sigmaUTS = mat.ultimateTensileStrength;

  // Yield strain
  const epsilonY = sigmaY / E;
  // UTS strain (approximate)
  const epsilonUTS = epsilonY + 0.08;
  // Fracture strain
  const epsilonF = epsilonUTS + 0.05;

  let yieldIdx = 0;
  let utsIdx = 0;

  // Linear elastic region
  const elasticSteps = 30;
  for (let i = 0; i <= elasticSteps; i++) {
    const strain = (i / elasticSteps) * epsilonY;
    const stress = E * strain;
    points.push({ strain, stress });
  }
  yieldIdx = points.length - 1;

  // Plastic region (strain hardening)
  const plasticSteps = 40;
  for (let i = 1; i <= plasticSteps; i++) {
    const t = i / plasticSteps;
    const strain = epsilonY + t * (epsilonUTS - epsilonY);
    // Ramberg-Osgood-like hardening
    const stress = sigmaY + (sigmaUTS - sigmaY) * Math.pow(t, 0.5);
    points.push({ strain, stress });
  }
  utsIdx = points.length - 1;

  // Necking / fracture
  const neckingSteps = 15;
  for (let i = 1; i <= neckingSteps; i++) {
    const t = i / neckingSteps;
    const strain = epsilonUTS + t * (epsilonF - epsilonUTS);
    const stress = sigmaUTS * (1 - 0.4 * t * t);
    points.push({ strain, stress });
  }

  return { points, yieldIdx, utsIdx, fractureIdx: points.length - 1 };
}

const SVG_WIDTH = 600;
const SVG_HEIGHT = 350;
const PADDING = { top: 30, right: 30, bottom: 50, left: 70 };

const StressStrainCurve: React.FC<StressStrainCurveProps> = ({ material }) => {
  const { pulseCount } = useZeqSync();

  const { points, yieldIdx, utsIdx, fractureIdx } = useMemo(
    () => generateStressStrainCurve(material),
    [material]
  );

  // Animate data points loading based on pulse count
  const visiblePoints = Math.min(points.length, Math.max(5, pulseCount * 3));

  const maxStrain = Math.max(...points.map((p) => p.strain)) * 1.1;
  const maxStress = Math.max(...points.map((p) => p.stress)) * 1.1;

  const plotW = SVG_WIDTH - PADDING.left - PADDING.right;
  const plotH = SVG_HEIGHT - PADDING.top - PADDING.bottom;

  const scaleX = (v: number) => PADDING.left + (v / maxStrain) * plotW;
  const scaleY = (v: number) => SVG_HEIGHT - PADDING.bottom - (v / maxStress) * plotH;

  const pathD = points
    .slice(0, visiblePoints)
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(p.strain).toFixed(1)} ${scaleY(p.stress).toFixed(1)}`)
    .join(' ');

  // Axis ticks
  const xTicks = [0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3].filter((v) => v <= maxStrain);
  const yTickStep = maxStress > 2000 ? 500 : maxStress > 500 ? 100 : 50;
  const yTicks: number[] = [];
  for (let v = 0; v <= maxStress; v += yTickStep) yTicks.push(v);

  const yieldPt = points[yieldIdx];
  const utsPt = points[utsIdx];
  const fracturePt = points[fractureIdx];

  return (
    <div className="bg-slate-900 rounded-lg border border-slate-700 p-4">
      <h3 className="text-sm font-semibold text-slate-300 mb-3">
        Stress-Strain Curve: {material.name}
      </h3>
      <svg width={SVG_WIDTH} height={SVG_HEIGHT} viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} className="w-full">
        {/* Plot background */}
        <rect
          x={PADDING.left}
          y={PADDING.top}
          width={plotW}
          height={plotH}
          fill="#0f172a"
          rx={4}
        />

        {/* Grid lines */}
        {yTicks.map((v) => (
          <line
            key={`yg-${v}`}
            x1={PADDING.left}
            y1={scaleY(v)}
            x2={SVG_WIDTH - PADDING.right}
            y2={scaleY(v)}
            stroke="#1e293b"
            strokeWidth={0.5}
          />
        ))}
        {xTicks.map((v) => (
          <line
            key={`xg-${v}`}
            x1={scaleX(v)}
            y1={PADDING.top}
            x2={scaleX(v)}
            y2={SVG_HEIGHT - PADDING.bottom}
            stroke="#1e293b"
            strokeWidth={0.5}
          />
        ))}

        {/* Axes */}
        <line
          x1={PADDING.left}
          y1={SVG_HEIGHT - PADDING.bottom}
          x2={SVG_WIDTH - PADDING.right}
          y2={SVG_HEIGHT - PADDING.bottom}
          stroke="#475569"
          strokeWidth={1}
        />
        <line
          x1={PADDING.left}
          y1={PADDING.top}
          x2={PADDING.left}
          y2={SVG_HEIGHT - PADDING.bottom}
          stroke="#475569"
          strokeWidth={1}
        />

        {/* X-axis ticks */}
        {xTicks.map((v) => (
          <g key={`xt-${v}`}>
            <line x1={scaleX(v)} y1={SVG_HEIGHT - PADDING.bottom} x2={scaleX(v)} y2={SVG_HEIGHT - PADDING.bottom + 4} stroke="#475569" />
            <text x={scaleX(v)} y={SVG_HEIGHT - PADDING.bottom + 16} textAnchor="middle" fill="#64748b" fontSize={10} fontFamily="monospace">
              {v.toFixed(2)}
            </text>
          </g>
        ))}

        {/* Y-axis ticks */}
        {yTicks.map((v) => (
          <g key={`yt-${v}`}>
            <line x1={PADDING.left - 4} y1={scaleY(v)} x2={PADDING.left} y2={scaleY(v)} stroke="#475569" />
            <text x={PADDING.left - 8} y={scaleY(v) + 4} textAnchor="end" fill="#64748b" fontSize={10} fontFamily="monospace">
              {v.toFixed(0)}
            </text>
          </g>
        ))}

        {/* Axis labels */}
        <text x={SVG_WIDTH / 2} y={SVG_HEIGHT - 5} textAnchor="middle" fill="#94a3b8" fontSize={12}>
          Strain (&#949;)
        </text>
        <text
          x={15}
          y={SVG_HEIGHT / 2}
          textAnchor="middle"
          fill="#94a3b8"
          fontSize={12}
          transform={`rotate(-90, 15, ${SVG_HEIGHT / 2})`}
        >
          Stress (&#963;) MPa
        </text>

        {/* Curve */}
        <path d={pathD} fill="none" stroke={material.color} strokeWidth={2.5} strokeLinecap="round" />

        {/* Yield point */}
        {visiblePoints > yieldIdx && (
          <g>
            <circle cx={scaleX(yieldPt.strain)} cy={scaleY(yieldPt.stress)} r={5} fill="none" stroke="#eab308" strokeWidth={2} />
            <text x={scaleX(yieldPt.strain) + 8} y={scaleY(yieldPt.stress) - 8} fill="#eab308" fontSize={10} fontWeight="bold">
              Yield ({yieldPt.stress.toFixed(0)} MPa)
            </text>
          </g>
        )}

        {/* UTS point */}
        {visiblePoints > utsIdx && (
          <g>
            <circle cx={scaleX(utsPt.strain)} cy={scaleY(utsPt.stress)} r={5} fill="none" stroke="#ef4444" strokeWidth={2} />
            <text x={scaleX(utsPt.strain) + 8} y={scaleY(utsPt.stress) - 8} fill="#ef4444" fontSize={10} fontWeight="bold">
              UTS ({utsPt.stress.toFixed(0)} MPa)
            </text>
          </g>
        )}

        {/* Fracture point */}
        {visiblePoints >= fractureIdx && (
          <g>
            <line
              x1={scaleX(fracturePt.strain) - 5}
              y1={scaleY(fracturePt.stress) - 5}
              x2={scaleX(fracturePt.strain) + 5}
              y2={scaleY(fracturePt.stress) + 5}
              stroke="#f97316"
              strokeWidth={2}
            />
            <line
              x1={scaleX(fracturePt.strain) + 5}
              y1={scaleY(fracturePt.stress) - 5}
              x2={scaleX(fracturePt.strain) - 5}
              y2={scaleY(fracturePt.stress) + 5}
              stroke="#f97316"
              strokeWidth={2}
            />
            <text x={scaleX(fracturePt.strain) + 8} y={scaleY(fracturePt.stress) + 4} fill="#f97316" fontSize={10} fontWeight="bold">
              Fracture
            </text>
          </g>
        )}
      </svg>
    </div>
  );
};

export default StressStrainCurve;
