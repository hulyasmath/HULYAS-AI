import React, { useMemo } from 'react';
import { PlacedGate } from './CircuitBuilder';
import { GateType } from './GateSelector';
import { PrecisionBadge } from '../shared/PrecisionBadge';
import { EntropyVerifier } from '../shared/EntropyVerifier';

interface FidelityMetricsProps {
  gates: PlacedGate[];
  numQubits: number;
  numSteps: number;
}

const ERROR_RATE = 0.001;

const FidelityMetrics: React.FC<FidelityMetricsProps> = ({ gates, numQubits, numSteps }) => {
  const metrics = useMemo(() => {
    const gateCountByType: Record<string, number> = {};
    for (const g of gates) {
      gateCountByType[g.gate] = (gateCountByType[g.gate] || 0) + 1;
    }

    const totalGates = gates.length;
    const tCount = (gateCountByType['T'] || 0);

    // Circuit depth: max time step used + 1
    const depth = gates.length > 0 ? Math.max(...gates.map((g) => g.timeStep)) + 1 : 0;

    // Estimated fidelity
    const fidelity = Math.pow(1 - ERROR_RATE, totalGates);

    // Reference fidelity for comparison (ideal case with slightly different error model)
    const referenceFidelity = Math.exp(-ERROR_RATE * totalGates);

    return { gateCountByType, totalGates, tCount, depth, fidelity, referenceFidelity };
  }, [gates]);

  // Simulated state vector magnitudes for entropy verification
  const stateVector = useMemo(() => {
    const dim = Math.pow(2, numQubits);
    const sv: number[] = new Array(dim).fill(0);
    // Start from |0...0> state
    sv[0] = 1.0;
    // Simulate simplified gate effects on probability amplitudes
    for (const g of gates) {
      const gateType = g.gate;
      if (gateType === 'H') {
        // Hadamard on qubit spreads amplitude
        const mask = 1 << (numQubits - 1 - g.qubit);
        const newSv = [...sv];
        for (let i = 0; i < dim; i++) {
          const partner = i ^ mask;
          if (i < partner) {
            const a = sv[i];
            const b = sv[partner];
            newSv[i] = (a + b) / Math.SQRT2;
            newSv[partner] = (a - b) / Math.SQRT2;
          }
        }
        sv.splice(0, dim, ...newSv);
      } else if (gateType === 'X') {
        const mask = 1 << (numQubits - 1 - g.qubit);
        const newSv = [...sv];
        for (let i = 0; i < dim; i++) {
          const partner = i ^ mask;
          newSv[i] = sv[partner];
        }
        sv.splice(0, dim, ...newSv);
      }
      // Other gates: simplified - just add small perturbation
      else {
        for (let i = 0; i < dim; i++) {
          sv[i] += (Math.random() - 0.5) * 0.01;
        }
        // Renormalize
        const norm = Math.sqrt(sv.reduce((s, v) => s + v * v, 0));
        if (norm > 0) for (let i = 0; i < dim; i++) sv[i] /= norm;
      }
    }
    return sv.map((v) => v * v); // Probabilities
  }, [gates, numQubits]);

  const gateTypeColors: Record<string, string> = {
    H: 'text-cyan-400',
    X: 'text-orange-400',
    Y: 'text-purple-400',
    Z: 'text-emerald-400',
    T: 'text-yellow-400',
    S: 'text-pink-400',
    CNOT: 'text-cyan-300',
    SWAP: 'text-orange-300',
    CZ: 'text-emerald-300',
  };

  return (
    <div className="space-y-4">
      {/* Gate counts */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-300 mb-3">Gate Count</h3>
        {metrics.totalGates === 0 ? (
          <p className="text-xs text-slate-500">No gates placed yet.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {Object.entries(metrics.gateCountByType).map(([gate, count]) => (
              <div
                key={gate}
                className="flex items-center gap-1 px-2 py-1 rounded bg-slate-700/50 border border-slate-600"
              >
                <span className={`text-sm font-mono font-bold ${gateTypeColors[gate] || 'text-slate-300'}`}>
                  {gate}
                </span>
                <span className="text-xs text-slate-400">x{count}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Circuit stats */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-300 mb-3">Circuit Statistics</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <span className="text-xs text-slate-400">Circuit Depth</span>
            <p className="text-lg font-mono text-cyan-400">{metrics.depth}</p>
          </div>
          <div>
            <span className="text-xs text-slate-400">Total Gates</span>
            <p className="text-lg font-mono text-cyan-400">{metrics.totalGates}</p>
          </div>
          <div>
            <span className="text-xs text-slate-400">T-Count</span>
            <p className="text-lg font-mono text-yellow-400">{metrics.tCount}</p>
          </div>
          <div>
            <span className="text-xs text-slate-400">Qubits Used</span>
            <p className="text-lg font-mono text-cyan-400">
              {new Set(gates.flatMap((g) => [g.qubit, ...(g.targetQubit !== undefined ? [g.targetQubit] : [])])).size}
            </p>
          </div>
        </div>
      </div>

      {/* Fidelity */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-300 mb-3">Estimated Fidelity</h3>
        <div className="mb-2">
          <span className="text-xs text-slate-400">
            F = (1 - {ERROR_RATE})^{metrics.totalGates}
          </span>
          <p className="text-2xl font-mono font-bold text-cyan-400">
            {metrics.fidelity.toFixed(6)}
          </p>
        </div>
        <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden mb-3">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${metrics.fidelity * 100}%`,
              backgroundColor:
                metrics.fidelity > 0.99
                  ? '#22c55e'
                  : metrics.fidelity > 0.95
                  ? '#eab308'
                  : '#ef4444',
            }}
          />
        </div>
        <PrecisionBadge
          computed={metrics.fidelity}
          reference={metrics.referenceFidelity}
          label="Fidelity vs exponential model"
        />
      </div>

      {/* Entropy verification on state vector */}
      <EntropyVerifier data={stateVector} label="State Vector Entropy" />
    </div>
  );
};

export default FidelityMetrics;
