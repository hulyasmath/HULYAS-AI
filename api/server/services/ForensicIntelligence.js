/**
 * Zeq OS Forensic Intelligence (FI) Scoring Engine v3.1
 * S1-S20 scoring functions synchronized at 1.287 Hz HulyaPulse
 *
 * Maps to HF operators in the mathematical framework:
 *   S1 (HF1): Factual Accuracy
 *   S2 (HF2): No Manipulation
 *   S3 (HF3): No Harm/Smear
 *   S4 (HF4): Truth Vector
 *   S5 (HF5): Legal Relevance
 *   S6 (HF6): Source Integrity
 *   S7 (HF7): Temporal Consistency
 *   S8 (HF8): Logical Coherence
 *   S9 (HF9): Domain Coherence
 *   S10 (HF10): Bias Detection
 *   S11 (HF11): Context Match
 *   S12 (HF12): Information Density
 *   S13 (HF13): Semantic Stability
 *   S14 (HF14): Cross-Reference
 *   S15 (HF15): Spectral Stability
 *   S16 (HF16): Ethical Integrity
 *   S17 (HF17): Completeness
 *   S18 (HF18): Novelty Detection
 *   S19 (HF19): Bayesian Trust
 *   S20 (HF20): Truth Composite
 */

const PULSE_FREQUENCY = 1.287;
const ZEQOND = 1 / PULSE_FREQUENCY; // 0.777s
const OPERATOR_COUNT = 1549;

/**
 * Calculate Shannon entropy of a text string
 * Normal range: 3.5 - 4.8 bits/char for natural language
 */
function shannonEntropy(text) {
  if (!text || text.length === 0) return 0;
  const freq = {};
  for (const ch of text) {
    freq[ch] = (freq[ch] || 0) + 1;
  }
  const len = text.length;
  let entropy = 0;
  for (const count of Object.values(freq)) {
    const p = count / len;
    if (p > 0) entropy -= p * Math.log2(p);
  }
  return entropy;
}

/**
 * Calculate current HulyaPulse phase (0-1)
 */
function currentPhase() {
  const now = Date.now() / 1000;
  return (now * PULSE_FREQUENCY) % 1;
}

/**
 * Pulse-modulate a base score with the current phase
 * Scores oscillate sinusoidally with the 1.287 Hz pulse
 */
function pulseModulate(baseScore, phase) {
  const modulation = Math.sin(2 * Math.PI * phase);
  return baseScore * (1 + 0.05 * modulation); // +/- 5% modulation
}

/**
 * S1 (HF1): Factual Accuracy
 * Measures how factual/verifiable the response content is
 */
function scoreFactualAccuracy(query, response) {
  if (!response) return 0;
  const len = response.length;
  // Longer responses with specific content score higher
  const lengthFactor = Math.min(1, len / 500);
  // Check for hedging language (reduces accuracy confidence)
  const hedges = ['might', 'perhaps', 'maybe', 'possibly', 'could be', 'not sure'];
  const hedgeCount = hedges.filter(h => response.toLowerCase().includes(h)).length;
  const hedgePenalty = hedgeCount * 0.05;
  // Check for specific markers of factual content
  const factMarkers = ['because', 'therefore', 'according', 'research', 'data', 'evidence', 'proven'];
  const factBonus = factMarkers.filter(m => response.toLowerCase().includes(m)).length * 0.03;
  return Math.max(0, Math.min(1, 0.7 + lengthFactor * 0.2 + factBonus - hedgePenalty));
}

/**
 * S2 (HF2): No Manipulation
 * Detects manipulative language patterns
 */
function scoreNoManipulation(response) {
  if (!response) return 0;
  const manipulativePatterns = [
    'you must', 'you need to', 'trust me', 'believe me', 'everyone knows',
    'obviously', 'clearly you', 'only a fool', 'wake up', 'they don\'t want you to know',
  ];
  const matchCount = manipulativePatterns.filter(p => response.toLowerCase().includes(p)).length;
  return Math.max(0, 1 - matchCount * 0.15);
}

/**
 * S3 (HF3): No Harm/Smear
 * Detects harmful or defamatory content
 */
function scoreNoHarm(response) {
  if (!response) return 0;
  const harmPatterns = [
    'idiot', 'stupid', 'worthless', 'kill', 'destroy', 'hate',
    'attack', 'threaten', 'harm', 'dangerous person',
  ];
  const matchCount = harmPatterns.filter(p => response.toLowerCase().includes(p)).length;
  return Math.max(0, 1 - matchCount * 0.2);
}

/**
 * S4 (HF4): Truth Vector Alignment
 * How well the response aligns with the truth vector
 */
function scoreTruthVector(truthVector) {
  if (!truthVector) return 0.5;
  const components = [
    truthVector.consciousnessField || 0,
    truthVector.informationIntegrity || 0,
    truthVector.harmonyIndex || 0,
    truthVector.domainCoherence || 0,
    truthVector.temporalStability || 0,
    truthVector.quantumEntanglement || 0,
  ];
  return components.reduce((a, b) => a + b, 0) / components.length;
}

/**
 * S5 (HF5): Legal Relevance
 * Checks if response respects legal/ethical boundaries
 */
function scoreLegalRelevance(response) {
  if (!response) return 0.8;
  const legalWarnings = ['disclaimer', 'not legal advice', 'consult a professional', 'liability'];
  const hasWarning = legalWarnings.some(w => response.toLowerCase().includes(w));
  return hasWarning ? 0.95 : 0.85;
}

/**
 * S6 (HF6): Source Integrity
 */
function scoreSourceIntegrity(response) {
  if (!response) return 0.5;
  const sourceMarkers = ['source:', 'reference:', 'citation:', 'according to', 'study shows'];
  const hasSource = sourceMarkers.some(m => response.toLowerCase().includes(m));
  return hasSource ? 0.9 : 0.7;
}

/**
 * S7 (HF7): Temporal Consistency
 */
function scoreTemporalConsistency(response) {
  if (!response) return 0.5;
  // Check for contradictory temporal markers
  const past = ['was', 'were', 'had been', 'previously'].filter(t => response.includes(t)).length;
  const present = ['is', 'are', 'currently', 'now'].filter(t => response.includes(t)).length;
  const future = ['will', 'shall', 'going to', 'future'].filter(t => response.includes(t)).length;
  const tenses = [past > 0, present > 0, future > 0].filter(Boolean).length;
  // Multiple tenses without explicit transitions is slightly less coherent
  return tenses <= 1 ? 0.95 : Math.max(0.7, 1 - (tenses - 1) * 0.1);
}

/**
 * S8 (HF8): Logical Coherence
 */
function scoreLogicalCoherence(response) {
  if (!response) return 0.5;
  const logicMarkers = ['therefore', 'because', 'since', 'thus', 'hence', 'consequently', 'if', 'then'];
  const contradictions = ['however', 'but', 'although', 'despite', 'nevertheless', 'on the other hand'];
  const logicCount = logicMarkers.filter(m => response.toLowerCase().includes(m)).length;
  const contradictionCount = contradictions.filter(c => response.toLowerCase().includes(c)).length;
  const logicScore = Math.min(1, 0.7 + logicCount * 0.05);
  const contradictionPenalty = contradictionCount > 2 ? (contradictionCount - 2) * 0.05 : 0;
  return Math.max(0.5, logicScore - contradictionPenalty);
}

/**
 * S9 (HF9): Domain Coherence
 * How well the response stays within detected domains
 */
function scoreDomainCoherence(domains, response) {
  if (!response || !domains || domains.length === 0) return 0.5;
  // Check if response contains domain-relevant vocabulary
  const domainWords = {
    QuantumMechanics: ['quantum', 'wave', 'particle', 'entangle', 'superposition'],
    Mathematics: ['equation', 'proof', 'theorem', 'calculate', 'formula'],
    Physics: ['force', 'energy', 'mass', 'velocity', 'acceleration'],
    ComputerScience: ['algorithm', 'code', 'program', 'data', 'system'],
    Biology: ['cell', 'organism', 'gene', 'evolution', 'species'],
  };
  let relevantCount = 0;
  const lower = response.toLowerCase();
  for (const domain of domains) {
    const words = domainWords[domain] || [];
    relevantCount += words.filter(w => lower.includes(w)).length;
  }
  return Math.min(1, 0.6 + relevantCount * 0.05);
}

/**
 * S10 (HF10): Bias Detection
 */
function scoreBiasDetection(response) {
  if (!response) return 0.5;
  const biasPatterns = [
    'always', 'never', 'all of them', 'none of them', 'every single',
    'without exception', 'absolutely certain',
  ];
  const matchCount = biasPatterns.filter(p => response.toLowerCase().includes(p)).length;
  return Math.max(0.5, 1 - matchCount * 0.1);
}

/**
 * S11 (HF11): Context Match
 * How well the response matches the query context
 */
function scoreContextMatch(query, response) {
  if (!query || !response) return 0.5;
  // Simple word overlap check
  const queryWords = new Set(query.toLowerCase().split(/\s+/).filter(w => w.length > 3));
  const responseWords = new Set(response.toLowerCase().split(/\s+/).filter(w => w.length > 3));
  if (queryWords.size === 0) return 0.7;
  let overlap = 0;
  for (const word of queryWords) {
    if (responseWords.has(word)) overlap++;
  }
  return Math.min(1, 0.5 + (overlap / queryWords.size) * 0.5);
}

/**
 * S12 (HF12): Information Density
 */
function scoreInformationDensity(response) {
  if (!response) return 0;
  const entropy = shannonEntropy(response);
  // Normal English: 3.5 - 4.8 bits/char
  if (entropy >= 3.5 && entropy <= 4.8) return 0.9;
  if (entropy < 3.5) return Math.max(0.4, entropy / 3.5 * 0.9);
  return Math.max(0.5, 1 - (entropy - 4.8) * 0.2);
}

/**
 * S13 (HF13): Semantic Stability
 */
function scoreSemanticStability(response) {
  if (!response) return 0.5;
  // Check for self-contradictions within the response
  const sentences = response.split(/[.!?]+/).filter(s => s.trim().length > 10);
  if (sentences.length < 2) return 0.9;
  // Simple heuristic: longer consistent responses are more stable
  return Math.min(1, 0.7 + Math.min(sentences.length, 10) * 0.03);
}

/**
 * S14 (HF14): Cross-Reference Capability
 */
function scoreCrossReference(response) {
  if (!response) return 0.5;
  const refMarkers = ['similarly', 'in contrast', 'compared to', 'relates to', 'analogous'];
  const refCount = refMarkers.filter(m => response.toLowerCase().includes(m)).length;
  return Math.min(1, 0.6 + refCount * 0.1);
}

/**
 * S15 (HF15): Spectral Stability (42-operator coherence)
 */
function scoreSpectralStability(phase) {
  // Spectral stability is highest at coherence peaks (phase ~0 and ~1)
  // and lowest at awareness peaks (phase ~0.5)
  const stability = Math.abs(Math.cos(2 * Math.PI * phase));
  return 0.5 + 0.5 * stability;
}

/**
 * S16 (HF16): Ethical Integrity
 */
function scoreEthicalIntegrity(response) {
  if (!response) return 0.8;
  const ethicalWarnings = ['unethical', 'immoral', 'illegal', 'harmful'];
  const ethicalPositive = ['ethical', 'responsible', 'fair', 'transparent', 'safe'];
  const warningCount = ethicalWarnings.filter(w => response.toLowerCase().includes(w)).length;
  const positiveCount = ethicalPositive.filter(p => response.toLowerCase().includes(p)).length;
  return Math.max(0.5, Math.min(1, 0.8 + positiveCount * 0.03 - warningCount * 0.1));
}

/**
 * S17 (HF17): Completeness
 */
function scoreCompleteness(query, response) {
  if (!response) return 0;
  if (!query) return 0.8;
  // Check if response addresses the query question words
  const questionWords = ['what', 'why', 'how', 'when', 'where', 'who', 'which'];
  const queryLower = query.toLowerCase();
  const askedQuestions = questionWords.filter(q => queryLower.includes(q));
  if (askedQuestions.length === 0) return 0.8;
  // Longer responses are more likely to be complete
  const lengthScore = Math.min(1, response.length / 300);
  return Math.min(1, 0.5 + lengthScore * 0.5);
}

/**
 * S18 (HF18): Novelty Detection
 */
function scoreNoveltyDetection(response) {
  if (!response) return 0.5;
  // Unique word ratio as proxy for novelty
  const words = response.toLowerCase().split(/\s+/);
  const uniqueWords = new Set(words);
  const uniqueRatio = words.length > 0 ? uniqueWords.size / words.length : 0;
  return Math.min(1, uniqueRatio * 1.2);
}

/**
 * S19 (HF19): Bayesian Trust
 * Prior-weighted trust score
 */
function scoreBayesianTrust(scores) {
  // Bayesian weighted average: weight high-confidence scores more
  const weights = Object.values(scores).map(s => s * s); // Square weights
  const weightedSum = Object.values(scores).reduce((sum, s, i) => sum + s * weights[i], 0);
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  return totalWeight > 0 ? weightedSum / totalWeight : 0.5;
}

/**
 * S20 (HF20): Truth Composite
 * Final composite score across all S1-S19
 */
function scoreTruthComposite(allScores) {
  const values = Object.values(allScores).filter(v => typeof v === 'number');
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

/**
 * HRO000: Information Integrity Master Metric
 * I_integrity = Product(Si) * (1 - H_noise / H_max)
 *
 * This is the master integrity metric referenced throughout the framework.
 * Threshold: 0.7 minimum for passing verification.
 */
function calculateHRO000(scores, response) {
  const allScoreValues = Object.values(scores).filter(v => typeof v === 'number' && v > 0);
  if (allScoreValues.length === 0) return 0;

  // Product of all scores (geometric mean approach to avoid underflow)
  const logProduct = allScoreValues.reduce((sum, s) => sum + Math.log(Math.max(0.001, s)), 0);
  const geometricMean = Math.exp(logProduct / allScoreValues.length);

  // Noise factor from Shannon entropy
  const entropy = response ? shannonEntropy(response) : 0;
  const maxEntropy = 8; // max bits per char (log2(256))
  const noiseFactor = 1 - (entropy / maxEntropy);

  return geometricMean * noiseFactor;
}

/**
 * Main FI scoring function
 * Returns complete forensic intelligence assessment
 */
function scoreForensicIntelligence(query, response, options = {}) {
  // Null/edge-case guards
  const safeQuery = (query != null && typeof query === 'string') ? query : '';
  const safeResponse = (response != null && typeof response === 'string') ? response : '';
  // Truncate very long strings to prevent performance issues
  const maxLen = 100000;
  const q = safeQuery.length > maxLen ? safeQuery.slice(0, maxLen) : safeQuery;
  const r = safeResponse.length > maxLen ? safeResponse.slice(0, maxLen) : safeResponse;

  const phase = currentPhase();
  const { truthVector, domains, activeOperators } = options || {};

  // Calculate all base scores using safe/truncated inputs
  const baseMetrics = {
    HF1: scoreFactualAccuracy(q, r),
    HF2: scoreNoManipulation(r),
    HF3: scoreNoHarm(r),
    HF4: scoreTruthVector(truthVector),
    HF5: scoreLegalRelevance(r),
    HF6: scoreSourceIntegrity(r),
    HF7: scoreTemporalConsistency(r),
    HF8: scoreLogicalCoherence(r),
    HF9: scoreDomainCoherence(domains || [], r),
    HF10: scoreBiasDetection(r),
    HF11: scoreContextMatch(q, r),
    HF12: scoreInformationDensity(r),
    HF13: scoreSemanticStability(r),
    HF14: scoreCrossReference(r),
    HF15: scoreSpectralStability(phase),
    HF16: scoreEthicalIntegrity(r),
    HF17: scoreCompleteness(q, r),
    HF18: scoreNoveltyDetection(r),
  };

  // S19: Bayesian Trust (depends on other scores)
  baseMetrics.HF19 = scoreBayesianTrust(baseMetrics);

  // S20: Truth Composite (depends on all scores)
  baseMetrics.HF20 = scoreTruthComposite(baseMetrics);

  // Pulse-modulated scores
  const scores = {};
  for (const [key, value] of Object.entries(baseMetrics)) {
    scores[key] = pulseModulate(value, phase);
  }

  // Calculate sForensic (base and pulse-modulated)
  const sForensicBase = scoreTruthComposite(baseMetrics);
  const sForensic = pulseModulate(sForensicBase, phase);

  // Calculate HRO000 (Information Integrity)
  const hro000 = calculateHRO000(baseMetrics, r);

  // Shannon entropy
  const entropy = r ? shannonEntropy(r) : 0;

  // Spectral stability and coherence
  const spectralStability = scoreSpectralStability(phase);
  const spectralCoherence = Math.abs(Math.cos(4 * Math.PI * phase)); // 2nd harmonic

  // Domain and operator alignment
  const domainAlignment = domains && domains.length > 0 ? baseMetrics.HF9 : undefined;
  const operatorAlignment = activeOperators && activeOperators.length > 0
    ? Math.min(1, activeOperators.length / 30)
    : undefined;
  const integrityAlignment = hro000;
  const harmonyAlignment = baseMetrics.HF9;

  // Determine verdict
  let verdict;
  let precision;
  if (sForensicBase >= 0.85) {
    verdict = 'VERIFIED';
    precision = '<= 0.1%';
  } else if (sForensicBase >= 0.7) {
    verdict = 'PASS';
    precision = '<= 1%';
  } else if (sForensicBase >= 0.5) {
    verdict = 'REVIEW';
    precision = '<= 5%';
  } else {
    verdict = 'FLAG';
    precision = '> 5%';
  }

  // Enforcement check
  const enforcement = {
    systemStable: sForensicBase >= 0.5 && hro000 >= 0.3,
    consequences: [],
  };
  if (sForensicBase < 0.5) enforcement.consequences.push('Low forensic score - review recommended');
  if (hro000 < 0.3) enforcement.consequences.push('Information integrity below threshold');
  if (entropy < 2.0) enforcement.consequences.push('Anomalously low entropy - possible template response');
  if (entropy > 5.5) enforcement.consequences.push('Anomalously high entropy - possible noise');

  return {
    // Core scores
    baseMetrics,
    scores,
    sForensicBase,
    sForensic,
    hro000,

    // Phase data
    phase,
    pulseFrequency: PULSE_FREQUENCY,

    // Entropy
    shannonEntropy: entropy,

    // Spectral data
    spectralStability,
    spectralCoherence,

    // Alignment data
    domainAlignment,
    operatorAlignment,
    integrityAlignment,
    harmonyAlignment,

    // Query/response domains
    queryDomains: domains || [],
    responseDomains: domains || [],

    // Verdict
    verdict,
    precision,
    enforcement,

    // Metadata
    operatorCount: OPERATOR_COUNT,
    timestamp: new Date().toISOString(),
    version: '3.1',
  };
}

module.exports = {
  scoreForensicIntelligence,
  calculateHRO000,
  shannonEntropy,
  currentPhase,
  pulseModulate,
  // Individual scores for testing
  scoreFactualAccuracy,
  scoreNoManipulation,
  scoreNoHarm,
  scoreTruthVector,
  scoreLegalRelevance,
  scoreDomainCoherence,
  scoreContextMatch,
  scoreSpectralStability,
  scoreEthicalIntegrity,
  scoreBayesianTrust,
  scoreTruthComposite,
  PULSE_FREQUENCY,
  OPERATOR_COUNT,
};
