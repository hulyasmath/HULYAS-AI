import React, { useState } from 'react';
import { AppPageLayout } from '../shared/AppPageLayout';
import { EntropyVerifier } from '../shared/EntropyVerifier';
import { KolmogorovChecker } from '../shared/KolmogorovChecker';
import MaterialSelector, { Material, MATERIALS } from './MaterialSelector';
import StressStrainCurve from './StressStrainCurve';
import FatigueCalculator from './FatigueCalculator';

const MaterialsExplorer: React.FC = () => {
  const [selectedMaterial, setSelectedMaterial] = useState<Material>(MATERIALS[0]);

  // Material properties as numbers for entropy verification
  const propertyValues = [
    selectedMaterial.youngsModulus,
    selectedMaterial.yieldStrength,
    selectedMaterial.ultimateTensileStrength,
    selectedMaterial.density,
    selectedMaterial.fatigueSigmaF,
  ];

  // Serialized material data for Kolmogorov
  const materialDataString = MATERIALS.map(
    (m) => `${m.name}:E=${m.youngsModulus},Sy=${m.yieldStrength},Su=${m.ultimateTensileStrength},rho=${m.density}`
  ).join('|');

  const sidebar = (
    <div className="space-y-4">
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-300 mb-3">Material Database</h3>
        <MaterialSelector
          selectedMaterial={selectedMaterial}
          onSelectMaterial={setSelectedMaterial}
        />
      </div>

      {/* Summary card for selected material */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-300 mb-2">Selected Properties</h3>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-400">Young's Modulus</span>
            <span className="text-cyan-400 font-mono">{selectedMaterial.youngsModulus} GPa</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Yield Strength</span>
            <span className="text-cyan-400 font-mono">{selectedMaterial.yieldStrength} MPa</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">UTS</span>
            <span className="text-cyan-400 font-mono">{selectedMaterial.ultimateTensileStrength} MPa</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Density</span>
            <span className="text-cyan-400 font-mono">{selectedMaterial.density} kg/m&sup3;</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Specific Strength</span>
            <span className="text-orange-400 font-mono">
              {(selectedMaterial.ultimateTensileStrength / (selectedMaterial.density / 1000)).toFixed(0)} kN&middot;m/kg
            </span>
          </div>
        </div>
      </div>

      <EntropyVerifier data={propertyValues} label="Property Entropy" compact />
      <KolmogorovChecker data={materialDataString} label="Database Complexity" compact />
    </div>
  );

  return (
    <AppPageLayout
      title="Materials Science Explorer"
      description="Stress-strain analysis and fatigue life prediction"
      domain="materials-science"
      sidebar={sidebar}
    >
      <StressStrainCurve material={selectedMaterial} />
      <FatigueCalculator material={selectedMaterial} />
    </AppPageLayout>
  );
};

export default MaterialsExplorer;
