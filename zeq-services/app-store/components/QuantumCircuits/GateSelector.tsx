import React from 'react';

export type GateType = 'H' | 'X' | 'Y' | 'Z' | 'T' | 'S' | 'CNOT' | 'SWAP' | 'CZ';

export interface GateInfo {
  name: GateType;
  label: string;
  color: string;
  qubits: 1 | 2;
  matrix: string;
}

export const GATES: GateInfo[] = [
  { name: 'H', label: 'Hadamard', color: '#06b6d4', qubits: 1, matrix: '1/sqrt(2) [[1,1],[1,-1]]' },
  { name: 'X', label: 'Pauli-X', color: '#f97316', qubits: 1, matrix: '[[0,1],[1,0]]' },
  { name: 'Y', label: 'Pauli-Y', color: '#a855f7', qubits: 1, matrix: '[[0,-i],[i,0]]' },
  { name: 'Z', label: 'Pauli-Z', color: '#22c55e', qubits: 1, matrix: '[[1,0],[0,-1]]' },
  { name: 'T', label: 'T Gate', color: '#eab308', qubits: 1, matrix: '[[1,0],[0,e^(ipi/4)]]' },
  { name: 'S', label: 'S Gate', color: '#ec4899', qubits: 1, matrix: '[[1,0],[0,i]]' },
  { name: 'CNOT', label: 'CNOT', color: '#06b6d4', qubits: 2, matrix: '[[1,0,0,0],[0,1,0,0],[0,0,0,1],[0,0,1,0]]' },
  { name: 'SWAP', label: 'SWAP', color: '#f97316', qubits: 2, matrix: '[[1,0,0,0],[0,0,1,0],[0,1,0,0],[0,0,0,1]]' },
  { name: 'CZ', label: 'CZ', color: '#22c55e', qubits: 2, matrix: '[[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,-1]]' },
];

interface GateSelectorProps {
  selectedGate: GateType | null;
  onSelectGate: (gate: GateType) => void;
}

const GateSelector: React.FC<GateSelectorProps> = ({ selectedGate, onSelectGate }) => {
  const singleQubit = GATES.filter((g) => g.qubits === 1);
  const twoQubit = GATES.filter((g) => g.qubits === 2);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Single-Qubit Gates
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {singleQubit.map((gate) => (
            <button
              key={gate.name}
              onClick={() => onSelectGate(gate.name)}
              className={`group relative flex flex-col items-center gap-1 p-2 rounded-lg border transition-all ${
                selectedGate === gate.name
                  ? 'border-cyan-500 bg-cyan-500/20 shadow-lg shadow-cyan-500/10'
                  : 'border-slate-700 bg-slate-800/50 hover:border-slate-600 hover:bg-slate-800'
              }`}
              title={gate.matrix}
            >
              <div
                className="w-8 h-8 rounded flex items-center justify-center text-sm font-bold text-white"
                style={{ backgroundColor: gate.color + '33', borderColor: gate.color, borderWidth: 1 }}
              >
                {gate.name}
              </div>
              <span className="text-xs text-slate-400">{gate.label}</span>
              {/* Matrix tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-700 rounded text-xs font-mono text-slate-300 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                {gate.matrix}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Two-Qubit Gates
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {twoQubit.map((gate) => (
            <button
              key={gate.name}
              onClick={() => onSelectGate(gate.name)}
              className={`group relative flex flex-col items-center gap-1 p-2 rounded-lg border transition-all ${
                selectedGate === gate.name
                  ? 'border-cyan-500 bg-cyan-500/20 shadow-lg shadow-cyan-500/10'
                  : 'border-slate-700 bg-slate-800/50 hover:border-slate-600 hover:bg-slate-800'
              }`}
              title={gate.matrix}
            >
              <div
                className="w-8 h-8 rounded flex items-center justify-center text-sm font-bold text-white"
                style={{ backgroundColor: gate.color + '33', borderColor: gate.color, borderWidth: 1 }}
              >
                {gate.name === 'CNOT' ? 'CX' : gate.name}
              </div>
              <span className="text-xs text-slate-400">{gate.label}</span>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-700 rounded text-[10px] font-mono text-slate-300 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 max-w-[200px] overflow-hidden text-ellipsis">
                {gate.matrix}
              </div>
            </button>
          ))}
        </div>
      </div>

      {selectedGate && (
        <div className="p-3 rounded-lg border border-cyan-500/30 bg-cyan-500/5">
          <p className="text-xs text-cyan-400 mb-1">Selected: {selectedGate}</p>
          <p className="text-xs text-slate-400">
            {GATES.find((g) => g.name === selectedGate)?.qubits === 1
              ? 'Click on a qubit line to place this gate.'
              : 'Click on a qubit line for the control, then the target.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default GateSelector;
