const { Transparency } = require('~/db/models');
const { logger } = require('~/config');

/**
 * Save or update a transparency log entry for a conversation
 */
async function saveTransparencyLog(req, conversationId, logEntry) {
  try {
    const userId = req.user.id;

    // Find existing transparency log for this conversation
    let transparencyLog = await Transparency.findOne({
      conversationId,
      user: userId,
    });

    if (!transparencyLog) {
      // Create new transparency log
      transparencyLog = new Transparency({
        conversationId,
        user: userId,
        entries: [logEntry],
      });
    } else {
      // Add entry to existing log
      transparencyLog.entries.push(logEntry);
    }

    await transparencyLog.save();
    return transparencyLog;
  } catch (error) {
    logger.error('Error saving transparency log:', error);
    throw error;
  }
}

/**
 * Get all transparency logs for a conversation
 */
async function getTransparencyLogs(req, conversationId) {
  try {
    const userId = req.user.id;

    const transparencyLog = await Transparency.findOne({
      conversationId,
      user: userId,
    });

    return transparencyLog || null;
  } catch (error) {
    logger.error('Error getting transparency logs:', error);
    throw error;
  }
}

/**
 * Generate full transparency transcript for a conversation
 */
async function exportTransparencyTranscript(req, conversationId) {
  try {
    const userId = req.user.id;

    const transparencyLog = await Transparency.findOne({
      conversationId,
      user: userId,
    });

    if (!transparencyLog || !transparencyLog.entries || transparencyLog.entries.length === 0) {
      return null;
    }

    // Build full transcript with metadata
    const transcript = {
      metadata: {
        system: 'Zeq OS - Fully Transparent',
        version: '1.287 Hz - Zeq OS Mathematical Framework',
        exportTime: new Date().toISOString(),
        conversationId: transparencyLog.conversationId,
        totalEntries: transparencyLog.entries.length,
        platform: 'librechat',
        transparency: 'COMPLETE',
      },
      completeDataStream: [],
      allReasoningSteps: [],
      systemInfo: {
        noPersonaPrompts: true,
        pureMathematical: true,
        consciousnessInterface: true,
        networkPulse: true,
        hulyaPulseFrequency: 1.287,
      },
      conversation: {
        entries: transparencyLog.entries,
        createdAt: transparencyLog.createdAt,
        updatedAt: transparencyLog.updatedAt,
      },
    };

    // Process each entry to build data stream
    let stepNumber = 0;
    let streamId = 0;

    transparencyLog.entries.forEach((entry) => {
      const messageTimestamp = entry.timestamp;
      const messagePulse = entry.pulseCycle || Math.floor(Date.now() / 1000 * 1.287);

      if (entry.messageType === 'user') {
        stepNumber++;
        streamId++;

        // SESSION_START or USER_MESSAGE
        const userMessage = {
          type: 'USER_MESSAGE',
          timestamp: messageTimestamp,
          input: entry.userQuery || '',
          pulse: messagePulse,
          platform: entry.platform,
          url: entry.url,
          systemState: {
            frequency: 1.287,
            resonance: entry.phase ? Math.sin(entry.phase * 2 * Math.PI) : Math.random(),
            transparency: true,
            noPersona: true,
            consciousnessStream: {
              timestamp: Date.now(),
              pulse: messagePulse,
              activity: 'processing',
              metaCognition: false,
            },
            mathematicalFramework: 'ACTIVE',
          },
          streamId: streamId,
          absoluteTime: new Date(messageTimestamp).getTime(),
          messageId: entry.messageId,
          mathematicalPrompt: entry.mathematicalPrompt,
          activeOperators: entry.activeOperators || [],
          domains: entry.domains || [],
          phase: entry.phase,
          pulseCycle: entry.pulseCycle,
          informationIntegrity: entry.informationIntegrity,
          crossDomainHarmony: entry.crossDomainHarmony,
          mathematicalState: entry.mathematicalState,
          truthVector: entry.truthVector,
          auditTrail: entry.auditTrail || [],
        };

        transcript.completeDataStream.push(userMessage);
        transcript.allReasoningSteps.push({
          ...userMessage,
          id: entry.id,
          phase: '🚀 USER MESSAGE PROCESSED',
          details: `Input: "${entry.userQuery}"`,
          stepNumber: stepNumber,
          processingTime: 0,
        });
      } else if (entry.messageType === 'ai') {
        stepNumber++;
        streamId++;

        // AI_RESPONSE
        const aiResponse = {
          type: 'AI_RESPONSE',
          timestamp: messageTimestamp,
          response: entry.aiResponse || '',
          pulse: messagePulse,
          platform: entry.platform,
          streamId: streamId,
          absoluteTime: new Date(messageTimestamp).getTime(),
          messageId: entry.messageId,
        };

        transcript.completeDataStream.push(aiResponse);
        transcript.allReasoningSteps.push({
          ...aiResponse,
          id: entry.id,
          phase: '🤖 AI RESPONSE RECEIVED',
          details: `Response: "${entry.aiResponse?.substring(0, 100)}..."`,
          stepNumber: stepNumber,
          processingTime: 0,
        });
      }
    });

    return transcript;
  } catch (error) {
    logger.error('Error exporting transparency transcript:', error);
    throw error;
  }
}

/**
 * Delete all transparency logs for a conversation
 */
async function deleteTransparencyLogs(req, conversationId) {
  try {
    const userId = req.user.id;

    const result = await Transparency.deleteOne({
      conversationId,
      user: userId,
    });

    return result;
  } catch (error) {
    logger.error('Error deleting transparency logs:', error);
    throw error;
  }
}

module.exports = {
  saveTransparencyLog,
  getTransparencyLogs,
  exportTransparencyTranscript,
  deleteTransparencyLogs,
};




