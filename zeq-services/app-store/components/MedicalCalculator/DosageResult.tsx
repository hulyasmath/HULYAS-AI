import React, { useMemo } from 'react';
import { Activity, Scale, Pill } from 'lucide-react';
import { PrecisionBadge } from '../shared/PrecisionBadge';
import { EntropyVerifier } from '../shared/EntropyVerifier';
import { KolmogorovChecker } from '../shared/KolmogorovChecker';
import { computeLocally } from '../shared/OperatorExecution';
import { PatientData } from './PatientInput';

interface DosageResultProps {
  activeTab: 'gfr' | 'bmi' | 'dosage';
  patient: PatientData;
  calculations: {
    gfr: number;
    bmi: number;
    bsa: number;
    adjustedDose: number;
    standardDose: number;
  };
}

const DosageResult: React.FC<DosageResultProps> = ({ activeTab, patient, calculations }) => {
  // Cross-verify with computeLocally
  const refGfr = computeLocally('MED_GFR', {
    age: patient.age,
    weight: patient.weight,
    creatinine: patient.creatinine,
    isFemale: patient.sex === 'female' ? 1 : 0,
  });
  const refBmi = computeLocally('MED_BMI', {
    weight: patient.weight,
    height: patient.height / 100,
  });
  const refBsa = computeLocally('MED_BSA', {
    weight: patient.weight,
    height: patient.height,
  });
  const refDose = computeLocally('MED_DOSE', {
    weight: patient.weight,
    height: patient.height,
    standardDose: calculations.standardDose,
  });

  const allValues = useMemo(
    () => [calculations.gfr, calculations.bmi, calculations.bsa, calculations.adjustedDose],
    [calculations]
  );

  const dataStr = useMemo(
    () => allValues.map(v => v.toFixed(8)).join(','),
    [allValues]
  );

  return (
    <div className="space-y-4">
      {activeTab === 'gfr' && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4">
            <Activity size={18} className="text-cyan-400" />
            <h3 className="text-sm font-semibold text-slate-200">
              Glomerular Filtration Rate (Cockcroft-Gault)
            </h3>
          </div>

          <div className="mb-3">
            <p className="text-3xl font-mono font-bold text-cyan-400">
              {calculations.gfr.toFixed(1)}
              <span className="text-sm text-slate-400 ml-2">mL/min</span>
            </p>
          </div>

          <div className="bg-slate-900/50 rounded-lg p-3 text-xs text-slate-400 font-mono mb-3">
            GFR = ((140 - {patient.age}) * {patient.weight}) / (72 * {patient.creatinine})
            {patient.sex === 'female' ? ' * 0.85' : ''}
            {' = '}
            <span className="text-cyan-400">{calculations.gfr.toFixed(2)}</span>
          </div>

          <PrecisionBadge computed={calculations.gfr} reference={refGfr} label="GFR Validation" />
        </div>
      )}

      {activeTab === 'bmi' && (
        <div className="space-y-4">
          {/* BMI */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-4">
              <Scale size={18} className="text-orange-400" />
              <h3 className="text-sm font-semibold text-slate-200">Body Mass Index</h3>
            </div>

            <p className="text-3xl font-mono font-bold text-orange-400">
              {calculations.bmi.toFixed(1)}
              <span className="text-sm text-slate-400 ml-2">kg/m2</span>
            </p>

            <div className="mt-2 text-xs text-slate-400">
              {calculations.bmi < 18.5 && <span className="text-amber-400">Underweight</span>}
              {calculations.bmi >= 18.5 && calculations.bmi < 25 && <span className="text-emerald-400">Normal weight</span>}
              {calculations.bmi >= 25 && calculations.bmi < 30 && <span className="text-amber-400">Overweight</span>}
              {calculations.bmi >= 30 && calculations.bmi < 40 && <span className="text-orange-400">Obese</span>}
              {calculations.bmi >= 40 && <span className="text-red-400">Morbidly obese</span>}
            </div>

            <div className="bg-slate-900/50 rounded-lg p-3 text-xs text-slate-400 font-mono mt-3">
              BMI = {patient.weight} / ({(patient.height / 100).toFixed(2)}){'\u00B2'}
              {' = '}
              <span className="text-orange-400">{calculations.bmi.toFixed(2)}</span>
            </div>

            <div className="mt-3">
              <PrecisionBadge computed={calculations.bmi} reference={refBmi} label="BMI Validation" />
            </div>
          </div>

          {/* BSA */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-4">
              <Scale size={18} className="text-cyan-400" />
              <h3 className="text-sm font-semibold text-slate-200">Body Surface Area (DuBois)</h3>
            </div>

            <p className="text-3xl font-mono font-bold text-cyan-400">
              {calculations.bsa.toFixed(3)}
              <span className="text-sm text-slate-400 ml-2">m2</span>
            </p>

            <div className="bg-slate-900/50 rounded-lg p-3 text-xs text-slate-400 font-mono mt-3">
              BSA = 0.007184 * {patient.weight}^0.425 * {patient.height}^0.725
              {' = '}
              <span className="text-cyan-400">{calculations.bsa.toFixed(4)}</span>
            </div>

            <div className="mt-3">
              <PrecisionBadge computed={calculations.bsa} reference={refBsa} label="BSA Validation" />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'dosage' && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4">
            <Pill size={18} className="text-emerald-400" />
            <h3 className="text-sm font-semibold text-slate-200">BSA-Adjusted Dosage</h3>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <span className="text-xs text-slate-400">Standard Dose</span>
              <p className="text-xl font-mono text-slate-300">{calculations.standardDose} mg</p>
            </div>
            <div>
              <span className="text-xs text-slate-400">Adjusted Dose</span>
              <p className="text-xl font-mono font-bold text-emerald-400">{calculations.adjustedDose.toFixed(1)} mg</p>
            </div>
          </div>

          <div className="bg-slate-900/50 rounded-lg p-3 text-xs text-slate-400 font-mono mb-3">
            Dose = {calculations.standardDose} * ({calculations.bsa.toFixed(3)} / 1.73)
            {' = '}
            <span className="text-emerald-400">{calculations.adjustedDose.toFixed(2)} mg</span>
          </div>

          <div className="mb-3">
            <PrecisionBadge computed={calculations.adjustedDose} reference={refDose} label="Dose Validation" />
          </div>

          {calculations.gfr < 60 && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 text-amber-400 text-sm">
              Note: Patient has reduced renal function (GFR {calculations.gfr.toFixed(0)} mL/min).
              Further dose adjustment may be required.
            </div>
          )}
        </div>
      )}

      {/* Verification section */}
      <EntropyVerifier data={allValues} label="Computation Entropy" />
      <KolmogorovChecker data={dataStr} label="Result Complexity" />
    </div>
  );
};

export default DosageResult;
