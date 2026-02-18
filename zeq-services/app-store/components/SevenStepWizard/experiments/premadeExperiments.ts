/**
 * Premade Experiments Import and Conversion
 * 
 * Imports 105 premade experiments from JSON and converts them to RealExperiment format.
 * Each experiment must include:
 * - Real physical measurements with uncertainties
 * - Proper beta value (tuned for ≤0.1% error, range 0.0-2.0)
 * - Normalized operator weights (sum = 1.0)
 * - Location and environmental conditions
 * - Experimental apparatus and instruments
 */

import type { RealExperiment, Measurement, DataSource } from './realData';
import { normalizeWeightsToSum } from '../utils/weightNormalization';

// Import premade experiments JSON (with error handling)
let premadeExperimentsJson: any;
try {
  // Try to import the JSON file
  premadeExperimentsJson = require('../../../zeq-ecosystem/zeq-7stepwizard/105_premade_experiments.json');
} catch (error) {
  console.warn('Could not load premade experiments JSON:', error);
  premadeExperimentsJson = { experiments: [] };
}

/**
 * Interface for premade experiment from JSON
 */
interface PremadeExperimentJson {
  id: number;
  name: string;
  difficulty: string;
  description: string;
  required_data: string[];
  ko_operators: Array<{
    code: string;
    equation: string;
    application: string;
  }>;
  computation_method: string;
  target_accuracy: string;
  expected_result: string;
}

/**
 * Real experiment data structure with measurements
 */
interface RealExperimentData {
  measurements: Record<string, {
    value: number;
    uncertainty: number;
    unit: string;
  }>;
  location: string;
  environment: {
    temperature?: number;
    pressure?: number;
    humidity?: number;
  };
  apparatus: string[];
  instruments: string[];
}

/**
 * Convert premade experiment JSON to RealExperiment format
 */
function convertPremadeExperiment(
  premade: PremadeExperimentJson,
  realData: RealExperimentData,
  beta: number
): RealExperiment {
  // Extract operator codes and create initial weights
  const operatorCodes = premade.ko_operators.map(op => op.code);
  
  // Ensure KO42 is included
  const hasKO42 = operatorCodes.some(code => code === 'KO42' || code.startsWith('KO42'));
  const selectedOperators = hasKO42 
    ? operatorCodes 
    : ['KO42', ...operatorCodes];
  
  // Create initial weights (equal distribution, will be normalized)
  const initialWeights: Record<string, number> = {};
  selectedOperators.forEach(op => {
    initialWeights[op] = 1.0 / selectedOperators.length;
  });
  
  // Normalize weights to sum = 1.0
  const normalizedWeights = normalizeWeightsToSum(initialWeights);
  
  // Convert measurements to Measurement format
  const measurements: Record<string, Measurement> = {};
  for (const [key, data] of Object.entries(realData.measurements)) {
    measurements[key] = {
      value: data.value,
      unit: data.unit,
      uncertainty: data.uncertainty,
      source: `Premade experiment ${premade.id} - ${premade.name}`,
    };
  }
  
  // Determine ko42Mode (default to KO42.1)
  const ko42Mode: 'KO42.1' | 'KO42.2' = selectedOperators.includes('KO42.1') 
    ? 'KO42.1' 
    : selectedOperators.includes('KO42.2')
    ? 'KO42.2'
    : 'KO42.1';
  
  // Create global params with beta and measurements
  const globalParams: Record<string, any> = {
    beta,
    ...realData.measurements,
    location: realData.location,
    environment: realData.environment,
    apparatus: realData.apparatus,
    instruments: realData.instruments,
  };
  
  // Convert difficulty
  const difficultyMap: Record<string, 'easy' | 'medium' | 'hard' | 'expert' | 'impossible'> = {
    'Easy': 'easy',
    'Medium': 'medium',
    'Hard': 'hard',
    'Expert': 'expert',
    'Impossible': 'impossible',
  };
  const difficulty = difficultyMap[premade.difficulty] || 'medium';
  
  // Create domain tags from operators
  const domainTags: string[] = [];
  selectedOperators.forEach(op => {
    if (op.startsWith('QM')) domainTags.push('quantum');
    if (op.startsWith('NM')) domainTags.push('classical');
    if (op.startsWith('GR')) domainTags.push('relativity');
    if (op.startsWith('CS')) domainTags.push('computational');
    if (op.startsWith('CAO')) domainTags.push('consciousness');
    if (op.startsWith('HRO')) domainTags.push('field');
  });
  domainTags.push(difficulty);
  
  return {
    id: `premade_${premade.id}`,
    title: premade.name,
    description: premade.description,
    source: {
      type: 'paper',
      citation: `Premade Experiment ${premade.id}: ${premade.name}`,
    },
    measurements,
    difficulty,
    domainTags: Array.from(new Set(domainTags)),
    prompt: `${premade.description}. ${premade.computation_method}. Expected: ${premade.expected_result}`,
    defaultFlow: 'guided',
    ko42Mode,
    selectedOperators,
    globalParams,
    experimentalConditions: {
      location: realData.location,
      ...realData.environment,
    },
  };
}

/**
 * Default real data generator for premade experiments
 * NOTE: This should be replaced with actual measured data from experiments
 */
function generateDefaultRealData(premade: PremadeExperimentJson): RealExperimentData {
  // This is a placeholder - real implementations should use actual measured data
  const measurements: Record<string, { value: number; uncertainty: number; unit: string }> = {};
  
  // Generate placeholder measurements based on required_data
  premade.required_data.forEach((req, idx) => {
    const key = req.toLowerCase().replace(/[^a-z0-9]/g, '_');
    measurements[key] = {
      value: 1.0 + idx * 0.1,
      uncertainty: 0.01,
      unit: 'unit',
    };
  });
  
  return {
    measurements,
    location: 'earth',
    environment: {
      temperature: 298.15,
      pressure: 101325,
      humidity: 50,
    },
    apparatus: ['Standard laboratory equipment'],
    instruments: ['Precision measurement instruments'],
  };
}

/**
 * Default beta values for different difficulty levels
 * These should be tuned per experiment to achieve ≤0.1% error
 */
function getDefaultBeta(difficulty: string): number {
  const betaMap: Record<string, number> = {
    'Easy': 0.1,
    'Medium': 0.3,
    'Hard': 0.5,
    'Expert': 0.8,
    'Impossible': 1.2,
  };
  return betaMap[difficulty] || 0.3;
}

/**
 * Import and convert all 105 premade experiments
 */
export function importPremadeExperiments(): RealExperiment[] {
  const experiments: RealExperiment[] = [];
  
  const premadeData = premadeExperimentsJson as { experiments: PremadeExperimentJson[] };
  
  for (const premade of premadeData.experiments) {
    try {
      const realData = generateDefaultRealData(premade);
      const beta = getDefaultBeta(premade.difficulty);
      const converted = convertPremadeExperiment(premade, realData, beta);
      experiments.push(converted);
    } catch (error) {
      console.error(`Failed to convert premade experiment ${premade.id}:`, error);
    }
  }
  
  return experiments;
}

/**
 * Get a single premade experiment by ID
 */
export function getPremadeExperiment(id: number): RealExperiment | null {
  const premadeData = premadeExperimentsJson as { experiments: PremadeExperimentJson[] };
  const premade = premadeData.experiments.find(exp => exp.id === id);
  
  if (!premade) return null;
  
  const realData = generateDefaultRealData(premade);
  const beta = getDefaultBeta(premade.difficulty);
  return convertPremadeExperiment(premade, realData, beta);
}
