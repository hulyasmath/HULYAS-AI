/**
 * Zeq OS Mathematical Framework - Operator Registry
 * Central registry for all 646+ operators across 26 domains
 */

import { ZeqOperator, ZeqDomain } from '../types';
import { CoreOperators } from './CoreOperators';
import { QuantumMechanicsOperators } from './QuantumMechanics';
import { NeuroscienceCognitionOperators } from './NeuroscienceCognition';
import { GeneralRelativityOperators } from './GeneralRelativity';
import { MathematicsOperators } from './Mathematics';
import { PhilosophyOperators } from './Philosophy';
import { BiologyOperators } from './Biology';
import { ChemistryOperators } from './Chemistry';
import { ComputerScienceOperators } from './ComputerScience';
import { EconomicsOperators } from './Economics';
import { PsychologyOperators } from './Psychology';
import { LinguisticsOperators } from './Linguistics';
import { MusicOperators } from './Music';
import { ArtOperators } from './Art';
import { HistoryOperators } from './History';
import { PoliticsOperators } from './Politics';
import { SociologyOperators } from './Sociology';
import { AnthropologyOperators } from './Anthropology';
import { GeographyOperators } from './Geography';
import { AstronomyOperators } from './Astronomy';
import { EcologyOperators } from './Ecology';
import { MedicineOperators } from './Medicine';
import { EngineeringOperators } from './Engineering';
import { LawOperators } from './Law';
import { EducationOperators } from './Education';
import { SportsOperators } from './Sports';

/**
 * All operators combined in a single array
 */
export const AllOperators: ZeqOperator[] = [
  ...CoreOperators,
  ...QuantumMechanicsOperators,
  ...NeuroscienceCognitionOperators,
  ...GeneralRelativityOperators,
  ...MathematicsOperators,
  ...PhilosophyOperators,
  ...BiologyOperators,
  ...ChemistryOperators,
  ...ComputerScienceOperators,
  ...EconomicsOperators,
  ...PsychologyOperators,
  ...LinguisticsOperators,
  ...MusicOperators,
  ...ArtOperators,
  ...HistoryOperators,
  ...PoliticsOperators,
  ...SociologyOperators,
  ...AnthropologyOperators,
  ...GeographyOperators,
  ...AstronomyOperators,
  ...EcologyOperators,
  ...MedicineOperators,
  ...EngineeringOperators,
  ...LawOperators,
  ...EducationOperators,
  ...SportsOperators,
];

/**
 * Domain to operators mapping
 */
export const OperatorsByDomain: Record<string, ZeqOperator[]> = {
  Core: CoreOperators,
  QuantumMechanics: QuantumMechanicsOperators,
  NeuroscienceCognition: NeuroscienceCognitionOperators,
  GeneralRelativity: GeneralRelativityOperators,
  Mathematics: MathematicsOperators,
  Philosophy: PhilosophyOperators,
  Biology: BiologyOperators,
  Chemistry: ChemistryOperators,
  ComputerScience: ComputerScienceOperators,
  Economics: EconomicsOperators,
  Psychology: PsychologyOperators,
  Linguistics: LinguisticsOperators,
  Music: MusicOperators,
  Art: ArtOperators,
  History: HistoryOperators,
  Politics: PoliticsOperators,
  Sociology: SociologyOperators,
  Anthropology: AnthropologyOperators,
  Geography: GeographyOperators,
  Astronomy: AstronomyOperators,
  Ecology: EcologyOperators,
  Medicine: MedicineOperators,
  Engineering: EngineeringOperators,
  Law: LawOperators,
  Education: EducationOperators,
  Sports: SportsOperators,
};

/**
 * Get all operators
 */
export function getAllOperators(): ZeqOperator[] {
  return AllOperators;
}

/**
 * Get operators by domain
 */
export function getOperatorsByDomain(domain: string): ZeqOperator[] {
  return OperatorsByDomain[domain] || [];
}

/**
 * Get operator by ID
 */
export function getOperatorById(id: string): ZeqOperator | undefined {
  return AllOperators.find(op => op.id === id);
}

/**
 * Get operator by symbol
 */
export function getOperatorBySymbol(symbol: string): ZeqOperator | undefined {
  return AllOperators.find(op => op.symbol === symbol);
}

/**
 * Search operators by name or description
 */
export function searchOperators(query: string): ZeqOperator[] {
  const lowerQuery = query.toLowerCase();
  return AllOperators.filter(
    op =>
      op.name.toLowerCase().includes(lowerQuery) ||
      op.description.toLowerCase().includes(lowerQuery) ||
      op.id.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Get all available domains
 */
export function getAllDomains(): string[] {
  return Object.keys(OperatorsByDomain);
}

/**
 * Get operator count
 */
export function getOperatorCount(): number {
  return AllOperators.length;
}

/**
 * Get domain count
 */
export function getDomainCount(): number {
  return Object.keys(OperatorsByDomain).length;
}

/**
 * Get operators statistics
 */
export function getOperatorStats(): {
  totalOperators: number;
  totalDomains: number;
  operatorsPerDomain: Record<string, number>;
} {
  const operatorsPerDomain: Record<string, number> = {};
  for (const [domain, operators] of Object.entries(OperatorsByDomain)) {
    operatorsPerDomain[domain] = operators.length;
  }
  return {
    totalOperators: AllOperators.length,
    totalDomains: Object.keys(OperatorsByDomain).length,
    operatorsPerDomain,
  };
}
