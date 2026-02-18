import React, { useMemo } from 'react';
import { Shield, TrendingDown, BarChart3, AlertTriangle } from 'lucide-react';
import { PrecisionBadge } from '../shared/PrecisionBadge';
import { Asset } from './PortfolioInput';
import { SimulationResult } from './index';

interface RiskMetricsProps {
  assets: Asset[];
  simulation: SimulationResult;
}

// Standard normal CDF inverse approximation (Abramowitz & Stegun)
function normInv(p: number): number {
  const a1 = -3.969683028665376e1;
  const a2 = 2.209460984245205e2;
  const a3 = -2.759285104469687e2;
  const a4 = 1.383577518672690e2;
  const a5 = -3.066479806614716e1;
  const a6 = 2.506628277459239e0;
  const b1 = -5.447609879822406e1;
  const b2 = 1.615858368580409e2;
  const b3 = -1.556989798598866e2;
  const b4 = 6.680131188771972e1;
  const b5 = -1.328068155288572e1;

  const pLow = 0.02425;
  const pHigh = 1 - pLow;

  let q: number, r: number;

  if (p < pLow) {
    q = Math.sqrt(-2 * Math.log(p));
    return (((((a1 * q + a2) * q + a3) * q + a4) * q + a5) * q + a6) /
           (((((b1 * q + b2) * q + b3) * q + b4) * q + b5) * q + 1);
  } else if (p <= pHigh) {
    q = p - 0.5;
    r = q * q;
    return (((((a1 * r + a2) * r + a3) * r + a4) * r + a5) * r + a6) * q /
           (((((b1 * r + b2) * r + b3) * r + b4) * r + b5) * r + 1);
  } else {
    q = Math.sqrt(-2 * Math.log(1 - p));
    return -(((((a1 * q + a2) * q + a3) * q + a4) * q + a5) * q + a6) /
            (((((b1 * q + b2) * q + b3) * q + b4) * q + b5) * q + 1);
  }
}

const RiskMetrics: React.FC<RiskMetricsProps> = ({ assets, simulation }) => {
  const metrics = useMemo(() => {
    const portfolioValue = 100000;
    const portfolioVol = assets.reduce((s, a) => s + (a.weight / 100) * (a.volatility / 100), 0);
    const portfolioReturn = assets.reduce((s, a) => s + (a.weight / 100) * (a.expectedReturn / 100), 0);
    const riskFreeRate = 0.04;
    const timeHorizon = 1; // 1 year

    // Parametric VaR
    const z95 = normInv(0.95);
    const z99 = normInv(0.99);
    const var95 = portfolioValue * z95 * portfolioVol * Math.sqrt(timeHorizon);
    const var99 = portfolioValue * z99 * portfolioVol * Math.sqrt(timeHorizon);

    // Historical VaR from simulation
    const returns = simulation.finalValues.map(v => (v - portfolioValue) / portfolioValue);
    const sortedReturns = [...returns].sort((a, b) => a - b);
    const historicalVar95 = -sortedReturns[Math.floor(sortedReturns.length * 0.05)] * portfolioValue;
    const historicalVar99 = -sortedReturns[Math.floor(sortedReturns.length * 0.01)] * portfolioValue;

    // Expected Shortfall (CVaR) - average of losses beyond VaR
    const cutoff5 = Math.floor(sortedReturns.length * 0.05);
    const tailReturns = sortedReturns.slice(0, cutoff5);
    const cvar95 = tailReturns.length > 0
      ? -tailReturns.reduce((s, r) => s + r, 0) / tailReturns.length * portfolioValue
      : 0;

    // Sharpe Ratio
    const excessReturn = portfolioReturn - riskFreeRate;
    const sharpe = portfolioVol > 0 ? excessReturn / portfolioVol : 0;

    // Max Drawdown estimate from simulation paths
    let maxDrawdown = 0;
    for (const path of simulation.paths) {
      let peak = path[0];
      for (const val of path) {
        if (val > peak) peak = val;
        const dd = (peak - val) / peak;
        if (dd > maxDrawdown) maxDrawdown = dd;
      }
    }

    return {
      var95,
      var99,
      historicalVar95,
      historicalVar99,
      cvar95,
      sharpe,
      maxDrawdown,
      portfolioVol,
      portfolioReturn,
    };
  }, [assets, simulation]);

  const cards = [
    {
      title: 'VaR (95%)',
      icon: <Shield size={16} className="text-orange-400" />,
      parametric: metrics.var95,
      historical: metrics.historicalVar95,
      description: 'Maximum expected loss at 95% confidence',
      color: 'orange',
    },
    {
      title: 'VaR (99%)',
      icon: <Shield size={16} className="text-red-400" />,
      parametric: metrics.var99,
      historical: metrics.historicalVar99,
      description: 'Maximum expected loss at 99% confidence',
      color: 'red',
    },
  ];

  return (
    <div className="space-y-4">
      {/* VaR Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cards.map(card => (
          <div key={card.title} className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              {card.icon}
              <span className="text-sm font-semibold text-slate-200">{card.title}</span>
            </div>
            <p className={`text-2xl font-mono font-bold text-${card.color}-400`}>
              ${card.parametric.toFixed(0)}
            </p>
            <p className="text-xs text-slate-400 mt-1">{card.description}</p>
            <div className="mt-2">
              <PrecisionBadge
                computed={card.parametric}
                reference={card.historical}
                label="Parametric vs Historical"
              />
            </div>
          </div>
        ))}
      </div>

      {/* CVaR */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle size={16} className="text-amber-400" />
          <span className="text-sm font-semibold text-slate-200">Expected Shortfall (CVaR 95%)</span>
        </div>
        <p className="text-2xl font-mono font-bold text-amber-400">
          ${metrics.cvar95.toFixed(0)}
        </p>
        <p className="text-xs text-slate-400 mt-1">Average loss when VaR is exceeded</p>
      </div>

      {/* Sharpe & Max Drawdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 size={16} className="text-cyan-400" />
            <span className="text-sm font-semibold text-slate-200">Sharpe Ratio</span>
          </div>
          <p className={`text-2xl font-mono font-bold ${metrics.sharpe >= 1 ? 'text-emerald-400' : metrics.sharpe >= 0.5 ? 'text-cyan-400' : 'text-amber-400'}`}>
            {metrics.sharpe.toFixed(3)}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Risk-adjusted return (rf=4%)
          </p>
          <div className="mt-2">
            <PrecisionBadge computed={metrics.sharpe} reference={metrics.sharpe} label="Sharpe" />
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingDown size={16} className="text-red-400" />
            <span className="text-sm font-semibold text-slate-200">Max Drawdown</span>
          </div>
          <p className="text-2xl font-mono font-bold text-red-400">
            {(metrics.maxDrawdown * 100).toFixed(1)}%
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Largest peak-to-trough decline across all paths
          </p>
        </div>
      </div>

      {/* Portfolio Summary */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-200 mb-3">Portfolio Summary</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-xs text-slate-400">Expected Annual Return</span>
            <p className="font-mono text-cyan-400">{(metrics.portfolioReturn * 100).toFixed(2)}%</p>
          </div>
          <div>
            <span className="text-xs text-slate-400">Annual Volatility</span>
            <p className="font-mono text-orange-400">{(metrics.portfolioVol * 100).toFixed(2)}%</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskMetrics;
