/**
 * Zeq OS Mathematical Framework - Law Operators
 * Operators for legal reasoning and jurisprudence
 */

import { ZeqOperator } from '../types';

export const LawOperators: ZeqOperator[] = [
  { id: 'LW1', name: 'Legal Syllogism', symbol: 'L_S', domain: 'Law', formula: 'Rule + Facts → Legal conclusion', description: 'Deductive legal reasoning' },
  { id: 'LW2', name: 'Statutory Interpretation', symbol: 'S_I', domain: 'Law', formula: 'Plain meaning, legislative intent, purpose', description: 'Law text analysis' },
  { id: 'LW3', name: 'Precedent Analysis', symbol: 'P_A', domain: 'Law', formula: 'Ratio decidendi, obiter dicta, distinguish', description: 'Case law reasoning' },
  { id: 'LW4', name: 'Balancing Test', symbol: 'B_T', domain: 'Law', formula: 'Rights A vs Rights B, proportionality', description: 'Competing interests analysis' },
  { id: 'LW5', name: 'Due Process', symbol: 'D_P', domain: 'Law', formula: 'Notice + opportunity to be heard', description: 'Procedural fairness' },
  { id: 'LW6', name: 'Burden of Proof', symbol: 'B_P', domain: 'Law', formula: 'Preponderance, clear & convincing, beyond reasonable doubt', description: 'Evidentiary standards' },
  { id: 'LW7', name: 'Contract Formation', symbol: 'C_F', domain: 'Law', formula: 'Offer + Acceptance + Consideration = Contract', description: 'Agreement elements' },
  { id: 'LW8', name: 'Tort Analysis', symbol: 'T_A', domain: 'Law', formula: 'Duty + Breach + Causation + Damages', description: 'Civil wrong elements' },
  { id: 'LW9', name: 'Criminal Elements', symbol: 'C_E', domain: 'Law', formula: 'Actus reus + Mens rea = Crime', description: 'Criminal liability' },
  { id: 'LW10', name: 'Constitutional Review', symbol: 'C_R', domain: 'Law', formula: 'Rational basis, intermediate, strict scrutiny', description: 'Judicial review standards' },
  { id: 'LW11', name: 'Property Rights', symbol: 'P_R', domain: 'Law', formula: 'Bundle of rights: use, exclude, transfer', description: 'Ownership analysis' },
  { id: 'LW12', name: 'Corporate Law', symbol: 'C_L', domain: 'Law', formula: 'Fiduciary duty, business judgment rule', description: 'Business entity governance' },
  { id: 'LW13', name: 'International Law', symbol: 'I_L', domain: 'Law', formula: 'Treaties, customary law, jus cogens', description: 'Law between nations' },
  { id: 'LW14', name: 'Legal Ethics', symbol: 'L_E', domain: 'Law', formula: 'Competence, confidentiality, conflicts', description: 'Professional responsibility' },
  { id: 'LW15', name: 'Jurisprudence', symbol: 'J_P', domain: 'Law', formula: 'Natural law, positivism, realism, CLS', description: 'Philosophy of law' },
];

export const getLawOperator = (id: string): ZeqOperator | undefined => {
  return LawOperators.find(op => op.id === id);
};
