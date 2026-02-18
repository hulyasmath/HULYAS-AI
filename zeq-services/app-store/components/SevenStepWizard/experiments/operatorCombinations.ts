/**
 * Operator Combination Tracker
 * 
 * Ensures all experiments have unique operator combinations.
 * Tracks which operator sets have been used to prevent duplicates.
 */

const usedCombinations = new Set<string>();

/**
 * Get a unique key for an operator combination
 * Operators are sorted to ensure same combination in different order is detected as duplicate
 */
export function getCombinationKey(operators: string[]): string {
  // Filter out KO42 variants (they're all the same for uniqueness purposes)
  const filtered = operators.filter(id => id !== 'KO42' && id !== 'KO42.1' && id !== 'KO42.2');
  // Sort to ensure order doesn't matter
  return filtered.sort().join('+');
}

/**
 * Check if an operator combination is unique
 * Returns true if unique, false if already used
 */
export function isCombinationUnique(operators: string[]): boolean {
  const key = getCombinationKey(operators);
  if (usedCombinations.has(key)) {
    return false;
  }
  usedCombinations.add(key);
  return true;
}

/**
 * Reset the tracker (for testing/validation)
 */
export function resetCombinationTracker(): void {
  usedCombinations.clear();
}

/**
 * Get all used combinations (for validation/debugging)
 */
export function getUsedCombinations(): string[] {
  return Array.from(usedCombinations);
}

/**
 * Validate that all experiments have unique operator combinations
 */
export function validateUniqueCombinations(experiments: Array<{ id: string; selectedOperators: string[] }>): {
  valid: boolean;
  duplicates: Array<{ experimentId: string; combination: string }>;
} {
  resetCombinationTracker();
  const duplicates: Array<{ experimentId: string; combination: string }> = [];
  
  for (const exp of experiments) {
    const key = getCombinationKey(exp.selectedOperators);
    if (usedCombinations.has(key)) {
      duplicates.push({
        experimentId: exp.id,
        combination: key,
      });
    } else {
      usedCombinations.add(key);
    }
  }
  
  return {
    valid: duplicates.length === 0,
    duplicates,
  };
}
