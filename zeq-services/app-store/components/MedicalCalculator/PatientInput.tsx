import React, { useState } from 'react';
import { User } from 'lucide-react';

export interface PatientData {
  age: number;
  weight: number;
  height: number;
  sex: 'male' | 'female';
  creatinine: number;
}

interface PatientInputProps {
  patient: PatientData;
  onChange: (patient: PatientData) => void;
}

interface FieldConfig {
  key: keyof Omit<PatientData, 'sex'>;
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
}

const FIELDS: FieldConfig[] = [
  { key: 'age', label: 'Age', unit: 'years', min: 1, max: 120, step: 1 },
  { key: 'weight', label: 'Weight', unit: 'kg', min: 1, max: 500, step: 0.1 },
  { key: 'height', label: 'Height', unit: 'cm', min: 30, max: 300, step: 1 },
  { key: 'creatinine', label: 'Serum Creatinine', unit: 'mg/dL', min: 0.1, max: 30, step: 0.1 },
];

const PatientInput: React.FC<PatientInputProps> = ({ patient, onChange }) => {
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});

  const handleNumericChange = (field: FieldConfig, value: string) => {
    const n = parseFloat(value);
    const newErrors = { ...errors };

    if (value === '' || isNaN(n)) {
      newErrors[field.key] = `Required`;
      setErrors(newErrors);
      return;
    }

    if (!isFinite(n)) {
      newErrors[field.key] = `Must be a finite number`;
      setErrors(newErrors);
      return;
    }

    if (n < field.min || n > field.max) {
      newErrors[field.key] = `Must be ${field.min}-${field.max}`;
      setErrors(newErrors);
      // Still update so user sees live feedback
    } else {
      delete newErrors[field.key];
      setErrors(newErrors);
    }

    onChange({ ...patient, [field.key]: n });
  };

  const handleSexChange = (sex: 'male' | 'female') => {
    onChange({ ...patient, sex });
  };

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 space-y-4">
      <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
        <User size={16} className="text-cyan-400" />
        Patient Data
      </h3>

      <div className="space-y-3">
        {FIELDS.map(field => (
          <div key={field.key}>
            <label className="block text-xs text-slate-400 mb-1">
              {field.label} ({field.unit})
            </label>
            <input
              type="number"
              value={patient[field.key]}
              onChange={e => handleNumericChange(field, e.target.value)}
              className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-1.5 text-sm text-white focus:border-cyan-400 focus:outline-none"
              min={field.min}
              max={field.max}
              step={field.step}
            />
            {errors[field.key] && (
              <p className="text-xs text-red-400 mt-1">{errors[field.key]}</p>
            )}
          </div>
        ))}

        {/* Sex selector */}
        <div>
          <label className="block text-xs text-slate-400 mb-1">Sex</label>
          <div className="flex gap-2">
            <button
              onClick={() => handleSexChange('male')}
              className={`flex-1 px-3 py-1.5 rounded text-sm font-medium transition-colors border ${
                patient.sex === 'male'
                  ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
                  : 'bg-slate-900 text-slate-400 border-slate-600 hover:border-slate-500'
              }`}
            >
              Male
            </button>
            <button
              onClick={() => handleSexChange('female')}
              className={`flex-1 px-3 py-1.5 rounded text-sm font-medium transition-colors border ${
                patient.sex === 'female'
                  ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
                  : 'bg-slate-900 text-slate-400 border-slate-600 hover:border-slate-500'
              }`}
            >
              Female
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientInput;
