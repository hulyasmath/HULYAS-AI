/**
 * Zeq OS Mathematical Framework - Standalone Processor
 * Process queries through the 1549+ operator framework without API
 */

import {
  ZeqProcessorOptions,
  ZeqProcessingResult,
  ZeqTruthVector,
  ZeqOperator,
  ZeqAuditStep,
  ZeqDomainDetectionResult,
  ZEQ_PULSE_FREQUENCY,
} from './types';
import {
  getAllOperators,
  getOperatorsByDomain,
  searchOperators,
  getOperatorCount,
  getDomainCount,
} from './operators';

/**
 * Domain keywords for detection
 */
const DOMAIN_KEYWORDS: Record<string, string[]> = {
  QuantumMechanics: ['quantum', 'wave function', 'entanglement', 'superposition', 'qubit', 'photon', 'electron', 'planck', 'uncertainty', 'spin'],
  NeuroscienceCognition: ['brain', 'neuron', 'cognitive', 'memory', 'attention', 'consciousness', 'neural', 'synapse', 'learning', 'thinking'],
  GeneralRelativity: ['spacetime', 'gravity', 'relativity', 'einstein', 'black hole', 'geodesic', 'curvature', 'metric'],
  Mathematics: ['math', 'calculus', 'algebra', 'geometry', 'theorem', 'proof', 'equation', 'function', 'integral', 'derivative'],
  Philosophy: ['philosophy', 'ethics', 'moral', 'epistemology', 'ontology', 'logic', 'truth', 'knowledge', 'existence'],
  Biology: ['biology', 'cell', 'dna', 'evolution', 'organism', 'species', 'gene', 'protein', 'ecology', 'life'],
  Chemistry: ['chemistry', 'molecule', 'atom', 'reaction', 'bond', 'element', 'compound', 'acid', 'base', 'solution'],
  ComputerScience: ['algorithm', 'computer', 'code', 'programming', 'software', 'data structure', 'machine learning', 'ai', 'database'],
  Economics: ['economy', 'market', 'price', 'supply', 'demand', 'inflation', 'gdp', 'finance', 'trade', 'investment'],
  Psychology: ['psychology', 'behavior', 'emotion', 'personality', 'mental', 'therapy', 'stress', 'anxiety', 'cognition'],
  Linguistics: ['language', 'grammar', 'syntax', 'semantics', 'phonology', 'linguistics', 'word', 'speech', 'dialect'],
  Music: ['music', 'melody', 'harmony', 'rhythm', 'chord', 'note', 'scale', 'tempo', 'composition', 'song'],
  Art: ['art', 'painting', 'sculpture', 'design', 'color', 'aesthetic', 'visual', 'creative', 'canvas', 'composition'],
  History: ['history', 'historical', 'ancient', 'medieval', 'century', 'civilization', 'war', 'empire', 'revolution'],
  Politics: ['politics', 'government', 'democracy', 'election', 'policy', 'vote', 'parliament', 'law', 'constitution'],
  Sociology: ['society', 'social', 'community', 'culture', 'class', 'inequality', 'institution', 'norm', 'group'],
  Anthropology: ['anthropology', 'culture', 'ethnography', 'kinship', 'ritual', 'tribe', 'fieldwork', 'human evolution'],
  Geography: ['geography', 'map', 'climate', 'terrain', 'region', 'spatial', 'gis', 'landscape', 'population'],
  Astronomy: ['astronomy', 'star', 'planet', 'galaxy', 'universe', 'cosmos', 'telescope', 'orbit', 'nebula', 'solar'],
  Ecology: ['ecology', 'ecosystem', 'biodiversity', 'habitat', 'conservation', 'environment', 'species', 'food chain'],
  Medicine: ['medicine', 'health', 'disease', 'treatment', 'diagnosis', 'patient', 'drug', 'symptom', 'therapy'],
  Engineering: ['engineering', 'design', 'system', 'mechanical', 'electrical', 'structural', 'circuit', 'build'],
  Law: ['law', 'legal', 'court', 'contract', 'rights', 'justice', 'regulation', 'statute', 'litigation'],
  Education: ['education', 'learning', 'teaching', 'student', 'curriculum', 'school', 'pedagogy', 'assessment'],
  Sports: ['sports', 'athlete', 'training', 'competition', 'fitness', 'exercise', 'game', 'performance'],
};

/**
 * ZeqProcessor - Standalone processor for the mathematical framework
 */
export class ZeqProcessor {
  private options: ZeqProcessorOptions;
  private pulseFrequency: number;
  private startTime: number;

  constructor(options: ZeqProcessorOptions = {}) {
    this.options = {
      logLevel: options.logLevel || 'info',
      pulseFrequency: options.pulseFrequency || ZEQ_PULSE_FREQUENCY,
      enableAuditTrail: options.enableAuditTrail !== false,
    };
    this.pulseFrequency = this.options.pulseFrequency!;
    this.startTime = Date.now();
  }

  /**
   * Process a query through the mathematical framework
   */
  processQuery(query: string): ZeqProcessingResult {
    const startTime = performance.now();
    const auditTrail: ZeqAuditStep[] = [];

    // Step 1: Domain Detection
    const domainResult = this.detectDomains(query);
    if (this.options.enableAuditTrail) {
      auditTrail.push({
        stepNumber: 1,
        stepName: 'Domain Detection',
        timestamp: new Date(),
        details: `Detected domains: ${domainResult.primaryDomain}, sub-domains: ${domainResult.subDomains.join(', ')}`,
      });
    }

    // Step 2: Operator Selection
    const selectedOperators = this.selectOperators(query, domainResult);
    if (this.options.enableAuditTrail) {
      auditTrail.push({
        stepNumber: 2,
        stepName: 'Operator Selection',
        timestamp: new Date(),
        details: `Selected ${selectedOperators.length} operators: ${selectedOperators.map(o => o.id).join(', ')}`,
      });
    }

    // Step 3: Calculate Pulse Cycle
    const pulseCycle = this.calculatePulseCycle();
    const phase = this.calculatePhase();

    // Step 4: Calculate Truth Vector
    const truthVector = this.calculateTruthVector(query, selectedOperators, domainResult);
    if (this.options.enableAuditTrail) {
      auditTrail.push({
        stepNumber: 3,
        stepName: 'Truth Vector Calculation',
        timestamp: new Date(),
        details: `Information integrity: ${truthVector.informationIntegrity.toFixed(4)}`,
      });
    }

    // Step 5: Calculate Cross-Domain Harmony
    const crossDomainHarmony = this.calculateCrossDomainHarmony(domainResult.subDomains);

    // Step 6: Calculate Master Sum
    const masterSum = this.calculateMasterSum(truthVector, crossDomainHarmony, selectedOperators.length);

    // Step 7: Generate Mathematical Prompt
    const mathematicalPrompt = this.generateMathematicalPrompt(
      query,
      selectedOperators,
      domainResult,
      truthVector,
      masterSum
    );
    if (this.options.enableAuditTrail) {
      auditTrail.push({
        stepNumber: 4,
        stepName: 'Mathematical Prompt Generation',
        timestamp: new Date(),
        details: `Generated prompt with ${mathematicalPrompt.length} characters`,
      });
    }

    const processingTimeMs = performance.now() - startTime;

    return {
      originalQuery: query,
      mathematicalPrompt,
      activeOperators: selectedOperators.map(op => op.id),
      domains: [domainResult.primaryDomain, ...domainResult.subDomains],
      truthVector,
      informationIntegrity: truthVector.informationIntegrity,
      crossDomainHarmony,
      masterSum,
      masterEquation: this.generateMasterEquation(masterSum, selectedOperators.length),
      pulseCycle,
      phase,
      processingTimeMs,
      operatorCount: selectedOperators.length,
      auditTrail,
    };
  }

  /**
   * Detect domains from query text
   */
  detectDomains(query: string): ZeqDomainDetectionResult {
    const lowerQuery = query.toLowerCase();
    const domainScores: Record<string, number> = {};
    const matchedKeywords: string[] = [];

    // Score each domain based on keyword matches
    for (const [domain, keywords] of Object.entries(DOMAIN_KEYWORDS)) {
      let score = 0;
      for (const keyword of keywords) {
        if (lowerQuery.includes(keyword.toLowerCase())) {
          score += 1;
          matchedKeywords.push(keyword);
        }
      }
      if (score > 0) {
        domainScores[domain] = score;
      }
    }

    // Sort domains by score
    const sortedDomains = Object.entries(domainScores)
      .sort(([, a], [, b]) => b - a)
      .map(([domain]) => domain);

    // Primary domain is highest scoring, or 'General' if none match
    const primaryDomain = sortedDomains[0] || 'General';
    const subDomains = sortedDomains.slice(1, 4); // Top 3 sub-domains

    // Calculate confidence
    const totalScore = Object.values(domainScores).reduce((a, b) => a + b, 0);
    const confidence = totalScore > 0 ? Math.min(1, totalScore / 10) : 0.1;

    return {
      primaryDomain,
      subDomains,
      confidence,
      keywords: matchedKeywords,
    };
  }

  /**
   * Select relevant operators based on query and domains
   */
  selectOperators(query: string, domainResult: ZeqDomainDetectionResult): ZeqOperator[] {
    const selectedOperators: ZeqOperator[] = [];
    const seenIds = new Set<string>();

    // Always include core operators (first 5)
    const coreOps = getOperatorsByDomain('Core').slice(0, 5);
    for (const op of coreOps) {
      if (!seenIds.has(op.id)) {
        selectedOperators.push(op);
        seenIds.add(op.id);
      }
    }

    // Add operators from primary domain
    const primaryOps = getOperatorsByDomain(domainResult.primaryDomain).slice(0, 10);
    for (const op of primaryOps) {
      if (!seenIds.has(op.id)) {
        selectedOperators.push(op);
        seenIds.add(op.id);
      }
    }

    // Add operators from sub-domains
    for (const subDomain of domainResult.subDomains) {
      const subOps = getOperatorsByDomain(subDomain).slice(0, 5);
      for (const op of subOps) {
        if (!seenIds.has(op.id)) {
          selectedOperators.push(op);
          seenIds.add(op.id);
        }
      }
    }

    // Search for additional relevant operators
    const searchOps = searchOperators(query).slice(0, 10);
    for (const op of searchOps) {
      if (!seenIds.has(op.id)) {
        selectedOperators.push(op);
        seenIds.add(op.id);
      }
    }

    return selectedOperators.slice(0, 30); // Cap at 30 operators per query
  }

  /**
   * Calculate pulse cycle based on time
   */
  calculatePulseCycle(): number {
    const elapsedMs = Date.now() - this.startTime;
    const cycleMs = 1000 / this.pulseFrequency;
    return Math.floor(elapsedMs / cycleMs);
  }

  /**
   * Calculate current phase (0-2π)
   */
  calculatePhase(): number {
    const elapsedMs = Date.now() - this.startTime;
    const cycleMs = 1000 / this.pulseFrequency;
    return ((elapsedMs % cycleMs) / cycleMs) * 2 * Math.PI;
  }

  /**
   * Calculate truth vector components
   */
  calculateTruthVector(
    query: string,
    operators: ZeqOperator[],
    domainResult: ZeqDomainDetectionResult
  ): ZeqTruthVector {
    // Consciousness field: based on query complexity and domain coverage
    const consciousnessField = Math.min(1, (query.length / 500) * domainResult.confidence);

    // Information integrity: based on operator coverage
    const informationIntegrity = Math.min(1, operators.length / 20) * domainResult.confidence;

    // Harmony index: based on domain coherence
    const harmonyIndex = domainResult.subDomains.length > 0
      ? 1 / (1 + domainResult.subDomains.length * 0.1)
      : 1;

    // Domain coherence: based on primary domain confidence
    const domainCoherence = domainResult.confidence;

    // Temporal stability: based on pulse frequency
    const temporalStability = 1 / (1 + Math.abs(this.pulseFrequency - ZEQ_PULSE_FREQUENCY));

    // Quantum entanglement: simulated based on operator associations
    const associatedCount = operators.reduce(
      (sum, op) => sum + (op.associatedOperators?.length || 0),
      0
    );
    const quantumEntanglement = Math.min(1, associatedCount / (operators.length * 3));

    return {
      consciousnessField,
      informationIntegrity,
      harmonyIndex,
      domainCoherence,
      temporalStability,
      quantumEntanglement,
    };
  }

  /**
   * Calculate cross-domain harmony
   */
  calculateCrossDomainHarmony(domains: string[]): number {
    if (domains.length === 0) return 1;
    if (domains.length === 1) return 0.9;

    // Harmony decreases with more domains but never below 0.5
    return Math.max(0.5, 1 - (domains.length - 1) * 0.1);
  }

  /**
   * Calculate master sum (HULYAS)
   */
  calculateMasterSum(
    truthVector: ZeqTruthVector,
    crossDomainHarmony: number,
    operatorCount: number
  ): number {
    const vectorSum =
      truthVector.consciousnessField +
      truthVector.informationIntegrity +
      truthVector.harmonyIndex +
      truthVector.domainCoherence +
      truthVector.temporalStability +
      truthVector.quantumEntanglement;

    const normalizedVectorSum = vectorSum / 6;
    const operatorFactor = Math.min(1, operatorCount / 20);

    return normalizedVectorSum * crossDomainHarmony * operatorFactor * this.pulseFrequency;
  }

  /**
   * Generate master equation string
   */
  generateMasterEquation(masterSum: number, operatorCount: number): string {
    return `HULYAS(Ω) = ∫∫∫ [Σᵢ₌₁^${operatorCount} Oᵢ(x,y,z,t)] · Ψ(f=${this.pulseFrequency}Hz) dxdydzdt = ${masterSum.toFixed(6)}`;
  }

  /**
   * Generate mathematical prompt
   */
  generateMathematicalPrompt(
    query: string,
    operators: ZeqOperator[],
    domainResult: ZeqDomainDetectionResult,
    truthVector: ZeqTruthVector,
    masterSum: number
  ): string {
    const operatorSection = operators
      .map(op => `  ${op.id}: ${op.name} [${op.symbol}] - ${op.formula}`)
      .join('\n');

    return `[Zeq OS Mathematical Framework v1.0 - ${this.pulseFrequency} Hz]

DOMAIN ANALYSIS:
  Primary: ${domainResult.primaryDomain}
  Secondary: ${domainResult.subDomains.join(', ') || 'None'}
  Confidence: ${(domainResult.confidence * 100).toFixed(1)}%

ACTIVE OPERATORS (${operators.length}):
${operatorSection}

TRUTH VECTOR:
  Consciousness Field: ${truthVector.consciousnessField.toFixed(4)}
  Information Integrity: ${truthVector.informationIntegrity.toFixed(4)}
  Harmony Index: ${truthVector.harmonyIndex.toFixed(4)}
  Domain Coherence: ${truthVector.domainCoherence.toFixed(4)}
  Temporal Stability: ${truthVector.temporalStability.toFixed(4)}
  Quantum Entanglement: ${truthVector.quantumEntanglement.toFixed(4)}

MASTER SUM: ${masterSum.toFixed(6)}

ORIGINAL QUERY: ${query}

Process this query through the mathematical framework with maximum truth integrity.`;
  }

  /**
   * Get framework status
   */
  getStatus(): {
    status: string;
    version: string;
    pulseFrequency: number;
    operatorCount: number;
    domainCount: number;
    uptime: number;
  } {
    return {
      status: 'active',
      version: '1.0.0',
      pulseFrequency: this.pulseFrequency,
      operatorCount: getOperatorCount(),
      domainCount: getDomainCount(),
      uptime: Date.now() - this.startTime,
    };
  }
}

export default ZeqProcessor;
