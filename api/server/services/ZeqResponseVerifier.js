/**
 * Zeq OS Response Verifier
 * Verifies AI responses through the Forensic Intelligence pipeline
 * Referenced in Transparency export as the verification system
 *
 * Modes:
 *   'correct' (default) - Verify and flag issues, allow response through
 *   'strict'  - Block responses below threshold
 *   'audit'   - Log only, no blocking
 */

const { scoreForensicIntelligence, calculateHRO000, shannonEntropy } = require('./ForensicIntelligence');
const { logger } = require('~/config');

// Thresholds from TransparencyPanel export
const THRESHOLDS = {
  minCombinedScore: 0.75,
  minInformationIntegrity: 0.85,
  minCrossDomainHarmony: 0.70,
  criticalThreshold: 0.85,
};

/**
 * Verify an AI response through the Forensic Intelligence pipeline
 *
 * @param {string} query - Original user query
 * @param {string} response - AI response text
 * @param {object} frameworkState - Current mathematical framework state
 * @returns {object} Verification result with score, metrics, and warnings
 */
function verifyResponse(query, response, frameworkState = {}) {
  const startTime = Date.now();
  const mode = process.env.ZEQ_VERIFY_MODE || 'correct';

  try {
    // Run full Forensic Intelligence scoring
    const fiResult = scoreForensicIntelligence(query, response, {
      truthVector: frameworkState.truthVector,
      domains: frameworkState.domains,
      activeOperators: frameworkState.activeOperators,
    });

    // Calculate composite verification score
    const score = fiResult.sForensicBase;
    const hro000 = fiResult.hro000;

    // Determine if passed
    const passed = score >= THRESHOLDS.minCombinedScore && hro000 >= 0.3;

    // Collect warnings
    const warnings = [];
    if (score < THRESHOLDS.minCombinedScore) {
      warnings.push(`Combined score ${(score * 100).toFixed(1)}% below threshold ${(THRESHOLDS.minCombinedScore * 100)}%`);
    }
    if (hro000 < 0.3) {
      warnings.push(`HRO000 integrity ${(hro000 * 100).toFixed(1)}% below minimum 30%`);
    }
    if (fiResult.shannonEntropy < 2.0 || fiResult.shannonEntropy > 5.5) {
      warnings.push(`Entropy ${fiResult.shannonEntropy.toFixed(2)} outside normal range [2.0, 5.5]`);
    }
    if (fiResult.baseMetrics.HF2 < 0.7) {
      warnings.push('Potential manipulative language detected');
    }
    if (fiResult.baseMetrics.HF3 < 0.7) {
      warnings.push('Potential harmful content detected');
    }

    // Build metrics summary
    const metrics = {
      informationIntegrity: hro000,
      crossDomainHarmony: frameworkState.crossDomainHarmony || fiResult.baseMetrics.HF9,
      factualAccuracy: fiResult.baseMetrics.HF1,
      logicalCoherence: fiResult.baseMetrics.HF8,
      ethicalIntegrity: fiResult.baseMetrics.HF16,
      spectralStability: fiResult.spectralStability,
      shannonEntropy: fiResult.shannonEntropy,
      bayesianTrust: fiResult.baseMetrics.HF19,
    };

    // Correction guidance for flagged responses
    let correctionGuidance = null;
    if (!passed) {
      const weakAreas = [];
      if (fiResult.baseMetrics.HF1 < 0.7) weakAreas.push('factual accuracy');
      if (fiResult.baseMetrics.HF8 < 0.7) weakAreas.push('logical coherence');
      if (fiResult.baseMetrics.HF9 < 0.7) weakAreas.push('domain coherence');
      if (fiResult.baseMetrics.HF11 < 0.7) weakAreas.push('context match');
      if (fiResult.baseMetrics.HF16 < 0.7) weakAreas.push('ethical integrity');
      correctionGuidance = weakAreas.length > 0
        ? `Improve: ${weakAreas.join(', ')}`
        : 'Review response for overall quality improvement';
    }

    // Build operator equations for the verification
    const operatorEquations = [
      { operator: 'HF1', name: 'Factual Accuracy', value: fiResult.baseMetrics.HF1 },
      { operator: 'HF9', name: 'Domain Coherence', value: fiResult.baseMetrics.HF9 },
      { operator: 'HF15', name: 'Spectral Stability', value: fiResult.spectralStability },
      { operator: 'HF16', name: 'Ethical Integrity', value: fiResult.baseMetrics.HF16 },
      { operator: 'HF20', name: 'Truth Composite', value: fiResult.baseMetrics.HF20 },
      { operator: 'HRO000', name: 'Information Integrity', value: hro000 },
    ];

    const verificationTimeMs = Date.now() - startTime;

    const result = {
      passed,
      score,
      verificationResult: fiResult.verdict,
      metrics,
      warnings,
      correctionGuidance,
      operatorEquations,
      verificationTimeMs,
      mode,
      phase: fiResult.phase,
      timestamp: new Date().toISOString(),
    };

    logger.info('[ZeqResponseVerifier] Verification complete', {
      passed,
      score: score.toFixed(4),
      hro000: hro000.toFixed(4),
      verdict: fiResult.verdict,
      warnings: warnings.length,
      mode,
      timeMs: verificationTimeMs,
    });

    return result;
  } catch (error) {
    logger.error('[ZeqResponseVerifier] Verification error:', error);
    // Return a safe default on error - don't block responses
    return {
      passed: true,
      score: 0,
      verificationResult: 'ERROR',
      metrics: {},
      warnings: [`Verification error: ${error.message}`],
      correctionGuidance: null,
      operatorEquations: [],
      verificationTimeMs: Date.now() - startTime,
      mode,
      phase: 0,
      timestamp: new Date().toISOString(),
    };
  }
}

module.exports = {
  verifyResponse,
  THRESHOLDS,
};
