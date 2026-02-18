/**
 * ZeqProcessingLog Model - CRUD Operations
 * Handles processing log storage and retrieval for the Zeq OS Mathematical Framework
 */

const { ZeqProcessingLog } = require('~/db/models');
const { logger } = require('~/config');

/**
 * Save a new processing log entry
 * @param {Object} logData - Processing log data
 * @returns {Promise<Object>} - Saved log entry
 */
async function saveProcessingLog(logData) {
  try {
    const log = new ZeqProcessingLog(logData);
    await log.save();
    return log;
  } catch (error) {
    logger.error('[ZeqProcessingLog] Error saving processing log:', error);
    throw error;
  }
}

/**
 * Get processing log by message ID
 * @param {string} messageId - Message ID
 * @param {string} userId - User ID
 * @returns {Promise<Object|null>} - Processing log or null
 */
async function getProcessingLogByMessageId(messageId, userId) {
  try {
    return await ZeqProcessingLog.findOne({ messageId, user: userId });
  } catch (error) {
    logger.error('[ZeqProcessingLog] Error getting processing log:', error);
    throw error;
  }
}

/**
 * Get all processing logs for a conversation
 * @param {string} conversationId - Conversation ID
 * @param {string} userId - User ID
 * @param {Object} options - Query options (limit, skip, sort)
 * @returns {Promise<Object[]>} - Array of processing logs
 */
async function getProcessingLogsByConversation(conversationId, userId, options = {}) {
  try {
    const { limit = 50, skip = 0, sort = { createdAt: -1 } } = options;

    return await ZeqProcessingLog.find({ conversationId, user: userId })
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();
  } catch (error) {
    logger.error('[ZeqProcessingLog] Error getting processing logs:', error);
    throw error;
  }
}

/**
 * Get processing logs by date range
 * @param {string} userId - User ID
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @param {Object} options - Query options
 * @returns {Promise<Object[]>} - Array of processing logs
 */
async function getProcessingLogsByDateRange(userId, startDate, endDate, options = {}) {
  try {
    const { limit = 100, skip = 0 } = options;

    return await ZeqProcessingLog.find({
      user: userId,
      createdAt: { $gte: startDate, $lte: endDate },
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
  } catch (error) {
    logger.error('[ZeqProcessingLog] Error getting processing logs by date:', error);
    throw error;
  }
}

/**
 * Get processing statistics for a user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - Statistics object
 */
async function getProcessingStats(userId) {
  try {
    const stats = await ZeqProcessingLog.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: null,
          totalProcessed: { $sum: 1 },
          avgProcessingTime: { $avg: '$processingTimeMs' },
          avgOperatorCount: { $avg: { $size: '$operators' } },
          avgInformationIntegrity: { $avg: '$informationIntegrity' },
          avgCrossDomainHarmony: { $avg: '$crossDomainHarmony' },
          avgMasterSum: { $avg: '$masterSum' },
          domains: { $addToSet: '$domains' },
        },
      },
    ]);

    if (stats.length === 0) {
      return {
        totalProcessed: 0,
        avgProcessingTime: 0,
        avgOperatorCount: 0,
        avgInformationIntegrity: 0,
        avgCrossDomainHarmony: 0,
        avgMasterSum: 0,
        uniqueDomains: [],
      };
    }

    const result = stats[0];
    // Flatten domains array
    const uniqueDomains = [...new Set(result.domains.flat())];

    return {
      totalProcessed: result.totalProcessed,
      avgProcessingTime: Math.round(result.avgProcessingTime * 100) / 100,
      avgOperatorCount: Math.round(result.avgOperatorCount * 100) / 100,
      avgInformationIntegrity: Math.round(result.avgInformationIntegrity * 1000) / 1000,
      avgCrossDomainHarmony: Math.round(result.avgCrossDomainHarmony * 1000) / 1000,
      avgMasterSum: Math.round(result.avgMasterSum * 1000000) / 1000000,
      uniqueDomains,
    };
  } catch (error) {
    logger.error('[ZeqProcessingLog] Error getting processing stats:', error);
    throw error;
  }
}

/**
 * Delete processing logs for a conversation
 * @param {string} conversationId - Conversation ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - Delete result
 */
async function deleteProcessingLogsByConversation(conversationId, userId) {
  try {
    return await ZeqProcessingLog.deleteMany({ conversationId, user: userId });
  } catch (error) {
    logger.error('[ZeqProcessingLog] Error deleting processing logs:', error);
    throw error;
  }
}

/**
 * Delete processing log by message ID
 * @param {string} messageId - Message ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - Delete result
 */
async function deleteProcessingLogByMessageId(messageId, userId) {
  try {
    return await ZeqProcessingLog.deleteOne({ messageId, user: userId });
  } catch (error) {
    logger.error('[ZeqProcessingLog] Error deleting processing log:', error);
    throw error;
  }
}

module.exports = {
  saveProcessingLog,
  getProcessingLogByMessageId,
  getProcessingLogsByConversation,
  getProcessingLogsByDateRange,
  getProcessingStats,
  deleteProcessingLogsByConversation,
  deleteProcessingLogByMessageId,
};
