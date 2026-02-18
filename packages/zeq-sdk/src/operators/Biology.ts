/**
 * Zeq OS Mathematical Framework - Biology Operators
 * Operators for biological systems and life sciences
 */

import { ZeqOperator } from '../types';

export const BiologyOperators: ZeqOperator[] = [
  { id: 'BIO1', name: 'Natural Selection', symbol: 'N_S', domain: 'Biology', formula: 'Δp = p(1-p)s/w̄', description: 'Change in allele frequency under selection' },
  { id: 'BIO2', name: 'Genetic Drift', symbol: 'G_D', domain: 'Biology', formula: 'Var(p) = p(1-p)/2N', description: 'Random allele frequency changes' },
  { id: 'BIO3', name: 'Michaelis-Menten', symbol: 'M_M', domain: 'Biology', formula: 'v = Vmax[S]/(Km + [S])', description: 'Enzyme kinetics rate equation' },
  { id: 'BIO4', name: 'Lotka-Volterra', symbol: 'L_V', domain: 'Biology', formula: 'dx/dt = αx - βxy, dy/dt = δxy - γy', description: 'Predator-prey population dynamics' },
  { id: 'BIO5', name: 'Hardy-Weinberg', symbol: 'H_W', domain: 'Biology', formula: 'p² + 2pq + q² = 1', description: 'Genetic equilibrium frequencies' },
  { id: 'BIO6', name: 'Logistic Growth', symbol: 'L_G', domain: 'Biology', formula: 'dN/dt = rN(1 - N/K)', description: 'Population growth with carrying capacity' },
  { id: 'BIO7', name: 'Hodgkin-Huxley', symbol: 'H_H', domain: 'Biology', formula: 'C dV/dt = -Σ gᵢ(V-Eᵢ) + I', description: 'Action potential propagation model' },
  { id: 'BIO8', name: 'Central Dogma', symbol: 'C_D', domain: 'Biology', formula: 'DNA → RNA → Protein', description: 'Information flow in molecular biology' },
  { id: 'BIO9', name: 'Phylogenetic Analysis', symbol: 'P_A', domain: 'Biology', formula: 'Tree(species) = argmin_T Σ mutations(T)', description: 'Evolutionary tree reconstruction' },
  { id: 'BIO10', name: 'Metabolic Flux', symbol: 'M_F', domain: 'Biology', formula: 'S·v = 0 at steady state', description: 'Stoichiometric flux balance analysis' },
  { id: 'BIO11', name: 'Gene Regulation', symbol: 'G_R', domain: 'Biology', formula: 'd[P]/dt = α·Hill([TF]) - β[P]', description: 'Transcriptional regulation dynamics' },
  { id: 'BIO12', name: 'Ecological Niche', symbol: 'E_N', domain: 'Biology', formula: 'N(species) = f(resources, competition, environment)', description: 'Species ecological role modeling' },
  { id: 'BIO13', name: 'Protein Folding', symbol: 'P_F', domain: 'Biology', formula: 'ΔG = ΔH - TΔS, native = argmin_conf G', description: 'Free energy minimization in folding' },
  { id: 'BIO14', name: 'Immune Response', symbol: 'I_R', domain: 'Biology', formula: 'dA/dt = r·A·P/(K+P) - d·A', description: 'Adaptive immune cell dynamics' },
  { id: 'BIO15', name: 'Cell Cycle', symbol: 'C_C', domain: 'Biology', formula: 'G1 → S → G2 → M, checkpoints', description: 'Cell division regulation model' },
];

export const getBiologyOperator = (id: string): ZeqOperator | undefined => {
  return BiologyOperators.find(op => op.id === id);
};
