/**
 * Zeq OS Mathematical Framework - Medicine Operators
 * Operators for medical science and healthcare
 */

import { ZeqOperator } from '../types';

export const MedicineOperators: ZeqOperator[] = [
  { id: 'MD1', name: 'Diagnosis', symbol: 'D_X', domain: 'Medicine', formula: 'P(Disease|Symptoms) via Bayes', description: 'Disease probability assessment' },
  { id: 'MD2', name: 'Pharmacokinetics', symbol: 'P_K', domain: 'Medicine', formula: 'ADME: absorption, distribution, metabolism, elimination', description: 'Drug movement in body' },
  { id: 'MD3', name: 'Pharmacodynamics', symbol: 'P_D', domain: 'Medicine', formula: 'Effect = Emax·C/(EC50 + C)', description: 'Drug effect mechanisms' },
  { id: 'MD4', name: 'Epidemiology', symbol: 'E_P', domain: 'Medicine', formula: 'R₀, incidence, prevalence, risk ratios', description: 'Disease population patterns' },
  { id: 'MD5', name: 'Clinical Trials', symbol: 'C_T', domain: 'Medicine', formula: 'RCT, placebo, blinding, endpoints', description: 'Treatment efficacy testing' },
  { id: 'MD6', name: 'Pathophysiology', symbol: 'P_P', domain: 'Medicine', formula: 'Normal → dysfunction → disease', description: 'Disease mechanism analysis' },
  { id: 'MD7', name: 'Evidence-Based Medicine', symbol: 'EBM', domain: 'Medicine', formula: 'Best evidence + clinical expertise + patient values', description: 'Clinical decision framework' },
  { id: 'MD8', name: 'Vital Signs', symbol: 'V_S', domain: 'Medicine', formula: 'HR, BP, RR, T, SpO2 normal ranges', description: 'Physiological indicators' },
  { id: 'MD9', name: 'Laboratory Interpretation', symbol: 'L_I', domain: 'Medicine', formula: 'Reference ranges, sensitivity, specificity', description: 'Test result analysis' },
  { id: 'MD10', name: 'Imaging Analysis', symbol: 'I_A', domain: 'Medicine', formula: 'X-ray, CT, MRI, ultrasound interpretation', description: 'Medical image reading' },
  { id: 'MD11', name: 'Surgical Planning', symbol: 'S_P', domain: 'Medicine', formula: 'Indication, approach, risk assessment', description: 'Operative decision making' },
  { id: 'MD12', name: 'Prognosis', symbol: 'P_G', domain: 'Medicine', formula: 'Survival curves, staging, risk factors', description: 'Disease outcome prediction' },
  { id: 'MD13', name: 'Drug Interactions', symbol: 'D_I', domain: 'Medicine', formula: 'PK/PD interactions, contraindications', description: 'Multi-drug effects' },
  { id: 'MD14', name: 'Medical Ethics', symbol: 'M_E', domain: 'Medicine', formula: 'Autonomy, beneficence, non-maleficence, justice', description: 'Healthcare ethical principles' },
  { id: 'MD15', name: 'Public Health', symbol: 'P_H', domain: 'Medicine', formula: 'Prevention, promotion, policy, population', description: 'Community health approach' },
];

export const getMedicineOperator = (id: string): ZeqOperator | undefined => {
  return MedicineOperators.find(op => op.id === id);
};
