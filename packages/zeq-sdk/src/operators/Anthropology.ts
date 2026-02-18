/**
 * Zeq OS Mathematical Framework - Anthropology Operators
 * Operators for cultural and human study
 */

import { ZeqOperator } from '../types';

export const AnthropologyOperators: ZeqOperator[] = [
  { id: 'AN1', name: 'Ethnography', symbol: 'E_G', domain: 'Anthropology', formula: 'Participant observation → thick description', description: 'Fieldwork methodology' },
  { id: 'AN2', name: 'Cultural Relativism', symbol: 'C_R', domain: 'Anthropology', formula: 'Evaluate culture in its own context', description: 'Non-ethnocentric analysis' },
  { id: 'AN3', name: 'Kinship Analysis', symbol: 'K_A', domain: 'Anthropology', formula: 'Descent, marriage, residence patterns', description: 'Family and social relations' },
  { id: 'AN4', name: 'Structuralism', symbol: 'S_T', domain: 'Anthropology', formula: 'Deep structures, binary oppositions', description: 'Lévi-Strauss analysis' },
  { id: 'AN5', name: 'Symbolic Anthropology', symbol: 'S_A', domain: 'Anthropology', formula: 'Culture = system of symbols and meanings', description: 'Geertz interpretive approach' },
  { id: 'AN6', name: 'Material Culture', symbol: 'M_C', domain: 'Anthropology', formula: 'Objects → social meaning and practice', description: 'Artifact analysis' },
  { id: 'AN7', name: 'Human Evolution', symbol: 'H_E', domain: 'Anthropology', formula: 'Hominid evolution, bipedalism, encephalization', description: 'Biological anthropology' },
  { id: 'AN8', name: 'Linguistic Anthropology', symbol: 'L_A', domain: 'Anthropology', formula: 'Language ↔ culture ↔ thought', description: 'Sapir-Whorf and beyond' },
  { id: 'AN9', name: 'Economic Anthropology', symbol: 'E_A', domain: 'Anthropology', formula: 'Gift economy, reciprocity, redistribution', description: 'Non-market exchange' },
  { id: 'AN10', name: 'Political Anthropology', symbol: 'P_A', domain: 'Anthropology', formula: 'Power, authority, stateless societies', description: 'Politics in small-scale societies' },
  { id: 'AN11', name: 'Medical Anthropology', symbol: 'M_A', domain: 'Anthropology', formula: 'Health, illness, healing across cultures', description: 'Cultural health systems' },
  { id: 'AN12', name: 'Visual Anthropology', symbol: 'V_A', domain: 'Anthropology', formula: 'Film, photography as ethnographic method', description: 'Visual documentation' },
  { id: 'AN13', name: 'Applied Anthropology', symbol: 'A_A', domain: 'Anthropology', formula: 'Theory → practical problem solving', description: 'Policy and development' },
  { id: 'AN14', name: 'Postmodern Anthropology', symbol: 'P_M', domain: 'Anthropology', formula: 'Reflexivity, multiple voices, power', description: 'Critical self-examination' },
  { id: 'AN15', name: 'Archaeology', symbol: 'A_R', domain: 'Anthropology', formula: 'Material remains → past behavior', description: 'Historical reconstruction' },
];

export const getAnthropologyOperator = (id: string): ZeqOperator | undefined => {
  return AnthropologyOperators.find(op => op.id === id);
};
