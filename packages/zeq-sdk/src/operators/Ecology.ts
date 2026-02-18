/**
 * Zeq OS Mathematical Framework - Ecology Operators
 * Operators for ecosystem and environmental analysis
 */

import { ZeqOperator } from '../types';

export const EcologyOperators: ZeqOperator[] = [
  { id: 'ECO1', name: 'Food Web', symbol: 'F_W', domain: 'Ecology', formula: 'Trophic levels, energy transfer (10%)', description: 'Energy flow through ecosystems' },
  { id: 'ECO2', name: 'Biodiversity Index', symbol: 'B_I', domain: 'Ecology', formula: 'Shannon: H = -Σ pᵢ ln(pᵢ)', description: 'Species diversity measure' },
  { id: 'ECO3', name: 'Carrying Capacity', symbol: 'K', domain: 'Ecology', formula: 'K = max sustainable population', description: 'Environmental population limit' },
  { id: 'ECO4', name: 'Succession', symbol: 'S_C', domain: 'Ecology', formula: 'Pioneer → intermediate → climax community', description: 'Ecosystem development stages' },
  { id: 'ECO5', name: 'Nutrient Cycling', symbol: 'N_C', domain: 'Ecology', formula: 'C, N, P cycles, biogeochemistry', description: 'Element movement through systems' },
  { id: 'ECO6', name: 'Species-Area', symbol: 'S_A', domain: 'Ecology', formula: 'S = cA^z, island biogeography', description: 'Biodiversity vs habitat size' },
  { id: 'ECO7', name: 'Niche Theory', symbol: 'N_T', domain: 'Ecology', formula: 'Fundamental vs realized niche', description: 'Species ecological role' },
  { id: 'ECO8', name: 'Competition Models', symbol: 'C_M', domain: 'Ecology', formula: 'Lotka-Volterra competition, α coefficients', description: 'Interspecific competition' },
  { id: 'ECO9', name: 'Metapopulation', symbol: 'M_P', domain: 'Ecology', formula: 'dp/dt = cp(1-p) - ep, colonization-extinction', description: 'Patchy population dynamics' },
  { id: 'ECO10', name: 'Ecosystem Services', symbol: 'E_S', domain: 'Ecology', formula: 'Provisioning, regulating, cultural, supporting', description: 'Nature\'s benefits to humans' },
  { id: 'ECO11', name: 'Climate Change Impact', symbol: 'C_I', domain: 'Ecology', formula: 'Species range shifts, phenology, extinction', description: 'Climate effects on ecosystems' },
  { id: 'ECO12', name: 'Conservation Biology', symbol: 'C_B', domain: 'Ecology', formula: 'MVP, PVA, reserve design', description: 'Species and habitat protection' },
  { id: 'ECO13', name: 'Restoration Ecology', symbol: 'R_E', domain: 'Ecology', formula: 'Degraded → target ecosystem', description: 'Ecosystem recovery methods' },
  { id: 'ECO14', name: 'Landscape Ecology', symbol: 'L_E', domain: 'Ecology', formula: 'Patches, corridors, matrix, fragmentation', description: 'Spatial ecology patterns' },
  { id: 'ECO15', name: 'Invasive Species', symbol: 'I_S', domain: 'Ecology', formula: 'Introduction → establishment → spread → impact', description: 'Non-native species dynamics' },
];

export const getEcologyOperator = (id: string): ZeqOperator | undefined => {
  return EcologyOperators.find(op => op.id === id);
};
