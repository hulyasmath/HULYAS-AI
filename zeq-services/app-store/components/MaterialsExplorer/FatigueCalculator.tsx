import React, { useState, useMemo } from 'react';
import { Material } from './MaterialSelector';
import { PrecisionBadge } from '../shared/PrecisionBadge';

interface FatigueCalculatorProps {
  material: Material;
}

const FatigueCalculator: React.FC<FatigueCalculatorProps> = ({ material }) => {
  const [stressAmplitude, setStressAmplitude] = useState(200);
  const [rRatio, setRRatio] = useState(-1.0);

  const results = useMemo(() => {
    const sigmaA = stressAmplitude;
    const sigmaF = material.fatigueSigmaF;
    const b = material.fatigueB;
    const sigmaUTS = material.ultimateTensileStrength;

    // Basquin's equation: N = (sigma_a / sigma'_f)^(1/b)
    const nBasquin = sigmaA > 0 && sigmaA < sigmaF
      ? Math.pow(sigmaA / sigmaF, 1 / b)
      : sigmaA >= sigmaF ? 1 : Infinity;

    // Mean stress from R-ratio: sigma_m = sigma_a * (1 + R) / (1 - R)
    const sigmaMean = rRatio !== 1 ? sigmaA * (1 + rRatio) / (1 - rRatio) : 0;

    // Goodman correction: sigma_a_eff = sigma_a / (1 - sigma_m / sigma_uts)
    const goodmanDenom = 1 - sigmaMean / sigmaUTS;
    const sigmaAeff = goodmanDenom > 0 ? sigmaA / goodmanDenom : sigmaA;

    // Corrected fatigue life
    const nGoodman = sigmaAeff > 0 && sigmaAeff < sigmaF
      ? Math.pow(sigmaAeff / sigmaF, 1 / b)
      : sigmaAeff >= sigmaF ? 1 : Infinity;

    // Safety factor (Goodman diagram)
    const safetyFactor = goodmanDenom > 0 ? sigmaUTS * goodmanDenom / sigmaA : 0;

    // Reference value using slightly different model (Morrow)
    const morrowFatigue = sigmaA > 0 && sigmaA < sigmaF
      ? Math.pow(sigmaA / (sigmaF - sigmaMean), 1 / b)
      : Infinity;

    return {
      nBasquin: isFinite(nBasquin) ? nBasquin : null,
      nGoodman: isFinite(nGoodman) ? nGoodman : null,
      sigmaMean,
      sigmaAeff,
      safetyFactor,
      morrowFatigue: isFinite(morrowFatigue) ? morrowFatigue : null,
    };
  }, [stressAmplitude, rRatio, material]);

  const maxStress = material.ultimateTensileStrength;

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 space-y-4">
      <h3 className="text-sm font-semibold text-slate-300">Fatigue Life Calculator</h3>

      {/* Inputs */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-slate-400 block mb-1">
            Stress Amplitude (MPa)
          </label>
          <input
            type="number"
            value={stressAmplitude}
            onChange={(e) => {
              const v = parseFloat(e.target.value);
              if (!isNaN(v) && v >= 0 && v <= maxStress * 2) setStressAmplitude(v);
            }}
            min={0}
            max={maxStress * 2}
            step={10}
            className="w-full px-3 py-1.5 bg-slate-900 border border-slate-600 rounded text-sm text-white font-mono focus:outline-none focus:border-cyan-500"
          />
          <input
            type="range"
            value={stressAmplitude}
            onChange={(e) => setStressAmplitude(parseFloat(e.target.value))}
            min={10}
            max={maxStress}
            step={5}
            className="w-full mt-1 accent-cyan-500"
          />
        </div>
        <div>
          <label className="text-xs text-slate-400 block mb-1">
            R-ratio (min/max stress)
          </label>
          <input
            type="number"
            value={rRatio}
            onChange={(e) => {
              const v = parseFloat(e.target.value);
              if (!isNaN(v) && v >= -1 && v < 1) setRRatio(v);
            }}
            min={-1}
            max={0.9}
            step={0.1}
            className="w-full px-3 py-1.5 bg-slate-900 border border-slate-600 rounded text-sm text-white font-mono focus:outline-none focus:border-cyan-500"
          />
          <input
            type="range"
            value={rRatio}
            onChange={(e) => setRRatio(parseFloat(e.target.value))}
            min={-1}
            max={0.9}
            step={0.05}
            className="w-full mt-1 accent-cyan-500"
          />
        </div>
      </div>

      {/* Formulas */}
      <div className="p-3 rounded bg-slate-900/50 border border-slate-700">
        <p className="text-xs text-slate-400 font-mono">
          Basquin: N = (&sigma;_a / &sigma;'_f)^(1/b) where b = {material.fatigueB}
        </p>
        <p className="text-xs text-slate-400 font-mono mt-1">
          Goodman: &sigma;_a_eff = &sigma;_a / (1 - &sigma;_m / &sigma;_uts)
        </p>
      </div>

      {/* Results */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-700">
          <span className="text-xs text-slate-400">Basquin Life (N)</span>
          <p className="text-lg font-mono font-bold text-cyan-400">
            {results.nBasquin !== null
              ? results.nBasquin.toExponential(2)
              : 'N/A'}
          </p>
        </div>
        <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-700">
          <span className="text-xs text-slate-400">Goodman Corrected (N)</span>
          <p className="text-lg font-mono font-bold text-orange-400">
            {results.nGoodman !== null
              ? results.nGoodman.toExponential(2)
              : 'N/A'}
          </p>
        </div>
        <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-700">
          <span className="text-xs text-slate-400">Mean Stress</span>
          <p className="text-lg font-mono text-slate-300">{results.sigmaMean.toFixed(1)} MPa</p>
        </div>
        <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-700">
          <span className="text-xs text-slate-400">Safety Factor</span>
          <p className={`text-lg font-mono font-bold ${results.safetyFactor > 1.5 ? 'text-emerald-400' : results.safetyFactor > 1 ? 'text-yellow-400' : 'text-red-400'}`}>
            {results.safetyFactor.toFixed(3)}
          </p>
        </div>
      </div>

      {/* Precision badge */}
      {results.nGoodman !== null && results.morrowFatigue !== null && (
        <PrecisionBadge
          computed={Math.log10(results.nGoodman)}
          reference={Math.log10(results.morrowFatigue)}
          label="Goodman vs Morrow (log10 N)"
        />
      )}

      {/* Goodman diagram (simplified) */}
      <div className="bg-slate-900 rounded-lg border border-slate-700 p-3">
        <h4 className="text-xs font-semibold text-slate-400 mb-2">Goodman Diagram</h4>
        <svg width={300} height={200} viewBox="0 0 300 200" className="w-full max-w-[300px]">
          <rect x={40} y={10} width={240} height={170} fill="#0f172a" rx={4} />

          {/* Axes */}
          <line x1={40} y1={180} x2={280} y2={180} stroke="#475569" strokeWidth={1} />
          <line x1={40} y1={10} x2={40} y2={180} stroke="#475569" strokeWidth={1} />

          {/* Labels */}
          <text x={160} y={198} textAnchor="middle" fill="#94a3b8" fontSize={10}>Mean Stress (MPa)</text>
          <text x={12} y={100} textAnchor="middle" fill="#94a3b8" fontSize={10} transform="rotate(-90, 12, 100)">
            Stress Amp (MPa)
          </text>

          {/* Goodman line: from (0, sigma_y) to (sigma_uts, 0) */}
          {(() => {
            const xScale = (v: number) => 40 + (v / maxStress) * 240;
            const yScale = (v: number) => 180 - (v / maxStress) * 170;
            return (
              <>
                <line x1={xScale(0)} y1={yScale(material.yieldStrength)} x2={xScale(maxStress)} y2={yScale(0)} stroke="#06b6d4" strokeWidth={1.5} />
                {/* Operating point */}
                <circle
                  cx={xScale(Math.max(0, results.sigmaMean))}
                  cy={yScale(stressAmplitude)}
                  r={4}
                  fill={results.safetyFactor > 1 ? '#22c55e' : '#ef4444'}
                  stroke="white"
                  strokeWidth={1}
                />
                {/* Labels on Goodman line endpoints */}
                <text x={xScale(0) + 4} y={yScale(material.yieldStrength) - 4} fill="#06b6d4" fontSize={9}>
                  &sigma;_y={material.yieldStrength}
                </text>
                <text x={xScale(maxStress) - 4} y={yScale(0) - 4} fill="#06b6d4" fontSize={9} textAnchor="end">
                  &sigma;_uts={maxStress}
                </text>
              </>
            );
          })()}
        </svg>
      </div>
    </div>
  );
};

export default FatigueCalculator;
