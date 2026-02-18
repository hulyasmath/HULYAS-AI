import React, { useMemo } from 'react';
import { TrendingUp } from 'lucide-react';
import { useZeqSync } from '../SimulationVisualizer/useZeqSync';
import { EmissionsConfig, computeEmissions, RCP_SCENARIOS } from './EmissionsCalculator';

interface ProjectionChartProps {
  config: EmissionsConfig;
}

export const ProjectionChart: React.FC<ProjectionChartProps> = ({ config }) => {
  const { syncValue } = useZeqSync({ amplitude: 0.05 });

  const svgW = 700;
  const svgH = 360;
  const margin = { left: 60, right: 30, top: 30, bottom: 40 };
  const plotW = svgW - margin.left - margin.right;
  const plotH = svgH - margin.top - margin.bottom;

  const startYear = 2020;
  const endYear = 2100;
  const yearRange = endYear - startYear;
  const currentYear = 2026;

  // Generate projection data for each RCP scenario
  const scenarios = useMemo(() => {
    return RCP_SCENARIOS.map(scenario => {
      const points: { year: number; temp: number }[] = [];
      for (let year = startYear; year <= endYear; year += 2) {
        const yearOffset = year - startYear;
        const scenarioConfig = { ...config, emissionRate: scenario.rate };
        const result = computeEmissions(scenarioConfig, yearOffset);
        points.push({ year, temp: result.temperatureAnomaly });
      }
      return { ...scenario, points };
    });
  }, [config]);

  // Y-axis range
  const allTemps = scenarios.flatMap(s => s.points.map(p => p.temp));
  const maxTemp = Math.max(Math.ceil(Math.max(...allTemps, 3)), 3);
  const minTemp = 0;
  const tempRange = maxTemp - minTemp;

  // Coordinate helpers
  const xScale = (year: number) => margin.left + ((year - startYear) / yearRange) * plotW;
  const yScale = (temp: number) => margin.top + plotH - ((temp - minTemp) / tempRange) * plotH;

  // Generate path data
  const pathFor = (points: { year: number; temp: number }[]) => {
    return points.map((p, i) => {
      const x = xScale(p.year);
      const y = yScale(p.temp + syncValue * 0.1);
      return `${i === 0 ? 'M' : 'L'}${x},${y}`;
    }).join(' ');
  };

  // Confidence band path (filled area)
  const bandPathFor = (points: { year: number; temp: number }[], spread: number) => {
    const upper = points.map(p => {
      const x = xScale(p.year);
      const y = yScale(p.temp + spread);
      return `${x},${y}`;
    });
    const lower = [...points].reverse().map(p => {
      const x = xScale(p.year);
      const y = yScale(Math.max(p.temp - spread, 0));
      return `${x},${y}`;
    });
    return `M${upper.join(' L')} L${lower.join(' L')} Z`;
  };

  // Year ticks
  const yearTicks = [2020, 2030, 2040, 2050, 2060, 2070, 2080, 2090, 2100];
  // Temp ticks
  const tempTicks = Array.from({ length: maxTemp + 1 }, (_, i) => i);

  // Current year x
  const currentYearX = xScale(currentYear);

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp size={18} className="text-cyan-400" />
        <h3 className="text-sm font-semibold text-slate-200">Temperature Projection (2020-2100)</h3>
      </div>

      <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full">
        {/* Grid */}
        {yearTicks.map(year => (
          <line
            key={`grid-x-${year}`}
            x1={xScale(year)} y1={margin.top}
            x2={xScale(year)} y2={margin.top + plotH}
            stroke="#1e293b" strokeWidth={1}
          />
        ))}
        {tempTicks.map(t => (
          <line
            key={`grid-y-${t}`}
            x1={margin.left} y1={yScale(t)}
            x2={margin.left + plotW} y2={yScale(t)}
            stroke="#1e293b" strokeWidth={1}
          />
        ))}

        {/* 1.5C and 2C thresholds */}
        <line
          x1={margin.left} y1={yScale(1.5)}
          x2={margin.left + plotW} y2={yScale(1.5)}
          stroke="#f97316" strokeWidth={1} strokeDasharray="6,4" opacity={0.5}
        />
        <text x={margin.left + plotW + 4} y={yScale(1.5) + 4} fontSize={9} className="fill-orange-400">1.5C</text>

        <line
          x1={margin.left} y1={yScale(2)}
          x2={margin.left + plotW} y2={yScale(2)}
          stroke="#ef4444" strokeWidth={1} strokeDasharray="6,4" opacity={0.5}
        />
        <text x={margin.left + plotW + 4} y={yScale(2) + 4} fontSize={9} className="fill-red-400">2.0C</text>

        {/* Confidence bands */}
        {scenarios.map(scenario => (
          <path
            key={`band-${scenario.name}`}
            d={bandPathFor(scenario.points, 0.3)}
            fill={scenario.color}
            opacity={0.08}
          />
        ))}

        {/* Scenario lines */}
        {scenarios.map(scenario => (
          <path
            key={`line-${scenario.name}`}
            d={pathFor(scenario.points)}
            fill="none"
            stroke={scenario.color}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}

        {/* Current year marker */}
        <line
          x1={currentYearX} y1={margin.top}
          x2={currentYearX} y2={margin.top + plotH}
          stroke="#22d3ee" strokeWidth={1.5} strokeDasharray="4,3"
        />
        <text x={currentYearX} y={margin.top - 8} textAnchor="middle" fontSize={10} className="fill-cyan-400 font-mono">
          {currentYear}
        </text>

        {/* X axis labels */}
        {yearTicks.map(year => (
          <text
            key={`xlabel-${year}`}
            x={xScale(year)}
            y={margin.top + plotH + 18}
            textAnchor="middle"
            fontSize={10}
            className="fill-slate-400 font-mono"
          >
            {year}
          </text>
        ))}

        {/* Y axis labels */}
        {tempTicks.map(t => (
          <text
            key={`ylabel-${t}`}
            x={margin.left - 8}
            y={yScale(t) + 4}
            textAnchor="end"
            fontSize={10}
            className="fill-slate-400 font-mono"
          >
            +{t}C
          </text>
        ))}

        {/* Axis labels */}
        <text x={svgW / 2} y={svgH - 2} textAnchor="middle" fontSize={11} className="fill-slate-400">
          Year
        </text>
        <text
          x={14}
          y={svgH / 2}
          textAnchor="middle"
          fontSize={11}
          className="fill-slate-400"
          transform={`rotate(-90, 14, ${svgH / 2})`}
        >
          Temp Anomaly (C)
        </text>

        {/* Scenario labels at end of lines */}
        {scenarios.map(scenario => {
          const lastPt = scenario.points[scenario.points.length - 1];
          return (
            <text
              key={`label-${scenario.name}`}
              x={xScale(lastPt.year) - 4}
              y={yScale(lastPt.temp) - 6}
              textAnchor="end"
              fontSize={10}
              fill={scenario.color}
              fontWeight="bold"
            >
              {scenario.name}
            </text>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-2 text-xs">
        {scenarios.map(scenario => (
          <div key={scenario.name} className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 rounded" style={{ backgroundColor: scenario.color }} />
            <span className="text-slate-400">{scenario.name}</span>
            <span className="text-slate-500">({scenario.description})</span>
          </div>
        ))}
      </div>
    </div>
  );
};
