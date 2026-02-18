import React, { useState, useMemo, useCallback } from 'react';
import { Car, RotateCcw } from 'lucide-react';
import { AppPageLayout } from '../shared/AppPageLayout';
import { useZeqSync } from '../SimulationVisualizer/useZeqSync';
import { VehicleVisualizer } from './VehicleVisualizer';
import { SuspensionChart } from './SuspensionChart';
import { DynamicsMetrics } from './DynamicsMetrics';

type TabId = 'cornering' | 'suspension' | 'braking';

const VehicleDynamics: React.FC = () => {
  const { syncValue, elapsedTime, pulseCount } = useZeqSync();

  const [activeTab, setActiveTab] = useState<TabId>('cornering');

  // Vehicle parameters
  const [mass, setMass] = useState(1500);
  const [speed, setSpeed] = useState(100);
  const [turnRadius, setTurnRadius] = useState(100);

  // Suspension parameters
  const [springRate, setSpringRate] = useState(30);
  const [dampingCoeff, setDampingCoeff] = useState(3);
  const [unsprungMass, setUnsprungMass] = useState(45);

  // Braking parameters
  const [deceleration, setDeceleration] = useState(8);
  const [cgHeight, setCgHeight] = useState(0.55);
  const [wheelbase, setWheelbase] = useState(2.7);

  const handleReset = useCallback(() => {
    setMass(1500);
    setSpeed(100);
    setTurnRadius(100);
    setSpringRate(30);
    setDampingCoeff(3);
    setUnsprungMass(45);
    setDeceleration(8);
    setCgHeight(0.55);
    setWheelbase(2.7);
  }, []);

  const speedMs = useMemo(() => speed / 3.6, [speed]);

  const lateralAccel = useMemo(() => {
    const r = turnRadius > 0 ? turnRadius : 1;
    const val = (speedMs * speedMs) / r;
    return isFinite(val) ? val : 0;
  }, [speedMs, turnRadius]);

  const slipAngle = useMemo(() => {
    const vy = speedMs * Math.sin(lateralAccel / (speedMs || 1) * 0.1);
    const vx = speedMs > 0 ? speedMs : 0.01;
    const alpha = Math.atan2(vy, vx);
    return isFinite(alpha) ? alpha : 0;
  }, [speedMs, lateralAccel]);

  const tabs: { id: TabId; label: string }[] = [
    { id: 'cornering', label: 'Cornering' },
    { id: 'suspension', label: 'Suspension' },
    { id: 'braking', label: 'Braking' },
  ];

  const sidebar = (
    <div className="space-y-4">
      {/* Tab selector */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3">
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 text-xs py-1.5 px-2 rounded transition-colors ${
                activeTab === tab.id
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Vehicle parameters */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 space-y-3">
        <h3 className="text-sm font-medium text-slate-200 flex items-center gap-2">
          <Car size={14} className="text-cyan-400" />
          Vehicle Parameters
        </h3>
        <div>
          <label className="text-xs text-slate-400">Mass: {mass} kg</label>
          <input
            type="range"
            min={1000}
            max={2000}
            step={50}
            value={mass}
            onChange={(e) => setMass(Number(e.target.value))}
            className="w-full accent-cyan-400"
          />
        </div>
        <div>
          <label className="text-xs text-slate-400">Speed: {speed} km/h</label>
          <input
            type="range"
            min={20}
            max={200}
            step={5}
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="w-full accent-cyan-400"
          />
        </div>
        <div>
          <label className="text-xs text-slate-400">Turn Radius: {turnRadius} m</label>
          <input
            type="range"
            min={20}
            max={500}
            step={10}
            value={turnRadius}
            onChange={(e) => setTurnRadius(Number(e.target.value))}
            className="w-full accent-cyan-400"
          />
        </div>
      </div>

      {/* Suspension parameters */}
      {activeTab === 'suspension' && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 space-y-3">
          <h3 className="text-sm font-medium text-slate-200">Suspension</h3>
          <div>
            <label className="text-xs text-slate-400">Spring Rate: {springRate} kN/m</label>
            <input
              type="range"
              min={10}
              max={80}
              step={1}
              value={springRate}
              onChange={(e) => setSpringRate(Number(e.target.value))}
              className="w-full accent-orange-400"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400">Damping: {dampingCoeff} kNs/m</label>
            <input
              type="range"
              min={1}
              max={8}
              step={0.5}
              value={dampingCoeff}
              onChange={(e) => setDampingCoeff(Number(e.target.value))}
              className="w-full accent-orange-400"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400">Unsprung Mass: {unsprungMass} kg</label>
            <input
              type="range"
              min={30}
              max={60}
              step={1}
              value={unsprungMass}
              onChange={(e) => setUnsprungMass(Number(e.target.value))}
              className="w-full accent-orange-400"
            />
          </div>
        </div>
      )}

      {/* Braking parameters */}
      {activeTab === 'braking' && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 space-y-3">
          <h3 className="text-sm font-medium text-slate-200">Braking</h3>
          <div>
            <label className="text-xs text-slate-400">Deceleration: {deceleration} m/s&sup2;</label>
            <input
              type="range"
              min={1}
              max={15}
              step={0.5}
              value={deceleration}
              onChange={(e) => setDeceleration(Number(e.target.value))}
              className="w-full accent-orange-400"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400">CG Height: {cgHeight} m</label>
            <input
              type="range"
              min={0.3}
              max={1.0}
              step={0.05}
              value={cgHeight}
              onChange={(e) => setCgHeight(Number(e.target.value))}
              className="w-full accent-orange-400"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400">Wheelbase: {wheelbase} m</label>
            <input
              type="range"
              min={2.0}
              max={3.5}
              step={0.1}
              value={wheelbase}
              onChange={(e) => setWheelbase(Number(e.target.value))}
              className="w-full accent-orange-400"
            />
          </div>
        </div>
      )}

      {/* Reset */}
      <button
        onClick={handleReset}
        className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 rounded-lg text-sm text-slate-300 transition-colors"
      >
        <RotateCcw size={14} />
        Reset Defaults
      </button>

      {/* Sync indicator */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-2 text-xs text-slate-500">
        <span className="font-mono">Pulse #{pulseCount} | sync={syncValue.toFixed(4)}</span>
      </div>
    </div>
  );

  return (
    <AppPageLayout
      title="Vehicle Dynamics Analyzer"
      description="Bicycle model cornering, quarter-car suspension, and Pacejka tire model"
      domain="Transportation Engineering"
      sidebar={sidebar}
    >
      {activeTab === 'cornering' && (
        <VehicleVisualizer
          mass={mass}
          speedMs={speedMs}
          turnRadius={turnRadius}
          lateralAccel={lateralAccel}
          slipAngle={slipAngle}
          syncValue={syncValue}
          elapsedTime={elapsedTime}
        />
      )}

      {activeTab === 'suspension' && (
        <SuspensionChart
          sprungMass={mass * 0.75}
          unsprungMass={unsprungMass}
          springRate={springRate * 1000}
          dampingCoeff={dampingCoeff * 1000}
          tireStiffness={200000}
          elapsedTime={elapsedTime}
        />
      )}

      {activeTab === 'braking' && (
        <VehicleVisualizer
          mass={mass}
          speedMs={speedMs}
          turnRadius={turnRadius}
          lateralAccel={lateralAccel}
          slipAngle={slipAngle}
          syncValue={syncValue}
          elapsedTime={elapsedTime}
          brakingMode
          deceleration={deceleration}
          cgHeight={cgHeight}
          wheelbase={wheelbase}
        />
      )}

      <DynamicsMetrics
        mass={mass}
        speedMs={speedMs}
        turnRadius={turnRadius}
        lateralAccel={lateralAccel}
        slipAngle={slipAngle}
        springRate={springRate * 1000}
        dampingCoeff={dampingCoeff * 1000}
        unsprungMass={unsprungMass}
        deceleration={deceleration}
        cgHeight={cgHeight}
        wheelbase={wheelbase}
        activeTab={activeTab}
        syncValue={syncValue}
      />
    </AppPageLayout>
  );
};

export default VehicleDynamics;
