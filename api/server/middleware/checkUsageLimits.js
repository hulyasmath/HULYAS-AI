const { logger } = require('@librechat/data-schemas');
const { ErrorTypes } = require('librechat-data-provider');
const { getPlanById, getPlanByName } = require('~/models/Plan');
const { getTokensUsedMonthly, getRequestsUsedDaily } = require('~/models/Usage');
const { User } = require('~/db/models');

/**
 * Check if user has exceeded their plan limits
 * @param {Object} req - Express request object
 * @param {Object} options - Options for limit checking
 * @param {string} options.endpoint - The endpoint being used (e.g. 'DeepSeek', 'OpenRouter')
 * @param {string} [options.model] - The model being used
 * @param {number} [options.estimatedTokens] - Estimated tokens for this request
 * @returns {Promise<{allowed: boolean, reason?: string, warning?: boolean}>}
 */
const checkUsageLimits = async (req, { endpoint, model, estimatedTokens = 0 }) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return { allowed: false, reason: 'User not authenticated' };
    }

    // Get user with plan populated
    const user = await User.findById(userId).populate('planId').lean();
    if (!user) {
      return { allowed: false, reason: 'User not found' };
    }

    // If user has no plan, default to 'free'
    let plan = user.planId;
    if (!plan) {
      plan = await getPlanByName('free');
      if (!plan) {
        logger.warn('[checkUsageLimits] Free plan not found, allowing request');
        return { allowed: true }; // Fail open if no plan exists
      }
    }

    // Check endpoint restriction
    if (!plan.allowedEndpoints || !Array.isArray(plan.allowedEndpoints)) {
      logger.warn(`[checkUsageLimits] Plan ${plan.name} has invalid allowedEndpoints`);
      return { allowed: true }; // Fail open
    }

    if (!plan.allowedEndpoints.includes(endpoint)) {
      return {
        allowed: false,
        reason: `Your ${plan.displayName || plan.name} plan does not allow access to ${endpoint}. Please upgrade your plan to use this endpoint.`,
      };
    }

    // Check model restriction if specified
    if (plan.allowedModels && typeof plan.allowedModels === 'object' && model) {
      const allowedModelsForEndpoint = plan.allowedModels[endpoint];
      if (Array.isArray(allowedModelsForEndpoint) && !allowedModelsForEndpoint.includes(model)) {
        return {
          allowed: false,
          reason: `Your ${plan.displayName || plan.name} plan does not allow the model ${model} on ${endpoint}.`,
        };
      }
    }

    // Check monthly token limit
    if (plan.monthlyTokenLimit !== null && plan.monthlyTokenLimit !== undefined) {
      const tokensUsed = await getTokensUsedMonthly(userId);
      const customOverrides = user.customTokenOverrides || 0;
      const effectiveLimit = plan.monthlyTokenLimit + customOverrides;
      const tokensAfterRequest = tokensUsed + estimatedTokens;

      if (tokensAfterRequest > effectiveLimit) {
        if (plan.hardLimit) {
          return {
            allowed: false,
            reason: `You've reached your ${plan.displayName || plan.name} monthly token limit (${effectiveLimit.toLocaleString()} tokens). You've used ${tokensUsed.toLocaleString()} tokens this month. Please upgrade your plan or wait until next month.`,
          };
        } else {
          // Soft limit - warn but allow
          return {
            allowed: true,
            warning: true,
            reason: `Warning: You're approaching your ${plan.displayName || plan.name} monthly token limit. You've used ${tokensUsed.toLocaleString()} of ${effectiveLimit.toLocaleString()} tokens.`,
          };
        }
      }
    }

    // Check daily request limit
    if (plan.dailyRequestLimit !== null && plan.dailyRequestLimit !== undefined) {
      const requestsUsed = await getRequestsUsedDaily(userId);
      if (requestsUsed >= plan.dailyRequestLimit) {
        if (plan.hardLimit) {
          return {
            allowed: false,
            reason: `You've reached your ${plan.displayName || plan.name} daily request limit (${plan.dailyRequestLimit} requests). You've made ${requestsUsed} requests today. Please upgrade your plan or try again tomorrow.`,
          };
        } else {
          // Soft limit - warn but allow
          return {
            allowed: true,
            warning: true,
            reason: `Warning: You're approaching your ${plan.displayName || plan.name} daily request limit. You've made ${requestsUsed} of ${plan.dailyRequestLimit} requests today.`,
          };
        }
      }
    }

    // All checks passed
    return { allowed: true };
  } catch (error) {
    logger.error('[checkUsageLimits] Error checking usage limits:', error);
    // Fail open on error to avoid blocking legitimate requests
    return { allowed: true };
  }
};

/**
 * Express middleware to check usage limits before processing a request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const checkUsageLimitsMiddleware = async (req, res, next) => {
  try {
    const endpoint = req.body?.endpoint || req.body?.endpointOption?.endpoint;
    const model = req.body?.model || req.body?.endpointOption?.model;
    const estimatedTokens = req.body?.estimatedTokens || 0;

    if (!endpoint) {
      // If no endpoint specified, skip check (might be a non-LLM request)
      return next();
    }

    const result = await checkUsageLimits(req, { endpoint, model, estimatedTokens });

    if (!result.allowed) {
      return res.status(402).json({
        type: ErrorTypes.USAGE_LIMIT_EXCEEDED,
        message: result.reason || 'Usage limit exceeded',
      });
    }

    // If warning, add it to response headers for frontend to display
    if (result.warning) {
      res.setHeader('X-Usage-Warning', result.reason || 'Approaching usage limit');
    }

    next();
  } catch (error) {
    logger.error('[checkUsageLimitsMiddleware] Error:', error);
    // Fail open on error
    next();
  }
};

module.exports = {
  checkUsageLimits,
  checkUsageLimitsMiddleware,
};

