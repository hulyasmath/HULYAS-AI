const { logger } = require('@librechat/data-schemas');
const { SystemRoles } = require('librechat-data-provider');
const {
  getPlanByName,
  getPlanById,
  getAllPlans,
  createPlan,
  updatePlan,
  deletePlan,
} = require('~/models/Plan');
const { getTokensUsedMonthly, getRequestsUsedDaily, getUserUsageSummary } = require('~/models/Usage');
const { User } = require('~/db/models');
const { updateUser } = require('~/models');

/**
 * Check if user is admin
 */
const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  if (req.user.role !== SystemRoles.ADMIN) {
    return res.status(403).json({ message: 'Forbidden: Admin access required' });
  }
  next();
};

/**
 * GET /api/admin/plans
 * Get all plans
 */
const getPlans = async (req, res) => {
  try {
    const plans = await getAllPlans();
    res.status(200).json(plans);
  } catch (error) {
    logger.error('[getPlans] Error:', error);
    res.status(500).json({ message: 'Error fetching plans', error: error.message });
  }
};

/**
 * GET /api/plans/public
 * Get active plans for public access (registration)
 */
const getPublicPlans = async (req, res) => {
  try {
    const plans = await getAllPlans();
    // Return only essential fields for public display
    const publicPlans = plans.map((plan) => ({
      _id: plan._id,
      name: plan.name,
      displayName: plan.displayName,
      monthlyTokenLimit: plan.monthlyTokenLimit,
      dailyRequestLimit: plan.dailyRequestLimit,
      allowedEndpoints: plan.allowedEndpoints,
      isActive: plan.isActive,
    }));
    res.status(200).json(publicPlans);
  } catch (error) {
    logger.error('[getPublicPlans] Error:', error);
    res.status(500).json({ message: 'Error fetching plans', error: error.message });
  }
};

/**
 * GET /api/admin/plans/:planId
 * Get a specific plan
 */
const getPlan = async (req, res) => {
  try {
    const { planId } = req.params;
    const plan = await getPlanById(planId);
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }
    res.status(200).json(plan);
  } catch (error) {
    logger.error('[getPlan] Error:', error);
    res.status(500).json({ message: 'Error fetching plan', error: error.message });
  }
};

/**
 * POST /api/admin/plans
 * Create a new plan
 */
const createPlanController = async (req, res) => {
  try {
    const planData = req.body;
    const plan = await createPlan(planData);
    res.status(201).json(plan);
  } catch (error) {
    logger.error('[createPlanController] Error:', error);
    res.status(500).json({ message: 'Error creating plan', error: error.message });
  }
};

/**
 * PUT /api/admin/plans/:planId
 * Update a plan
 */
const updatePlanController = async (req, res) => {
  try {
    const { planId } = req.params;
    const updates = req.body;
    const plan = await updatePlan(planId, updates);
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }
    res.status(200).json(plan);
  } catch (error) {
    logger.error('[updatePlanController] Error:', error);
    res.status(500).json({ message: 'Error updating plan', error: error.message });
  }
};

/**
 * DELETE /api/admin/plans/:planId
 * Delete a plan (soft delete)
 */
const deletePlanController = async (req, res) => {
  try {
    const { planId } = req.params;
    const plan = await deletePlan(planId);
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }
    res.status(200).json({ message: 'Plan deleted successfully', plan });
  } catch (error) {
    logger.error('[deletePlanController] Error:', error);
    res.status(500).json({ message: 'Error deleting plan', error: error.message });
  }
};

/**
 * GET /api/admin/users/:userId/usage
 * Get usage summary for a user
 */
const getUserUsage = async (req, res) => {
  try {
    const { userId } = req.params;
    const usage = await getUserUsageSummary(userId);
    res.status(200).json(usage);
  } catch (error) {
    logger.error('[getUserUsage] Error:', error);
    res.status(500).json({ message: 'Error fetching user usage', error: error.message });
  }
};

/**
 * GET /api/admin/users/:userId/plan
 * Get user's current plan
 */
const getUserPlan = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).populate('planId').lean();
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let plan = user.planId;
    if (!plan) {
      // Default to free plan if no plan assigned
      plan = await getPlanByName('free');
    }

    const usage = await getUserUsageSummary(userId);

    res.status(200).json({
      plan: plan || null,
      usage,
      customTokenOverrides: user.customTokenOverrides || 0,
      stripeCustomerId: user.stripeCustomerId || null,
      stripeSubscriptionId: user.stripeSubscriptionId || null,
    });
  } catch (error) {
    logger.error('[getUserPlan] Error:', error);
    res.status(500).json({ message: 'Error fetching user plan', error: error.message });
  }
};

/**
 * PUT /api/admin/users/:userId/plan
 * Update user's plan
 */
const updateUserPlan = async (req, res) => {
  try {
    const { userId } = req.params;
    const { planId, customTokenOverrides, stripeCustomerId, stripeSubscriptionId } = req.body;

    const updates = {};
    if (planId !== undefined) {
      // Validate plan exists
      const plan = await getPlanById(planId);
      if (!plan) {
        return res.status(400).json({ message: 'Invalid plan ID' });
      }
      updates.planId = planId;
    }
    if (customTokenOverrides !== undefined) {
      updates.customTokenOverrides = customTokenOverrides;
    }
    if (stripeCustomerId !== undefined) {
      updates.stripeCustomerId = stripeCustomerId;
    }
    if (stripeSubscriptionId !== undefined) {
      updates.stripeSubscriptionId = stripeSubscriptionId;
    }

    await updateUser(userId, updates);
    const user = await User.findById(userId).populate('planId').lean();

    res.status(200).json({
      message: 'User plan updated successfully',
      user: {
        id: user._id,
        email: user.email,
        planId: user.planId,
        customTokenOverrides: user.customTokenOverrides,
        stripeCustomerId: user.stripeCustomerId,
        stripeSubscriptionId: user.stripeSubscriptionId,
      },
    });
  } catch (error) {
    logger.error('[updateUserPlan] Error:', error);
    res.status(500).json({ message: 'Error updating user plan', error: error.message });
  }
};

module.exports = {
  isAdmin,
  getPlans,
  getPlan,
  getPublicPlans,
  createPlanController,
  updatePlanController,
  deletePlanController,
  getUserUsage,
  getUserPlan,
  updateUserPlan,
};

