/**
 * ZeqAuditTrail Model - CRUD Operations
 * Handles audit trail storage and retrieval for the Zeq OS Mathematical Framework
 */

const { ZeqAuditTrail } = require('~/db/models');
const { logger } = require('~/config');

/**
 * Save a new audit trail entry
 * @param {Object} auditData - Audit trail data
 * @returns {Promise<Object>} - Saved audit trail entry
 */
async function saveAuditTrail(auditData) {
  try {
    const audit = new ZeqAuditTrail(auditData);
    await audit.save();
    return audit;
  } catch (error) {
    logger.error('[ZeqAuditTrail] Error saving audit trail:', error);
    throw error;
  }
}

/**
 * Get audit trail by message ID
 * @param {string} messageId - Message ID
 * @param {string} userId - User ID
 * @returns {Promise<Object|null>} - Audit trail or null
 */
async function getAuditTrailByMessageId(messageId, userId) {
  try {
    return await ZeqAuditTrail.findOne({ messageId, user: userId });
  } catch (error) {
    logger.error('[ZeqAuditTrail] Error getting audit trail:', error);
    throw error;
  }
}

/**
 * Get all audit trails for a conversation
 * @param {string} conversationId - Conversation ID
 * @param {string} userId - User ID
 * @param {Object} options - Query options (limit, skip, sort)
 * @returns {Promise<Object[]>} - Array of audit trails
 */
async function getAuditTrailsByConversation(conversationId, userId, options = {}) {
  try {
    const { limit = 50, skip = 0, sort = { createdAt: -1 } } = options;

    return await ZeqAuditTrail.find({ conversationId, user: userId })
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();
  } catch (error) {
    logger.error('[ZeqAuditTrail] Error getting audit trails:', error);
    throw error;
  }
}

/**
 * Get operator execution statistics
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - Operator statistics
 */
async function getOperatorStats(userId) {
  try {
    const stats = await ZeqAuditTrail.aggregate([
      { $match: { user: userId } },
      { $unwind: '$operatorExecutions' },
      {
        $group: {
          _id: '$operatorExecutions.operator',
          totalExecutions: { $sum: 1 },
          avgExecutionTime: { $avg: '$operatorExecutions.executionTimeMs' },
          successCount: {
            $sum: { $cond: ['$operatorExecutions.success', 1, 0] },
          },
          failureCount: {
            $sum: { $cond: ['$operatorExecutions.success', 0, 1] },
          },
        },
      },
      {
        $project: {
          operator: '$_id',
          totalExecutions: 1,
          avgExecutionTime: { $round: ['$avgExecutionTime', 2] },
          successCount: 1,
          failureCount: 1,
          successRate: {
            $round: [{ $multiply: [{ $divide: ['$successCount', '$totalExecutions'] }, 100] }, 2],
          },
        },
      },
      { $sort: { totalExecutions: -1 } },
    ]);

    return stats;
  } catch (error) {
    logger.error('[ZeqAuditTrail] Error getting operator stats:', error);
    throw error;
  }
}

/**
 * Get processing time statistics
 * @param {string} userId - User ID
 * @param {Date} startDate - Start date (optional)
 * @param {Date} endDate - End date (optional)
 * @returns {Promise<Object>} - Processing time statistics
 */
async function getProcessingTimeStats(userId, startDate, endDate) {
  try {
    const matchStage = { user: userId };
    if (startDate && endDate) {
      matchStage.createdAt = { $gte: startDate, $lte: endDate };
    }

    const stats = await ZeqAuditTrail.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalAudits: { $sum: 1 },
          avgProcessingTime: { $avg: '$totalProcessingTimeMs' },
          minProcessingTime: { $min: '$totalProcessingTimeMs' },
          maxProcessingTime: { $max: '$totalProcessingTimeMs' },
          avgOperatorCount: { $avg: '$operatorCount' },
          totalSuccessfulOperators: { $sum: '$successfulOperators' },
          totalFailedOperators: { $sum: '$failedOperators' },
        },
      },
    ]);

    if (stats.length === 0) {
      return {
        totalAudits: 0,
        avgProcessingTime: 0,
        minProcessingTime: 0,
        maxProcessingTime: 0,
        avgOperatorCount: 0,
        totalSuccessfulOperators: 0,
        totalFailedOperators: 0,
        overallSuccessRate: 0,
      };
    }

    const result = stats[0];
    const totalOperators = result.totalSuccessfulOperators + result.totalFailedOperators;
    const overallSuccessRate =
      totalOperators > 0
        ? Math.round((result.totalSuccessfulOperators / totalOperators) * 10000) / 100
        : 100;

    return {
      totalAudits: result.totalAudits,
      avgProcessingTime: Math.round(result.avgProcessingTime * 100) / 100,
      minProcessingTime: result.minProcessingTime,
      maxProcessingTime: result.maxProcessingTime,
      avgOperatorCount: Math.round(result.avgOperatorCount * 100) / 100,
      totalSuccessfulOperators: result.totalSuccessfulOperators,
      totalFailedOperators: result.totalFailedOperators,
      overallSuccessRate,
    };
  } catch (error) {
    logger.error('[ZeqAuditTrail] Error getting processing time stats:', error);
    throw error;
  }
}

/**
 * Delete audit trails for a conversation
 * @param {string} conversationId - Conversation ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - Delete result
 */
async function deleteAuditTrailsByConversation(conversationId, userId) {
  try {
    return await ZeqAuditTrail.deleteMany({ conversationId, user: userId });
  } catch (error) {
    logger.error('[ZeqAuditTrail] Error deleting audit trails:', error);
    throw error;
  }
}

/**
 * Delete audit trail by message ID
 * @param {string} messageId - Message ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - Delete result
 */
async function deleteAuditTrailByMessageId(messageId, userId) {
  try {
    return await ZeqAuditTrail.deleteOne({ messageId, user: userId });
  } catch (error) {
    logger.error('[ZeqAuditTrail] Error deleting audit trail:', error);
    throw error;
  }
}

module.exports = {
  saveAuditTrail,
  getAuditTrailByMessageId,
  getAuditTrailsByConversation,
  getOperatorStats,
  getProcessingTimeStats,
  deleteAuditTrailsByConversation,
  deleteAuditTrailByMessageId,
};
