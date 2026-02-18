/**
 * @zeq/sdk - Zeq OS Mathematical Framework SDK
 * 1549+ operators at 1.287 Hz for enhanced AI reasoning
 *
 * @example With LibreChat API
 * ```typescript
 * import { ZeqClient } from '@zeq/sdk';
 *
 * const client = new ZeqClient({
 *   baseUrl: 'http://localhost:3080',
 *   jwtToken: 'your-jwt-token'
 * });
 *
 * const result = await client.process('Explain quantum entanglement');
 * console.log(result.data?.mathematicalPrompt);
 * ```
 *
 * @example Standalone (no API)
 * ```typescript
 * import { ZeqProcessor } from '@zeq/sdk';
 *
 * const processor = new ZeqProcessor();
 * const result = processor.processQuery('Explain quantum entanglement');
 * console.log(result.mathematicalPrompt);
 * console.log(result.activeOperators);
 * console.log(result.domains);
 * ```
 *
 * @example Access operators directly
 * ```typescript
 * import { getAllOperators, getOperatorsByDomain, getOperatorById } from '@zeq/sdk';
 *
 * const allOps = getAllOperators(); // 1549+ operators
 * const quantumOps = getOperatorsByDomain('QuantumMechanics');
 * const specific = getOperatorById('QM1'); // Wave Function Collapse
 * ```
 */

// Main classes
export { ZeqClient } from './ZeqClient';
export { ZeqProcessor } from './ZeqProcessor';

// Types
export {
  // Core types
  ZeqOperator,
  ZeqTruthVector,
  ZeqProcessingResult,
  ZeqAuditStep,

  // Client types
  ZeqClientOptions,
  ZeqProcessorOptions,
  ZeqApiResponse,

  // Detection types
  ZeqDomainDetectionResult,
  ZeqOperatorSelectionResult,

  // Response types
  ZeqStatusResponse,
  ZeqOperatorListResponse,
  ZeqLogEntry,
  ZeqTransparencyReport,

  // Domain type
  ZeqDomain,

  // Constants
  ZEQ_PULSE_FREQUENCY,
  ZEQ_OPERATOR_COUNT,
  ZEQ_DOMAIN_COUNT,
  ZEQ_VERSION,
} from './types';

// Operator registry functions
export {
  getAllOperators,
  getOperatorsByDomain,
  getOperatorById,
  getOperatorBySymbol,
  searchOperators,
  getAllDomains,
  getOperatorCount,
  getDomainCount,
  getOperatorStats,
  AllOperators,
  OperatorsByDomain,
} from './operators/OperatorRegistry';

// Individual operator modules (for advanced usage)
export { CoreOperators } from './operators/CoreOperators';
export { QuantumMechanicsOperators } from './operators/QuantumMechanics';
export { NeuroscienceCognitionOperators } from './operators/NeuroscienceCognition';
export { GeneralRelativityOperators } from './operators/GeneralRelativity';
export { MathematicsOperators } from './operators/Mathematics';
export { PhilosophyOperators } from './operators/Philosophy';
export { BiologyOperators } from './operators/Biology';
export { ChemistryOperators } from './operators/Chemistry';
export { ComputerScienceOperators } from './operators/ComputerScience';
export { EconomicsOperators } from './operators/Economics';
export { PsychologyOperators } from './operators/Psychology';
export { LinguisticsOperators } from './operators/Linguistics';
export { MusicOperators } from './operators/Music';
export { ArtOperators } from './operators/Art';
export { HistoryOperators } from './operators/History';
export { PoliticsOperators } from './operators/Politics';
export { SociologyOperators } from './operators/Sociology';
export { AnthropologyOperators } from './operators/Anthropology';
export { GeographyOperators } from './operators/Geography';
export { AstronomyOperators } from './operators/Astronomy';
export { EcologyOperators } from './operators/Ecology';
export { MedicineOperators } from './operators/Medicine';
export { EngineeringOperators } from './operators/Engineering';
export { LawOperators } from './operators/Law';
export { EducationOperators } from './operators/Education';
export { SportsOperators } from './operators/Sports';

// Default export for convenience
export { ZeqProcessor as default } from './ZeqProcessor';
