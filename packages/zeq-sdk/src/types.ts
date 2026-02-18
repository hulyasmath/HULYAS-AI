/**
 * Zeq OS Mathematical Framework - TypeScript Types
 * Core interfaces for the 1549 kinematic operator framework at 1.287 Hz
 *
 * Framework includes:
 * - 1549 base kinematic operators across 34 domains
 * - Dynamic operator expansion (AI can create new operators)
 * - 34 knowledge domains
 * - 1.287 Hz (777ms Zeqond) pulse synchronization
 */

export interface ZeqOperator {
  id: string;
  name: string;
  symbol: string;
  domain: string;
  subDomain?: string;
  formula: string;
  description: string;
  associatedOperators?: string[];
  complementaryOperators?: string[];
  parameters?: Record<string, any>;
}

export interface ZeqTruthVector {
  consciousnessField: number;
  informationIntegrity: number;
  harmonyIndex: number;
  domainCoherence: number;
  temporalStability: number;
  quantumEntanglement: number;
}

export interface ZeqProcessingResult {
  originalQuery: string;
  mathematicalPrompt: string;
  activeOperators: string[];
  domains: string[];
  truthVector: ZeqTruthVector;
  informationIntegrity: number;
  crossDomainHarmony: number;
  masterSum: number;
  masterEquation: string;
  pulseCycle: number;
  phase: number;
  processingTimeMs: number;
  operatorCount: number;
  auditTrail?: ZeqAuditStep[];
}

export interface ZeqAuditStep {
  stepNumber: number;
  stepName: string;
  timestamp: Date;
  details: string;
  inputState?: Record<string, any>;
  outputState?: Record<string, any>;
}

export interface ZeqClientOptions {
  baseUrl: string;
  jwtToken?: string;
  apiKey?: string;
  timeout?: number;
}

export interface ZeqProcessorOptions {
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
  pulseFrequency?: number;
  enableAuditTrail?: boolean;
}

export interface ZeqDomainDetectionResult {
  primaryDomain: string;
  subDomains: string[];
  confidence: number;
  keywords: string[];
}

export interface ZeqOperatorSelectionResult {
  operators: ZeqOperator[];
  domains: string[];
  selectionRationale: string;
}

export interface ZeqApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  processingTimeMs: number;
}

export interface ZeqStatusResponse {
  status: 'active' | 'inactive';
  version: string;
  pulseFrequency: number;
  operatorCount: number;
  domainCount: number;
  uptime: number;
}

export interface ZeqOperatorListResponse {
  operators: ZeqOperator[];
  totalCount: number;
  domains: string[];
}

export interface ZeqLogEntry {
  messageId: string;
  conversationId: string;
  user: string;
  userQuery: string;
  mathematicalPrompt: string;
  operators: string[];
  domains: string[];
  truthVector: ZeqTruthVector;
  informationIntegrity: number;
  crossDomainHarmony: number;
  masterSum: number;
  pulseCycle: number;
  phase: number;
  processingTimeMs: number;
  createdAt: Date;
}

export interface ZeqTransparencyReport {
  messageId: string;
  conversationId: string;
  processingLog: ZeqLogEntry;
  auditTrail: ZeqAuditStep[];
  operatorDetails: ZeqOperator[];
  mathematicalState: {
    initialState: Record<string, any>;
    finalState: Record<string, any>;
    transformations: string[];
  };
}

// Domain constants - 34 knowledge domains
export type ZeqDomain =
  // Core Physics
  | 'structural'
  | 'quantum'
  | 'thermodynamics'
  | 'relativistic'
  | 'field'
  // Chemistry & Biology
  | 'chemical'
  | 'genetic'
  | 'biological'
  // Consciousness & Cognition
  | 'consciousness'
  | 'temporal'
  | 'emotional'
  // Information & Computation
  | 'information'
  | 'computational'
  // Pure Mathematics
  | 'calculus'
  | 'linear_algebra'
  | 'statistics'
  | 'topology'
  | 'optimization'
  | 'graph_theory'
  // Applied Mathematics
  | 'differential_equations'
  | 'complex_analysis'
  | 'number_theory'
  | 'category_theory'
  // Engineering & Applied Science
  | 'signal_processing'
  | 'control_theory'
  | 'machine_learning'
  // Economics & Game Theory
  | 'financial'
  | 'game_theory'
  // Advanced Consciousness & Integration
  | 'spiritual'
  | 'ethical'
  | 'creative'
  | 'social'
  | 'cosmic';

// Framework constants
export const ZEQ_PULSE_FREQUENCY = 1.287; // Hz (777ms Zeqond period)
export const ZEQ_GOLDEN_RATIO = 0.618; // Secondary harmonic
export const ZEQ_HARMONIC_FREQ = 2.083; // Tertiary harmonic
export const ZEQ_OPERATOR_COUNT = 1549; // Base framework operators across 34 domains
export const ZEQ_DOMAIN_COUNT = 34; // Knowledge domains
export const ZEQ_VERSION = '1.287.0'; // Version aligned with pulse frequency
export const ZEQ_ZEQOND_MS = 777; // Pulse period in milliseconds

// Dynamic Operator Expansion Types
export interface ZeqDynamicOperator {
  code: string;
  name: string;
  formula: string;
  description: string;
  category: string;
  domains: string[];
  parameters?: Record<string, any>;
  createdBy: string;
  createdAt: string;
  isDynamic: true;
  pulseSynced: boolean;
  hulyasFrequency: number;
  reasoning?: string;
}

export interface ZeqOperatorValidation {
  operatorCode: string;
  validationType: 'SIMULATED' | 'EXPERIMENTAL' | 'NONE';
  disclaimer: string;
  framework: {
    frequency: string;
    period: string;
    ko42Synchronized: boolean;
  };
  precisionTarget: string;
  precisionAchieved: string;
  meetsFrameworkStandard: boolean;
  measurements: ZeqValidationMeasurement[];
  statistics: {
    samples: number;
    avgDeviation: string;
    maxDeviation: string;
    minDeviation: string;
    passRate: string;
  };
  generatedAt: string;
  note: string;
}

export interface ZeqValidationMeasurement {
  sample: number;
  pulsePhase: string;
  ko42Sync: string;
  predicted: string;
  measured: string;
  deviation: string;
  withinPrecision: boolean;
}

export interface ZeqSaveResult {
  success: boolean;
  operatorsSaved: number;
  frameworkOperators: number;
  totalFramework: number;
  validationType: string;
  fileSaved: boolean;
  savedPath: string | null;
  savedAt: string;
  message: string;
  nextSteps: string[];
}

export interface ZeqExpansionStats {
  aiCreatedOperators: number;
  frameworkOperators: number;
  totalOperators: number;
  byCategory: Record<string, number>;
  byCreator: Record<string, number>;
  historyLength: number;
  expansionRate: string;
  note: string;
}
