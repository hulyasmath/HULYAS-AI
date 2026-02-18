/**
 * Zeq OS Mathematical Framework - Linguistics Operators
 * Operators for language structure and analysis
 */

import { ZeqOperator } from '../types';

export const LinguisticsOperators: ZeqOperator[] = [
  { id: 'LI1', name: 'Syntax Tree', symbol: 'S_T', domain: 'Linguistics', formula: 'S → NP VP, NP → Det N, VP → V NP', description: 'Phrase structure grammar' },
  { id: 'LI2', name: 'Semantic Composition', symbol: 'S_C', domain: 'Linguistics', formula: '⟦AB⟧ = ⟦A⟧(⟦B⟧) or ⟦B⟧(⟦A⟧)', description: 'Compositional meaning construction' },
  { id: 'LI3', name: 'Phonological Rules', symbol: 'P_R', domain: 'Linguistics', formula: 'A → B / X__Y (A becomes B in context X_Y)', description: 'Sound change patterns' },
  { id: 'LI4', name: 'Morphological Analysis', symbol: 'M_A', domain: 'Linguistics', formula: 'Word = Root + Affixes, paradigms', description: 'Word structure decomposition' },
  { id: 'LI5', name: 'Pragmatic Implicature', symbol: 'P_I', domain: 'Linguistics', formula: 'Said(p) + Maxims → Implicated(q)', description: 'Gricean conversational inference' },
  { id: 'LI6', name: 'Discourse Structure', symbol: 'D_S', domain: 'Linguistics', formula: 'Coherence relations, RST trees', description: 'Text organization analysis' },
  { id: 'LI7', name: 'Speech Acts', symbol: 'S_A', domain: 'Linguistics', formula: 'Illocutionary force + propositional content', description: 'Austin-Searle speech act theory' },
  { id: 'LI8', name: 'Optimality Theory', symbol: 'O_T', domain: 'Linguistics', formula: 'Output = argmin violations(ranked constraints)', description: 'Constraint-based phonology' },
  { id: 'LI9', name: 'Lexical Semantics', symbol: 'L_S', domain: 'Linguistics', formula: 'Word meaning = features, relations, prototypes', description: 'Word meaning representation' },
  { id: 'LI10', name: 'Language Acquisition', symbol: 'L_A', domain: 'Linguistics', formula: 'LAD + PLD → mature grammar', description: 'Chomsky acquisition model' },
  { id: 'LI11', name: 'Sociolinguistic Variation', symbol: 'S_V', domain: 'Linguistics', formula: 'P(variant) = f(social variables)', description: 'Social factors in language' },
  { id: 'LI12', name: 'Historical Linguistics', symbol: 'H_L', domain: 'Linguistics', formula: 'Proto-language reconstruction, sound laws', description: 'Language change over time' },
  { id: 'LI13', name: 'Typological Universals', symbol: 'T_U', domain: 'Linguistics', formula: 'If feature A then feature B (implicational)', description: 'Cross-linguistic patterns' },
  { id: 'LI14', name: 'Information Structure', symbol: 'I_S', domain: 'Linguistics', formula: 'Topic-focus articulation, givenness', description: 'Information packaging in discourse' },
  { id: 'LI15', name: 'Computational Linguistics', symbol: 'C_L', domain: 'Linguistics', formula: 'NLP, parsing, MT, NLU, NLG', description: 'Language processing algorithms' },
];

export const getLinguisticsOperator = (id: string): ZeqOperator | undefined => {
  return LinguisticsOperators.find(op => op.id === id);
};
