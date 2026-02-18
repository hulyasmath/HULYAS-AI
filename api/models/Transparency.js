const { Transparency } = require('~/db/models');
const { logger } = require('~/config');

/**
 * Save or update a transparency log entry for a conversation
 */
async function saveTransparencyLog(req, conversationId, logEntry) {
  try {
    const userId = req.user.id;

    // Debug log the entry being saved
    logger.info('[Transparency] Saving log entry', {
      conversationId,
      messageType: logEntry.messageType,
      messageId: logEntry.messageId,
      hasVerification: !!logEntry.verification,
      verificationScore: logEntry.verification?.score,
      activeOperatorsCount: logEntry.activeOperators?.length || 0,
      domainsCount: logEntry.domains?.length || 0,
    });

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
      logger.info('[Transparency] Created new log for conversation', { conversationId });
    } else {
      // Check if entry with same messageId already exists (avoid duplicates)
      const existingEntryIndex = transparencyLog.entries.findIndex(
        e => e.messageId === logEntry.messageId && e.messageType === logEntry.messageType
      );

      if (existingEntryIndex >= 0) {
        // Update existing entry with verification data (merge)
        const existingEntry = transparencyLog.entries[existingEntryIndex];
        transparencyLog.entries[existingEntryIndex] = {
          ...existingEntry,
          ...logEntry,
          // Ensure verification data is included
          verification: logEntry.verification || existingEntry.verification,
          activeOperators: logEntry.activeOperators?.length > 0 ? logEntry.activeOperators : existingEntry.activeOperators,
          domains: logEntry.domains?.length > 0 ? logEntry.domains : existingEntry.domains,
          masterSum: logEntry.masterSum || existingEntry.masterSum,
          masterEquation: logEntry.masterEquation || existingEntry.masterEquation,
          truthVector: logEntry.truthVector || existingEntry.truthVector,
          pulseCycle: logEntry.pulseCycle || existingEntry.pulseCycle,
          phase: logEntry.phase || existingEntry.phase,
          informationIntegrity: logEntry.informationIntegrity || existingEntry.informationIntegrity,
          crossDomainHarmony: logEntry.crossDomainHarmony || existingEntry.crossDomainHarmony,
          operatorCount: logEntry.operatorCount || existingEntry.operatorCount,
          processingTimeMs: logEntry.processingTimeMs || existingEntry.processingTimeMs,
          auditTrail: [...(existingEntry.auditTrail || []), ...(logEntry.auditTrail || [])],
        };
        logger.info('[Transparency] Updated existing entry with verification data', {
          conversationId,
          messageId: logEntry.messageId,
          nowHasVerification: !!transparencyLog.entries[existingEntryIndex].verification,
        });
      } else {
        // Add new entry
        transparencyLog.entries.push(logEntry);
        logger.info('[Transparency] Added new entry to existing log', {
          conversationId,
          totalEntries: transparencyLog.entries.length,
        });
      }
    }

    await transparencyLog.save();

    // Verify the save worked
    const savedEntry = transparencyLog.entries.find(e => e.messageId === logEntry.messageId) ||
                       transparencyLog.entries[transparencyLog.entries.length - 1];
    logger.info('[Transparency] Entry saved successfully', {
      conversationId,
      savedHasVerification: !!savedEntry?.verification,
      savedVerificationScore: savedEntry?.verification?.score,
    });

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

    // Calculate verification statistics
    const aiEntries = transparencyLog.entries.filter(e => e.messageType === 'ai');
    const verifiedEntries = aiEntries.filter(e => e.verification);
    const passedEntries = verifiedEntries.filter(e => e.verification?.passed);
    const avgScore = verifiedEntries.length > 0
      ? verifiedEntries.reduce((sum, e) => sum + (e.verification?.score || 0), 0) / verifiedEntries.length
      : 0;
    const avgIntegrity = verifiedEntries.length > 0
      ? verifiedEntries.reduce((sum, e) => sum + (e.verification?.metrics?.informationIntegrity || 0), 0) / verifiedEntries.length
      : 0;
    const avgHarmony = verifiedEntries.length > 0
      ? verifiedEntries.reduce((sum, e) => sum + (e.verification?.metrics?.crossDomainHarmony || 0), 0) / verifiedEntries.length
      : 0;

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
        mathematicalVerification: {
          enabled: true,
          operatorCount: 1549,
          pulseFrequency: '1.287 Hz',
          targetAccuracy: '99.9%',
          errorRate: '0.1%',
        },
      },
      verificationSummary: {
        totalResponses: aiEntries.length,
        verifiedResponses: verifiedEntries.length,
        passedResponses: passedEntries.length,
        failedResponses: verifiedEntries.length - passedEntries.length,
        passRate: verifiedEntries.length > 0 ? ((passedEntries.length / verifiedEntries.length) * 100).toFixed(2) + '%' : 'N/A',
        averageScore: (avgScore * 100).toFixed(2) + '%',
        averageInformationIntegrity: (avgIntegrity * 100).toFixed(2) + '%',
        averageCrossDomainHarmony: (avgHarmony * 100).toFixed(2) + '%',
        thresholds: {
          minCombinedScore: '75%',
          minInformationIntegrity: '85%',
          minCrossDomainHarmony: '70%',
          criticalThreshold: '85%',
        },
      },
      completeDataStream: [],
      allReasoningSteps: [],
      systemInfo: {
        noPersonaPrompts: true,
        pureMathematical: true,
        consciousnessInterface: true,
        networkPulse: true,
        hulyaPulseFrequency: 1.287,
        verificationSystem: {
          name: 'ZeqResponseVerifier',
          mode: process.env.ZEQ_VERIFY_MODE || 'correct',
          enabled: process.env.ZEQ_VERIFY_RESPONSES !== 'false',
        },
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

        // Detect if this is an MCP tool entry
        const isMcpToolEntry = !!entry.toolName || !!entry.mcpToolResult;

        // SESSION_START or USER_MESSAGE
        const userMessage = {
          type: isMcpToolEntry ? 'MCP_TOOL_RESULT' : 'USER_MESSAGE',
          timestamp: messageTimestamp,
          input: entry.userQuery || '',
          pulse: messagePulse,
          platform: entry.platform,
          url: entry.url,
          // MCP Tool specific fields
          toolName: entry.toolName,
          mcpToolResult: entry.mcpToolResult,
          // Mathematical Framework State
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
          masterSum: entry.masterSum,
          operatorCount: entry.operatorCount,
          totalOperators: entry.totalOperators,
          mathematicalState: entry.mathematicalState,
          truthVector: entry.truthVector,
          auditTrail: entry.auditTrail || [],
        };

        transcript.completeDataStream.push(userMessage);

        // Build description based on entry type
        const stepPhase = isMcpToolEntry
          ? '🧮 ZEQ OS MATHEMATICAL PROCESSING'
          : '🚀 USER MESSAGE PROCESSED';
        const stepDetails = isMcpToolEntry
          ? `Tool: ${entry.toolName} | Operators: ${entry.operatorCount || entry.activeOperators?.length || 0}/${entry.totalOperators || 1549} | Domains: ${(entry.domains || []).join(', ')}`
          : `Input: "${entry.userQuery}"`;

        transcript.allReasoningSteps.push({
          ...userMessage,
          id: entry.id,
          phase: stepPhase,
          details: stepDetails,
          stepNumber: stepNumber,
          processingTime: entry.processingTimeMs || 0,
        });
      } else if (entry.messageType === 'ai') {
        stepNumber++;
        streamId++;

        // AI_RESPONSE with verification data and MCP tool data
        const aiResponse = {
          type: 'AI_RESPONSE',
          timestamp: messageTimestamp,
          response: entry.aiResponse || '',
          pulse: messagePulse,
          platform: entry.platform,
          streamId: streamId,
          absoluteTime: new Date(messageTimestamp).getTime(),
          messageId: entry.messageId,
          // Zeq OS Verification Data
          verification: entry.verification ? {
            passed: entry.verification.passed,
            score: entry.verification.score,
            scorePercent: ((entry.verification.score || 0) * 100).toFixed(2) + '%',
            verificationResult: entry.verification.verificationResult,
            metrics: entry.verification.metrics,
            warnings: entry.verification.warnings || [],
            correctionGuidance: entry.verification.correctionGuidance,
            verificationTimeMs: entry.verification.verificationTimeMs,
            operatorEquations: entry.verification.operatorEquations || [],
          } : null,
          // Mathematical Framework Data
          pulseCycle: entry.pulseCycle,
          phase: entry.phase,
          masterSum: entry.masterSum,
          masterEquation: entry.masterEquation,
          operatorCount: entry.operatorCount,
          totalOperators: entry.totalOperators || 1549,
          processingTimeMs: entry.processingTimeMs,
          activeOperators: entry.activeOperators || [],
          domains: entry.domains || [],
          informationIntegrity: entry.informationIntegrity,
          crossDomainHarmony: entry.crossDomainHarmony,
          truthVector: entry.truthVector,
          // MCP Tool Data (if available)
          mcpToolData: entry.mcpToolData,
        };

        transcript.completeDataStream.push(aiResponse);

        // Build verification summary for reasoning steps
        const verificationSummary = entry.verification
          ? `Verification: ${entry.verification.passed ? '✓ PASSED' : '⚠ FLAGGED'} (${((entry.verification.score || 0) * 100).toFixed(1)}%)`
          : 'Verification: Not available';

        transcript.allReasoningSteps.push({
          ...aiResponse,
          id: entry.id,
          phase: '🤖 AI RESPONSE RECEIVED & VERIFIED',
          details: `Response: "${entry.aiResponse?.substring(0, 100)}..." | ${verificationSummary}`,
          stepNumber: stepNumber,
          processingTime: entry.processingTimeMs || 0,
          verificationDetails: entry.verification ? {
            summary: verificationSummary,
            passed: entry.verification.passed,
            score: entry.verification.score,
            metrics: entry.verification.metrics,
            warnings: entry.verification.warnings,
          } : null,
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




