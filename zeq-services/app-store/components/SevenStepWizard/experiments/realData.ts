/**
 * Real Experimental Data Structure
 * 
 * CRITICAL: All experiments must use REAL measured data from authoritative sources.
 * No approximations, no "ish" values, no fake data. Every measurement must be
 * traceable to a real experimental source.
 */

export type DataSourceType = 'nist' | 'nasa' | 'paper' | 'historical' | 'lab' | 'esa';

export interface Measurement {
  value: number;
  unit: string;
  uncertainty?: number;
  measuredBy?: string;
  date?: string;
  source: string;
  notes?: string;
}

export interface DataSource {
  type: DataSourceType;
  citation: string;
  url?: string;
  doi?: string;
  accessed?: string;
}

export interface RealExperiment {
  id: string;
  title: string;
  description: string;
  source: DataSource;
  measurements: Record<string, Measurement>;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert' | 'impossible';
  domainTags: string[];
  prompt: string;
  defaultFlow: 'auto' | 'guided';
  ko42Mode: 'KO42.1' | 'KO42.2';
  selectedOperators: string[];
  globalParams: Record<string, any>;
  experimentalConditions?: {
    location?: string;
    date?: string;
    temperature?: number;
    pressure?: number;
    humidity?: number;
    [key: string]: any;
  };
}

/**
 * Validation function to ensure all measurements are real
 */
export function validateRealExperiment(exp: RealExperiment): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check source citation exists
  if (!exp.source.citation || exp.source.citation.trim().length === 0) {
    errors.push(`Experiment ${exp.id}: Missing source citation`);
  }
  
  // Check all measurements have values
  for (const [key, measurement] of Object.entries(exp.measurements)) {
    if (typeof measurement.value !== 'number' || isNaN(measurement.value)) {
      errors.push(`Experiment ${exp.id}: Invalid measurement value for ${key}`);
    }
    if (!measurement.unit || measurement.unit.trim().length === 0) {
      errors.push(`Experiment ${exp.id}: Missing unit for ${key}`);
    }
    if (!measurement.source || measurement.source.trim().length === 0) {
      errors.push(`Experiment ${exp.id}: Missing source for measurement ${key}`);
    }
  }
  
  // Check for approximate values (common patterns to avoid)
  const approximatePatterns = [
    /ish/i, /approx/i, /about/i, /roughly/i, /~/, /around/i, /typical/i, /generic/i
  ];
  
  const allText = JSON.stringify(exp).toLowerCase();
  for (const pattern of approximatePatterns) {
    if (pattern.test(allText)) {
      errors.push(`Experiment ${exp.id}: Contains approximate language - all values must be exact measurements`);
      break;
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}
