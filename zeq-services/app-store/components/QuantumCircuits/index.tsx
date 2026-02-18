import React, { useState, useCallback } from 'react';
import { AppPageLayout } from '../shared/AppPageLayout';
import { KolmogorovChecker } from '../shared/KolmogorovChecker';
import GateSelector, { GateType } from './GateSelector';
import CircuitBuilder, { PlacedGate } from './CircuitBuilder';
import FidelityMetrics from './FidelityMetrics';

const NUM_QUBITS_OPTIONS = [3, 4, 5];
const NUM_STEPS_OPTIONS = [6, 8, 10, 12];

const QuantumCircuits: React.FC = () => {
  const [selectedGate, setSelectedGate] = useState<GateType | null>(null);
  const [gates, setGates] = useState<PlacedGate[]>([]);
  const [numQubits, setNumQubits] = useState(4);
  const [numSteps, setNumSteps] = useState(8);
  const [pendingControl, setPendingControl] = useState<{
    gate: GateType;
    qubit: number;
    timeStep: number;
  } | null>(null);

  const handleAddGate = useCallback((gate: PlacedGate) => {
    setGates((prev) => [...prev, gate]);
  }, []);

  const handleRemoveGate = useCallback((id: string) => {
    setGates((prev) => prev.filter((g) => g.id !== id));
  }, []);

  const handleClearCircuit = () => {
    setGates([]);
    setPendingControl(null);
  };

  // Serialize circuit for Kolmogorov complexity check
  const circuitString = gates
    .map((g) => `${g.gate}@q${g.qubit}t${g.timeStep}${g.targetQubit !== undefined ? `>q${g.targetQubit}` : ''}`)
    .join(';');

  const sidebar = (
    <div className="space-y-4">
      {/* Circuit config */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 space-y-3">
        <h3 className="text-sm font-semibold text-slate-300">Circuit Configuration</h3>
        <div>
          <label className="text-xs text-slate-400 block mb-1">Qubits</label>
          <div className="flex gap-1">
            {NUM_QUBITS_OPTIONS.map((n) => (
              <button
                key={n}
                onClick={() => {
                  setNumQubits(n);
                  // Remove gates on qubits that no longer exist
                  setGates((prev) =>
                    prev.filter((g) => g.qubit < n && (g.targetQubit === undefined || g.targetQubit < n))
                  );
                }}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  numQubits === n
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'bg-slate-700 text-slate-400 border border-slate-600 hover:bg-slate-600'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs text-slate-400 block mb-1">Time Steps</label>
          <div className="flex gap-1">
            {NUM_STEPS_OPTIONS.map((n) => (
              <button
                key={n}
                onClick={() => {
                  setNumSteps(n);
                  setGates((prev) => prev.filter((g) => g.timeStep < n));
                }}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  numSteps === n
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'bg-slate-700 text-slate-400 border border-slate-600 hover:bg-slate-600'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={handleClearCircuit}
          className="w-full px-3 py-1.5 text-sm rounded bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors"
        >
          Clear Circuit
        </button>
      </div>

      {/* Gate selector */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-300 mb-3">Gate Palette</h3>
        <GateSelector selectedGate={selectedGate} onSelectGate={setSelectedGate} />
      </div>

      {/* Kolmogorov on circuit description */}
      {circuitString.length > 0 && (
        <KolmogorovChecker data={circuitString} label="Circuit Complexity" />
      )}
    </div>
  );

  return (
    <AppPageLayout
      title="Quantum Circuit Designer"
      description="Design and analyze quantum circuits with fidelity estimation"
      domain="quantum-computing"
      sidebar={sidebar}
    >
      {/* Circuit diagram */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-300">Circuit Diagram</h2>
          <span className="text-xs text-slate-500">
            {gates.length} gate{gates.length !== 1 ? 's' : ''} placed
          </span>
        </div>
        <CircuitBuilder
          numQubits={numQubits}
          numSteps={numSteps}
          gates={gates}
          selectedGate={selectedGate}
          onAddGate={handleAddGate}
          onRemoveGate={handleRemoveGate}
          pendingControl={pendingControl}
          onSetPendingControl={setPendingControl}
        />
        {!selectedGate && gates.length === 0 && (
          <p className="text-xs text-slate-500 mt-2">
            Select a gate from the palette, then click on qubit line positions to place it.
          </p>
        )}
      </div>

      {/* Fidelity metrics */}
      <FidelityMetrics gates={gates} numQubits={numQubits} numSteps={numSteps} />
    </AppPageLayout>
  );
};

export default QuantumCircuits;
