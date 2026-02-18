/**
 * Zeq OS Process Routes
 * POST /api/zeq/process - Process a query through the mathematical framework
 * POST /api/zeq/verify  - Verify an AI response via Forensic Intelligence
 * GET  /api/zeq/status  - Get framework status
 */

const express = require('express');
const router = express.Router();
const requireJwtAuth = require('~/server/middleware/requireJwtAuth');
const { scoreForensicIntelligence } = require('~/server/services/ForensicIntelligence');
const { verifyResponse } = require('~/server/services/ZeqResponseVerifier');
const { logger } = require('~/config');

const PULSE_FREQUENCY = 1.287;
const OPERATOR_COUNT = 1549;

/**
 * Domain detection keywords (subset of ZeqProcessor)
 */
const DOMAIN_KEYWORDS = {
  QuantumMechanics: ['quantum', 'wave function', 'entanglement', 'superposition', 'qubit'],
  Mathematics: ['math', 'calculus', 'algebra', 'geometry', 'theorem', 'proof', 'equation'],
  Physics: ['physics', 'force', 'energy', 'mass', 'velocity', 'gravity', 'relativity'],
  ComputerScience: ['algorithm', 'computer', 'code', 'programming', 'software', 'ai', 'ml'],
  Biology: ['biology', 'cell', 'dna', 'evolution', 'organism', 'gene'],
  Chemistry: ['chemistry', 'molecule', 'atom', 'reaction', 'bond', 'element'],
  NeuroscienceCognition: ['brain', 'neuron', 'cognitive', 'consciousness', 'neural'],
  Philosophy: ['philosophy', 'ethics', 'ontology', 'epistemology', 'logic'],
  Economics: ['economy', 'market', 'finance', 'investment', 'inflation'],
  Medicine: ['medicine', 'health', 'disease', 'treatment', 'diagnosis'],
};

/**
 * Detect domains from query text
 */
function detectDomains(query) {
  const lower = query.toLowerCase();
  const scores = {};
  for (const [domain, keywords] of Object.entries(DOMAIN_KEYWORDS)) {
    const count = keywords.filter(k => lower.includes(k)).length;
    if (count > 0) scores[domain] = count;
  }
  const sorted = Object.entries(scores).sort(([, a], [, b]) => b - a);
  return {
    primaryDomain: sorted[0]?.[0] || 'General',
    subDomains: sorted.slice(1, 4).map(([d]) => d),
    confidence: sorted.length > 0 ? Math.min(1, sorted[0][1] / 5) : 0.1,
  };
}

/**
 * Calculate truth vector components
 */
function calculateTruthVector(query, operatorCount, domainResult) {
  const consciousnessField = Math.min(1, (query.length / 500) * domainResult.confidence);
  const informationIntegrity = Math.min(1, operatorCount / 20) * domainResult.confidence;
  const harmonyIndex = domainResult.subDomains.length > 0 ? 1 / (1 + domainResult.subDomains.length * 0.1) : 1;
  const domainCoherence = domainResult.confidence;
  const temporalStability = 1;
  const quantumEntanglement = Math.min(1, operatorCount / 30);

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
 * POST /api/zeq/process
 * Process a query through the Zeq OS mathematical framework
 */
router.post('/process', requireJwtAuth, async (req, res) => {
  try {
    const { query } = req.body;
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'query is required and must be a string' });
    }

    const startTime = Date.now();
    const now = Date.now() / 1000;
    const phase = (now * PULSE_FREQUENCY) % 1;
    const pulseCycle = Math.floor(now * PULSE_FREQUENCY);

    // Domain detection
    const domainResult = detectDomains(query);

    // Calculate truth vector
    const truthVector = calculateTruthVector(query, 15, domainResult);

    // Cross-domain harmony
    const crossDomainHarmony = domainResult.subDomains.length === 0
      ? 1
      : Math.max(0.5, 1 - (domainResult.subDomains.length - 1) * 0.1);

    // Master sum
    const vectorSum = Object.values(truthVector).reduce((a, b) => a + b, 0) / 6;
    const masterSum = vectorSum * crossDomainHarmony * Math.min(1, 15 / 20) * PULSE_FREQUENCY;

    const processingTimeMs = Date.now() - startTime;

    res.json({
      success: true,
      result: {
        originalQuery: query,
        domains: [domainResult.primaryDomain, ...domainResult.subDomains],
        truthVector,
        informationIntegrity: truthVector.informationIntegrity,
        crossDomainHarmony,
        masterSum,
        masterEquation: `HULYAS(Ω) = ∫∫∫ [Σᵢ₌₁^${OPERATOR_COUNT} Oᵢ(x,y,z,t)] · Ψ(f=${PULSE_FREQUENCY}Hz) dxdydzdt = ${masterSum.toFixed(6)}`,
        pulseCycle,
        phase,
        processingTimeMs,
        operatorCount: OPERATOR_COUNT,
      },
    });
  } catch (error) {
    logger.error('[ZeqProcess] Error processing query:', error);
    res.status(500).json({ error: 'Failed to process query' });
  }
});

/**
 * POST /api/zeq/verify
 * Verify an AI response through Forensic Intelligence
 */
router.post('/verify', requireJwtAuth, async (req, res) => {
  try {
    const { query, response, frameworkState } = req.body;
    if (!query || typeof query !== 'string' || !response || typeof response !== 'string') {
      return res.status(400).json({ error: 'query and response are required and must be strings' });
    }

    const verification = verifyResponse(query, response, frameworkState || {});

    res.json({
      success: true,
      verification,
    });
  } catch (error) {
    logger.error('[ZeqProcess] Error verifying response:', error);
    res.status(500).json({ error: 'Failed to verify response' });
  }
});

/**
 * POST /api/zeq/detect-domains
 * Detect domains from query text
 */
router.post('/detect-domains', requireJwtAuth, async (req, res) => {
  try {
    const { query } = req.body;
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'query is required and must be a string' });
    }

    const result = detectDomains(query);
    res.json({ success: true, ...result });
  } catch (error) {
    logger.error('[ZeqProcess] Error detecting domains:', error);
    res.status(500).json({ error: 'Failed to detect domains' });
  }
});

/**
 * GET /api/zeq/status
 * Get framework status
 */
router.get('/status', async (req, res) => {
  const now = Date.now() / 1000;
  res.json({
    status: 'active',
    version: '1.287.31',
    pulseFrequency: PULSE_FREQUENCY,
    operatorCount: OPERATOR_COUNT,
    domainCount: 34,
    phase: (now * PULSE_FREQUENCY) % 1,
    pulseCycle: Math.floor(now * PULSE_FREQUENCY),
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /api/zeq/fi-score
 * Get Forensic Intelligence score for a query/response pair
 */
router.post('/fi-score', requireJwtAuth, async (req, res) => {
  try {
    const { query, response, domains, activeOperators, truthVector } = req.body;
    if (!query || typeof query !== 'string' || !response || typeof response !== 'string') {
      return res.status(400).json({ error: 'query and response are required and must be strings' });
    }

    const fiResult = scoreForensicIntelligence(query, response, {
      domains,
      activeOperators,
      truthVector,
    });

    res.json({ success: true, forensicIntelligence: fiResult });
  } catch (error) {
    logger.error('[ZeqProcess] Error computing FI score:', error);
    res.status(500).json({ error: 'Failed to compute FI score' });
  }
});

module.exports = router;
