/**
 * Zeq OS Mathematical Framework - Philosophy Operators
 * Operators for logic, epistemology, and philosophical reasoning
 */

import { ZeqOperator } from '../types';

export const PhilosophyOperators: ZeqOperator[] = [
  { id: 'PH1', name: 'Modal Logic', symbol: 'M_L', domain: 'Philosophy', formula: '□p (necessarily p), ◇p (possibly p)', description: 'Reasoning about possibility and necessity' },
  { id: 'PH2', name: 'Epistemological Justification', symbol: 'E_J', domain: 'Philosophy', formula: 'K(p) = JTB(p) ∧ ¬Gettier(p)', description: 'Knowledge as justified true belief' },
  { id: 'PH3', name: 'Deontic Logic', symbol: 'D_L', domain: 'Philosophy', formula: 'O(p) (obligatory), P(p) (permitted), F(p) (forbidden)', description: 'Logic of obligations and permissions' },
  { id: 'PH4', name: 'Counterfactual Reasoning', symbol: 'C_F', domain: 'Philosophy', formula: 'A □→ B (if A were true, B would be)', description: 'Reasoning about hypothetical scenarios' },
  { id: 'PH5', name: 'Dialectical Synthesis', symbol: 'D_S', domain: 'Philosophy', formula: 'Thesis + Antithesis → Synthesis', description: 'Hegelian dialectical reasoning' },
  { id: 'PH6', name: 'Phenomenological Reduction', symbol: 'P_R', domain: 'Philosophy', formula: 'epoché(experience) → essential structure', description: 'Husserl\'s method of bracketing' },
  { id: 'PH7', name: 'Logical Positivism', symbol: 'L_P', domain: 'Philosophy', formula: 'Meaningful(p) ↔ Verifiable(p) ∨ Analytic(p)', description: 'Verification principle of meaning' },
  { id: 'PH8', name: 'Pragmatic Truth', symbol: 'P_T', domain: 'Philosophy', formula: 'True(p) ↔ Useful(p) in practice', description: 'James-Dewey pragmatic theory' },
  { id: 'PH9', name: 'Coherence Theory', symbol: 'C_T', domain: 'Philosophy', formula: 'True(p) ↔ Coherent(p, BeliefSystem)', description: 'Truth as systemic coherence' },
  { id: 'PH10', name: 'Correspondence Theory', symbol: 'C_R', domain: 'Philosophy', formula: 'True(p) ↔ Corresponds(p, Facts)', description: 'Truth as correspondence to reality' },
  { id: 'PH11', name: 'Existential Analysis', symbol: 'E_A', domain: 'Philosophy', formula: 'Dasein, authenticity, being-toward-death', description: 'Heidegger\'s fundamental ontology' },
  { id: 'PH12', name: 'Utilitarian Calculus', symbol: 'U_C', domain: 'Philosophy', formula: 'U(a) = Σ happiness(a) - Σ suffering(a)', description: 'Greatest good for greatest number' },
  { id: 'PH13', name: 'Categorical Imperative', symbol: 'C_I', domain: 'Philosophy', formula: 'Act only on maxims universalizable without contradiction', description: 'Kant\'s moral law' },
  { id: 'PH14', name: 'Virtue Ethics', symbol: 'V_E', domain: 'Philosophy', formula: 'Good(a) ↔ Virtuous(agent) ∧ Flourishing(eudaimonia)', description: 'Aristotelian character ethics' },
  { id: 'PH15', name: 'Social Contract', symbol: 'S_C', domain: 'Philosophy', formula: 'Legitimate(authority) ↔ Consented(citizens)', description: 'Political legitimacy through consent' },
];

export const getPhilosophyOperator = (id: string): ZeqOperator | undefined => {
  return PhilosophyOperators.find(op => op.id === id);
};
