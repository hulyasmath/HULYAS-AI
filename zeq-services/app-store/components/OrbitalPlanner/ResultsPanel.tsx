import React, { useMemo } from 'react';
import { Gauge, Clock, Zap } from 'lucide-react';
import { PrecisionBadge } from '../shared/PrecisionBadge';
import { EntropyVerifier } from '../shared/EntropyVerifier';
import { KolmogorovChecker } from '../shared/KolmogorovChecker';
import { computeLocally } from '../shared/OperatorExecution';
import {
  HohmannResult,
  orbitVelocity,
  orbitPeriod,
  escapeVelocity,
  inclinationChangeDeltaV,
  formatTransferTime,
} from './TransferCalculator';
import { MissionParams } from './MissionConfig';

interface ResultsPanelProps {
  transfer: HohmannResult | null;
  params: MissionParams;
}

const ResultsPanel: React.FC<ResultsPanelProps> = ({ transfer, params }) => {
  if (!transfer) {
    return (
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 text-center text-slate-400">
        <Gauge size={32} className="mx-auto mb-2 opacity-50" />
        <p className="text-sm">Configure mission parameters and click Calculate to see results.</p>
      </div>
    );
  }

  const incDV = inclinationChangeDeltaV(params.departureAlt, params.inclination);
  const totalWithInc = transfer.totalDeltaV + incDV;
  const depVel = orbitVelocity(params.departureAlt);
  const arrVel = orbitVelocity(params.arrivalAlt);
  const depPeriod = orbitPeriod(params.departureAlt);
  const arrPeriod = orbitPeriod(params.arrivalAlt);
  const depEscape = escapeVelocity(params.departureAlt);

  // Reference values from computeLocally for cross-verification
  const refDeltaV = computeLocally('HOHMANN_TRANSFER', {
    altitude1: params.departureAlt,
    altitude2: params.arrivalAlt,
  });

  // Collect numbers for entropy verification
  const computedValues = useMemo(
    () => [
      transfer.deltaV1,
      transfer.deltaV2,
      transfer.totalDeltaV,
      transfer.transferTime,
      depVel,
      arrVel,
      depPeriod,
      arrPeriod,
      depEscape,
      incDV,
    ],
    [transfer, depVel, arrVel, depPeriod, arrPeriod, depEscape, incDV]
  );

  const computationStr = useMemo(
    () => computedValues.map(v => v.toFixed(8)).join(','),
    [computedValues]
  );

  return (
    <div className="space-y-4">
      {/* Delta-V Budget */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2 mb-3">
          <Zap size={16} className="text-orange-400" />
          Delta-V Budget
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <span className="text-xs text-slate-400">Burn 1 (departure)</span>
            <p className="text-lg font-mono text-cyan-400">{transfer.deltaV1.toFixed(2)} m/s</p>
          </div>
          <div>
            <span className="text-xs text-slate-400">Burn 2 (arrival)</span>
            <p className="text-lg font-mono text-orange-400">{transfer.deltaV2.toFixed(2)} m/s</p>
          </div>
          {incDV > 0 && (
            <div>
              <span className="text-xs text-slate-400">Inclination change</span>
              <p className="text-lg font-mono text-amber-400">{incDV.toFixed(2)} m/s</p>
            </div>
          )}
          <div className="col-span-2 border-t border-slate-700 pt-2">
            <span className="text-xs text-slate-400">Total Delta-V</span>
            <p className="text-xl font-mono text-white font-bold">{totalWithInc.toFixed(2)} m/s</p>
          </div>
        </div>
        <div className="mt-3">
          <PrecisionBadge computed={transfer.totalDeltaV} reference={refDeltaV} label="Hohmann dV" />
        </div>
      </div>

      {/* Transfer Time */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2 mb-3">
          <Clock size={16} className="text-cyan-400" />
          Transfer Time
        </h3>
        <p className="text-xl font-mono text-cyan-400">{formatTransferTime(transfer.transferTime)}</p>
        <p className="text-xs text-slate-400 mt-1">{transfer.transferTime.toFixed(1)} seconds</p>
      </div>

      {/* Orbital Velocities */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2 mb-3">
          <Gauge size={16} className="text-cyan-400" />
          Orbital Parameters
        </h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-xs text-slate-400">Departure velocity</span>
            <p className="font-mono text-slate-200">{depVel.toFixed(2)} m/s</p>
          </div>
          <div>
            <span className="text-xs text-slate-400">Arrival velocity</span>
            <p className="font-mono text-slate-200">{arrVel.toFixed(2)} m/s</p>
          </div>
          <div>
            <span className="text-xs text-slate-400">Departure period</span>
            <p className="font-mono text-slate-200">{formatTransferTime(depPeriod)}</p>
          </div>
          <div>
            <span className="text-xs text-slate-400">Arrival period</span>
            <p className="font-mono text-slate-200">{formatTransferTime(arrPeriod)}</p>
          </div>
          <div className="col-span-2">
            <span className="text-xs text-slate-400">Escape velocity (departure)</span>
            <p className="font-mono text-slate-200">{depEscape.toFixed(2)} m/s</p>
          </div>
        </div>
      </div>

      {/* Verification */}
      <EntropyVerifier data={computedValues} label="Computation Entropy" />
      <KolmogorovChecker data={computationStr} label="Result Complexity" />
    </div>
  );
};

export default ResultsPanel;
