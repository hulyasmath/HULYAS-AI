const express = require('express');
const router = express.Router();
const { requireJwtAuth } = require('~/server/middleware');
const {
  saveTransparencyLog,
  getTransparencyLogs,
  exportTransparencyTranscript,
  deleteTransparencyLogs,
} = require('~/models/Transparency');
const { logger } = require('~/config');

/**
 * POST /api/transparency/log
 * Store a transparency log entry for a conversation
 */
router.post('/log', requireJwtAuth, async (req, res) => {
  try {
    const { conversationId, logEntry } = req.body;

    if (!conversationId || !logEntry) {
      logger.warn('Transparency log request missing required fields', { conversationId: !!conversationId, logEntry: !!logEntry });
      return res.status(400).json({ success: false, error: 'conversationId and logEntry are required' });
    }

    logger.info('📝 Saving transparency log', { 
      conversationId, 
      messageType: logEntry.messageType,
      userId: req.user?.id,
      hasUserQuery: !!logEntry.userQuery,
      hasAiResponse: !!logEntry.aiResponse,
    });

    const result = await saveTransparencyLog(req, conversationId, logEntry);
    
    logger.info('✅ Transparency log saved successfully', { 
      conversationId,
      entryCount: result.entries?.length || 0,
      totalEntries: result.entries?.length || 0
    });
    
    res.json({ success: true, transparencyLog: result });
  } catch (error) {
    logger.error('❌ Error saving transparency log:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to save transparency log' });
  }
});

/**
 * GET /api/transparency/:conversationId
 * Get all transparency logs for a conversation
 */
router.get('/:conversationId', requireJwtAuth, async (req, res) => {
  try {
    const { conversationId } = req.params;

    const transparencyLog = await getTransparencyLogs(req, conversationId);

    if (!transparencyLog) {
      return res.json({ success: true, transparencyLog: null, entries: [] });
    }

    res.json({
      success: true,
      transparencyLog,
      entries: transparencyLog.entries || [],
    });
  } catch (error) {
    logger.error('Error getting transparency logs:', error);
    res.status(500).json({ error: 'Failed to get transparency logs' });
  }
});

/**
 * GET /api/transparency/:conversationId/export
 * Export full transcript as JSON
 */
router.get('/:conversationId/export', requireJwtAuth, async (req, res) => {
  try {
    const { conversationId } = req.params;

    logger.info('📥 Export transparency request', { 
      conversationId, 
      userId: req.user?.id,
      method: req.method,
      path: req.path,
      originalUrl: req.originalUrl
    });

    if (!conversationId) {
      return res.status(400).json({ success: false, error: 'Conversation ID is required' });
    }

    const transcript = await exportTransparencyTranscript(req, conversationId);

    if (!transcript) {
      logger.info('📥 No transcript found', { conversationId, userId: req.user?.id });
      return res.status(404).json({ 
        success: false, 
        error: 'No transparency logs found for this conversation. Send a message first to generate transparency logs.' 
      });
    }

    logger.info('📥 Export successful', { 
      conversationId, 
      entryCount: transcript.metadata?.totalEntries || 0 
    });
    
    res.json({ success: true, transcript });
  } catch (error) {
    logger.error('❌ Error exporting transparency transcript:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to export transparency transcript' 
    });
  }
});

/**
 * DELETE /api/transparency/:conversationId
 * Clear logs for a conversation
 */
router.delete('/:conversationId', requireJwtAuth, async (req, res) => {
  try {
    const { conversationId } = req.params;

    const result = await deleteTransparencyLogs(req, conversationId);

    res.json({ success: true, deleted: result.deletedCount > 0 });
  } catch (error) {
    logger.error('Error deleting transparency logs:', error);
    res.status(500).json({ error: 'Failed to delete transparency logs' });
  }
});

module.exports = router;

