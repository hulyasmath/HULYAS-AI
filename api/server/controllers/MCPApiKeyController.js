const crypto = require('crypto');
const { logger } = require('@librechat/data-schemas');
const { User } = require('~/db/models');
const MCPApiKey = require('~/server/models/MCPApiKey');
const { getPlanById } = require('~/models/Plan');

/**
 * Check if user has a paid plan (Pro or Enterprise) OR is an admin/owner.
 * Admins always get access regardless of their assigned plan, so the site
 * owner can generate API keys without needing a Stripe subscription.
 */
async function hasPaidPlan(userId) {
  try {
    const user = await User.findById(userId).populate('planId').lean();
    if (!user) {
      return false;
    }

    // Admins always have access — owner/operator of the platform
    const adminRoles = ['ADMIN', 'admin'];
    if (adminRoles.includes(user.role)) {
      logger.debug('[hasPaidPlan] Admin user — granting API key access', { userId });
      return true;
    }

    if (!user.planId) {
      return false;
    }

    const plan = user.planId;
    // Check if plan name indicates paid tier
    const paidPlans = ['pro', 'enterprise'];
    return paidPlans.includes(plan.name?.toLowerCase());
  } catch (error) {
    logger.error('[hasPaidPlan] Error:', error);
    return false;
  }
}

/**
 * Generate a secure API key
 */
function generateApiKey() {
  const randomBytes = crypto.randomBytes(32);
  const key = `zeq_${randomBytes.toString('base64url')}`;
  const prefix = key.substring(0, key.indexOf('_') + 1); // e.g., 'zeq_'
  return { key, prefix };
}

const mcpApiKeyController = {
  /**
   * POST /api/mcp/apikey/generate
   * Generate a new MCP API key for the current user (paid plans only).
   * Replaces any existing key.
   */
  generateApiKey: async (req, res) => {
    const userId = req.user.id;
    try {
      const isPaid = await hasPaidPlan(userId);
      if (!isPaid) {
        return res.status(403).json({
          message: 'MCP API key generation is only available for paid plans (Pro or Enterprise).',
        });
      }

      const { key, prefix } = generateApiKey();
      const keyHash = crypto.createHash('sha256').update(key).digest('hex');

      const newApiKey = await MCPApiKey.findOneAndUpdate(
        { userId },
        { userId, apiKey: keyHash, prefix, isActive: true, lastUsedAt: null },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      );

      // Return the actual key only once
      res.status(200).json({
        message: 'API key generated successfully',
        apiKey: key,
        prefix: newApiKey.prefix,
        createdAt: newApiKey.createdAt,
      });
    } catch (error) {
      logger.error('[generateApiKey] Error:', error);
      res.status(500).json({ message: 'Error generating API key', error: error.message });
    }
  },

  /**
   * GET /api/mcp/apikey
   * Get the current user's MCP API key (masked)
   */
  getApiKey: async (req, res) => {
    const userId = req.user.id;
    try {
      const apiKey = await MCPApiKey.findOne({ userId, isActive: true }).lean();
      if (!apiKey) {
        return res.status(200).json({ apiKey: null, message: 'No API key found' });
      }
      // Only return prefix and creation date for security
      res.status(200).json({
        prefix: apiKey.prefix,
        createdAt: apiKey.createdAt,
        lastUsedAt: apiKey.lastUsedAt,
      });
    } catch (error) {
      logger.error('[getApiKey] Error:', error);
      res.status(500).json({ message: 'Error fetching API key', error: error.message });
    }
  },

  /**
   * DELETE /api/mcp/apikey/revoke
   * Revoke the current user's MCP API key
   */
  revokeApiKey: async (req, res) => {
    const userId = req.user.id;
    try {
      const result = await MCPApiKey.findOneAndUpdate(
        { userId, isActive: true },
        { isActive: false },
        { new: true },
      );
      if (!result) {
        return res.status(404).json({ message: 'No active API key found to revoke' });
      }
      res.status(200).json({ message: 'API key revoked successfully' });
    } catch (error) {
      logger.error('[revokeApiKey] Error:', error);
      res.status(500).json({ message: 'Error revoking API key', error: error.message });
    }
  },

  /**
   * POST /api/mcp/validate-key
   * Middleware to validate an incoming API key for MCP server requests
   */
  validateApiKey: async (req, res) => {
    const apiKeyHeader = req.header('x-api-key') || req.header('authorization');
    if (!apiKeyHeader) {
      return res.status(401).json({ valid: false, message: 'Unauthorized: API key missing' });
    }

    const incomingKey = apiKeyHeader.startsWith('Bearer ')
      ? apiKeyHeader.substring(7)
      : apiKeyHeader;

    try {
      const keyHash = crypto.createHash('sha256').update(incomingKey).digest('hex');
      const mcpApiKey = await MCPApiKey.findOne({ apiKey: keyHash, isActive: true });

      if (!mcpApiKey) {
        return res.status(401).json({ valid: false, message: 'Unauthorized: Invalid or inactive API key' });
      }

      // Update lastUsedAt
      mcpApiKey.lastUsedAt = new Date();
      await mcpApiKey.save();

      res.status(200).json({
        valid: true,
      });
    } catch (error) {
      logger.error('[validateApiKey] Error:', error);
      res.status(500).json({ valid: false, message: 'Error validating API key', error: error.message });
    }
  },
};

module.exports = { mcpApiKeyController };
