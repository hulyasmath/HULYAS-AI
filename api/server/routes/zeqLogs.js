/**
 * Zeq OS Logs/Audit Routes
 * GET  /api/zeq/logs/:conversationId  - Get processing logs for a conversation
 * GET  /api/zeq/audit/:messageId      - Get audit trail for a message
 * GET  /api/zeq/stats                 - Get processing statistics
 * DELETE /api/zeq/logs/:conversationId - Delete logs for a conversation
 * GET  /api/zeq/export/:conversationId - Export logs for a conversation
 */

const express = require('express');
const router = express.Router();
const requireJwtAuth = require('~/server/middleware/requireJwtAuth');
const { logger } = require('~/config');

let auditTrailModule;
try {
  auditTrailModule = require('~/models/ZeqAuditTrail');
} catch (e) {
  logger.warn('[ZeqLogs] ZeqAuditTrail module not available:', e.message);
}

/**
 * GET /api/zeq/logs/:conversationId
 * Get all processing logs for a conversation
 */
router.get('/logs/:conversationId', requireJwtAuth, async (req, res) => {
  try {
    const { conversationId } = req.params;

    if (!auditTrailModule) {
      return res.json({ success: true, logs: [], message: 'Audit trail module not available' });
    }

    const logs = await auditTrailModule.getAuditTrailsByConversation(conversationId, req.user.id);
    res.json({ success: true, logs: logs || [] });
  } catch (error) {
    logger.error('[ZeqLogs] Error getting logs:', error);
    res.status(500).json({ error: 'Failed to get logs' });
  }
});

/**
 * GET /api/zeq/audit/:messageId
 * Get audit trail for a specific message
 */
router.get('/audit/:messageId', requireJwtAuth, async (req, res) => {
  try {
    const { messageId } = req.params;

    if (!auditTrailModule) {
      return res.json({ success: true, auditTrail: null, message: 'Audit trail module not available' });
    }

    const auditTrail = await auditTrailModule.getAuditTrailByMessageId(messageId, req.user.id);
    res.json({ success: true, auditTrail });
  } catch (error) {
    logger.error('[ZeqLogs] Error getting audit trail:', error);
    res.status(500).json({ error: 'Failed to get audit trail' });
  }
});

/**
 * GET /api/zeq/stats
 * Get processing statistics
 */
router.get('/stats', requireJwtAuth, async (req, res) => {
  try {
    if (!auditTrailModule) {
      return res.json({
        success: true,
        stats: {
          totalProcessed: 0,
          operatorStats: [],
          processingTimeStats: { avg: 0, min: 0, max: 0 },
        },
        message: 'Audit trail module not available',
      });
    }

    const [operatorStats, processingTimeStats] = await Promise.all([
      auditTrailModule.getOperatorStats ? auditTrailModule.getOperatorStats(req.user.id) : [],
      auditTrailModule.getProcessingTimeStats ? auditTrailModule.getProcessingTimeStats(req.user.id) : { avg: 0, min: 0, max: 0 },
    ]);

    res.json({
      success: true,
      stats: {
        operatorStats,
        processingTimeStats,
      },
    });
  } catch (error) {
    logger.error('[ZeqLogs] Error getting stats:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

/**
 * DELETE /api/zeq/logs/:conversationId
 * Delete all logs for a conversation
 */
router.delete('/logs/:conversationId', requireJwtAuth, async (req, res) => {
  try {
    const { conversationId } = req.params;

    if (!auditTrailModule) {
      return res.json({ success: true, deleted: false, message: 'Audit trail module not available' });
    }

    const result = await auditTrailModule.deleteAuditTrailsByConversation(conversationId, req.user.id);
    res.json({ success: true, deleted: (result && result.deletedCount > 0) || false });
  } catch (error) {
    logger.error('[ZeqLogs] Error deleting logs:', error);
    res.status(500).json({ error: 'Failed to delete logs' });
  }
});

/**
 * GET /api/zeq/export/:conversationId
 * Export logs for a conversation (includes transparency data)
 */
router.get('/export/:conversationId', requireJwtAuth, async (req, res) => {
  try {
    const { conversationId } = req.params;

    // Try to get both audit trails and transparency logs
    let auditTrails = [];
    let transparencyLog = null;

    if (auditTrailModule) {
      auditTrails = await auditTrailModule.getAuditTrailsByConversation(conversationId, req.user.id) || [];
    }

    try {
      const { getTransparencyLogs } = require('~/models/Transparency');
      transparencyLog = await getTransparencyLogs(req, conversationId);
    } catch (e) {
      // Transparency module may not be available
    }

    res.json({
      success: true,
      export: {
        conversationId,
        exportTime: new Date().toISOString(),
        auditTrails,
        transparencyLog: transparencyLog ? {
          entries: transparencyLog.entries || [],
          createdAt: transparencyLog.createdAt,
          updatedAt: transparencyLog.updatedAt,
        } : null,
        framework: {
          version: '1.287.31',
          pulseFrequency: 1.287,
          operatorCount: 1549,
        },
      },
    });
  } catch (error) {
    logger.error('[ZeqLogs] Error exporting logs:', error);
    res.status(500).json({ error: 'Failed to export logs' });
  }
});

module.exports = router;
