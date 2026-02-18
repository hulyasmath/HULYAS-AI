/**
 * Zeq OS Mathematical Framework - Sociology Operators
 * Operators for social structure and behavior analysis
 */

import { ZeqOperator } from '../types';

export const SociologyOperators: ZeqOperator[] = [
  { id: 'SO1', name: 'Social Stratification', symbol: 'S_S', domain: 'Sociology', formula: 'Class = f(income, education, occupation)', description: 'Social hierarchy analysis' },
  { id: 'SO2', name: 'Network Analysis', symbol: 'N_A', domain: 'Sociology', formula: 'Centrality, clustering, bridging ties', description: 'Social network structure' },
  { id: 'SO3', name: 'Structural Functionalism', symbol: 'S_F', domain: 'Sociology', formula: 'Institution → Social function → Stability', description: 'Parsons systemic theory' },
  { id: 'SO4', name: 'Symbolic Interactionism', symbol: 'S_I', domain: 'Sociology', formula: 'Meaning = social construction through interaction', description: 'Micro-level meaning making' },
  { id: 'SO5', name: 'Conflict Theory', symbol: 'C_T', domain: 'Sociology', formula: 'Society = struggle over scarce resources', description: 'Power and inequality focus' },
  { id: 'SO6', name: 'Social Capital', symbol: 'S_C', domain: 'Sociology', formula: 'Capital = networks + norms + trust', description: 'Bourdieu-Coleman resources' },
  { id: 'SO7', name: 'Institutional Analysis', symbol: 'I_A', domain: 'Sociology', formula: 'Rules, norms, shared beliefs → behavior', description: 'Organizational sociology' },
  { id: 'SO8', name: 'Deviance Theory', symbol: 'D_T', domain: 'Sociology', formula: 'Deviance = rule-breaking + labeling', description: 'Social norm violation' },
  { id: 'SO9', name: 'Socialization', symbol: 'S_Z', domain: 'Sociology', formula: 'Self = f(primary + secondary agents)', description: 'Social learning process' },
  { id: 'SO10', name: 'Demographic Analysis', symbol: 'D_A', domain: 'Sociology', formula: 'Birth rate, death rate, migration, age structure', description: 'Population dynamics' },
  { id: 'SO11', name: 'Urbanization', symbol: 'U_B', domain: 'Sociology', formula: 'Urban transition, gentrification, segregation', description: 'City and spatial sociology' },
  { id: 'SO12', name: 'Collective Behavior', symbol: 'C_B', domain: 'Sociology', formula: 'Crowds, panics, fads, social movements', description: 'Group dynamics theory' },
  { id: 'SO13', name: 'Cultural Sociology', symbol: 'C_S', domain: 'Sociology', formula: 'Symbols, meanings, rituals, discourse', description: 'Culture and meaning systems' },
  { id: 'SO14', name: 'Rational Choice', symbol: 'R_C', domain: 'Sociology', formula: 'Action = maximize utility given constraints', description: 'Micro-foundation theory' },
  { id: 'SO15', name: 'Global Sociology', symbol: 'G_S', domain: 'Sociology', formula: 'Globalization, transnational flows, cosmopolitanism', description: 'World society analysis' },
];

export const getSociologyOperator = (id: string): ZeqOperator | undefined => {
  return SociologyOperators.find(op => op.id === id);
};
