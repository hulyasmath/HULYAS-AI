import React from 'react';
import { AlertTriangle, CheckCircle, AlertCircle, ShieldAlert } from 'lucide-react';

interface SafetyCheckProps {
  gfr: number;
  bmi: number;
}

interface Warning {
  level: 'red' | 'yellow' | 'green';
  icon: React.ReactNode;
  title: string;
  message: string;
}

const SafetyCheck: React.FC<SafetyCheckProps> = ({ gfr, bmi }) => {
  const warnings: Warning[] = [];

  // GFR-based warnings
  if (gfr < 30) {
    warnings.push({
      level: 'red',
      icon: <ShieldAlert size={16} />,
      title: 'Severe Renal Impairment',
      message: 'GFR < 30 mL/min. Dose adjustment required. Consult nephrologist.',
    });
  } else if (gfr < 60) {
    warnings.push({
      level: 'yellow',
      icon: <AlertTriangle size={16} />,
      title: 'Moderate Renal Impairment',
      message: 'GFR 30-60 mL/min. Consider dose reduction for renally cleared drugs.',
    });
  } else if (gfr >= 90) {
    warnings.push({
      level: 'green',
      icon: <CheckCircle size={16} />,
      title: 'Normal Renal Function',
      message: 'GFR >= 90 mL/min. Standard dosing appropriate.',
    });
  } else {
    warnings.push({
      level: 'yellow',
      icon: <AlertCircle size={16} />,
      title: 'Mildly Reduced Renal Function',
      message: 'GFR 60-89 mL/min. Monitor renal function.',
    });
  }

  // BMI-based warnings
  if (bmi > 40) {
    warnings.push({
      level: 'yellow',
      icon: <AlertTriangle size={16} />,
      title: 'Morbid Obesity',
      message: 'BMI > 40. Consider ideal body weight or adjusted body weight for dosing.',
    });
  } else if (bmi > 30) {
    warnings.push({
      level: 'yellow',
      icon: <AlertCircle size={16} />,
      title: 'Obesity',
      message: 'BMI > 30. Lipophilic drugs may have altered distribution.',
    });
  }

  // Generic drug interaction warning
  warnings.push({
    level: 'yellow',
    icon: <AlertTriangle size={16} />,
    title: 'Drug Interactions',
    message: 'Always verify against current drug interaction databases before prescribing.',
  });

  const levelStyles = {
    red: 'bg-red-500/10 border-red-500/30 text-red-400',
    yellow: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
    green: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
  };

  const levelIconStyles = {
    red: 'text-red-400',
    yellow: 'text-amber-400',
    green: 'text-emerald-400',
  };

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
        <ShieldAlert size={16} className="text-amber-400" />
        Safety Alerts
      </h3>

      {warnings.map((warning, i) => (
        <div
          key={i}
          className={`border rounded-lg p-3 ${levelStyles[warning.level]}`}
        >
          <div className="flex items-start gap-2">
            <span className={`mt-0.5 ${levelIconStyles[warning.level]}`}>
              {warning.icon}
            </span>
            <div>
              <p className="text-sm font-medium">{warning.title}</p>
              <p className="text-xs opacity-80 mt-0.5">{warning.message}</p>
            </div>
          </div>
        </div>
      ))}

      <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-3 text-xs text-slate-500">
        These calculations are for educational purposes only. Always verify with clinical references
        and consider patient-specific factors not captured by these formulas.
      </div>
    </div>
  );
};

export default SafetyCheck;
