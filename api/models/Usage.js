const { logger } = require('@librechat/data-schemas');
const { Transaction } = require('~/db/models');

/**
 * Get total tokens used by a user in the current month
 * @param {string|ObjectId} userId - The user ID
 * @param {Date} [periodStart] - Start of the period (defaults to start of current month)
 * @returns {Promise<number>} Total tokens used (prompt + completion)
 */
const getTokensUsedMonthly = async (userId, periodStart = null) => {
  try {
    const now = new Date();
    const startOfMonth = periodStart || new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // Sum all token transactions for this user in the current month
    // Transactions have negative rawAmount (they're debits), so we sum the absolute values
    const result = await Transaction.aggregate([
      {
        $match: {
          user: userId,
          createdAt: {
            $gte: startOfMonth,
            $lte: endOfMonth,
          },
          tokenType: { $in: ['prompt', 'completion'] },
        },
      },
      {
        $group: {
          _id: null,
          totalTokens: {
            $sum: { $abs: '$rawAmount' },
          },
        },
      },
    ]);

    const totalTokens = result.length > 0 ? result[0].totalTokens : 0;
    return totalTokens;
  } catch (error) {
    logger.error(`[getTokensUsedMonthly] Error calculating monthly tokens for user ${userId}:`, error);
    throw error;
  }
};

/**
 * Get total requests made by a user today
 * @param {string|ObjectId} userId - The user ID
 * @param {Date} [date] - Specific date (defaults to today)
 * @returns {Promise<number>} Total requests made today
 */
const getRequestsUsedDaily = async (userId, date = null) => {
  try {
    const targetDate = date || new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Count unique conversations created today
    // We'll count by unique conversationId
    // This is a simplified approach - you might want to track requests differently
    const result = await Transaction.aggregate([
      {
        $match: {
          user: userId,
          createdAt: {
            $gte: startOfDay,
            $lte: endOfDay,
          },
          conversationId: { $exists: true, $ne: null },
          tokenType: { $in: ['prompt', 'completion'] }, // Only count actual LLM requests
        },
      },
      {
        $group: {
          _id: '$conversationId',
        },
      },
      {
        $count: 'totalRequests',
      },
    ]);

    const totalRequests = result.length > 0 ? result[0].totalRequests : 0;
    return totalRequests;
  } catch (error) {
    logger.error(`[getRequestsUsedDaily] Error calculating daily requests for user ${userId}:`, error);
    throw error;
  }
};

/**
 * Get usage summary for a user (tokens and requests)
 * @param {string|ObjectId} userId - The user ID
 * @returns {Promise<{monthlyTokens: number, dailyRequests: number}>}
 */
const getUserUsageSummary = async (userId) => {
  try {
    const [monthlyTokens, dailyRequests] = await Promise.all([
      getTokensUsedMonthly(userId),
      getRequestsUsedDaily(userId),
    ]);

    return {
      monthlyTokens,
      dailyRequests,
    };
  } catch (error) {
    logger.error(`[getUserUsageSummary] Error getting usage summary for user ${userId}:`, error);
    throw error;
  }
};

module.exports = {
  getTokensUsedMonthly,
  getRequestsUsedDaily,
  getUserUsageSummary,
};

