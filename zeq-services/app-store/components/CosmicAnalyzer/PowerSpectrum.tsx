import React, { useMemo } from 'react';

interface PowerSpectrumProps {
  hubbleConstant: number;
  darkEnergyFraction: number;
  baryonFraction: number;
}

interface SpectrumPoint {
  l: number;
  cl: number;
  error: number;
}

// Generate a realistic-looking CMB power spectrum shape
function generatePowerSpectrum(
  H0: number,
  omegaLambda: number,
  omegaB: number
): SpectrumPoint[] {
  const points: SpectrumPoint[] = [];

  // Peak positions shift with cosmological parameters
  const peakShift = (H0 - 67.4) * 2;
  const peak1 = 220 + peakShift;
  const peak2 = 540 + peakShift * 1.5;
  const peak3 = 800 + peakShift * 2;

  // Peak heights depend on baryon fraction and dark energy
  const baryonRatio = omegaB / 0.0493;
  const h1 = 5800 * baryonRatio;
  const h2 = 2500 * (2 - baryonRatio); // Odd peaks enhanced by baryons
  const h3 = 2800 * baryonRatio;

  // Damping envelope
  const dampingScale = 1200;

  for (let logL = Math.log10(2); logL <= Math.log10(2000); logL += 0.02) {
    const l = Math.pow(10, logL);

    // Sachs-Wolfe plateau at low l
    let cl = 1000 * Math.pow(l / 10, -0.3);

    // Acoustic peaks (Gaussian approximation)
    const w1 = 80;
    const w2 = 100;
    const w3 = 120;

    cl += h1 * Math.exp(-Math.pow(l - peak1, 2) / (2 * w1 * w1));
    cl += h2 * Math.exp(-Math.pow(l - peak2, 2) / (2 * w2 * w2));
    cl += h3 * Math.exp(-Math.pow(l - peak3, 2) / (2 * w3 * w3));

    // Silk damping at high l
    cl *= Math.exp(-l * l / (dampingScale * dampingScale));

    // l(l+1)C_l / 2pi normalization already implicit
    const error = cl * (0.05 + 0.1 * Math.random());

    points.push({ l, cl: Math.max(0, cl), error });
  }

  return points;
}

const SVG_WIDTH = 650;
const SVG_HEIGHT = 350;
const PADDING = { top: 30, right: 30, bottom: 50, left: 70 };

const PowerSpectrum: React.FC<PowerSpectrumProps> = ({
  hubbleConstant,
  darkEnergyFraction,
  baryonFraction,
}) => {
  const data = useMemo(
    () => generatePowerSpectrum(hubbleConstant, darkEnergyFraction, baryonFraction),
    [hubbleConstant, darkEnergyFraction, baryonFraction]
  );

  const plotW = SVG_WIDTH - PADDING.left - PADDING.right;
  const plotH = SVG_HEIGHT - PADDING.top - PADDING.bottom;

  const lMin = 2;
  const lMax = 2000;
  const clMax = Math.max(...data.map((d) => d.cl)) * 1.15;

  const scaleX = (l: number) =>
    PADDING.left + (Math.log10(l / lMin) / Math.log10(lMax / lMin)) * plotW;
  const scaleY = (cl: number) =>
    SVG_HEIGHT - PADDING.bottom - (cl / clMax) * plotH;

  // Best-fit curve path
  const curvePath = data
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(d.l).toFixed(1)} ${scaleY(d.cl).toFixed(1)}`)
    .join(' ');

  // Sample data points with error bars (every 5th point)
  const samplePoints = data.filter((_, i) => i % 5 === 0);

  // X-axis ticks (logarithmic)
  const xTicks = [2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000];

  // Y-axis ticks
  const yTickStep = clMax > 5000 ? 1000 : 500;
  const yTicks: number[] = [];
  for (let v = 0; v <= clMax; v += yTickStep) yTicks.push(v);

  // Peak annotations
  const peak1 = data.reduce((best, d) =>
    d.l > 150 && d.l < 300 && d.cl > best.cl ? d : best, { l: 0, cl: 0, error: 0 });
  const peak2 = data.reduce((best, d) =>
    d.l > 400 && d.l < 700 && d.cl > best.cl ? d : best, { l: 0, cl: 0, error: 0 });
  const peak3 = data.reduce((best, d) =>
    d.l > 650 && d.l < 950 && d.cl > best.cl ? d : best, { l: 0, cl: 0, error: 0 });

  return (
    <div className="bg-slate-900 rounded-lg border border-slate-700 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-300">
          CMB Angular Power Spectrum
        </h3>
        <span className="text-xs text-slate-500 font-mono">
          l(l+1)C_l / 2&pi; (&mu;K&sup2;)
        </span>
      </div>
      <svg width={SVG_WIDTH} height={SVG_HEIGHT} viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} className="w-full">
        {/* Plot background */}
        <rect x={PADDING.left} y={PADDING.top} width={plotW} height={plotH} fill="#0f172a" rx={4} />

        {/* Grid */}
        {yTicks.map((v) => (
          <line
            key={`yg-${v}`}
            x1={PADDING.left} y1={scaleY(v)}
            x2={SVG_WIDTH - PADDING.right} y2={scaleY(v)}
            stroke="#1e293b" strokeWidth={0.5}
          />
        ))}
        {xTicks.map((v) => (
          <line
            key={`xg-${v}`}
            x1={scaleX(v)} y1={PADDING.top}
            x2={scaleX(v)} y2={SVG_HEIGHT - PADDING.bottom}
            stroke="#1e293b" strokeWidth={0.5}
          />
        ))}

        {/* Axes */}
        <line x1={PADDING.left} y1={SVG_HEIGHT - PADDING.bottom} x2={SVG_WIDTH - PADDING.right} y2={SVG_HEIGHT - PADDING.bottom} stroke="#475569" strokeWidth={1} />
        <line x1={PADDING.left} y1={PADDING.top} x2={PADDING.left} y2={SVG_HEIGHT - PADDING.bottom} stroke="#475569" strokeWidth={1} />

        {/* X-axis ticks */}
        {xTicks.map((v) => (
          <g key={`xt-${v}`}>
            <line x1={scaleX(v)} y1={SVG_HEIGHT - PADDING.bottom} x2={scaleX(v)} y2={SVG_HEIGHT - PADDING.bottom + 4} stroke="#475569" />
            <text x={scaleX(v)} y={SVG_HEIGHT - PADDING.bottom + 16} textAnchor="middle" fill="#64748b" fontSize={9} fontFamily="monospace">
              {v}
            </text>
          </g>
        ))}

        {/* Y-axis ticks */}
        {yTicks.map((v) => (
          <g key={`yt-${v}`}>
            <line x1={PADDING.left - 4} y1={scaleY(v)} x2={PADDING.left} y2={scaleY(v)} stroke="#475569" />
            <text x={PADDING.left - 8} y={scaleY(v) + 4} textAnchor="end" fill="#64748b" fontSize={9} fontFamily="monospace">
              {v.toFixed(0)}
            </text>
          </g>
        ))}

        {/* Axis labels */}
        <text x={SVG_WIDTH / 2} y={SVG_HEIGHT - 5} textAnchor="middle" fill="#94a3b8" fontSize={11}>
          Multipole moment l
        </text>
        <text x={15} y={SVG_HEIGHT / 2} textAnchor="middle" fill="#94a3b8" fontSize={11} transform={`rotate(-90, 15, ${SVG_HEIGHT / 2})`}>
          l(l+1)C_l / 2&pi; (&mu;K&sup2;)
        </text>

        {/* Error bars on sample points */}
        {samplePoints.map((d, i) => (
          <g key={`err-${i}`}>
            <line
              x1={scaleX(d.l)} y1={scaleY(d.cl - d.error)}
              x2={scaleX(d.l)} y2={scaleY(d.cl + d.error)}
              stroke="#475569" strokeWidth={1}
            />
            <circle cx={scaleX(d.l)} cy={scaleY(d.cl)} r={2} fill="#94a3b8" />
          </g>
        ))}

        {/* Best-fit curve */}
        <path d={curvePath} fill="none" stroke="#06b6d4" strokeWidth={2} />

        {/* Peak annotations */}
        {peak1.l > 0 && (
          <g>
            <line x1={scaleX(peak1.l)} y1={scaleY(peak1.cl) - 5} x2={scaleX(peak1.l)} y2={scaleY(peak1.cl) - 25} stroke="#eab308" strokeWidth={1} strokeDasharray="2,2" />
            <text x={scaleX(peak1.l)} y={scaleY(peak1.cl) - 28} textAnchor="middle" fill="#eab308" fontSize={9} fontWeight="bold">
              1st (l~{Math.round(peak1.l)})
            </text>
          </g>
        )}
        {peak2.l > 0 && (
          <g>
            <line x1={scaleX(peak2.l)} y1={scaleY(peak2.cl) - 5} x2={scaleX(peak2.l)} y2={scaleY(peak2.cl) - 25} stroke="#f97316" strokeWidth={1} strokeDasharray="2,2" />
            <text x={scaleX(peak2.l)} y={scaleY(peak2.cl) - 28} textAnchor="middle" fill="#f97316" fontSize={9} fontWeight="bold">
              2nd (l~{Math.round(peak2.l)})
            </text>
          </g>
        )}
        {peak3.l > 0 && (
          <g>
            <line x1={scaleX(peak3.l)} y1={scaleY(peak3.cl) - 5} x2={scaleX(peak3.l)} y2={scaleY(peak3.cl) - 25} stroke="#a855f7" strokeWidth={1} strokeDasharray="2,2" />
            <text x={scaleX(peak3.l)} y={scaleY(peak3.cl) - 28} textAnchor="middle" fill="#a855f7" fontSize={9} fontWeight="bold">
              3rd (l~{Math.round(peak3.l)})
            </text>
          </g>
        )}
      </svg>
    </div>
  );
};

export default PowerSpectrum;
