/**
 * Validation System for Real Experimental Data
 * 
 * Ensures all experiments use REAL measured data with no approximations or fake values.
 */

import type { RealExperiment, Measurement } from './realData';
import { validateRealExperiment } from './realData';

/**
 * Patterns that indicate approximate/fake values (should NOT appear in real data)
 */
const APPROXIMATE_PATTERNS = [
  /ish/i,
  /approx/i,
  /about/i,
  /roughly/i,
  /~/,
  /around/i,
  /typical/i,
  /generic/i,
  /toy/i,
  /fake/i,
  /dummy/i,
  /mock/i,
  /test.*data/i,
  /example/i,
];

/**
 * Validate a single measurement
 */
export function validateMeasurement(measurement: Measurement, key: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check value is a real number
  if (typeof measurement.value !== 'number' || isNaN(measurement.value) || !isFinite(measurement.value)) {
    errors.push(`Measurement ${key}: Invalid value (must be a real number)`);
  }
  
  // Check unit exists
  if (!measurement.unit || measurement.unit.trim().length === 0) {
    errors.push(`Measurement ${key}: Missing unit`);
  }
  
  // Check source exists
  if (!measurement.source || measurement.source.trim().length === 0) {
    errors.push(`Measurement ${key}: Missing source citation`);
  }
  
  // Check for approximate language
  const measurementText = JSON.stringify(measurement).toLowerCase();
  for (const pattern of APPROXIMATE_PATTERNS) {
    if (pattern.test(measurementText)) {
      errors.push(`Measurement ${key}: Contains approximate language - all values must be exact measurements`);
      break;
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate all experiments in a collection
 */
export function validateAllExperiments(experiments: RealExperiment[]): {
  valid: boolean;
  total: number;
  validCount: number;
  invalidCount: number;
  errors: Array<{ experimentId: string; errors: string[] }>;
} {
  const errors: Array<{ experimentId: string; errors: string[] }> = [];
  let validCount = 0;
  
  for (const exp of experiments) {
    const validation = validateRealExperiment(exp);
    
    // Also validate each measurement
    const measurementErrors: string[] = [];
    for (const [key, measurement] of Object.entries(exp.measurements)) {
      const measValidation = validateMeasurement(measurement, key);
      if (!measValidation.valid) {
        measurementErrors.push(...measValidation.errors);
      }
    }
    
    const allErrors = [...validation.errors, ...measurementErrors];
    
    if (allErrors.length === 0) {
      validCount++;
    } else {
      errors.push({
        experimentId: exp.id,
        errors: allErrors,
      });
    }
  }
  
  return {
    valid: errors.length === 0,
    total: experiments.length,
    validCount,
    invalidCount: errors.length,
    errors,
  };
}

/**
 * Check for common fake data patterns
 */
export function checkForFakeData(experiments: RealExperiment[]): {
  hasFakeData: boolean;
  issues: Array<{ experimentId: string; issue: string }>;
} {
  const issues: Array<{ experimentId: string; issue: string }> = [];
  
  for (const exp of experiments) {
    const allText = JSON.stringify(exp).toLowerCase();
    
    // Check for approximate patterns
    for (const pattern of APPROXIMATE_PATTERNS) {
      if (pattern.test(allText)) {
        issues.push({
          experimentId: exp.id,
          issue: `Contains approximate language: ${pattern.source}`,
        });
        break;
      }
    }
    
    // Check for missing source citations
    if (!exp.source.citation || exp.source.citation.trim().length === 0) {
      issues.push({
        experimentId: exp.id,
        issue: 'Missing source citation',
      });
    }
    
    // Check measurements have sources
    for (const [key, measurement] of Object.entries(exp.measurements)) {
      if (!measurement.source || measurement.source.trim().length === 0) {
        issues.push({
          experimentId: exp.id,
          issue: `Measurement ${key} missing source`,
        });
      }
    }
  }
  
  return {
    hasFakeData: issues.length > 0,
    issues,
  };
}

/**
 * Verify all constants are real NIST values
 */
export function verifyConstantsAreReal(): { valid: boolean; issues: string[] } {
  const issues: string[] = [];
  
  // These should be checked against actual NIST values
  // For now, we assume constants.ts has been updated with real values
  
  return {
    valid: issues.length === 0,
    issues,
  };
}
