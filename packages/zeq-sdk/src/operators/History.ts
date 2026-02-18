/**
 * Zeq OS Mathematical Framework - History Operators
 * Operators for historical analysis and periodization
 */

import { ZeqOperator } from '../types';

export const HistoryOperators: ZeqOperator[] = [
  { id: 'HI1', name: 'Periodization', symbol: 'P_D', domain: 'History', formula: 'Era boundaries, turning points, transitions', description: 'Historical time division' },
  { id: 'HI2', name: 'Causation Analysis', symbol: 'C_A', domain: 'History', formula: 'Event_B = f(Event_A, context, contingency)', description: 'Historical cause and effect' },
  { id: 'HI3', name: 'Source Criticism', symbol: 'S_C', domain: 'History', formula: 'Reliability = f(proximity, bias, corroboration)', description: 'Primary source evaluation' },
  { id: 'HI4', name: 'Comparative History', symbol: 'C_H', domain: 'History', formula: 'Similarities(A,B), Differences(A,B), patterns', description: 'Cross-cultural comparison' },
  { id: 'HI5', name: 'Longue Durée', symbol: 'L_D', domain: 'History', formula: 'Long-term structures, cycles, slow change', description: 'Braudel temporal scales' },
  { id: 'HI6', name: 'Historical Materialism', symbol: 'H_M', domain: 'History', formula: 'Base → Superstructure, class struggle', description: 'Marxist historical analysis' },
  { id: 'HI7', name: 'Annales School', symbol: 'A_S', domain: 'History', formula: 'Total history, mentalities, serial history', description: 'French historiography method' },
  { id: 'HI8', name: 'Counterfactual Analysis', symbol: 'C_F', domain: 'History', formula: 'If not A, then what? Alternative paths', description: 'What-if historical reasoning' },
  { id: 'HI9', name: 'Prosopography', symbol: 'P_S', domain: 'History', formula: 'Collective biography, social patterns', description: 'Group biographical analysis' },
  { id: 'HI10', name: 'Microhistory', symbol: 'M_H', domain: 'History', formula: 'Single case → wider implications', description: 'Small-scale intensive study' },
  { id: 'HI11', name: 'World Systems', symbol: 'W_S', domain: 'History', formula: 'Core-periphery, economic cycles', description: 'Wallerstein global analysis' },
  { id: 'HI12', name: 'Oral History', symbol: 'O_H', domain: 'History', formula: 'Memory, testimony, lived experience', description: 'Interview-based evidence' },
  { id: 'HI13', name: 'Quantitative History', symbol: 'Q_H', domain: 'History', formula: 'Cliometrics, statistical analysis', description: 'Numerical historical methods' },
  { id: 'HI14', name: 'Cultural History', symbol: 'C_Hist', domain: 'History', formula: 'Symbols, representations, practices', description: 'History of meaning and culture' },
  { id: 'HI15', name: 'Postcolonial History', symbol: 'P_C', domain: 'History', formula: 'Subaltern voices, colonial legacy', description: 'Decolonizing historical narrative' },
];

export const getHistoryOperator = (id: string): ZeqOperator | undefined => {
  return HistoryOperators.find(op => op.id === id);
};
