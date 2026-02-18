/**
 * Weight Normalization Utility
 * 
 * Normalizes operator weights to sum to 1.0, as required by the framework.
 * Handles KO42 variants by grouping them as a single operator before normalizing.
 */

/**
 * Normalizes a set of operator weights so their sum equals 1.0.
 * Preserves relative weight ratios while ensuring framework compliance.
 * 
 * @param weights - Record mapping operator IDs to their weights
 * @returns Normalized weights with sum = 1.0
 */
export function normalizeWeightsToSum(
  weights: Record<string, number>
): Record<string, number> {
  // Handle empty case
  if (Object.keys(weights).length === 0) {
    return {};
  }

  // Group KO42 variants (KO42, KO42.1, KO42.2) as a single operator
  const groupedWeights: Record<string, number> = {};
  let ko42TotalWeight = 0;
  const ko42Variants = ['KO42', 'KO42.1', 'KO42.2'];

  for (const [opId, weight] of Object.entries(weights)) {
    if (ko42Variants.includes(opId)) {
      ko42TotalWeight += weight;
    } else {
      groupedWeights[opId] = weight;
    }
  }

  // Add grouped KO42 weight (use the mode that was selected, or KO42 if none)
  if (ko42TotalWeight > 0) {
    // Find which KO42 variant was actually used
    const ko42Mode = Object.keys(weights).find(id => ko42Variants.includes(id)) || 'KO42';
    groupedWeights[ko42Mode] = ko42TotalWeight;
  }

  // Calculate current sum
  const currentSum = Object.values(groupedWeights).reduce((sum, w) => sum + w, 0);

  // If sum is zero or very small, return equal weights
  if (currentSum < 1e-10) {
    const numOps = Object.keys(groupedWeights).length;
    if (numOps === 0) return {};
    const equalWeight = 1.0 / numOps;
    const normalized: Record<string, number> = {};
    for (const opId of Object.keys(groupedWeights)) {
      normalized[opId] = equalWeight;
    }
    return normalized;
  }

  // Normalize to sum = 1.0
  const normalized: Record<string, number> = {};
  for (const [opId, weight] of Object.entries(groupedWeights)) {
    normalized[opId] = weight / currentSum;
  }

  return normalized;
}

/**
 * Normalizes weights while preserving KO42 variants separately if needed.
 * This version keeps KO42 variants distinct (for cases where they need to be separate).
 * 
 * @param weights - Record mapping operator IDs to their weights
 * @returns Normalized weights with sum = 1.0
 */
export function normalizeWeightsToSumPreserveKO42(
  weights: Record<string, number>
): Record<string, number> {
  if (Object.keys(weights).length === 0) {
    return {};
  }

  const currentSum = Object.values(weights).reduce((sum, w) => sum + w, 0);

  if (currentSum < 1e-10) {
    const numOps = Object.keys(weights).length;
    if (numOps === 0) return {};
    const equalWeight = 1.0 / numOps;
    const normalized: Record<string, number> = {};
    for (const opId of Object.keys(weights)) {
      normalized[opId] = equalWeight;
    }
    return normalized;
  }

  const normalized: Record<string, number> = {};
  for (const [opId, weight] of Object.entries(weights)) {
    normalized[opId] = weight / currentSum;
  }

  return normalized;
}
