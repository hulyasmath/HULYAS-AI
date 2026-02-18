import React, { useState, useMemo } from 'react';
import { AppPageLayout } from '../shared/AppPageLayout';
import PatientInput, { PatientData } from './PatientInput';
import DosageResult from './DosageResult';
import SafetyCheck from './SafetyCheck';

type Tab = 'gfr' | 'bmi' | 'dosage';

const MedicalCalculator: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('gfr');
  const [patient, setPatient] = useState<PatientData>({
    age: 50,
    weight: 70,
    height: 170,
    sex: 'male',
    creatinine: 1.0,
  });

  const calculations = useMemo(() => {
    const { age, weight, height, sex, creatinine } = patient;
    const heightM = height / 100;

    // GFR: Cockcroft-Gault
    const gfrRaw = ((140 - age) * weight) / (72 * creatinine);
    const gfr = sex === 'female' ? gfrRaw * 0.85 : gfrRaw;

    // BMI
    const bmi = weight / (heightM * heightM);

    // BSA: DuBois formula
    const bsa = 0.007184 * Math.pow(weight, 0.425) * Math.pow(height, 0.725);

    // Dosage adjustment: standardDose * BSA / 1.73
    const standardDose = 100; // mg baseline
    const adjustedDose = standardDose * bsa / 1.73;

    return { gfr, bmi, bsa, adjustedDose, standardDose };
  }, [patient]);

  const tabs: { id: Tab; label: string }[] = [
    { id: 'gfr', label: 'GFR Calculator' },
    { id: 'bmi', label: 'BMI / BSA' },
    { id: 'dosage', label: 'Dosage Adjust' },
  ];

  const sidebar = (
    <div className="space-y-4">
      <PatientInput patient={patient} onChange={setPatient} />
      <SafetyCheck gfr={calculations.gfr} bmi={calculations.bmi} />
    </div>
  );

  return (
    <AppPageLayout
      title="Medical Dosage Calculator"
      description="GFR, BMI/BSA, and dosage calculations with safety checks"
      domain="medical"
      sidebar={sidebar}
    >
      {/* Tab Navigation */}
      <div className="flex gap-1 bg-slate-800/50 rounded-lg p-1 border border-slate-700">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <DosageResult
        activeTab={activeTab}
        patient={patient}
        calculations={calculations}
      />
    </AppPageLayout>
  );
};

export default MedicalCalculator;
