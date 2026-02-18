/**
 * Zeq OS Mathematical Framework - Neuroscience & Cognition Operators
 * Operators for neural processing and cognitive science
 */

import { ZeqOperator } from '../types';

export const NeuroscienceCognitionOperators: ZeqOperator[] = [
  {
    id: 'NM18',
    name: 'Neural Activation',
    symbol: 'Ν_A',
    domain: 'NeuroscienceCognition',
    formula: 'Ν_A(x) = σ(Wx + b) where σ = activation function',
    description: 'Models neural activation patterns',
    associatedOperators: ['NM19', 'NM20'],
  },
  {
    id: 'NM19',
    name: 'Synaptic Plasticity',
    symbol: 'Σ_P',
    domain: 'NeuroscienceCognition',
    formula: 'Σ_P(Δw) = η·pre·post·(1 - w/w_max)',
    description: 'Models synaptic weight changes via Hebbian learning',
    associatedOperators: ['NM18', 'NM21'],
  },
  {
    id: 'NM20',
    name: 'Attention Mechanism',
    symbol: 'Α_Μ',
    domain: 'NeuroscienceCognition',
    formula: 'Α_Μ(Q,K,V) = softmax(QK^T/√d_k)V',
    description: 'Scaled dot-product attention for cognitive focus',
    associatedOperators: ['NM18', 'NM22'],
  },
  {
    id: 'NM21',
    name: 'Memory Consolidation',
    symbol: 'Μ_C',
    domain: 'NeuroscienceCognition',
    formula: 'Μ_C(m,t) = m_0·e^(-t/τ) + m_∞(1-e^(-t/τ))',
    description: 'Models memory transfer from short to long-term',
    associatedOperators: ['NM19', 'NM23'],
  },
  {
    id: 'NM22',
    name: 'Working Memory',
    symbol: 'Ω_M',
    domain: 'NeuroscienceCognition',
    formula: 'Ω_M(x,t) = LSTM(x_t, h_{t-1}, c_{t-1})',
    description: 'Models working memory with gated recurrence',
    associatedOperators: ['NM20', 'NM24'],
  },
  {
    id: 'NM23',
    name: 'Pattern Recognition',
    symbol: 'Π_R',
    domain: 'NeuroscienceCognition',
    formula: 'Π_R(x) = argmax_c P(c|x) = argmax_c softmax(f(x))_c',
    description: 'Cognitive pattern classification',
    associatedOperators: ['NM21', 'NM25'],
  },
  {
    id: 'NM24',
    name: 'Cognitive Load',
    symbol: 'Κ_L',
    domain: 'NeuroscienceCognition',
    formula: 'Κ_L(task) = Σᵢ complexity_i · attention_i / capacity',
    description: 'Measures cognitive resource utilization',
    associatedOperators: ['NM22', 'NM26'],
  },
  {
    id: 'NM25',
    name: 'Semantic Memory',
    symbol: 'Σ_Μ',
    domain: 'NeuroscienceCognition',
    formula: 'Σ_Μ(concept) = Σⱼ w_j · feature_j · context_relevance_j',
    description: 'Retrieves semantic knowledge from memory networks',
    associatedOperators: ['NM23', 'NM27'],
  },
  {
    id: 'NM26',
    name: 'Decision Making',
    symbol: 'Δ_D',
    domain: 'NeuroscienceCognition',
    formula: 'Δ_D(options) = argmax_o Σₐ P(a|o)·U(a,o)',
    description: 'Expected utility maximization for decisions',
    associatedOperators: ['NM24', 'NM28'],
  },
  {
    id: 'NM27',
    name: 'Episodic Memory',
    symbol: 'Ε_Μ',
    domain: 'NeuroscienceCognition',
    formula: 'Ε_Μ(cue) = retrieval(encode(event), cue, context)',
    description: 'Context-dependent episodic memory retrieval',
    associatedOperators: ['NM25', 'NM29'],
  },
  {
    id: 'NM28',
    name: 'Reward Prediction',
    symbol: 'Ρ_R',
    domain: 'NeuroscienceCognition',
    formula: 'Ρ_R(s,a) = r + γ·max_a\' Q(s\',a\')',
    description: 'Temporal difference reward learning',
    associatedOperators: ['NM26', 'NM30'],
  },
  {
    id: 'NM29',
    name: 'Language Processing',
    symbol: 'Λ_P',
    domain: 'NeuroscienceCognition',
    formula: 'Λ_P(text) = Transformer(embed(tokenize(text)))',
    description: 'Neural language understanding and generation',
    associatedOperators: ['NM27', 'NM18'],
  },
  {
    id: 'NM30',
    name: 'Emotional Regulation',
    symbol: 'Ε_R',
    domain: 'NeuroscienceCognition',
    formula: 'Ε_R(e,c) = e · (1 - reappraisal(c)) + baseline',
    description: 'Cognitive reappraisal of emotional states',
    associatedOperators: ['NM28', 'NM19'],
  },
];

export const getNeuroscienceCognitionOperator = (id: string): ZeqOperator | undefined => {
  return NeuroscienceCognitionOperators.find(op => op.id === id);
};
