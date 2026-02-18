/**
 * Zeq OS Mathematical Framework - Chemistry Operators
 * Operators for chemical systems and reactions
 */

import { ZeqOperator } from '../types';

export const ChemistryOperators: ZeqOperator[] = [
  { id: 'CH1', name: 'Chemical Equilibrium', symbol: 'K_eq', domain: 'Chemistry', formula: 'K = [products]/[reactants], ΔG = -RT ln K', description: 'Thermodynamic equilibrium constant' },
  { id: 'CH2', name: 'Reaction Kinetics', symbol: 'R_K', domain: 'Chemistry', formula: 'rate = k[A]^m[B]^n, k = Ae^(-Ea/RT)', description: 'Arrhenius rate law' },
  { id: 'CH3', name: 'Gibbs Free Energy', symbol: 'ΔG', domain: 'Chemistry', formula: 'ΔG = ΔH - TΔS', description: 'Spontaneity of reactions' },
  { id: 'CH4', name: 'Electrochemistry', symbol: 'E_C', domain: 'Chemistry', formula: 'E = E° - (RT/nF)ln Q', description: 'Nernst equation for cell potential' },
  { id: 'CH5', name: 'Molecular Orbital', symbol: 'M_O', domain: 'Chemistry', formula: 'ψ = Σ cᵢφᵢ, LCAO-MO theory', description: 'Molecular orbital construction' },
  { id: 'CH6', name: 'Acid-Base', symbol: 'A_B', domain: 'Chemistry', formula: 'pH = -log[H⁺], Ka = [H⁺][A⁻]/[HA]', description: 'Proton transfer equilibria' },
  { id: 'CH7', name: 'Coordination Chemistry', symbol: 'C_C', domain: 'Chemistry', formula: 'Crystal field theory, ligand field splitting', description: 'Metal-ligand interactions' },
  { id: 'CH8', name: 'Thermochemistry', symbol: 'T_C', domain: 'Chemistry', formula: 'ΔH_rxn = Σ ΔH_f(products) - Σ ΔH_f(reactants)', description: 'Heat of reaction calculations' },
  { id: 'CH9', name: 'Quantum Chemistry', symbol: 'Q_C', domain: 'Chemistry', formula: 'Ĥψ = Eψ, variational principle', description: 'Electronic structure calculations' },
  { id: 'CH10', name: 'Spectroscopy', symbol: 'S_P', domain: 'Chemistry', formula: 'ΔE = hν, Beer-Lambert A = εlc', description: 'Molecular energy level transitions' },
  { id: 'CH11', name: 'Polymer Chemistry', symbol: 'P_C', domain: 'Chemistry', formula: 'DP = [M]₀/[I]₀, M̄n, M̄w, PDI', description: 'Polymerization kinetics and MW' },
  { id: 'CH12', name: 'Surface Chemistry', symbol: 'S_C', domain: 'Chemistry', formula: 'θ = KP/(1+KP), Langmuir isotherm', description: 'Adsorption equilibria' },
  { id: 'CH13', name: 'Photochemistry', symbol: 'P_H', domain: 'Chemistry', formula: 'φ = molecules reacted / photons absorbed', description: 'Light-induced reactions' },
  { id: 'CH14', name: 'Nuclear Chemistry', symbol: 'N_C', domain: 'Chemistry', formula: 'N(t) = N₀e^(-λt), t½ = ln2/λ', description: 'Radioactive decay kinetics' },
  { id: 'CH15', name: 'Organic Mechanisms', symbol: 'O_M', domain: 'Chemistry', formula: 'SN1, SN2, E1, E2, additions, eliminations', description: 'Reaction pathway analysis' },
];

export const getChemistryOperator = (id: string): ZeqOperator | undefined => {
  return ChemistryOperators.find(op => op.id === id);
};
