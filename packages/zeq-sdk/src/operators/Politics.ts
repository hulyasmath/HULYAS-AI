/**
 * Zeq OS Mathematical Framework - Politics Operators
 * Operators for political science and governance analysis
 */

import { ZeqOperator } from '../types';

export const PoliticsOperators: ZeqOperator[] = [
  { id: 'PO1', name: 'Voting Systems', symbol: 'V_S', domain: 'Politics', formula: 'Plurality, ranked-choice, proportional', description: 'Electoral system analysis' },
  { id: 'PO2', name: 'Power Analysis', symbol: 'P_A', domain: 'Politics', formula: 'Power = f(resources, legitimacy, network)', description: 'Political power distribution' },
  { id: 'PO3', name: 'Regime Types', symbol: 'R_T', domain: 'Politics', formula: 'Democracy ↔ Autocracy spectrum', description: 'Government classification' },
  { id: 'PO4', name: 'Political Spectrum', symbol: 'P_S', domain: 'Politics', formula: 'Left-Right, Authoritarian-Libertarian axes', description: 'Ideological positioning' },
  { id: 'PO5', name: 'Coalition Formation', symbol: 'C_F', domain: 'Politics', formula: 'Minimal winning coalition, pivotal voter', description: 'Alliance building theory' },
  { id: 'PO6', name: 'Public Choice', symbol: 'P_C', domain: 'Politics', formula: 'Rational actor model, rent-seeking', description: 'Economic analysis of politics' },
  { id: 'PO7', name: 'International Relations', symbol: 'I_R', domain: 'Politics', formula: 'Realism, liberalism, constructivism', description: 'IR theory paradigms' },
  { id: 'PO8', name: 'Policy Analysis', symbol: 'P_An', domain: 'Politics', formula: 'Problem → Options → Implementation → Evaluation', description: 'Policy cycle model' },
  { id: 'PO9', name: 'Federalism', symbol: 'F_D', domain: 'Politics', formula: 'Power division: central ↔ regional', description: 'Multi-level governance' },
  { id: 'PO10', name: 'Political Economy', symbol: 'P_E', domain: 'Politics', formula: 'State-market relations, redistribution', description: 'Economics-politics intersection' },
  { id: 'PO11', name: 'Social Movements', symbol: 'S_M', domain: 'Politics', formula: 'Mobilization = grievances + resources + opportunity', description: 'Collective action theory' },
  { id: 'PO12', name: 'Media Politics', symbol: 'M_P', domain: 'Politics', formula: 'Agenda setting, framing, priming', description: 'Media influence on politics' },
  { id: 'PO13', name: 'Political Participation', symbol: 'P_P', domain: 'Politics', formula: 'Turnout, engagement, civic activity', description: 'Citizen involvement patterns' },
  { id: 'PO14', name: 'Comparative Politics', symbol: 'C_P', domain: 'Politics', formula: 'Cross-national institutional analysis', description: 'Comparing political systems' },
  { id: 'PO15', name: 'Democratization', symbol: 'D_M', domain: 'Politics', formula: 'Transition → consolidation → quality', description: 'Democratic regime change' },
];

export const getPoliticsOperator = (id: string): ZeqOperator | undefined => {
  return PoliticsOperators.find(op => op.id === id);
};
