/**
 * Zeq OS Mathematical Framework - Core Operators
 * Foundation operators that apply across all domains
 */

import { ZeqOperator } from '../types';

export const CoreOperators: ZeqOperator[] = [
  {
    id: 'KO42',
    name: 'Knowledge Orchestration',
    symbol: 'Ω_K',
    domain: 'Core',
    formula: 'Ω_K(x) = ∫∫∫ K(x,y,z) · H(t) dxdydz',
    description: 'Orchestrates knowledge integration across all domains with temporal harmony',
    associatedOperators: ['TI1', 'CH2', 'SM3'],
  },
  {
    id: 'TI1',
    name: 'Truth Integration',
    symbol: 'Τ_I',
    domain: 'Core',
    formula: 'Τ_I(p) = Σᵢ wᵢ · T(pᵢ) · C(pᵢ)',
    description: 'Integrates truth values with confidence weights across propositions',
    associatedOperators: ['KO42', 'II4'],
  },
  {
    id: 'CH2',
    name: 'Cross-domain Harmony',
    symbol: 'Χ_H',
    domain: 'Core',
    formula: 'Χ_H(D₁,D₂) = cos(θ) · ||D₁|| · ||D₂|| / (||D₁|| + ||D₂||)',
    description: 'Calculates harmony between different knowledge domains',
    associatedOperators: ['KO42', 'DT5'],
  },
  {
    id: 'SM3',
    name: 'Semantic Mapping',
    symbol: 'Σ_M',
    domain: 'Core',
    formula: 'Σ_M(s) = T(embed(s)) · W_semantic',
    description: 'Maps semantic content to mathematical vector space',
    associatedOperators: ['KO42', 'LT6'],
  },
  {
    id: 'II4',
    name: 'Information Integrity',
    symbol: 'Ι_I',
    domain: 'Core',
    formula: 'Ι_I(I) = 1 - H(I)/log₂(n)',
    description: 'Measures information integrity using entropy normalization',
    associatedOperators: ['TI1', 'QC7'],
  },
  {
    id: 'DT5',
    name: 'Domain Transfer',
    symbol: 'Δ_T',
    domain: 'Core',
    formula: 'Δ_T(k,D₁→D₂) = P(D₂) · T(k|D₁) · A(D₁,D₂)',
    description: 'Transfers knowledge between domains with adaptation factor',
    associatedOperators: ['CH2', 'AM8'],
  },
  {
    id: 'LT6',
    name: 'Logical Transform',
    symbol: 'Λ_T',
    domain: 'Core',
    formula: 'Λ_T(p) = ⟨p₁ ∧ p₂ ∧ ... ∧ pₙ⟩ → q',
    description: 'Transforms logical propositions through inference chains',
    associatedOperators: ['SM3', 'CR9'],
  },
  {
    id: 'QC7',
    name: 'Quality Control',
    symbol: 'Θ_Q',
    domain: 'Core',
    formula: 'Θ_Q(r) = Σᵢ (accuracy_i · relevance_i · completeness_i) / n',
    description: 'Evaluates response quality across multiple dimensions',
    associatedOperators: ['II4', 'VF10'],
  },
  {
    id: 'AM8',
    name: 'Adaptive Modulation',
    symbol: 'Α_M',
    domain: 'Core',
    formula: 'Α_M(s,c) = s · (1 + α·∂c/∂t)',
    description: 'Modulates system state based on context change rate',
    associatedOperators: ['DT5', 'TS11'],
  },
  {
    id: 'CR9',
    name: 'Causal Reasoning',
    symbol: 'Ψ_C',
    domain: 'Core',
    formula: 'Ψ_C(A→B) = P(B|do(A)) - P(B|¬do(A))',
    description: 'Evaluates causal relationships using do-calculus',
    associatedOperators: ['LT6', 'PE12'],
  },
  {
    id: 'VF10',
    name: 'Verification Filter',
    symbol: 'Φ_V',
    domain: 'Core',
    formula: 'Φ_V(s) = s if V(s) > τ else ∅',
    description: 'Filters statements that fail verification threshold',
    associatedOperators: ['QC7', 'CI13'],
  },
  {
    id: 'TS11',
    name: 'Temporal Synthesis',
    symbol: 'Τ_S',
    domain: 'Core',
    formula: 'Τ_S(t) = ∫₀ᵗ f(τ) · e^(-λ(t-τ)) dτ',
    description: 'Synthesizes temporal information with decay function',
    associatedOperators: ['AM8', 'HI14'],
  },
  {
    id: 'PE12',
    name: 'Probability Estimation',
    symbol: 'Π_E',
    domain: 'Core',
    formula: 'Π_E(e) = P(e) · L(e|data) / P(data)',
    description: 'Estimates probabilities using Bayesian inference',
    associatedOperators: ['CR9', 'UC15'],
  },
  {
    id: 'CI13',
    name: 'Contextual Integration',
    symbol: 'Κ_I',
    domain: 'Core',
    formula: 'Κ_I(c) = Σⱼ wⱼ · Cⱼ(x) · R(Cⱼ,query)',
    description: 'Integrates contextual information with relevance weighting',
    associatedOperators: ['VF10', 'SA16'],
  },
  {
    id: 'HI14',
    name: 'Hierarchical Integration',
    symbol: 'Η_I',
    domain: 'Core',
    formula: 'Η_I(h) = Σₗ αₗ · Σₙ∈level(l) wₙ · vₙ',
    description: 'Integrates hierarchical knowledge structures',
    associatedOperators: ['TS11', 'RF17'],
  },
  {
    id: 'UC15',
    name: 'Uncertainty Calibration',
    symbol: 'Υ_C',
    domain: 'Core',
    formula: 'Υ_C(p) = p · σ(confidence) / (1 + σ(confidence))',
    description: 'Calibrates predictions based on uncertainty estimates',
    associatedOperators: ['PE12', 'MS1'],
  },
  {
    id: 'SA16',
    name: 'Semantic Alignment',
    symbol: 'Σ_A',
    domain: 'Core',
    formula: 'Σ_A(s₁,s₂) = cos(embed(s₁), embed(s₂)) · IDF(overlap)',
    description: 'Aligns semantic content between statements',
    associatedOperators: ['CI13', 'KO42'],
  },
  {
    id: 'RF17',
    name: 'Recursive Filtering',
    symbol: 'Ρ_F',
    domain: 'Core',
    formula: 'Ρ_F(x,n) = F(Ρ_F(x,n-1)) if n>0 else x',
    description: 'Applies recursive filtering to refine results',
    associatedOperators: ['HI14', 'TI1'],
  },
];

export const getCoreOperator = (id: string): ZeqOperator | undefined => {
  return CoreOperators.find(op => op.id === id);
};

export const getCoreOperatorsBySymbol = (symbol: string): ZeqOperator | undefined => {
  return CoreOperators.find(op => op.symbol === symbol);
};
