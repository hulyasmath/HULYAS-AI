const { logger } = require('@librechat/data-schemas');
const { Plan } = require('~/db/models');

/**
 * Get a plan by name
 * @param {string} planName - The name of the plan (e.g. 'free', 'pro', 'enterprise')
 * @returns {Promise<IPlan | null>}
 */
const getPlanByName = async (planName) => {
  try {
    const plan = await Plan.findOne({ name: planName.toLowerCase(), isActive: true }).lean();
    return plan;
  } catch (error) {
    logger.error(`[getPlanByName] Error fetching plan ${planName}:`, error);
    throw error;
  }
};

/**
 * Get a plan by ID
 * @param {string|ObjectId} planId - The plan ID
 * @returns {Promise<IPlan | null>}
 */
const getPlanById = async (planId) => {
  try {
    const plan = await Plan.findById(planId).lean();
    return plan;
  } catch (error) {
    logger.error(`[getPlanById] Error fetching plan ${planId}:`, error);
    throw error;
  }
};

/**
 * Get all active plans
 * @returns {Promise<IPlan[]>}
 */
const getAllPlans = async () => {
  try {
    const plans = await Plan.find({ isActive: true }).sort({ name: 1 }).lean();
    return plans;
  } catch (error) {
    logger.error('[getAllPlans] Error fetching plans:', error);
    throw error;
  }
};

/**
 * Create a new plan
 * @param {Object} planData - Plan data
 * @returns {Promise<IPlan>}
 */
const createPlan = async (planData) => {
  try {
    const plan = await Plan.create(planData);
    return plan.toObject();
  } catch (error) {
    logger.error('[createPlan] Error creating plan:', error);
    throw error;
  }
};

/**
 * Update a plan
 * @param {string|ObjectId} planId - The plan ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<IPlan | null>}
 */
const updatePlan = async (planId, updates) => {
  try {
    const plan = await Plan.findByIdAndUpdate(planId, { $set: updates }, { new: true }).lean();
    return plan;
  } catch (error) {
    logger.error(`[updatePlan] Error updating plan ${planId}:`, error);
    throw error;
  }
};

/**
 * Delete a plan (soft delete by setting isActive to false)
 * @param {string|ObjectId} planId - The plan ID
 * @returns {Promise<IPlan | null>}
 */
const deletePlan = async (planId) => {
  try {
    const plan = await Plan.findByIdAndUpdate(planId, { $set: { isActive: false } }, { new: true }).lean();
    return plan;
  } catch (error) {
    logger.error(`[deletePlan] Error deleting plan ${planId}:`, error);
    throw error;
  }
};

/**
 * Seed default plans (Free, Pro, Enterprise)
 * @returns {Promise<void>}
 */
const seedDefaultPlans = async () => {
  try {
    const defaultPlans = [
      {
        name: 'free',
        displayName: 'Free Plan',
        monthlyTokenLimit: 10000000, // 10M tokens
        dailyRequestLimit: 1000,
        allowedEndpoints: ['DeepSeek', 'OpenRouter', 'agents', 'groq', 'openAI'],
        hardLimit: false,
        isActive: true,
      },
      {
        name: 'pro',
        displayName: 'Pro Plan',
        monthlyTokenLimit: 1000000, // 1M tokens
        dailyRequestLimit: 2000,
        allowedEndpoints: ['DeepSeek', 'OpenRouter', 'agents', 'groq', 'openAI'],
        hardLimit: true,
        isActive: true,
      },
      {
        name: 'enterprise',
        displayName: 'Enterprise Plan',
        monthlyTokenLimit: null, // Unlimited (or set a very high number)
        dailyRequestLimit: null, // Unlimited (or set a very high number)
        allowedEndpoints: ['DeepSeek', 'OpenRouter', 'agents', 'groq', 'openAI'],
        hardLimit: true,
        isActive: true,
      },
    ];

    for (const planData of defaultPlans) {
      const existing = await Plan.findOne({ name: planData.name });
      if (!existing) {
        await Plan.create(planData);
        logger.info(`[seedDefaultPlans] Created plan: ${planData.name}`);
      } else {
        // Always update existing plans to ensure allowedEndpoints and limits are current
        await Plan.findOneAndUpdate(
          { name: planData.name },
          { $set: planData },
          { new: true },
        );
        logger.info(`[seedDefaultPlans] Updated plan: ${planData.name}`);
      }
    }
  } catch (error) {
    logger.error('[seedDefaultPlans] Error seeding default plans:', error);
    throw error;
  }
};

module.exports = {
  getPlanByName,
  getPlanById,
  getAllPlans,
  createPlan,
  updatePlan,
  deletePlan,
  seedDefaultPlans,
};

