import React, { useCallback } from 'react';
import { GateType, GATES } from './GateSelector';

export interface PlacedGate {
  id: string;
  gate: GateType;
  qubit: number;
  timeStep: number;
  targetQubit?: number; // for 2-qubit gates
}

interface CircuitBuilderProps {
  numQubits: number;
  numSteps: number;
  gates: PlacedGate[];
  selectedGate: GateType | null;
  onAddGate: (gate: PlacedGate) => void;
  onRemoveGate: (id: string) => void;
  pendingControl: { gate: GateType; qubit: number; timeStep: number } | null;
  onSetPendingControl: (pending: { gate: GateType; qubit: number; timeStep: number } | null) => void;
}

const QUBIT_Y_START = 50;
const QUBIT_Y_GAP = 60;
const STEP_X_START = 80;
const STEP_X_GAP = 70;
const GATE_SIZE = 36;

const CircuitBuilder: React.FC<CircuitBuilderProps> = ({
  numQubits,
  numSteps,
  gates,
  selectedGate,
  onAddGate,
  onRemoveGate,
  pendingControl,
  onSetPendingControl,
}) => {
  const svgWidth = STEP_X_START + numSteps * STEP_X_GAP + 40;
  const svgHeight = QUBIT_Y_START + numQubits * QUBIT_Y_GAP + 20;

  const getQubitY = (q: number) => QUBIT_Y_START + q * QUBIT_Y_GAP;
  const getStepX = (s: number) => STEP_X_START + s * STEP_X_GAP;

  const gateAt = (qubit: number, step: number) =>
    gates.find(
      (g) => (g.qubit === qubit || g.targetQubit === qubit) && g.timeStep === step
    );

  const handleCellClick = useCallback(
    (qubit: number, step: number) => {
      const existing = gateAt(qubit, step);
      if (existing) {
        onRemoveGate(existing.id);
        return;
      }

      if (!selectedGate) return;

      const gateInfo = GATES.find((g) => g.name === selectedGate);
      if (!gateInfo) return;

      if (gateInfo.qubits === 1) {
        onAddGate({
          id: `${selectedGate}-${qubit}-${step}-${Date.now()}`,
          gate: selectedGate,
          qubit,
          timeStep: step,
        });
      } else {
        // Two-qubit gate: first click = control, second = target
        if (!pendingControl) {
          onSetPendingControl({ gate: selectedGate, qubit, timeStep: step });
        } else {
          if (pendingControl.timeStep === step && pendingControl.qubit !== qubit) {
            onAddGate({
              id: `${pendingControl.gate}-${pendingControl.qubit}-${qubit}-${step}-${Date.now()}`,
              gate: pendingControl.gate,
              qubit: pendingControl.qubit,
              timeStep: step,
              targetQubit: qubit,
            });
          }
          onSetPendingControl(null);
        }
      }
    },
    [selectedGate, gates, pendingControl, onAddGate, onRemoveGate, onSetPendingControl]
  );

  const getGateColor = (gate: GateType) => GATES.find((g) => g.name === gate)?.color || '#06b6d4';

  return (
    <div className="bg-slate-900 rounded-lg border border-slate-700 p-4 overflow-x-auto">
      <svg
        width={svgWidth}
        height={svgHeight}
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="min-w-full"
      >
        {/* Background grid */}
        {Array.from({ length: numSteps }).map((_, s) => (
          <line
            key={`vgrid-${s}`}
            x1={getStepX(s)}
            y1={QUBIT_Y_START - 20}
            x2={getStepX(s)}
            y2={svgHeight - 10}
            stroke="#334155"
            strokeWidth={0.5}
            strokeDasharray="4,4"
          />
        ))}

        {/* Time step labels */}
        {Array.from({ length: numSteps }).map((_, s) => (
          <text
            key={`step-${s}`}
            x={getStepX(s)}
            y={20}
            textAnchor="middle"
            fill="#64748b"
            fontSize={11}
            fontFamily="monospace"
          >
            t{s}
          </text>
        ))}

        {/* Qubit lines */}
        {Array.from({ length: numQubits }).map((_, q) => (
          <g key={`qubit-${q}`}>
            <text
              x={20}
              y={getQubitY(q) + 5}
              fill="#06b6d4"
              fontSize={13}
              fontFamily="monospace"
              fontWeight="bold"
            >
              {`|q${q}⟩`}
            </text>
            <line
              x1={STEP_X_START - 20}
              y1={getQubitY(q)}
              x2={svgWidth - 20}
              y2={getQubitY(q)}
              stroke="#06b6d4"
              strokeWidth={1.5}
              opacity={0.6}
            />
          </g>
        ))}

        {/* Clickable cells */}
        {Array.from({ length: numQubits }).map((_, q) =>
          Array.from({ length: numSteps }).map((_, s) => (
            <rect
              key={`cell-${q}-${s}`}
              x={getStepX(s) - GATE_SIZE / 2}
              y={getQubitY(q) - GATE_SIZE / 2}
              width={GATE_SIZE}
              height={GATE_SIZE}
              fill="transparent"
              className="cursor-pointer hover:fill-cyan-500/10"
              onClick={() => handleCellClick(q, s)}
              rx={4}
            />
          ))
        )}

        {/* Pending control indicator */}
        {pendingControl && (
          <circle
            cx={getStepX(pendingControl.timeStep)}
            cy={getQubitY(pendingControl.qubit)}
            r={8}
            fill="#06b6d4"
            opacity={0.5}
            className="animate-pulse"
          />
        )}

        {/* Placed gates */}
        {gates.map((pg) => {
          const x = getStepX(pg.timeStep);
          const y = getQubitY(pg.qubit);
          const color = getGateColor(pg.gate);
          const gateInfo = GATES.find((g) => g.name === pg.gate);

          if (gateInfo?.qubits === 2 && pg.targetQubit !== undefined) {
            const ty = getQubitY(pg.targetQubit);
            if (pg.gate === 'CNOT') {
              return (
                <g key={pg.id} className="cursor-pointer" onClick={() => onRemoveGate(pg.id)}>
                  {/* Vertical line */}
                  <line x1={x} y1={y} x2={x} y2={ty} stroke={color} strokeWidth={2} />
                  {/* Control dot */}
                  <circle cx={x} cy={y} r={6} fill={color} />
                  {/* Target circle */}
                  <circle cx={x} cy={ty} r={12} fill="none" stroke={color} strokeWidth={2} />
                  <line x1={x - 8} y1={ty} x2={x + 8} y2={ty} stroke={color} strokeWidth={2} />
                  <line x1={x} y1={ty - 8} x2={x} y2={ty + 8} stroke={color} strokeWidth={2} />
                </g>
              );
            }
            if (pg.gate === 'SWAP') {
              return (
                <g key={pg.id} className="cursor-pointer" onClick={() => onRemoveGate(pg.id)}>
                  <line x1={x} y1={y} x2={x} y2={ty} stroke={color} strokeWidth={2} />
                  {/* X marks */}
                  <line x1={x - 6} y1={y - 6} x2={x + 6} y2={y + 6} stroke={color} strokeWidth={2} />
                  <line x1={x + 6} y1={y - 6} x2={x - 6} y2={y + 6} stroke={color} strokeWidth={2} />
                  <line x1={x - 6} y1={ty - 6} x2={x + 6} y2={ty + 6} stroke={color} strokeWidth={2} />
                  <line x1={x + 6} y1={ty - 6} x2={x - 6} y2={ty + 6} stroke={color} strokeWidth={2} />
                </g>
              );
            }
            if (pg.gate === 'CZ') {
              return (
                <g key={pg.id} className="cursor-pointer" onClick={() => onRemoveGate(pg.id)}>
                  <line x1={x} y1={y} x2={x} y2={ty} stroke={color} strokeWidth={2} />
                  <circle cx={x} cy={y} r={6} fill={color} />
                  <circle cx={x} cy={ty} r={6} fill={color} />
                </g>
              );
            }
          }

          // Single-qubit gate box
          return (
            <g key={pg.id} className="cursor-pointer" onClick={() => onRemoveGate(pg.id)}>
              <rect
                x={x - GATE_SIZE / 2}
                y={y - GATE_SIZE / 2}
                width={GATE_SIZE}
                height={GATE_SIZE}
                rx={4}
                fill={color + '33'}
                stroke={color}
                strokeWidth={1.5}
              />
              <text
                x={x}
                y={y + 5}
                textAnchor="middle"
                fill="white"
                fontSize={14}
                fontWeight="bold"
                fontFamily="monospace"
              >
                {pg.gate}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default CircuitBuilder;
