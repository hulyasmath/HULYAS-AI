import React, { useState, useCallback } from 'react';
import { AppPageLayout } from '../shared/AppPageLayout';
import MissionConfig, { MissionParams } from './MissionConfig';
import OrbitVisualizer3D from './OrbitVisualizer3D';
import ResultsPanel from './ResultsPanel';
import { hohmannTransfer, HohmannResult } from './TransferCalculator';

const OrbitalPlanner: React.FC = () => {
  const [params, setParams] = useState<MissionParams>({
    departureAlt: 200,
    arrivalAlt: 35786,
    mass: 1000,
    inclination: 0,
  });
  const [transfer, setTransfer] = useState<HohmannResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCompute = useCallback((newParams: MissionParams) => {
    setParams(newParams);
    setError(null);
    try {
      const result = hohmannTransfer(newParams.departureAlt, newParams.arrivalAlt);
      if (!isFinite(result.totalDeltaV) || isNaN(result.totalDeltaV)) {
        setError('Computation produced invalid results. Check input values.');
        setTransfer(null);
        return;
      }
      setTransfer(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Computation failed');
      setTransfer(null);
    }
  }, []);

  const sidebar = (
    <div className="space-y-4">
      <MissionConfig onCompute={handleCompute} />
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-sm">
          {error}
        </div>
      )}
    </div>
  );

  return (
    <AppPageLayout
      title="Orbital Mission Planner"
      description="Hohmann transfer orbit calculator with real-time visualization"
      domain="aerospace"
      sidebar={sidebar}
    >
      <OrbitVisualizer3D
        departureAlt={params.departureAlt}
        arrivalAlt={params.arrivalAlt}
        transfer={transfer}
      />
      <ResultsPanel transfer={transfer} params={params} />
    </AppPageLayout>
  );
};

export default OrbitalPlanner;
