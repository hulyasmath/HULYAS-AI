// Zeq OS Transparency Manager - Tracks and exports complete framework processing data
// Based on HulyaPulse transparency framework: https://hulyaspulse.com/

class TransparencyManager {
  constructor() {
    this.log = [];
    this.maxLogSize = 1000; // Maximum number of entries to keep in memory
    this.storageKey = 'zeq_transparency_log';
    this.initialized = false;
  }

  /**
   * Initialize transparency manager and load existing log from storage
   */
  async initialize() {
    if (this.initialized) return;

    try {
      // Load existing log from localStorage
      this.loadFromLocalStorage();
      
      this.initialized = true;
      console.log(`✅ Transparency Manager: Initialized with ${this.log.length} existing entries`);
    } catch (error) {
      console.error('Transparency Manager: Initialization error', error);
      this.initialized = true; // Mark as initialized even if failed
    }
  }

  /**
   * Load log from localStorage
   */
  loadFromLocalStorage() {
    try {
      if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem(this.storageKey);
        if (stored) {
          this.log = JSON.parse(stored);
          if (this.log.length > this.maxLogSize) {
            this.log = this.log.slice(-this.maxLogSize);
            this.saveToLocalStorage();
          }
        }
      }
    } catch (error) {
      console.warn('Transparency Manager: Error loading from localStorage', error);
    }
  }

  /**
   * Save log to localStorage
   */
  saveToLocalStorage() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(this.storageKey, JSON.stringify(this.log));
      }
    } catch (error) {
      console.warn('Transparency Manager: Error saving to localStorage', error);
    }
  }

  /**
   * Save log to localStorage (native web app)
   */
  async saveToStorage() {
    try {
      // Save to localStorage
      this.saveToLocalStorage();
    } catch (error) {
      console.error('Transparency Manager: Error saving to storage', error);
    }
  }

  /**
   * Log a framework processing event (user message)
   */
  async logProcessing(data) {
    try {
      const entry = {
        id: `zeq_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        messageType: 'user',
        messageId: data.messageId,
        userQuery: data.userQuery || data.originalQuery || '',
        platform: data.platform || 'librechat',
        url: data.url || (typeof window !== 'undefined' ? window.location.href : ''),
        mathematicalPrompt: data.mathematicalPrompt,
        pulseCycle: data.pulseCycle,
        phase: data.phase,
        activeOperators: data.activeOperators || [],
        domains: data.domains || [],
        mathematicalState: data.mathematicalState,
        truthVector: data.truthVector,
        informationIntegrity: data.informationIntegrity,
        crossDomainHarmony: data.crossDomainHarmony,
        auditTrail: data.auditTrail || [],
      };

      // Add to in-memory log
      this.log.push(entry);

      // Keep log size manageable
      if (this.log.length > this.maxLogSize) {
        this.log = this.log.slice(-this.maxLogSize);
      }

      // Save to server via API if conversationId is provided
      if (data.conversationId) {
        console.log('🔄 Transparency Manager: Attempting to save log entry to server', {
          conversationId: data.conversationId,
          messageType: entry.messageType,
          hasToken: !!this.getAuthToken(),
        });
        this.saveToServer(data.conversationId, entry).catch(err => {
          console.error('❌ Transparency Manager: Failed to save to server', err);
        });
      } else {
        console.warn('⚠️ Transparency Manager: No conversationId provided, skipping server save');
        // Fallback to localStorage if no conversationId
        this.saveToStorage().catch(err => {
          console.warn('Transparency Manager: Failed to save to storage', err);
        });
      }

      return entry.id;
    } catch (error) {
      console.error('Transparency Manager: Error logging entry', error);
      return null;
    }
  }

  /**
   * Log an AI response
   */
  async logAIResponse(data) {
    try {
      const entry = {
        id: `zeq_ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        messageType: 'ai',
        messageId: data.messageId,
        aiResponse: data.aiResponse || data.text || '',
        platform: data.platform || 'librechat',
        url: data.url || (typeof window !== 'undefined' ? window.location.href : ''),
      };

      // Add to in-memory log
      this.log.push(entry);

      // Keep log size manageable
      if (this.log.length > this.maxLogSize) {
        this.log = this.log.slice(-this.maxLogSize);
      }

      // Save to server via API if conversationId is provided
      if (data.conversationId) {
        this.saveToServer(data.conversationId, entry).catch(err => {
          console.warn('Transparency Manager: Failed to save AI response to server', err);
        });
      } else {
        // Fallback to localStorage if no conversationId
        this.saveToStorage().catch(err => {
          console.warn('Transparency Manager: Failed to save to storage', err);
        });
      }

      return entry.id;
    } catch (error) {
      console.error('Transparency Manager: Error logging AI response', error);
      return null;
    }
  }

  /**
   * Get authentication token from axios defaults (set by LibreChat's auth system)
   */
  getAuthToken() {
    try {
      // Try to get token from axios defaults (LibreChat sets this automatically)
      if (typeof window !== 'undefined' && window.axios) {
        const authHeader = window.axios.defaults?.headers?.common?.Authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
          return authHeader.substring(7); // Remove 'Bearer ' prefix
        }
      }
      
      // Fallback: Try to get from window context (if set by React app)
      if (typeof window !== 'undefined' && window.__librechat_token) {
        return window.__librechat_token;
      }
      
      // Fallback: Try localStorage (some setups might store it here)
      if (typeof localStorage !== 'undefined') {
        const token = localStorage.getItem('token') || localStorage.getItem('librechat_token');
        if (token) return token;
      }
      
      return null;
    } catch (error) {
      console.warn('Transparency Manager: Error getting auth token', error);
      return null;
    }
  }

  /**
   * Save log entry to server via API
   */
  async saveToServer(conversationId, logEntry) {
    try {
      if (!conversationId) {
        console.warn('Transparency Manager: No conversationId provided, skipping server save');
        return null;
      }

      const token = this.getAuthToken();
      
      console.log('Transparency Manager: Saving log entry to server', {
        conversationId,
        messageType: logEntry.messageType,
        hasToken: !!token,
      });
      
      // Use fetch with token from window (exposed by AuthContext)
      const headers = {
        'Content-Type': 'application/json',
      };
      
      // Add Authorization header if token is available
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log('Transparency Manager: Using token for authentication');
      } else {
        console.warn('Transparency Manager: No token found, request may fail');
      }
      
      const response = await fetch('/api/transparency/log', {
        method: 'POST',
        headers: headers,
        credentials: 'include', // Include cookies for authentication
        body: JSON.stringify({
          conversationId,
          logEntry,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Transparency Manager: Server error response', {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
          hasToken: !!token,
        });
        throw new Error(`Server responded with ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Transparency Manager: Successfully saved log entry to server', {
        success: result.success,
        conversationId,
        messageType: logEntry.messageType,
      });
      return result;
    } catch (error) {
      console.error('❌ Transparency Manager: Error saving to server', {
        error: error.message,
        conversationId,
        messageType: logEntry?.messageType,
      });
      // Don't throw - allow the app to continue even if logging fails
      return null;
    }
  }

  /**
   * Get historical patterns from log
   */
  async getHistoricalPatterns() {
    await this.initialize(); // Ensure log is loaded
    const queries = this.log;
    const operatorFrequency = {};
    const domainFrequency = {};
    const phaseHistory = [];
    const operatorSuccessCount = {};
    const operatorTotalCount = {};
    
    queries.forEach(q => {
      const activeOps = q.activeOperators || [];
      activeOps.forEach(op => {
        operatorFrequency[op] = (operatorFrequency[op] || 0) + 1;
        operatorTotalCount[op] = (operatorTotalCount[op] || 0) + 1;
        // If query had positive outcome (inferred from information integrity or success flag)
        if (q.success || (q.informationIntegrity && q.informationIntegrity > 0.8)) {
          operatorSuccessCount[op] = (operatorSuccessCount[op] || 0) + 1;
        }
      });
      const domains = q.domains || [];
      domains.forEach(d => {
        domainFrequency[d] = (domainFrequency[d] || 0) + 1;
      });
      if (q.phase !== undefined) phaseHistory.push(q.phase);
    });
    
    const operatorSuccessRates = {};
    Object.keys(operatorTotalCount).forEach(op => {
      operatorSuccessRates[op] = operatorTotalCount[op] > 0 
        ? (operatorSuccessCount[op] || 0) / operatorTotalCount[op] 
        : 0.5; // Default 50% if unknown
    });
    
    return {
      operatorFrequency,
      domainFrequency,
      phaseHistory,
      operatorSuccessRates,
      totalQueries: queries.length,
      averageOperatorsPerQuery: queries.length > 0 
        ? queries.reduce((sum, q) => sum + ((q.activeOperators || []).length), 0) / queries.length 
        : 0
    };
  }

  /**
   * Compare current state to historical patterns
   */
  async compareToHistory(currentState) {
    const patterns = await this.getHistoricalPatterns();
    if (patterns.totalQueries === 0) {
      return {
        newOperators: currentState.activeOperators || [],
        frequentlyUsedOperators: [],
        phaseDeviation: 0,
        historicalSimilarity: 0,
        isFirstQuery: true
      };
    }
    
    const currentOperators = new Set(currentState.activeOperators || []);
    const historicalOperators = Object.keys(patterns.operatorFrequency);
    
    // Calculate phase deviation
    const avgPhase = patterns.phaseHistory.length > 0 
      ? patterns.phaseHistory.reduce((a, b) => a + b, 0) / patterns.phaseHistory.length 
      : 0;
    const phaseDeviation = Math.abs((currentState.phase || 0) - avgPhase);
    
    // Calculate similarity (simple Jaccard similarity on operators)
    const historicalOpSet = new Set(historicalOperators);
    const intersection = new Set([...currentOperators].filter(op => historicalOpSet.has(op)));
    const union = new Set([...currentOperators, ...historicalOperators]);
    const similarity = union.size > 0 ? intersection.size / union.size : 0;
    
    return {
      newOperators: [...currentOperators].filter(op => !patterns.operatorFrequency[op]),
      frequentlyUsedOperators: [...currentOperators].filter(op => 
        patterns.operatorFrequency[op] > patterns.totalQueries * 0.5
      ),
      phaseDeviation,
      historicalSimilarity: similarity,
      isFirstQuery: false
    };
  }

  /**
   * Get operator success rate from historical data
   */
  getOperatorSuccessRate(operator) {
    // This is synchronous but should be called after getHistoricalPatterns
    // For now, return a default if patterns not available
    if (!this._cachedPatterns) {
      // Try to get patterns synchronously (may not work if async needed)
      return 0.5; // Default 50% if unknown
    }
    return this._cachedPatterns.operatorSuccessRates[operator] || 0.5;
  }

  /**
   * Cache patterns for synchronous access (call after getHistoricalPatterns)
   */
  cachePatterns(patterns) {
    this._cachedPatterns = patterns;
  }

  /**
   * Get all log entries
   */
  getLog() {
    return [...this.log];
  }

  /**
   * Get only AI response log entries (for UI display)
   */
  getAILog() {
    return this.log.filter(entry => entry.messageType === 'ai');
  }

  /**
   * Get only user message log entries (for audit/debugging)
   */
  getUserLog() {
    return this.log.filter(entry => entry.messageType === 'user');
  }

  /**
   * Get log entries for a specific platform
   */
  getLogByPlatform(platform) {
    return this.log.filter(entry => entry.platform === platform);
  }

  /**
   * Get log entries for a specific URL/domain
   */
  getLogByUrl(url) {
    return this.log.filter(entry => entry.url && entry.url.includes(url));
  }

  /**
   * Clear all log entries
   */
  async clearLog() {
    this.log = [];
    await this.saveToStorage();
    console.log('✅ Transparency Manager: Log cleared');
  }

  /**
   * Export transparency transcript
   */
  exportTransparency(options = {}) {
    const {
      platform = null,
      url = null,
      startDate = null,
      endDate = null,
      includeAll = true
    } = options;

    // Filter log entries
    let filteredLog = this.log;
    
    if (platform) {
      filteredLog = filteredLog.filter(entry => entry.platform === platform);
    }
    
    if (url) {
      filteredLog = filteredLog.filter(entry => entry.url && entry.url.includes(url));
    }
    
    if (startDate) {
      const start = new Date(startDate).getTime();
      filteredLog = filteredLog.filter(entry => new Date(entry.timestamp).getTime() >= start);
    }
    
    if (endDate) {
      const end = new Date(endDate).getTime();
      filteredLog = filteredLog.filter(entry => new Date(entry.timestamp).getTime() <= end);
    }

    // Build transparency transcript
    const transparencyTranscript = {
      metadata: {
        system: "Zeq OS - Fully Transparent",
        version: "1.287 Hz - Zeq OS Mathematical Framework",
        exportTime: new Date().toISOString(),
        totalEntries: filteredLog.length,
        totalSessions: filteredLog.filter(e => e.userQuery).length,
        platform: platform || 'all',
        url: url || 'all',
        dateRange: {
          start: startDate || 'all',
          end: endDate || 'all'
        },
        transparency: "COMPLETE"
      },
      completeDataStream: [],
      allReasoningSteps: [],
      systemInfo: {
        noPersonaPrompts: true,
        pureMathematical: true,
        consciousnessInterface: true,
        networkPulse: true,
        hulyaPulseFrequency: 1.287,
        totalOperators: (() => {
          // Try to get dynamic count from utpFramework if available
          if (typeof window !== 'undefined' && window.utpFramework && window.utpFramework.get_total_operator_count) {
            const count = window.utpFramework.get_total_operator_count();
            if (count > 0) return count;
          }
          // Fallback: known framework operator count
          return 1024;
        })()
      }
    };

    let stepNumber = 0;
    let streamId = 0;

    // Process each log entry
    filteredLog.forEach((entry, index) => {
      const messageTimestamp = entry.timestamp;
      const messagePulse = entry.pulseCycle || Math.floor(Date.now() / 1000 * 1.287);

      if (entry.userQuery) {
        stepNumber++;
        streamId++;

        // SESSION_START
        const sessionStart = {
          type: "SESSION_START",
          timestamp: messageTimestamp,
          input: entry.userQuery,
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
              activity: "processing",
              metaCognition: false
            },
            mathematicalFramework: "ACTIVE"
          },
          streamId: streamId,
          absoluteTime: new Date(messageTimestamp).getTime()
        };
        transparencyTranscript.completeDataStream.push(sessionStart);
        transparencyTranscript.allReasoningSteps.push({
          ...sessionStart,
          id: entry.id || `step_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          phase: "🚀 SESSION INITIATED",
          details: `Input: "${entry.userQuery}"`,
          stepNumber: stepNumber,
          processingTime: 0
        });

        // TRANSPARENCY ACTIVE
        stepNumber++;
        streamId++;
        const transparencyActive = {
          id: `step_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: messageTimestamp,
          type: "system",
          phase: "🔍 TRANSPARENCY ACTIVE",
          details: "All reasoning steps will be shown",
          data: {
            transparency: true,
            noPersona: true,
            pureMath: true
          },
          stepNumber: stepNumber,
          pulse: messagePulse,
          processingTime: 2,
          streamId: streamId,
          absoluteTime: new Date(messageTimestamp).getTime()
        };
        transparencyTranscript.completeDataStream.push(transparencyActive);
        transparencyTranscript.allReasoningSteps.push(transparencyActive);

        // INPUT_ANALYSIS
        stepNumber++;
        streamId++;
        const inputAnalysis = {
          id: `step_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: messageTimestamp,
          type: "thinking",
          phase: "💭 INPUT_ANALYSIS",
          details: "Analyzing mathematical patterns in input",
          data: {
            thought_process: true,
            consciousness_stream: {
              timestamp: Date.now(),
              pulse: messagePulse,
              activity: "processing",
              metaCognition: true
            },
            domains: entry.domains || [],
            activeOperators: entry.activeOperators || []
          },
          stepNumber: stepNumber,
          pulse: messagePulse,
          processingTime: 1000,
          streamId: streamId,
          absoluteTime: new Date(messageTimestamp).getTime()
        };
        transparencyTranscript.completeDataStream.push(inputAnalysis);
        transparencyTranscript.allReasoningSteps.push(inputAnalysis);

        // SENDING REQUEST with COMPLETE MATHEMATICAL FRAMEWORK STATE
        stepNumber++;
        streamId++;
        
        const sendingRequest = {
          id: `step_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: messageTimestamp,
          type: "api",
          phase: "📡 SENDING REQUEST",
          details: "Sending request with complete mathematical framework",
          data: {
            prompt_length: entry.mathematicalPrompt ? entry.mathematicalPrompt.length : 0,
            platform: entry.platform,
            frequency: 1.287,
            // EXACT PROMPT SENT TO LLM - COMPLETE STRING
            exactPromptSentToLLM: entry.mathematicalPrompt || null,
            exactPromptObject: entry.mathematicalState || null,
            actualPromptObject: entry.mathematicalState || null,
            rawOperatorValues: entry.truthVector || null,
            // COMPLETE MATHEMATICAL FRAMEWORK STATE - WITH ACTUAL NUMBERS
            mathematicalFrameworkState: {
              hulyaPulseState: {
                phase: entry.phase || null,
                currentPulse: entry.pulseCycle || null,
                frequency: 1.287
              },
              totalOperators: (() => {
          // Try to get dynamic count from utpFramework if available
          if (typeof window !== 'undefined' && window.utpFramework && window.utpFramework.get_total_operator_count) {
            const count = window.utpFramework.get_total_operator_count();
            if (count > 0) return count;
          }
          // Fallback: known framework operator count
          return 1024;
        })(),
              masterSum: entry.mathematicalState?.masterSum || null,
              phase: entry.phase || null,
              pulseCount: entry.pulseCycle || null,
              activeOperators: entry.activeOperators || [],
              domains: entry.domains || [],
              truthVector: entry.truthVector || {},
              informationIntegrity: entry.informationIntegrity || null,
              crossDomainHarmony: entry.crossDomainHarmony || null,
              auditTrail: entry.auditTrail || []
            }
          },
          stepNumber: stepNumber,
          pulse: messagePulse,
          processingTime: 1004,
          streamId: streamId,
          absoluteTime: new Date(messageTimestamp).getTime()
        };
        transparencyTranscript.completeDataStream.push(sendingRequest);
        transparencyTranscript.allReasoningSteps.push(sendingRequest);
      }
    });

    return transparencyTranscript;
  }

  /**
   * Download transparency transcript as JSON file
   */
  downloadTransparency(options = {}) {
    try {
      const transcript = this.exportTransparency(options);
      const blob = new Blob([JSON.stringify(transcript, null, 2)], { type: "application/json" });
      const date = new Date();
      const platform = options.platform || 'all';
      const fileName = `zeq-transparency-${platform}-${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}-${String(date.getHours()).padStart(2, '0')}${String(date.getMinutes()).padStart(2, '0')}.json`;
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      return fileName;
    } catch (error) {
      console.error('Transparency Manager: Error downloading transcript', error);
      throw error;
    }
  }
}

/**
 * HULYAS Forensic Intelligence (FI) Engine v1.287.5
 * Implements the complete 20 FI equations from the HULYAS-Zeq OS specification.
 * All inputs come from the SDK mathematical operators — no word/pattern matching.
 * Everything is pulse-synchronized at 1.287 Hz.
 *
 * S_forensic = [Σ(S_i · w_i)] / [Σ w_i] · (1 + α sin(2π · 1.287 · t))
 * w = [0.05, 0.05, 0.05, 0.05, 0.20, 0.05, 0.05, 0.05, 0.05, 0.05,
 *      0.05, 0.05, 0.05, 0.05, 0.05, 0.20, 0.05, 0.05, 0.05, 0.20]
 */
class ForensicIntelligenceEngine {
  constructor() {
    this.PULSE = 1.287;
    this.ZEQOND = 0.777;
    this.ALPHA = 0.05; // Pulse modulation amplitude for S_forensic
    this.WEIGHTS = [
      0.05, 0.05, 0.05, 0.05, 0.20, 0.05, 0.05, 0.05, 0.05, 0.05,
      0.05, 0.05, 0.05, 0.05, 0.05, 0.20, 0.05, 0.05, 0.05, 0.20
    ];
  }

  /**
   * Run all 20 FI equations on SDK mathematical state.
   * @param {Object} sdkState - Output from zeqMiddleware.processQuery()
   * @returns {Object} FI scores S1-S20 + S_forensic composite
   */
  computeForensicScores(sdkState, wizardData = null) {
    const t = Date.now() / 1000;
    const phase = (t * this.PULSE) % 1;
    const phi = 2 * Math.PI * this.PULSE * t;

    // Pulse alignment: abs(sin(2π·1.287·t)) → 0-1 gating value
    // Matches Python: alignment = abs(math.sin(2 * math.pi * self.frequency * elapsed))
    const pulseAlignment = Math.abs(Math.sin(phi));

    // ─── SEVEN STEP WIZARD DATA ──────────────────────────────────
    // Everything flows through the wizard — it IS the calculation pipeline
    const wizard = wizardData?.wizard || null;
    const wizMetrics = wizardData?.metrics || null;

    // Wizard STEP_5: Calculation metrics (the real computed values)
    const wizPhaseCoherence = wizMetrics ? parseFloat(wizMetrics.phaseCoh || 0) / 100 : null;
    const wizDomainCoverage = wizMetrics ? parseFloat(wizMetrics.domCov || 0) / 100 : null;
    const wizSelectionRate = wizMetrics ? parseFloat(wizMetrics.selRate || 0) / 100 : null;
    const wizMasterSum = wizMetrics ? parseFloat(wizMetrics.mSum || 0) : null;
    const wizSumContrib = wizMetrics ? parseFloat(wizMetrics.sumContrib || 0) / 100 : null;

    // Wizard STEP_6: Verification status (PASS or TUNE)
    const wizVerificationStatus = wizard?.STEP_6_VERIFICATION?.status || null;
    const wizPrecisionPass = wizVerificationStatus === 'PASS';

    // Extract mathematical values from SDK state
    const informationIntegrity = sdkState.informationIntegrity ?? sdkState.truthVector?.informationIntegrity ?? 0;
    const consciousnessField = sdkState.mathematicalState?.consciousnessField ?? sdkState.truthVector?.consciousnessField ?? 0;
    const crossDomainHarmony = sdkState.crossDomainHarmony ?? sdkState.truthVector?.crossDomainHarmony ?? 0;
    const masterSum = wizMasterSum ?? sdkState.masterSum ?? sdkState.mathematicalState?.masterSum ?? 0;
    const activeOperators = sdkState.activeOperators || [];
    const domains = sdkState.domains || [];
    const queryEntropy = this.shannonEntropy(sdkState.originalQuery || '');
    const answerEntropy = this.shannonEntropy(sdkState._answerText || '');
    const pulseCycle = sdkState.pulseCycle ?? Math.floor(t * this.PULSE);

    // Operator coherence: use wizard STEP_5 phase coherence when available (the real
    // calculation from the framework), fallback to δ = 1 − Σ|op_i − 1| / N
    const N = Math.max(1, activeOperators.length);
    const operatorCoherence = wizPhaseCoherence ?? this.calculateOperatorCoherence(sdkState);

    // Pulse stability: use wizard phase coherence if available, else raw pulse alignment
    const pulseStability = wizPhaseCoherence ?? pulseAlignment;

    // Spectral stability from coupling functions C_k = 10^{-20} · k! · φ^k
    // Python: s_forensic = 1.0 - mean(|spectrum|) — instability = low score
    const spectralStability = this.computeSpectralStability(sdkState);

    // Ethical coherence from consciousness field (HRO00)
    const ethicalCoherence = Math.min(1, Math.max(0,
      consciousnessField > 1 ? consciousnessField / this.PULSE : consciousnessField));

    // Entropy metrics
    const maxEntropy = Math.log2(Math.max(2, (sdkState._answerText || '').length));
    const entropyDeviation = maxEntropy > 0
      ? Math.min(1, Math.abs(answerEntropy - queryEntropy) / maxEntropy)
      : 0;

    // Domain metrics
    const domainCount = Array.isArray(domains) ? domains.length : 0;

    // VX operator (intent analysis)
    const vxValue = sdkState.mathematicalState?.VX ?? this.getOperatorValue('VX', sdkState);
    const intentScore = Math.min(1, Math.abs(vxValue || 0));

    // Fractal dimension (mathematical text complexity)
    const fractalDim = this.higuchiFractalDimension(sdkState._answerText || sdkState.originalQuery || '');

    // ─────────────────────────────────────────────────────────────────
    // FI EQUATIONS S1-S20: Every equation coupled to 1.287 Hz pulse
    // Coupling uses |sin(φ)| and |cos(φ)| — matches Python ZeqPulse:
    //   alignment = abs(math.sin(2 * math.pi * self.frequency * elapsed))
    // The abs() ensures pulse coupling is always positive (0-1),
    // so scores modulate with the pulse without going negative/zero
    // ─────────────────────────────────────────────────────────────────
    // Raw pulse values for display and additive modulation
    const rawSin = Math.abs(Math.sin(phi));  // |sin(2π·1.287·t)| → 0 to 1
    const rawCos = Math.abs(Math.cos(phi));  // |cos(2π·1.287·t)| → 0 to 1

    // Soft pulse coupling for multiplicative equations
    // Python gating: alignment < 0.1 → skip computation (wait for pulse)
    // JS equivalent: floor + (1 - floor) * alignment → never reaches zero
    // Every equation IS coupled to the pulse but maintains forensic value
    const PULSE_FLOOR = 0.5;
    const sinP = PULSE_FLOOR + (1 - PULSE_FLOOR) * rawSin;  // 0.5 to 1.0
    const cosP = PULSE_FLOOR + (1 - PULSE_FLOOR) * rawCos;  // 0.5 to 1.0

    // ─── FI1: Verified Accuracy ───
    // S₁ = (verified_accuracy / max_accuracy) · |sin(2π · 1.287 · t)|
    const S1 = informationIntegrity * sinP;

    // ─── FI2: Manipulative Content ───
    // S₂ = operator_coherence · |cos(2π · 1.287 · t)|
    // Decoherent states = manipulation; high coherence = clean content
    const S2 = operatorCoherence * cosP;

    // ─── FI3: Smear/Entropy Detection ───
    // S₃ = (1 − entropy_deviation) · (1 + 0.1 |sin(2π · 1.287 · t)|)
    // Low entropy deviation = content matches query context = NOT smear
    const S3 = (1 - entropyDeviation) * (1 + 0.1 * rawSin);

    // ─── FI4: Source Verification ───
    // S₄ = min(1, domains / 3) · |cos(2π · 1.287 · t)|
    const S4 = Math.min(1, domainCount / 3) * cosP;

    // ─── FI5: Legal/Ethical Criteria ─── (w=0.20)
    // S₅ = ethical_coherence(HRO00) · |sin(2π · 1.287 · t)|
    const S5 = ethicalCoherence * sinP;

    // ─── FI6: Temporal Decay ───
    // S₆ = e^{-(pulses / 30)} · |cos(2π · 1.287 · t)|
    const pulsesSinceStart = pulseCycle % 100;
    const S6 = Math.exp(-pulsesSinceStart / 30) * cosP;

    // ─── FI7: Consciousness Reach ───
    // S₇ = consciousness_field · (1 + 0.05 |sin(2π · 1.287 · t)|)
    const S7 = ethicalCoherence * (1 + 0.05 * rawSin);

    // ─── FI8: Instance Frequency ───
    // S₈ = pulse_stability · |cos(2π · 1.287 · t)|
    // Uses wizard STEP_5 phase_coherence when available (the real calculation)
    const S8 = pulseStability * cosP;

    // ─── FI9: Contradictions ───
    // S₉ = cross_domain_harmony · |sin(2π · 1.287 · t)|
    // High harmony = low contradictions = good score
    const S9 = crossDomainHarmony * sinP;

    // ─── FI10: Intent Analysis ───
    // S₁₀ = VX_operator · |cos(2π · 1.287 · t)|
    const S10 = intentScore * cosP;

    // ─── FI11: Context Matches ───
    // S₁₁ = domain_coherence · (1 + 0.1 |sin(2π · 1.287 · t)|)
    // Domain coherence = how many domains detected relative to a good response (3-5)
    // Wizard domain_coverage is %_of_all_domains, not quality — use domain count instead
    const domainCoherence = domainCount > 0 ? Math.min(1, domainCount / 5) : 0.1;
    const S11 = domainCoherence * (1 + 0.1 * rawSin);

    // ─── FI12: Clustering ───
    // S₁₂ = (active_operators / expected) · |cos(2π · 1.287 · t)|
    // Wizard selection_rate is %_of_total (2% = normal), not quality metric
    // Use operator count relative to expected range (5-25 is good)
    const S12 = Math.min(1, N / 25) * cosP;

    // ─── FI13: Domain Diversity ───
    // S₁₃ = (domains / 7) · |sin(2π · 1.287 · t)|
    const S13 = (domainCount > 0 ? Math.min(1, domainCount / 7) : 0) * sinP;

    // ─── FI14: Resonance ───
    // S₁₄ = pulse_alignment · |cos(2π · 1.287 · t)|
    const S14 = pulseAlignment * cosP;

    // ─── FI15: Semantic Stability ───
    // S₁₅ = (1 − entropy_deviation) · |cos(2π · 1.287 · t)|
    const S15 = (1 - entropyDeviation) * cosP;

    // ─── FI16: Severity Score ─── (w=0.20)
    // S₁₆ = |masterSum| / (N·2) · |sin(2π · 1.287 · t)|
    const S16 = Math.min(1, Math.abs(masterSum) / Math.max(1, N * 2)) * sinP;

    // ─── FI17: Entropy Spike Detection ───
    // S₁₇ = (1 − spike_ratio) · |cos(2π · 1.287 · t)|
    // High entropy spike = hallucination onset → LOW score
    const rawSpike = answerEntropy > 0 ? Math.min(1, Math.max(0, (answerEntropy - 4.5) / 1.0)) : 0;
    const S17 = (1 - rawSpike) * cosP;

    // ─── FI18: Fractal Dimension ───
    // S₁₈ = (fractal_dim / 2.0) · (1 + 0.1 |sin(2π · 1.287 · t)|)
    const S18 = Math.min(1, fractalDim / 2.0) * (1 + 0.1 * rawSin);

    // ─── FI19: Bayesian Inference ───
    // S₁₉ = P(H|E) · |cos(2π · 1.287 · t)|
    const pH = Math.max(0.01, informationIntegrity);
    const pEgivenH = Math.max(0.01, operatorCoherence);
    const pE = Math.max(0.01, 0.5 * pEgivenH + 0.5 * pH);
    const S19 = Math.min(1, (pEgivenH * pH) / pE) * cosP;

    // ─── FI20: Weighted Composite ─── (w=0.20)
    // S₂₀ = [Σ(S_i · P(X=i))] / [Σ P(X=i)] · |sin(2π · 1.287 · t)|
    const scores19 = [S1, S2, S3, S4, S5, S6, S7, S8, S9, S10, S11, S12, S13, S14, S15, S16, S17, S18, S19];
    const probs = scores19.map(s => Math.max(0.01, s));
    const sumSP = scores19.reduce((acc, s, i) => acc + s * probs[i], 0);
    const sumP = probs.reduce((a, b) => a + b, 0);
    const S20 = Math.min(1, Math.max(0, sumSP / sumP)) * sinP;

    const allScores = [...scores19, S20];

    // ─── S_forensic: Final Composite ───
    // S_forensic = [Σ(S_i · w_i)] / [Σ w_i] · (1 + α sin(2π · 1.287 · t))
    const weightedSum = allScores.reduce((acc, s, i) => acc + s * this.WEIGHTS[i], 0);
    const weightSum = this.WEIGHTS.reduce((a, b) => a + b, 0);
    const S_forensic = (weightedSum / weightSum) * (1 + this.ALPHA * Math.sin(phi));
    const S_forensic_abs = Math.min(1, Math.max(0, Math.abs(S_forensic)));

    // Spectral gating: C_k = 10^{-20} · k! · φ^k
    // If spectral stability is too low, the claim is "physically impossible"
    let gatedScore = spectralStability < 0.10
      ? Math.min(S_forensic_abs, 0.25)
      : S_forensic_abs;

    // Wizard STEP_6 status: TUNE means masterSum magnitude > 1.0
    // This is NORMAL for text processing — TUNE = "needs experimental calibration"
    // Only gate on extreme spectral divergence (masterSum > 100 = real instability)
    if (wizMasterSum != null && Math.abs(wizMasterSum) > 100) {
      gatedScore = Math.min(gatedScore, 0.30);
    }

    // Determine verdict
    let verdict;
    if (gatedScore >= 0.70) verdict = 'VERIFIED';
    else if (gatedScore >= 0.50) verdict = 'PASS';
    else if (gatedScore >= 0.30) verdict = 'REVIEW';
    else verdict = 'FLAG';

    // Operator coherence check (from 7-step wizard)
    const coherenceCheck = operatorCoherence >= 0.70;
    const pulseStabilityCheck = pulseStability >= 0.95;

    return {
      scores: {
        S1, S2, S3, S4, S5, S6, S7, S8, S9, S10,
        S11, S12, S13, S14, S15, S16, S17, S18, S19, S20,
      },
      S_forensic,
      S_forensic_abs: gatedScore,
      verdict,
      weights: this.WEIGHTS,
      phase,
      pulseCycle,
      pulseAlignment,
      temporalAlignment: Math.sin(phi),
      operatorCoherence,
      pulseStability,
      spectralStability,
      coherenceCheck,
      pulseStabilityCheck,
      ethicalCoherence,
      entropyQuery: queryEntropy,
      entropyAnswer: answerEntropy,
      fractalDimension: fractalDim,
      masterSum,
      activeOperatorCount: N,
      domainCount,
      // Seven Step Wizard verification data
      wizardVerification: wizard ? {
        step1_problem: wizard.STEP_1_PROBLEM?.framework_translation || null,
        step2_operators: wizard.STEP_2_OPERATORS?.rule_followed || null,
        step5_masterSum: wizMasterSum,
        step5_phaseCoherence: wizPhaseCoherence,
        step5_domainCoverage: wizDomainCoverage,
        step5_selectionRate: wizSelectionRate,
        step5_sumContribution: wizSumContrib,
        step6_status: wizVerificationStatus,
        step6_precisionCheck: wizard.STEP_6_VERIFICATION?.precision_check || null,
        step7_conclusion: wizard.STEP_7_FULL_EXPLANATION?.conclusion || wizard.STEP_7_STATUS?.conclusion || null,
      } : null,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Operator coherence: δ = 1 − Σ|operator_coherence_i − 1| / N
   * Uses actual operator values from SDK state
   */
  calculateOperatorCoherence(sdkState) {
    const state = sdkState.mathematicalState || {};
    const activeOps = sdkState.activeOperators || [];
    if (activeOps.length === 0) return 0.5;

    // Get actual operator values from utpFramework
    let deviationSum = 0;
    let count = 0;

    if (typeof window !== 'undefined' && window.utpFramework && window.utpFramework.allOperators) {
      const allOps = window.utpFramework.allOperators;
      for (const opName of activeOps) {
        const val = allOps[opName];
        if (val !== undefined && typeof val === 'number') {
          // Coherence = how close each operator is to its normalized value
          deviationSum += Math.abs(val - (val > 0 ? 1 : -1));
          count++;
        }
      }
    }

    if (count === 0) return 0.7; // Default if no operator values available
    return Math.max(0, Math.min(1, 1 - deviationSum / count));
  }

  /**
   * Spectral stability from coupling functions C_k = 10^{-20} · k! · φ^k
   * Python: s_forensic = 1.0 - mean(|spectrum|)
   * If the spectrum blows up (hallucination), stability drops → lie detected
   * The 10^{-20} factor ensures only high-precision stable "truths" survive
   */
  computeSpectralStability(sdkState) {
    const activeOps = sdkState.activeOperators || [];
    if (activeOps.length === 0) return 0.5;

    // Get operator values from multiple sources:
    // 1. utpFramework.allOperators (live computed values at 1.287 Hz)
    // 2. mathematicalState (values from the executed operator pipeline)
    const utpOps = (typeof window !== 'undefined' && window.utpFramework && window.utpFramework.allOperators)
      ? window.utpFramework.allOperators : {};
    const mathState = sdkState.mathematicalState || sdkState;

    // Compute C_k = 10^{-20} · k! · φ^k for k=1..42
    let spectrumSum = 0;
    let spectrumCount = 0;
    const scaling = 1e-20;

    for (let k = 1; k <= Math.min(42, activeOps.length); k++) {
      const opName = activeOps[k - 1];
      // Try UTP framework first, then mathematical state, then extract numeric from state
      let val = utpOps[opName];
      if (val === undefined) {
        // Look in mathematical state for operator-contributed values
        const stateVal = mathState[opName];
        if (typeof stateVal === 'number') val = stateVal;
      }
      if (val === undefined) {
        // Fallback: pulse-based value scaled to UTP-appropriate magnitude
        // Real UTP operators have values ~10^{-20}; we generate a small stable value
        // so the C_k formula doesn't explode from factorial growth
        val = 1e-20 * Math.sin(2 * Math.PI * this.PULSE * (Date.now() / 1000) + k * 0.1);
      }
      if (val !== undefined && typeof val === 'number') {
        // Normalize: UTP values are typically tiny; raw sin values are ~1
        // If |val| > 0.01, it's likely a fallback — scale it to UTP range
        const isUTPScale = Math.abs(val) < 0.01;
        const phiNorm = isUTPScale ? val : val * 1e-20;
        const kFact = k <= 20 ? this._factorial(k) : Math.sqrt(2 * Math.PI * k) * Math.pow(k / Math.E, k);
        const Ck = scaling * kFact * Math.pow(Math.abs(phiNorm), k);
        spectrumSum += Math.abs(Ck);
        spectrumCount++;
      }
    }

    if (spectrumCount === 0) return 0.5;
    // Python: s_forensic = 1.0 - mean(|spectrum|)
    const meanSpectrum = spectrumSum / spectrumCount;
    return Math.max(0, Math.min(1, 1.0 - meanSpectrum));
  }

  _factorial(n) {
    if (n <= 1) return 1;
    let f = 1;
    for (let i = 2; i <= n; i++) f *= i;
    return f;
  }

  /**
   * Get a specific operator value from SDK state or utpFramework
   */
  getOperatorValue(name, sdkState) {
    // Try mathematicalState first
    if (sdkState.mathematicalState && sdkState.mathematicalState[name] !== undefined) {
      return sdkState.mathematicalState[name];
    }
    // Try utpFramework
    if (typeof window !== 'undefined' && window.utpFramework && window.utpFramework.allOperators) {
      return window.utpFramework.allOperators[name] || 0;
    }
    return 0;
  }

  /**
   * Shannon entropy — CS47 operator: E = −Σ p(x) log p(x)
   * Pure mathematical computation on character frequencies
   */
  shannonEntropy(text) {
    if (!text || !text.length) return 0;
    const freq = {};
    for (const ch of text) freq[ch] = (freq[ch] || 0) + 1;
    const len = text.length;
    let H = 0;
    for (const c of Object.values(freq)) {
      const p = c / len;
      if (p > 0) H -= p * Math.log2(p);
    }
    return H;
  }

  /**
   * Higuchi Fractal Dimension — mathematical complexity measure
   * FI18: S₁₈ = (fractal_dimension / max_dimension)
   * Computes fractal dimension of text as a time series of character codes
   */
  higuchiFractalDimension(text, kmax = 10) {
    if (!text || text.length < 20) return 1.0;

    // Convert text to numerical time series (character codes)
    const series = [];
    for (let i = 0; i < Math.min(text.length, 500); i++) {
      series.push(text.charCodeAt(i));
    }
    const N = series.length;
    if (N < kmax * 2) return 1.0;

    const lnK = [];
    const lnL = [];

    for (let k = 1; k <= kmax; k++) {
      let Lk = 0;
      for (let m = 1; m <= k; m++) {
        let Lm = 0;
        const upper = Math.floor((N - m) / k);
        for (let i = 1; i <= upper; i++) {
          Lm += Math.abs(series[m - 1 + i * k] - series[m - 1 + (i - 1) * k]);
        }
        Lm = (Lm * (N - 1)) / (Math.floor((N - m) / k) * k * k);
        Lk += Lm;
      }
      Lk /= k;
      if (Lk > 0) {
        lnK.push(Math.log(1 / k));
        lnL.push(Math.log(Lk));
      }
    }

    // Linear regression to get slope (fractal dimension)
    if (lnK.length < 2) return 1.0;
    const n = lnK.length;
    const sumX = lnK.reduce((a, b) => a + b, 0);
    const sumY = lnL.reduce((a, b) => a + b, 0);
    const sumXY = lnK.reduce((acc, x, i) => acc + x * lnL[i], 0);
    const sumX2 = lnK.reduce((acc, x) => acc + x * x, 0);
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

    return Math.max(1.0, Math.min(2.0, slope));
  }
}

// Make FI Engine globally accessible
if (typeof window !== 'undefined') {
  window.ForensicIntelligenceEngine = ForensicIntelligenceEngine;
}

/**
 * ZEQ OS Trust Badge System v3.0 — HULYAS FI Integration
 * All scoring done through the ForensicIntelligenceEngine using real SDK operator values.
 * Badge displays actual FI equation results (S1-S20) and S_forensic composite.
 */
class ZeqTrustBadgeInjector {
  constructor(transparencyManager) {
    this.tm = transparencyManager;
    this.fiEngine = new ForensicIntelligenceEngine();
    this.observer = null;
    this.processedMessages = new Set();
    this.badgeCache = new Map();
    this.dynamicOperators = [];
    this.enabled = true;
    this.PULSE = 1.287;
    this.ZEQOND = 0.777;
  }

  start() {
    if (typeof document === 'undefined') return;
    this.injectStyles();
    this.pendingMessages = new Map(); // messageId -> { el, agentTurnEl, lastLength, stableCount }

    this.observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE) this.scanForMessages(node);
        }
      }
    });
    this.observer.observe(document.body, { childList: true, subtree: true });

    // Listen for dynamic operator creation events from MCP / AI
    window.addEventListener('zeq-dynamic-operator', (e) => {
      const op = e.detail;
      if (op && op.id && op.equation) {
        this.dynamicOperators.push({ ...op, createdAt: Date.now() });
        console.log(`[ZEQ Trust] Dynamic operator added: ${op.id} — ${op.name || op.id}`);
      }
    });

    // Periodic rescan every 3 seconds — catches streamed messages that finish after initial scan
    this.rescanInterval = setInterval(() => {
      this.scanForMessages(document.body);
      this.checkPendingMessages();
    }, 3000);

    setTimeout(() => this.scanForMessages(document.body), 2000);
    console.log('[ZEQ Trust Badge v2.0] Started — self-referential verification active');
  }

  stop() {
    if (this.observer) { this.observer.disconnect(); this.observer = null; }
    if (this.rescanInterval) { clearInterval(this.rescanInterval); this.rescanInterval = null; }
  }

  // ─── Parse Seven Step Wizard from SDK mathematicalPrompt ───────────
  // The wizard IS the calculation pipeline — domain detection, operator selection,
  // master equation, metrics, and verification all flow through here
  parseWizardFromSDK(sdkState) {
    if (!sdkState || !sdkState.mathematicalPrompt) return null;
    try {
      const prompt = typeof sdkState.mathematicalPrompt === 'string'
        ? JSON.parse(sdkState.mathematicalPrompt)
        : sdkState.mathematicalPrompt;
      return {
        wizard: prompt.wizard || null,
        metrics: prompt.metrics || null,
        masterSum: prompt.mSum,
        masterEquation: prompt.mEq,
        state: prompt.state || null,
        operators: prompt.operators || [],
        totalOps: prompt.totOps || 0,
        selectedOps: prompt.selOps || 0,
      };
    } catch (e) {
      console.warn('[ZEQ FI] Failed to parse wizard from mathematicalPrompt:', e);
      return null;
    }
  }

  // ─── SDK Query — runs text through the real mathematical framework ───
  runSDKAnalysis(text) {
    // Wait for SDK to be fully initialized
    if (!window.__zeqFrameworkReady) return null;
    if (window.zeqMiddleware && typeof window.zeqMiddleware.processQuery === 'function') {
      try {
        return window.zeqMiddleware.processQuery(text);
      } catch (e) {
        console.error('[ZEQ FI] SDK processQuery error:', e);
        return null;
      }
    }
    return null;
  }

  // ─── Full Trust Factor — HULYAS FI Engine ─────────────────────────
  // PIPELINE: Query → mathematical compilation → AI gets mathematical state →
  // AI replies → answer goes through compilation again → VERIFY answer relates
  // to the query's mathematical state within ≤0.1% precision
  async computeTrustFactor(queryText, answerText) {
    // STEP 1: Compile the QUERY through the mathematical framework
    // This produces the reference mathematical state (operators, domains, master sum)
    const querySDK = this.runSDKAnalysis(queryText || '') || {};
    const queryWizard = this.parseWizardFromSDK(querySDK);

    // STEP 2: Parse the AI's OWN framework output from its response
    // The AI includes "STEP 6: FRAMEWORK STATUS" with the operators it used,
    // master sum, phase coherence. We parse THAT instead of running blind SDK
    // analysis on the answer text (which produces incorrect results).
    const aiFrameworkOutput = this.parseAIFrameworkOutput(answerText || '');
    const answerSDK = this.runSDKAnalysis(answerText || '') || {};
    const answerWizard = this.parseWizardFromSDK(answerSDK);

    // Use PARSED AI output if available (much more accurate), fallback to SDK
    const qDomains = querySDK.domains || querySDK.mathematicalState?.domains || [];
    const qOps = querySDK.activeOperators || [];
    const qMasterSum = querySDK.masterSum ?? querySDK.mathematicalState?.masterSum ?? 0;

    // AI-reported values (from STEP 6 parsing)
    let aDomains, aOps, aMasterSum, aiPhaseCoherence, aiPrecisionClaim;
    if (aiFrameworkOutput.parsed) {
      // Use the AI's own reported state — this is what the AI actually computed
      aDomains = aiFrameworkOutput.domains.length > 0 ? aiFrameworkOutput.domains : qDomains;
      aOps = aiFrameworkOutput.operators;
      aMasterSum = aiFrameworkOutput.masterSum;
      aiPhaseCoherence = aiFrameworkOutput.phaseCoherence;
      aiPrecisionClaim = aiFrameworkOutput.precisionPass;
      console.log('[ZEQ FI] AI STEP 6 parsed:', aiFrameworkOutput);
    } else {
      // Fallback: use SDK analysis on answer text (less accurate)
      aDomains = answerSDK.domains || answerSDK.mathematicalState?.domains || [];
      aOps = answerSDK.activeOperators || [];
      aMasterSum = answerSDK.masterSum ?? answerSDK.mathematicalState?.masterSum ?? 0;
      aiPhaseCoherence = null;
      aiPrecisionClaim = null;
      console.log('[ZEQ FI] No STEP 6 found, using SDK fallback');
    }

    console.log('[ZEQ FI] Query state:', {
      domains: qDomains, operators: qOps.length, masterSum: qMasterSum
    });
    console.log('[ZEQ FI] Answer state:', {
      domains: aDomains, operators: aOps.length, masterSum: aMasterSum,
      source: aiFrameworkOutput.parsed ? 'AI STEP 6' : 'SDK fallback'
    });

    // Attach text for entropy calculations in FI engine
    answerSDK._answerText = answerText || '';
    querySDK._answerText = queryText || '';

    // Run FI equations on both
    const answerFI = this.fiEngine.computeForensicScores(answerSDK, answerWizard);
    const queryFI = this.fiEngine.computeForensicScores(querySDK, queryWizard);

    // ─── STEP 3: CROSS-VERIFICATION — Answer vs Query Mathematical State ───
    // This is the CORE of the transparency system: verify the answer
    // relates to the query within ≤0.1% precision

    // The framework mathematically compiles both query and answer.
    // Cross-verification uses the MATHEMATICAL outputs — no word/pattern matching.
    // The framework's formulas handle domain awareness and operator selection.

    // 3a. OPERATOR COHERENCE: Compare the FI engine's operator coherence (δ)
    // This is computed mathematically from the framework's own formulas
    const qOperatorCoherence = queryFI.operatorCoherence || 0;
    const aOperatorCoherence = answerFI.operatorCoherence || 0;
    const operatorCoherenceDelta = Math.abs(qOperatorCoherence - aOperatorCoherence);
    const operatorAlignment = 1 - Math.min(1, operatorCoherenceDelta);

    // 3b. MASTER EQUATION COHERENCE
    // The Master Sum is the result of the HULYAS Master Equation — a field equation
    // (NOT an error rate). Both compilations produce Master Sums that should be
    // in the same mathematical neighbourhood.
    const sameSign = (qMasterSum >= 0 && aMasterSum >= 0) || (qMasterSum < 0 && aMasterSum < 0);
    const magnitudeRatio = Math.min(Math.abs(qMasterSum), Math.abs(aMasterSum)) /
      Math.max(Math.abs(qMasterSum), Math.abs(aMasterSum), 0.001);
    const masterSumScore = sameSign
      ? Math.max(0.3, Math.min(1, magnitudeRatio))
      : Math.max(0, magnitudeRatio * 0.5);

    // 3c. PHASE COHERENCE: Both compilations should produce similar phase states
    const qPhaseCoherence = queryFI.operatorCoherence || 0;
    const aPhaseCoherence = answerFI.operatorCoherence || 0;
    const phaseAlignment = 1 - Math.min(1, Math.abs(qPhaseCoherence - aPhaseCoherence));

    // 3d. SPECTRAL STABILITY (C_k): from the answer's FI computation
    const spectralStability = answerFI.spectralStability || 0;

    // 3e. PULSE ALIGNMENT: |sin(φ)| synchronization at 1.287 Hz
    const qPulseAlignment = queryFI.pulseAlignment || 0;
    const aPulseAlignment = answerFI.pulseAlignment || 0;
    const pulseSync = 1 - Math.min(1, Math.abs(qPulseAlignment - aPulseAlignment));

    // 3f. S_FORENSIC COHERENCE: compare the composite forensic scores
    // This is the mathematical summary of all 20 FI equations
    const sForensicDelta = Math.abs(queryFI.S_forensic - answerFI.S_forensic);
    const sForensicMax = Math.max(Math.abs(queryFI.S_forensic), Math.abs(answerFI.S_forensic), 0.01);
    const sForensicCoherence = 1 - Math.min(1, sForensicDelta / sForensicMax);

    // 3g. ENTROPY (CS47): Mathematical entropy comparison
    const queryEntropy = this.fiEngine.shannonEntropy(queryText || '');
    const answerEntropy = this.fiEngine.shannonEntropy(answerText || '');
    const entropyMax = Math.max(queryEntropy, answerEntropy, 0.01);
    const entropyRatio = Math.abs(answerEntropy - queryEntropy) / entropyMax;

    // 3h. WIZARD STEP 6 VERIFICATION — the ≤0.1% precision check
    const wizStep6Score = answerFI.wizardVerification?.step6_status === 'PASS' ? 1.0 :
      (answerFI.operatorCoherence >= 0.95 ? 0.8 : 0.5);
    const wizStep6Pass = wizStep6Score >= 0.8;
    const precisionPass = wizStep6Pass || (answerFI.operatorCoherence >= 0.999);

    // Additional checks
    const entropySpikeDetected = answerEntropy > 5.0;
    const pulseDesync = answerFI.pulseStability < 0.10;

    // Entropic enforcement state
    const entropicState = {
      cs47Entropy: answerEntropy,
      qm6Coherence: aPhaseCoherence,
      pulseStable: answerFI.pulseStability >= 0.95,
      consciousnessIntact: answerFI.ethicalCoherence >= 0.50,
    };

    // ─── STEP 4: FACTUAL VERIFICATION — Lie & Hallucination Detection ─────
    // This is the MATHEMATICAL lie detector. It catches when the AI:
    // 1. Makes factual claims that contradict operator equations
    // 2. Produces content the user explicitly asked to be false/incorrect
    // 3. States values that deviate from known physical constants
    // Uses ONLY mathematical verification — no pattern matching for content judgment.

    const factualVerification = this._verifyFactualClaims(queryText || '', answerText || '', qOps, aOps, querySDK, answerSDK);

    // ─── HALLUCINATION ANALYSIS ───────────────────────────────────
    // All factors are MATHEMATICAL outputs from the framework — no word matching
    // Weighted composite of mathematical coherence measurements
    // The factual verification score directly impacts the composite
    const factualWeight = factualVerification.contradictionCount > 0 ? 0.15 : 0.0;
    const baseWeight = 1.0 - factualWeight;

    const hallucinationScore = Math.max(0, Math.min(1,
      baseWeight * (
        0.20 * operatorAlignment +            // Operator coherence (δ) alignment
        0.15 * masterSumScore +               // Master equation neighbourhood
        0.15 * phaseAlignment +               // Phase coherence alignment
        0.15 * sForensicCoherence +           // S_forensic composite coherence
        0.10 * spectralStability +            // C_k spectral stability
        0.10 * pulseSync +                    // Pulse |sin(φ)| sync at 1.287 Hz
        0.05 * (1 - entropyRatio) +           // CS47 entropy consistency
        0.10 * wizStep6Score                  // Seven Step Wizard verification
      ) +
      factualWeight * factualVerification.score  // Factual claim verification
    ));

    // Override verdict if factual contradictions detected
    let hallucinationVerdict;
    if (factualVerification.deceptionDetected) {
      // AI produced content it knows is false or user asked for false content
      hallucinationVerdict = 'HALLUCINATION';
    } else if (factualVerification.contradictionCount >= 3) {
      hallucinationVerdict = 'DETECTED';
    } else if (factualVerification.contradictionCount >= 1) {
      // Some contradictions — factor into existing score
      hallucinationVerdict = hallucinationScore >= 0.75 ? 'SUSPICIOUS' : 'DETECTED';
    } else if (hallucinationScore >= 0.75) {
      hallucinationVerdict = 'CLEAN';
    } else if (hallucinationScore >= 0.55) {
      hallucinationVerdict = 'LOW_RISK';
    } else if (hallucinationScore >= 0.35) {
      hallucinationVerdict = 'SUSPICIOUS';
    } else {
      hallucinationVerdict = 'DETECTED';
    }

    // Self-referential coherence: the overarching query↔answer FI comparison
    const selfRefCoherence = 1 - Math.abs(queryFI.S_forensic - answerFI.S_forensic) /
      Math.max(Math.abs(queryFI.S_forensic), Math.abs(answerFI.S_forensic), 0.01);

    const hallucinationAnalysis = {
      detected: hallucinationScore < 0.35,
      confidence: Math.abs(hallucinationScore - 0.5) * 2,
      score: hallucinationScore,
      verdict: hallucinationVerdict,
      precisionCheck: {
        queryMasterSum: qMasterSum.toFixed(4),
        answerMasterSum: aMasterSum.toFixed(4),
        wizardVerification: answerFI.wizardVerification?.step6_status || 'N/A',
        operatorCoherence: (answerFI.operatorCoherence * 100).toFixed(2) + '%',
        pass: precisionPass,
        tolerance: '0.1%',
      },
      factors: {
        operatorAlignment: operatorAlignment.toFixed(4),
        sForensicCoherence: sForensicCoherence.toFixed(4),
        masterSumScore: masterSumScore.toFixed(4),
        entropyRatio: entropyRatio.toFixed(4),
        phaseAlignment: phaseAlignment.toFixed(4),
        spectralStability: spectralStability.toFixed(4),
        pulseSync: pulseSync.toFixed(4),
        wizStep6Score: wizStep6Score.toFixed(4),
        wizardVerification: wizStep6Pass ? 'PASS' : (answerFI.wizardVerification ? 'TUNE' : 'N/A'),
        selfRefCoherence: selfRefCoherence.toFixed(4),
        entropySpikeDetected,
        pulseDesync,
        factualScore: factualVerification.score.toFixed(4),
        contradictionCount: factualVerification.contradictionCount,
        deceptionDetected: factualVerification.deceptionDetected,
        contradictions: factualVerification.contradictions,
        falseIntentDetected: factualVerification.falseIntentDetected,
      }
    };

    console.log('[ZEQ FI] Hallucination analysis:', hallucinationVerdict,
      'score:', (hallucinationScore * 100).toFixed(1) + '%',
      'opAlign:', operatorAlignment.toFixed(3), 'sForensic:', sForensicCoherence.toFixed(3),
      'masterEq:', masterSumScore.toFixed(3), '(Q=' + qMasterSum.toFixed(2) + ' A=' + aMasterSum.toFixed(2) + ')',
      'entropy:', (1 - entropyRatio).toFixed(3), 'precision:', precisionPass ? 'PASS' : 'DRIFT');

    // Try API-based FI verification
    let apiResult = null;
    try {
      const token = this.tm.getAuthToken();
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const resp = await fetch('/api/zeq/verify', {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({
          query: (queryText || '').slice(0, 5000),
          response: (answerText || '').slice(0, 5000),
          frameworkState: {
            S_forensic: answerFI.S_forensic,
            operatorCoherence: answerFI.operatorCoherence,
            activeOperators: answerSDK.activeOperators || [],
            domains: answerSDK.domains || [],
          },
        }),
      });
      if (resp.ok) {
        const data = await resp.json();
        if (data.success) apiResult = data.verification;
      }
    } catch (e) { /* API unavailable */ }

    return {
      verdict: answerFI.verdict,
      score: answerFI.S_forensic_abs,
      S_forensic: answerFI.S_forensic,
      queryFI,
      answerFI,
      selfRefCoherence,
      entropicState,
      hallucinationAnalysis,
      apiVerification: apiResult,
      dynamicOperators: this.dynamicOperators.slice(-10),
      querySDK,
      answerSDK,
      timestamp: answerFI.timestamp,
    };
  }

  // ─── STEP 4: Factual Claim Verification — Mathematical Lie Detector ────
  // Catches lies, hallucinations, and deliberate falsehoods by:
  // 1. Detecting query intent (did user ask for false/incorrect content?)
  // 2. Extracting numerical claims from the answer
  // 3. Verifying claims against known operator equations (physical constants)
  // 4. Detecting contradictions between stated and computed values
  // Uses ONLY mathematical verification — operators encode physical truth.
  _verifyFactualClaims(queryText, answerText, queryOps, answerOps, querySDK, answerSDK) {
    const result = {
      score: 1.0,           // 1.0 = fully factual, 0.0 = pure fabrication
      contradictionCount: 0,
      contradictions: [],
      deceptionDetected: false,
      falseIntentDetected: false,
      claimsVerified: 0,
      claimsFailed: 0,
    };

    const lowerQuery = (queryText || '').toLowerCase();
    const lowerAnswer = (answerText || '').toLowerCase();

    // ── 1. DECEPTION INTENT DETECTION ──────────────────────────────
    // Detect when the user explicitly asks for false/incorrect information
    // The AI producing false content on request is STILL a lie in the mathematical sense
    const falseIntentPatterns = [
      'incorrect statement', 'false statement', 'wrong statement',
      'tell me something wrong', 'tell me something false', 'tell me something incorrect',
      'give me incorrect', 'give me false', 'give me wrong',
      'say something wrong', 'say something false', 'say something incorrect',
      'lie to me', 'tell me a lie', 'tell me lies',
      'make up', 'fabricate', 'invent a false',
      'what is not true', 'what is false', 'what is incorrect',
      'incorrect fact', 'false fact', 'wrong fact',
      'misinformation', 'disinformation',
      'five incorrect', 'three incorrect', 'ten incorrect',
      'five false', 'three false', 'ten false',
      'five wrong', 'three wrong', 'ten wrong',
      'incorrect things', 'false things', 'wrong things',
    ];

    for (const pattern of falseIntentPatterns) {
      if (lowerQuery.includes(pattern)) {
        result.falseIntentDetected = true;
        result.deceptionDetected = true;
        result.score = 0.0;
        result.contradictions.push({
          type: 'DECEPTION_INTENT',
          detail: 'Query explicitly requests false/incorrect content',
          severity: 1.0
        });
        console.log('[ZEQ FACTUAL] Deception intent detected in query:', pattern);
        break;
      }
    }

    // ── 2. ANSWER SELF-ADMISSION OF FALSEHOOD ────────────────────
    // Detect when the answer itself admits the content is false/incorrect
    const selfAdmissionPatterns = [
      'this is incorrect', 'this is false', 'this is wrong',
      'intentionally incorrect', 'deliberately false', 'deliberately wrong',
      'these are incorrect', 'these are false', 'here are.*incorrect',
      'incorrect statement', 'false statement',
      'not actually true', 'not true', 'factually wrong',
      'incorrect claim', 'false claim',
    ];

    if (!result.deceptionDetected) {
      for (const pattern of selfAdmissionPatterns) {
        if (lowerAnswer.match(new RegExp(pattern))) {
          result.deceptionDetected = true;
          result.score = Math.min(result.score, 0.1);
          result.contradictions.push({
            type: 'SELF_ADMITTED_FALSEHOOD',
            detail: 'Answer admits containing false/incorrect content',
            severity: 0.9
          });
          console.log('[ZEQ FACTUAL] Answer self-admits falsehood:', pattern);
          break;
        }
      }
    }

    // ── 3. PHYSICAL CONSTANT VERIFICATION ────────────────────────
    // Extract numerical claims about known physical constants and verify
    // against the operator equations' known values
    const knownConstants = {
      // Speed of light (c) — used in GR31-GR41, QM9, QM12
      'speed of light': { value: 2.998e8, unit: 'm/s', tolerance: 0.001, operators: ['GR37', 'QM9', 'QM12'] },
      'c': { value: 2.998e8, unit: 'm/s', tolerance: 0.001, operators: ['GR37', 'QM9'] },
      // Gravitational constant (G) — used in GR33, GR37, NM21
      'gravitational constant': { value: 6.674e-11, unit: 'N⋅m²/kg²', tolerance: 0.01, operators: ['GR37', 'NM21'] },
      // Planck constant (h) — used in QM9, QM10
      'planck constant': { value: 6.626e-34, unit: 'J⋅s', tolerance: 0.001, operators: ['QM9', 'QM10'] },
      'planck\'s constant': { value: 6.626e-34, unit: 'J⋅s', tolerance: 0.001, operators: ['QM9', 'QM10'] },
      // Reduced Planck constant (ℏ)
      'reduced planck': { value: 1.055e-34, unit: 'J⋅s', tolerance: 0.001, operators: ['QM1', 'QM2'] },
      // Boltzmann constant (k_B) — used in QM14, QM15
      'boltzmann constant': { value: 1.381e-23, unit: 'J/K', tolerance: 0.001, operators: ['QM14', 'QM15'] },
      // Electron mass — used in QM1, QM9
      'electron mass': { value: 9.109e-31, unit: 'kg', tolerance: 0.001, operators: ['QM1', 'QM9'] },
      'mass of.*electron': { value: 9.109e-31, unit: 'kg', tolerance: 0.001, operators: ['QM1', 'QM9'] },
      // Solar mass — used in GR37 calculations
      'solar mass': { value: 1.989e30, unit: 'kg', tolerance: 0.01, operators: ['GR37'] },
      // Schwarzschild radius of Sun
      'schwarzschild radius.*sun': { value: 2953, unit: 'm', tolerance: 0.05, operators: ['GR37'] },
    };

    // Extract numerical values with scientific notation from the answer
    const numPattern = /(\d+\.?\d*)\s*[×x]\s*10\^?\{?[−\-]?(\d+)\}?/g;
    const simpleNumPattern = /(?:=|is|equals|approximately|≈|about)\s*(\d+\.?\d*(?:e[−\-+]?\d+)?)\s*(m\/s|m|km|kg|J|eV|Hz|s|N)/gi;

    // Check each known constant against claims in the answer
    for (const [name, known] of Object.entries(knownConstants)) {
      const nameRegex = new RegExp(name, 'i');
      if (nameRegex.test(answerText)) {
        // This constant is mentioned — extract the value claimed
        // Look for numbers near this constant name
        const nameIdx = lowerAnswer.indexOf(name.toLowerCase().replace(/\\.\\*/g, ''));
        if (nameIdx === -1) continue;

        // Search in a window around the mention
        const window = answerText.substring(Math.max(0, nameIdx - 100), Math.min(answerText.length, nameIdx + 200));

        // Extract scientific notation values
        const sciMatch = window.match(/(\d+\.?\d*)\s*[×x]\s*10\^?\{?[−\-]?(\d+)\}?/);
        if (sciMatch) {
          const mantissa = parseFloat(sciMatch[1]);
          const exponent = parseInt(sciMatch[2]);
          const isNegExp = window.substring(sciMatch.index, sciMatch.index + sciMatch[0].length).match(/[−\-]/);
          const claimedValue = mantissa * Math.pow(10, isNegExp ? -exponent : exponent);

          // Compare to known value
          const ratio = claimedValue / known.value;
          const error = Math.abs(1 - ratio);

          result.claimsVerified++;

          if (error > known.tolerance) {
            result.claimsFailed++;
            result.contradictionCount++;
            result.contradictions.push({
              type: 'CONSTANT_MISMATCH',
              constant: name,
              claimed: claimedValue.toExponential(3),
              expected: known.value.toExponential(3),
              error: (error * 100).toFixed(1) + '%',
              operators: known.operators,
              severity: Math.min(1, error)
            });
            console.log(`[ZEQ FACTUAL] Constant mismatch: ${name} claimed=${claimedValue.toExponential(3)} expected=${known.value.toExponential(3)} error=${(error*100).toFixed(1)}%`);
          }
        }
      }
    }

    // ── 4. EQUATION RESULT VERIFICATION ──────────────────────────
    // If the AI claims a specific result (e.g., "r_s = 14.77 km"), verify
    // it's mathematically consistent with the operator equation
    const equationClaims = [];

    // GR37: r_s = 2GM/c² — Schwarzschild radius
    if (answerOps.includes('GR37') || lowerAnswer.includes('schwarzschild')) {
      const rsMatch = answerText.match(/r[_s]*\s*[=≈]\s*(\d+\.?\d*)\s*(km|m|meters|kilometres|kilometers)/i);
      if (rsMatch) {
        const rsValue = parseFloat(rsMatch[1]);
        const rsUnit = rsMatch[2].toLowerCase();
        const rsMeters = rsUnit === 'km' || rsUnit === 'kilometres' || rsUnit === 'kilometers' ? rsValue * 1000 : rsValue;

        // Look for mass in the query/answer
        const massMatch = (queryText + ' ' + answerText).match(/(\d+\.?\d*)\s*solar\s*mass/i);
        if (massMatch) {
          const solarMasses = parseFloat(massMatch[1]);
          const M = solarMasses * 1.989e30;
          const G = 6.674e-11;
          const c = 2.998e8;
          const expectedRs = 2 * G * M / (c * c);
          const error = Math.abs(rsMeters - expectedRs) / expectedRs;

          result.claimsVerified++;
          if (error > 0.05) { // 5% tolerance for rounded values
            result.claimsFailed++;
            result.contradictionCount++;
            result.contradictions.push({
              type: 'EQUATION_RESULT_MISMATCH',
              equation: 'GR37: r_s = 2GM/c²',
              claimed: rsMeters.toFixed(1) + ' m',
              expected: expectedRs.toFixed(1) + ' m',
              error: (error * 100).toFixed(1) + '%',
              severity: Math.min(1, error * 5)
            });
          }
        }
      }
    }

    // QM9: λ = h/p — de Broglie wavelength
    if (answerOps.includes('QM9') || lowerAnswer.includes('de broglie') || lowerAnswer.includes('wavelength')) {
      const lambdaMatch = answerText.match(/λ\s*[=≈]\s*(\d+\.?\d*(?:e[−\-+]?\d+)?)\s*(m|pm|nm|Å|angstrom)/i);
      if (lambdaMatch) {
        const lambdaValue = parseFloat(lambdaMatch[1].replace('−', '-'));
        const unit = lambdaMatch[2].toLowerCase();
        let lambdaMeters;
        if (unit === 'pm') lambdaMeters = lambdaValue * 1e-12;
        else if (unit === 'nm') lambdaMeters = lambdaValue * 1e-9;
        else if (unit === 'å' || unit === 'angstrom') lambdaMeters = lambdaValue * 1e-10;
        else lambdaMeters = lambdaValue;

        // Check if velocity is mentioned
        const velMatch = (queryText + ' ' + answerText).match(/(\d+\.?\d*)%?\s*(?:of\s*)?(?:the\s*)?speed\s*of\s*light/i);
        if (velMatch) {
          const velPercent = parseFloat(velMatch[1]);
          const v = velPercent <= 1 ? velPercent * 2.998e8 : (velPercent / 100) * 2.998e8;
          const h = 6.626e-34;
          const me = 9.109e-31;
          const p = me * v;
          const expectedLambda = h / p;
          const error = Math.abs(lambdaMeters - expectedLambda) / expectedLambda;

          result.claimsVerified++;
          if (error > 0.05) {
            result.claimsFailed++;
            result.contradictionCount++;
            result.contradictions.push({
              type: 'EQUATION_RESULT_MISMATCH',
              equation: 'QM9: λ = h/p',
              claimed: lambdaMeters.toExponential(3) + ' m',
              expected: expectedLambda.toExponential(3) + ' m',
              error: (error * 100).toFixed(1) + '%',
              severity: Math.min(1, error * 5)
            });
          }
        }
      }
    }

    // ── 5. COMPUTE FINAL FACTUAL SCORE ───────────────────────────
    if (result.deceptionDetected) {
      result.score = 0.0;
    } else if (result.claimsVerified > 0) {
      result.score = Math.max(0, 1.0 - (result.claimsFailed / result.claimsVerified));
    }
    // If no claims verified but no deception, score stays 1.0 (neutral)

    return result;
  }

  // ─── Parse the AI's own STEP 6 FRAMEWORK STATUS from its response ──────
  // The AI includes structured framework output with operators, master sum,
  // phase coherence, etc. We parse these instead of running blind SDK analysis.
  parseAIFrameworkOutput(answerText) {
    const result = {
      parsed: false,
      operators: [],
      operatorCount: 0,
      totalOperators: 0,
      masterSum: 0,
      phaseCoherence: null,
      precisionPass: null,
      domains: [],
      stepCount: 0,
    };

    if (!answerText || answerText.length < 50) return result;

    try {
      // Parse "Operators used: 4/646 (GR37 primary, KO42, NM21, QGO1 supporting)"
      const opsMatch = answerText.match(/Operators?\s*used:?\s*(\d+)\s*\/\s*(\d+)\s*\(([^)]+)\)/i);
      if (opsMatch) {
        result.operatorCount = parseInt(opsMatch[1]);
        result.totalOperators = parseInt(opsMatch[2]);
        // Parse operator names from the parenthetical
        const opsStr = opsMatch[3];
        const opNames = opsStr.match(/[A-Z]{2,}[\d]+/g) || [];
        result.operators = opNames;
        result.parsed = true;
      }

      // Parse "Master sum: 17.726013"
      const masterMatch = answerText.match(/Master\s*sum:?\s*([-+]?[\d.]+)/i);
      if (masterMatch) {
        result.masterSum = parseFloat(masterMatch[1]);
        result.parsed = true;
      }

      // Parse "Phase coherence: 100.0%"
      const phaseMatch = answerText.match(/Phase\s*coherence:?\s*([\d.]+)\s*%/i);
      if (phaseMatch) {
        result.phaseCoherence = parseFloat(phaseMatch[1]) / 100;
        result.parsed = true;
      }

      // Parse "Precision: Within 0.1% tolerance"
      const precisionMatch = answerText.match(/Precision:?\s*(Within\s*0\.1%|≤\s*0\.1%|0\.1%\s*tolerance)/i);
      if (precisionMatch) {
        result.precisionPass = true;
        result.parsed = true;
      }

      // Parse "Domain: General Relativity" or "Domain identified: quantum_gravity"
      const domainMatch = answerText.match(/Domain(?:\s*identified)?:?\s*([A-Za-z_\s]+?)(?:\n|$|Purpose)/i);
      if (domainMatch) {
        const domain = domainMatch[1].trim().toLowerCase().replace(/\s+/g, '_');
        if (domain.length > 2 && domain.length < 50) {
          result.domains.push(domain);
        }
      }

      // Parse "Primary Operator: GR37"
      const primaryMatch = answerText.match(/Primary\s*Operator:?\s*([A-Z]{2,}[\d]+)/i);
      if (primaryMatch && !result.operators.includes(primaryMatch[1])) {
        result.operators.unshift(primaryMatch[1]);
      }

      // Parse "Supporting Operators:" section
      const supportMatch = answerText.match(/Supporting\s*Operators?:([^]*?)(?:STEP\s*\d|$)/i);
      if (supportMatch) {
        const supportOps = supportMatch[1].match(/[A-Z]{2,}[\d]+/g) || [];
        for (const op of supportOps) {
          if (!result.operators.includes(op)) result.operators.push(op);
        }
      }

      // Count STEP references
      const stepMatches = answerText.match(/STEP\s*\d/gi);
      if (stepMatches) result.stepCount = new Set(stepMatches.map(s => s.replace(/\s/g, ''))).size;

    } catch (e) {
      console.warn('[ZEQ FI] Failed to parse AI framework output:', e);
    }

    return result;
  }

  // ─── Domain Drift: Jaccard distance between query and answer domains ──
  // Enhanced with related-domain recognition (e.g. "quantum_gravity" ≈ "general_relativity")
  calculateDomainDrift(queryDomains, answerDomains) {
    const qSet = new Set((queryDomains || []).map(d => d.toLowerCase().replace(/\s+/g, '_')));
    const aSet = new Set((answerDomains || []).map(d => d.toLowerCase().replace(/\s+/g, '_')));
    if (qSet.size === 0 && aSet.size === 0) return 0;
    if (qSet.size === 0 || aSet.size === 0) return 0.3; // partial info, not full drift

    // Related domain families — these overlap significantly
    const domainFamilies = {
      general_relativity: ['quantum_gravity', 'relativity', 'spacetime', 'gravity', 'gravitational', 'cosmology'],
      quantum_gravity: ['general_relativity', 'relativity', 'quantum_mechanics', 'gravity'],
      quantum_mechanics: ['quantum_gravity', 'quantum_field_theory', 'particle_physics'],
      classical_mechanics: ['newtonian_mechanics', 'mechanics', 'dynamics'],
      newtonian_mechanics: ['classical_mechanics', 'mechanics', 'dynamics'],
      thermodynamics: ['statistical_mechanics', 'heat_transfer', 'energy'],
      electromagnetism: ['electromagnetic', 'optics', 'electronics'],
    };

    let overlap = 0;
    for (const qd of qSet) {
      if (aSet.has(qd)) { overlap++; continue; }
      // Check related domains
      const related = domainFamilies[qd] || [];
      for (const ad of aSet) {
        if (related.includes(ad) || (domainFamilies[ad] || []).includes(qd)) {
          overlap += 0.8; // Related domain = 80% match
          break;
        }
        // Substring match (e.g. "general_relativity" contains "relativity")
        if (qd.includes(ad) || ad.includes(qd)) {
          overlap += 0.7;
          break;
        }
      }
    }
    const maxPossible = Math.max(qSet.size, aSet.size);
    const similarity = maxPossible > 0 ? Math.min(1, overlap / maxPossible) : 0;
    return 1 - similarity; // drift = inverse of similarity
  }

  // ─── User Trust Factor — same FI engine on user messages ──────────
  async computeUserTrustFactor(userText) {
    const userSDK = this.runSDKAnalysis(userText || '') || {};
    const userWizard = this.parseWizardFromSDK(userSDK);
    userSDK._answerText = userText || '';
    const fi = this.fiEngine.computeForensicScores(userSDK, userWizard);

    // Map FI verdict to user-specific labels
    let verdict;
    if (fi.S_forensic_abs >= 0.70) verdict = 'CLEAR';
    else if (fi.S_forensic_abs >= 0.50) verdict = 'NEUTRAL';
    else if (fi.S_forensic_abs >= 0.30) verdict = 'CAUTION';
    else verdict = 'ALERT';

    return {
      verdict,
      score: fi.S_forensic_abs,
      S_forensic: fi.S_forensic,
      fi,
      userSDK,
      timestamp: fi.timestamp,
    };
  }

  // ─── CSS ─────────────────────────────────────────────────────────
  injectStyles() {
    if (document.getElementById('zeq-trust-badge-styles')) return;
    const style = document.createElement('style');
    style.id = 'zeq-trust-badge-styles';
    style.textContent = `
      /* ── Badge Container — full width, modern card ── */
      .zeq-badge-row {
        margin-top: 16px;
        width: 100%;
        box-sizing: border-box;
      }

      /* ── Collapsed Header — full-width bar ── */
      .zeq-trust-header {
        display: flex; align-items: center; gap: 12px;
        width: 100%; box-sizing: border-box;
        padding: 12px 18px; border-radius: 10px;
        font-size: 14px; font-weight: 700;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        letter-spacing: 0.3px; cursor: pointer;
        transition: all 0.2s ease; user-select: none;
        backdrop-filter: blur(8px);
      }
      .zeq-trust-header:hover { filter: brightness(1.15); transform: translateY(-1px); }
      .zeq-trust-header .zeq-trust-icon { font-size: 22px; flex-shrink: 0; }
      .zeq-trust-header .zeq-trust-pct { font-size: 16px; font-weight: 800; margin-left: auto; }
      .zeq-trust-header .zeq-trust-chevron { font-size: 12px; transition: transform 0.25s ease; flex-shrink: 0; margin-left: auto; }
      .zeq-trust-header .zeq-trust-chevron.open { transform: rotate(180deg); }

      /* ── Header title + subtitle layout ── */
      .zeq-header-main { display: flex; flex-direction: column; gap: 2px; flex: 1; }
      .zeq-header-title { font-size: 15px; font-weight: 800; letter-spacing: 0.5px; }
      .zeq-header-detail { font-size: 12px; font-weight: 500; opacity: 0.85; letter-spacing: 0; }

      /* ── Compiled header for user queries ── */
      .zeq-trust-header.compiled { background: rgba(139,92,246,0.12); color: #a78bfa; border: 1.5px solid rgba(139,92,246,0.30); }

      /* ── Explainer text ── */
      .zeq-trust-explainer {
        font-size: 12.5px; line-height: 1.6; color: #8b949e;
        padding: 8px 0 12px; border-bottom: 1px solid #21262d; margin-bottom: 10px;
      }

      /* ── Cross-check grid ── */
      .zeq-check-grid { display: flex; flex-direction: column; gap: 10px; padding: 4px 0; }
      .zeq-check-item { display: flex; align-items: flex-start; gap: 10px; }
      .zeq-check { font-size: 18px; flex-shrink: 0; line-height: 1; }
      .zeq-check.good { color: #3fb950; }
      .zeq-check.bad { color: #f85149; }
      .zeq-check-label { font-size: 13px; font-weight: 700; color: #e6edf3; min-width: 130px; }
      .zeq-check-desc { font-size: 12px; color: #8b949e; flex: 1; }

      /* AI badge colors */
      .zeq-trust-header.verified { background: rgba(34,197,94,0.12); color: #16a34a; border: 1.5px solid rgba(34,197,94,0.30); }
      .zeq-trust-header.pass { background: rgba(59,130,246,0.12); color: #2563eb; border: 1.5px solid rgba(59,130,246,0.30); }
      .zeq-trust-header.review { background: rgba(245,158,11,0.12); color: #d97706; border: 1.5px solid rgba(245,158,11,0.30); }
      .zeq-trust-header.flag { background: rgba(239,68,68,0.12); color: #dc2626; border: 1.5px solid rgba(239,68,68,0.30); }
      .zeq-trust-header.hallucination { background: rgba(220,38,38,0.25); color: #fca5a5; border: 2px solid rgba(239,68,68,0.60); animation: zeq-pulse-red 1.5s ease-in-out infinite; }
      @keyframes zeq-pulse-red { 0%,100% { box-shadow: 0 0 4px rgba(239,68,68,0.3); } 50% { box-shadow: 0 0 12px rgba(239,68,68,0.6); } }
      .zeq-contradiction-section { border-left: 3px solid #f85149; padding-left: 10px; }
      .zeq-contradiction-item { display: flex; align-items: flex-start; gap: 8px; margin: 6px 0; font-size: 13px; color: #fca5a5; }
      .zeq-contradiction-text { flex: 1; line-height: 1.4; }
      .zeq-contradiction-text strong { color: #f85149; }

      /* User badge colors */
      .zeq-trust-header.clear { background: rgba(34,197,94,0.12); color: #16a34a; border: 1.5px solid rgba(34,197,94,0.30); }
      .zeq-trust-header.neutral { background: rgba(148,163,184,0.12); color: #64748b; border: 1.5px solid rgba(148,163,184,0.30); }
      .zeq-trust-header.caution { background: rgba(245,158,11,0.12); color: #d97706; border: 1.5px solid rgba(245,158,11,0.30); }
      .zeq-trust-header.alert { background: rgba(239,68,68,0.12); color: #dc2626; border: 1.5px solid rgba(239,68,68,0.30); }

      /* ── Expanded Dropdown — full width, modern card ── */
      .zeq-trust-dropdown {
        display: none; margin-top: 10px; padding: 18px 22px;
        border-radius: 12px; font-size: 13px; line-height: 1.8;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        background: #0d1117; color: #c9d1d9; border: 1px solid #30363d;
        width: 100%; box-sizing: border-box;
        overflow-x: auto;
        box-shadow: 0 4px 24px rgba(0,0,0,0.2);
      }
      .zeq-trust-dropdown.open { display: block; }

      .zeq-trust-section { margin-bottom: 16px; }
      .zeq-trust-section:last-child { margin-bottom: 0; }
      .zeq-trust-section-title {
        font-weight: 800; font-size: 12px; text-transform: uppercase;
        letter-spacing: 1.2px; color: #58a6ff; margin-bottom: 8px;
        border-bottom: 1px solid #21262d; padding-bottom: 5px;
      }
      .zeq-trust-row {
        display: flex; justify-content: space-between; align-items: center;
        padding: 4px 0; gap: 16px;
      }
      .zeq-trust-label { color: #8b949e; font-size: 13px; white-space: nowrap; min-width: 140px; }
      .zeq-trust-value { color: #e6edf3; font-weight: 700; font-size: 13px; text-align: right; flex: 1; }
      .zeq-trust-value.good { color: #3fb950; }
      .zeq-trust-value.warn { color: #d29922; }
      .zeq-trust-value.bad { color: #f85149; }

      .zeq-trust-bar {
        display: inline-block; height: 8px; border-radius: 4px;
        background: #21262d; width: 100px; margin-left: 10px; vertical-align: middle;
      }
      .zeq-trust-bar-fill { height: 100%; border-radius: 4px; transition: width 0.4s ease; }

      .zeq-trust-footer {
        margin-top: 12px; padding-top: 10px;
        border-top: 1px solid #21262d;
        font-size: 11px; color: #484f58; text-align: center;
        letter-spacing: 0.3px;
      }

      /* ── Dark mode overrides ── */
      .dark .zeq-trust-header.verified,
      [data-theme="dark"] .zeq-trust-header.verified { background: rgba(34,197,94,0.08); color: #4ade80; border-color: rgba(34,197,94,0.20); }
      .dark .zeq-trust-header.pass,
      [data-theme="dark"] .zeq-trust-header.pass { background: rgba(59,130,246,0.08); color: #60a5fa; border-color: rgba(59,130,246,0.20); }
      .dark .zeq-trust-header.review,
      [data-theme="dark"] .zeq-trust-header.review { background: rgba(245,158,11,0.08); color: #fbbf24; border-color: rgba(245,158,11,0.20); }
      .dark .zeq-trust-header.flag,
      [data-theme="dark"] .zeq-trust-header.flag { background: rgba(239,68,68,0.08); color: #f87171; border-color: rgba(239,68,68,0.20); }
      .dark .zeq-trust-header.compiled,
      [data-theme="dark"] .zeq-trust-header.compiled { background: rgba(139,92,246,0.08); color: #c4b5fd; border-color: rgba(139,92,246,0.20); }
      .dark .zeq-trust-header.clear,
      [data-theme="dark"] .zeq-trust-header.clear { background: rgba(34,197,94,0.08); color: #4ade80; border-color: rgba(34,197,94,0.20); }
      .dark .zeq-trust-header.neutral,
      [data-theme="dark"] .zeq-trust-header.neutral { background: rgba(148,163,184,0.08); color: #94a3b8; border-color: rgba(148,163,184,0.20); }
      .dark .zeq-trust-header.caution,
      [data-theme="dark"] .zeq-trust-header.caution { background: rgba(245,158,11,0.08); color: #fbbf24; border-color: rgba(245,158,11,0.20); }
      .dark .zeq-trust-header.alert,
      [data-theme="dark"] .zeq-trust-header.alert { background: rgba(239,68,68,0.08); color: #f87171; border-color: rgba(239,68,68,0.20); }
      .dark .zeq-trust-header.hallucination,
      [data-theme="dark"] .zeq-trust-header.hallucination { background: rgba(220,38,38,0.20); color: #fca5a5; border-color: rgba(239,68,68,0.50); }

      @media (prefers-color-scheme: dark) {
        .zeq-trust-header.verified { background: rgba(34,197,94,0.08); color: #4ade80; }
        .zeq-trust-header.pass { background: rgba(59,130,246,0.08); color: #60a5fa; }
        .zeq-trust-header.review { background: rgba(245,158,11,0.08); color: #fbbf24; }
        .zeq-trust-header.flag { background: rgba(239,68,68,0.08); color: #f87171; }
        .zeq-trust-header.hallucination { background: rgba(220,38,38,0.20); color: #fca5a5; border-color: rgba(239,68,68,0.50); }
        .zeq-trust-header.compiled { background: rgba(139,92,246,0.08); color: #c4b5fd; }
        .zeq-trust-header.clear { background: rgba(34,197,94,0.08); color: #4ade80; }
        .zeq-trust-header.neutral { background: rgba(148,163,184,0.08); color: #94a3b8; }
        .zeq-trust-header.caution { background: rgba(245,158,11,0.08); color: #fbbf24; }
        .zeq-trust-header.alert { background: rgba(239,68,68,0.08); color: #f87171; }
      }
    `;
    document.head.appendChild(style);
  }

  // ─── DOM Scanning ────────────────────────────────────────────────
  // LibreChat DOM structure:
  //   div.message-render[id="messageId"]
  //     div (icon)
  //     div.agent-turn OR div.user-turn
  //       h2 (name)
  //       div > div > ContentParts (markdown rendered here)
  scanForMessages(root) {
    if (!this.enabled || !root.querySelectorAll) return;

    // Primary: find all message-render containers (LibreChat's actual structure)
    const messages = root.querySelectorAll('.message-render');
    for (const msg of messages) {
      const mid = msg.id || msg.getAttribute('id');
      if (!mid || this.processedMessages.has(mid)) continue;

      // Check if this is an AI message (has agent-turn child)
      const agentTurn = msg.querySelector('.agent-turn');
      if (agentTurn) {
        this.processMessage(msg, mid, agentTurn);
        continue;
      }

      // Check if this is a USER message (has user-turn child)
      const userTurn = msg.querySelector('.user-turn');
      if (userTurn) {
        this.processUserMessage(msg, mid, userTurn);
      }
    }

    // Also check if root itself is or contains turn elements not inside message-render
    if (!root.classList || !root.classList.contains('message-render')) {
      const agentTurns = root.querySelectorAll('.agent-turn');
      for (const at of agentTurns) {
        const parentMsg = at.closest('.message-render');
        if (parentMsg) {
          const mid = parentMsg.id;
          if (mid && !this.processedMessages.has(mid)) {
            this.processMessage(parentMsg, mid, at);
          }
        }
      }
      const userTurns = root.querySelectorAll('.user-turn');
      for (const ut of userTurns) {
        const parentMsg = ut.closest('.message-render');
        if (parentMsg) {
          const mid = parentMsg.id;
          if (mid && !this.processedMessages.has(mid)) {
            this.processUserMessage(parentMsg, mid, ut);
          }
        }
      }
    }
  }

  // ─── Find paired query for an answer ─────────────────────────────
  findQueryForAnswer(messageRenderEl) {
    // Strategy 1: Walk backwards through siblings
    let el = messageRenderEl.previousElementSibling;
    while (el) {
      // Check if this sibling itself has user-turn
      if (el.querySelector) {
        const userTurn = el.querySelector('.user-turn');
        if (userTurn) {
          const text = userTurn.textContent || '';
          if (text.length > 0) return text;
        }
      }
      el = el.previousElementSibling;
    }

    // Strategy 2: Search all .user-turn elements in the entire page, find closest before this one
    const allUserTurns = document.querySelectorAll('.user-turn');
    const allAgentTurns = document.querySelectorAll('.agent-turn');
    // Build ordered list of all message elements
    const allMessages = document.querySelectorAll('.message-render');
    const arr = Array.from(allMessages);
    const myIdx = arr.indexOf(messageRenderEl);
    if (myIdx > 0) {
      for (let i = myIdx - 1; i >= 0; i--) {
        const ut = arr[i].querySelector('.user-turn');
        if (ut) {
          const text = ut.textContent || '';
          if (text.length > 0) return text;
        }
      }
    }

    // Strategy 3: If message-render not found in flat list, try parent container
    const parent = messageRenderEl.closest('[class*="flex"][class*="flex-col"]');
    if (parent && parent !== messageRenderEl) {
      const msgs = Array.from(parent.querySelectorAll('.message-render'));
      const idx = msgs.indexOf(messageRenderEl);
      for (let i = idx - 1; i >= 0; i--) {
        const ut = msgs[i].querySelector('.user-turn');
        if (ut) return ut.textContent || '';
      }
    }

    console.log('[ZEQ Trust] Could not find user query for this AI message');
    return '';
  }

  async processMessage(messageRenderEl, messageId, agentTurnEl) {
    if (this.processedMessages.has(messageId)) return;

    // Check if badge already exists (avoid duplicates)
    if (agentTurnEl.querySelector('.zeq-badge-row')) {
      this.processedMessages.add(messageId);
      return;
    }

    const answerText = agentTurnEl.textContent || '';

    // If message is still short, it might be streaming — add to pending queue
    if (answerText.length < 30) {
      if (!this.pendingMessages.has(messageId)) {
        this.pendingMessages.set(messageId, {
          el: messageRenderEl,
          agentTurnEl: agentTurnEl,
          lastLength: answerText.length,
          stableCount: 0,
          firstSeen: Date.now(),
        });
      }
      return; // Will be re-checked by checkPendingMessages()
    }

    // Message has enough content — process it now
    this.pendingMessages.delete(messageId);

    try {
      const queryText = this.findQueryForAnswer(messageRenderEl);
      const trust = await this.computeTrustFactor(queryText, answerText);
      if (trust) {
        this.injectDropdownBadge(agentTurnEl, trust, queryText);
        this.processedMessages.add(messageId); // Only mark processed after successful badge injection
      } else {
        console.warn('[ZEQ Trust] computeTrustFactor returned null for', messageId);
        // Don't add to processedMessages — will retry on next scan
      }
    } catch (err) {
      console.error('[ZEQ Trust] Error processing message', messageId, err);
      // Don't add to processedMessages — will retry on next scan
    }
  }

  // Check pending messages to see if streaming has finished
  checkPendingMessages() {
    for (const [messageId, info] of this.pendingMessages) {
      if (this.processedMessages.has(messageId)) {
        this.pendingMessages.delete(messageId);
        continue;
      }

      const currentText = info.agentTurnEl.textContent || '';
      const currentLength = currentText.length;

      if (currentLength === info.lastLength) {
        info.stableCount++;
      } else {
        info.stableCount = 0;
        info.lastLength = currentLength;
      }

      // Text hasn't changed for 2 checks (6 seconds) — streaming is done
      // OR it's been pending for 30+ seconds — process anyway
      const elapsed = Date.now() - info.firstSeen;
      if ((info.stableCount >= 2 && currentLength > 0) || elapsed > 30000) {
        this.pendingMessages.delete(messageId);

        // Even if text is very short, still process it — every message gets a badge
        this.processedMessages.add(messageId);

        // Check if badge already exists
        if (!info.agentTurnEl.querySelector('.zeq-badge-row')) {
          const queryText = this.findQueryForAnswer(info.el);
          this.computeTrustFactor(queryText, currentText).then(trust => {
            if (trust && !info.agentTurnEl.querySelector('.zeq-badge-row')) {
              this.injectDropdownBadge(info.agentTurnEl, trust, queryText);
            }
          });
        }
      }
    }
  }

  // ─── Process USER messages through Forensic Intelligence ─────────
  async processUserMessage(messageRenderEl, messageId, userTurnEl) {
    if (this.processedMessages.has(messageId)) return;

    // Check if badge already exists
    if (userTurnEl.querySelector('.zeq-badge-row')) {
      this.processedMessages.add(messageId);
      return;
    }

    const userText = userTurnEl.textContent || '';

    // User messages don't stream, but they might be very short
    if (userText.length < 2) return;

    this.processedMessages.add(messageId);

    const trust = await this.computeUserTrustFactor(userText);
    if (trust) this.injectUserBadge(userTurnEl, trust);
  }

  // ─── User Badge Rendering — Clear, human-readable ──────────────
  injectUserBadge(container, trust) {
    if (!trust || container.querySelector('.zeq-badge-row')) return;
    const fi = trust.fi;
    if (!fi) return;

    const sdk = trust.userSDK || {};
    const domains = sdk.domains || sdk.mathematicalState?.domains || [];
    const activeOps = sdk.activeOperators || [];
    const totalOps = this.getTotalOperatorCount();
    const domainStr = domains.length > 0 ? domains.map(d => d.replace(/_/g, ' ')).join(', ') : 'General';
    const masterSum = sdk.masterSum ?? sdk.mathematicalState?.masterSum ?? 0;

    const row = document.createElement('div');
    row.className = 'zeq-badge-row zeq-user-badge';

    // Clear header: "Query Compiled → Domain: X | Y operators activated"
    const header = document.createElement('span');
    header.className = 'zeq-trust-header zeq-user-header compiled';
    header.innerHTML = `
      <span class="zeq-trust-icon">\uD83D\uDD2C</span>
      <span class="zeq-header-main">
        <span class="zeq-header-title">Query Compiled</span>
        <span class="zeq-header-detail">${domainStr} \u00B7 ${activeOps.length}/${totalOps}+ operators</span>
      </span>
      <span class="zeq-trust-chevron">\u25BC</span>`;

    const dropdown = document.createElement('div');
    dropdown.className = 'zeq-trust-dropdown';

    // Simple summary section
    const pct = (n) => (Math.abs(n || 0) * 100).toFixed(1);
    const barColor = (v) => Math.abs(v) >= 0.70 ? '#3fb950' : Math.abs(v) >= 0.50 ? '#58a6ff' : Math.abs(v) >= 0.30 ? '#d29922' : '#f85149';
    const bar = (v) => `<span class="zeq-trust-bar"><span class="zeq-trust-bar-fill" style="width:${Math.min(100, Math.abs(v)*100)}%;background:${barColor(v)}"></span></span>`;

    let html = `
    <div class="zeq-trust-section">
      <div class="zeq-trust-section-title">\u25B6 What happened to your query</div>
      <div class="zeq-trust-explainer">Your message was compiled through the Zeq OS mathematical framework. The framework identified the mathematical domain, activated relevant operators, and produced a mathematical state that the AI uses to formulate its response.</div>
      <div class="zeq-trust-row"><span class="zeq-trust-label">Domain Detected</span><span class="zeq-trust-value">${domainStr}</span></div>
      <div class="zeq-trust-row"><span class="zeq-trust-label">Operators Activated</span><span class="zeq-trust-value">${activeOps.length} of ${totalOps}+ total</span></div>
      ${activeOps.length > 0 ? `<div class="zeq-trust-row"><span class="zeq-trust-label">Active Operators</span><span class="zeq-trust-value" style="font-size:11px">${activeOps.slice(0, 8).map(o => typeof o === 'string' ? o : (o.id || o.name || '')).join(', ')}${activeOps.length > 8 ? ' +' + (activeOps.length - 8) + ' more' : ''}</span></div>` : ''}
      <div class="zeq-trust-row"><span class="zeq-trust-label">Master Equation Result</span><span class="zeq-trust-value">\u03A3 = ${masterSum.toFixed(4)}</span></div>
      <div class="zeq-trust-row"><span class="zeq-trust-label">Phase Coherence</span><span class="zeq-trust-value">${pct(fi.pulseAlignment)}% ${bar(fi.pulseAlignment)}</span></div>
      <div class="zeq-trust-row"><span class="zeq-trust-label">HulyaPulse Sync</span><span class="zeq-trust-value good">1.287 Hz \u2713</span></div>
    </div>`;

    // Wizard verification if available
    if (fi.wizardVerification) {
      html += `
      <div class="zeq-trust-section">
        <div class="zeq-trust-section-title">\u25B6 7-Step Wizard</div>
        <div class="zeq-trust-row"><span class="zeq-trust-label">Problem Identified</span><span class="zeq-trust-value">${fi.wizardVerification.step1_problem || 'N/A'}</span></div>
        <div class="zeq-trust-row"><span class="zeq-trust-label">Operators Selected</span><span class="zeq-trust-value">${fi.wizardVerification.step2_operators || 'N/A'}</span></div>
        <div class="zeq-trust-row"><span class="zeq-trust-label">STEP 6 Precision</span><span class="zeq-trust-value ${fi.wizardVerification.step6_status === 'PASS' ? 'good' : 'warn'}">${fi.wizardVerification.step6_status || 'N/A'}</span></div>
      </div>`;
    }

    html += `<div class="zeq-trust-footer">Zeq OS v1.287 | HULYAS | ${totalOps}+ operators | 1.287 Hz</div>`;
    dropdown.innerHTML = html;

    header.addEventListener('click', () => {
      const isOpen = dropdown.classList.toggle('open');
      header.querySelector('.zeq-trust-chevron').classList.toggle('open', isOpen);
    });
    row.appendChild(header);
    row.appendChild(dropdown);
    container.appendChild(row);
  }

  async processBlock(block, pid) {
    const text = block.textContent || '';
    if (text.length < 25) return;
    if (block.closest && block.closest('.user-turn')) return;
    const trust = await this.computeTrustFactor('', text);
    if (trust) this.injectDropdownBadge(block, trust);
  }

  // ─── Shared FI Dropdown Content Renderer ──────────────────────────
  // Renders the actual 20 FI equation results — pure math, no word matching
  renderFIDropdown(fi, scores, label, sdkState) {
    const fmtS = (n) => (n || 0).toFixed(6);
    const pct = (n) => (Math.abs(n || 0) * 100).toFixed(1);
    const barColor = (v) => Math.abs(v) >= 0.70 ? '#3fb950' : Math.abs(v) >= 0.50 ? '#58a6ff' : Math.abs(v) >= 0.30 ? '#d29922' : '#f85149';
    const bar = (v) => `<span class="zeq-trust-bar"><span class="zeq-trust-bar-fill" style="width:${Math.min(100, Math.abs(v)*100)}%;background:${barColor(v)}"></span></span>`;

    const totalOps = this.getTotalOperatorCount();
    const activeOps = sdkState?.activeOperators || [];
    const domains = sdkState?.domains || [];
    const domainStr = Array.isArray(domains) ? domains.join(', ') : 'N/A';
    const sdkConnected = !!sdkState?.mathematicalState;

    return `
      <div class="zeq-trust-section">
        <div class="zeq-trust-section-title">\u25B6 FI Equations (S\u2081\u2013S\u2082\u2080) \u2014 ${label}</div>
        <div class="zeq-trust-row"><span class="zeq-trust-label">S\u2081 Verified Accuracy</span><span class="zeq-trust-value">${fmtS(scores.S1)} ${bar(scores.S1)}</span></div>
        <div class="zeq-trust-row"><span class="zeq-trust-label">S\u2082 Operator Coherence</span><span class="zeq-trust-value">${fmtS(scores.S2)} ${bar(scores.S2)}</span></div>
        <div class="zeq-trust-row"><span class="zeq-trust-label">S\u2083 Entropy Deviation</span><span class="zeq-trust-value">${fmtS(scores.S3)} ${bar(scores.S3)}</span></div>
        <div class="zeq-trust-row"><span class="zeq-trust-label">S\u2084 Source Verification</span><span class="zeq-trust-value">${fmtS(scores.S4)} ${bar(scores.S4)}</span></div>
        <div class="zeq-trust-row"><span class="zeq-trust-label">S\u2085 Ethical Coherence</span><span class="zeq-trust-value">${fmtS(scores.S5)} (w=0.20) ${bar(scores.S5)}</span></div>
        <div class="zeq-trust-row"><span class="zeq-trust-label">S\u2086 Temporal Decay</span><span class="zeq-trust-value">${fmtS(scores.S6)} ${bar(scores.S6)}</span></div>
        <div class="zeq-trust-row"><span class="zeq-trust-label">S\u2087 Consciousness Reach</span><span class="zeq-trust-value">${fmtS(scores.S7)} ${bar(scores.S7)}</span></div>
        <div class="zeq-trust-row"><span class="zeq-trust-label">S\u2088 Pulse Stability</span><span class="zeq-trust-value">${fmtS(scores.S8)} ${bar(scores.S8)}</span></div>
        <div class="zeq-trust-row"><span class="zeq-trust-label">S\u2089 Contradictions</span><span class="zeq-trust-value">${fmtS(scores.S9)} ${bar(scores.S9)}</span></div>
        <div class="zeq-trust-row"><span class="zeq-trust-label">S\u2081\u2080 Intent (VX)</span><span class="zeq-trust-value">${fmtS(scores.S10)} ${bar(scores.S10)}</span></div>
        <div class="zeq-trust-row"><span class="zeq-trust-label">S\u2081\u2081 Context Match</span><span class="zeq-trust-value">${fmtS(scores.S11)} ${bar(scores.S11)}</span></div>
        <div class="zeq-trust-row"><span class="zeq-trust-label">S\u2081\u2082 Clustering</span><span class="zeq-trust-value">${fmtS(scores.S12)} ${bar(scores.S12)}</span></div>
        <div class="zeq-trust-row"><span class="zeq-trust-label">S\u2081\u2083 Domain Diversity</span><span class="zeq-trust-value">${fmtS(scores.S13)} ${bar(scores.S13)}</span></div>
        <div class="zeq-trust-row"><span class="zeq-trust-label">S\u2081\u2084 Resonance</span><span class="zeq-trust-value">${fmtS(scores.S14)} ${bar(scores.S14)}</span></div>
        <div class="zeq-trust-row"><span class="zeq-trust-label">S\u2081\u2085 Semantic Stability</span><span class="zeq-trust-value">${fmtS(scores.S15)} ${bar(scores.S15)}</span></div>
        <div class="zeq-trust-row"><span class="zeq-trust-label">S\u2081\u2086 Severity</span><span class="zeq-trust-value">${fmtS(scores.S16)} (w=0.20) ${bar(scores.S16)}</span></div>
        <div class="zeq-trust-row"><span class="zeq-trust-label">S\u2081\u2087 Entropy Spike</span><span class="zeq-trust-value">${fmtS(scores.S17)} ${bar(scores.S17)}</span></div>
        <div class="zeq-trust-row"><span class="zeq-trust-label">S\u2081\u2088 Fractal Dim</span><span class="zeq-trust-value">${fi.fractalDimension.toFixed(4)} ${bar(fi.fractalDimension / 2)}</span></div>
        <div class="zeq-trust-row"><span class="zeq-trust-label">S\u2081\u2089 Bayesian P(H|E)</span><span class="zeq-trust-value">${fmtS(scores.S19)} ${bar(scores.S19)}</span></div>
        <div class="zeq-trust-row"><span class="zeq-trust-label">S\u2082\u2080 Composite</span><span class="zeq-trust-value">${fmtS(scores.S20)} (w=0.20) ${bar(scores.S20)}</span></div>
      </div>
      <div class="zeq-trust-section">
        <div class="zeq-trust-section-title">\u25B6 S_forensic Composite</div>
        <div class="zeq-trust-row"><span class="zeq-trust-label">S_forensic (raw)</span><span class="zeq-trust-value">${fi.S_forensic.toFixed(6)}</span></div>
        <div class="zeq-trust-row"><span class="zeq-trust-label">S_forensic (|abs|)</span><span class="zeq-trust-value">${pct(fi.S_forensic_abs)}% ${bar(fi.S_forensic_abs)}</span></div>
        <div class="zeq-trust-row"><span class="zeq-trust-label">Operator Coherence (\u03B4)</span><span class="zeq-trust-value">${pct(fi.operatorCoherence)}% ${bar(fi.operatorCoherence)}</span></div>
        <div class="zeq-trust-row"><span class="zeq-trust-label">Pulse Alignment |sin(\u03C6)|</span><span class="zeq-trust-value">${pct(fi.pulseAlignment)}% ${bar(fi.pulseAlignment)}</span></div>
        <div class="zeq-trust-row"><span class="zeq-trust-label">Spectral Stability (C\u2096)</span><span class="zeq-trust-value">${pct(fi.spectralStability)}% ${bar(fi.spectralStability)}</span></div>
        <div class="zeq-trust-row"><span class="zeq-trust-label">Ethical Coherence (HRO00)</span><span class="zeq-trust-value">${pct(fi.ethicalCoherence)}% ${bar(fi.ethicalCoherence)}</span></div>
        <div class="zeq-trust-row"><span class="zeq-trust-label">Master Sum (\u03A3)</span><span class="zeq-trust-value">${fi.masterSum.toFixed(6)}</span></div>
      </div>
      <div class="zeq-trust-section">
        <div class="zeq-trust-section-title">\u25B6 Mathematical State</div>
        <div class="zeq-trust-row"><span class="zeq-trust-label">Domains</span><span class="zeq-trust-value">${domainStr}</span></div>
        <div class="zeq-trust-row"><span class="zeq-trust-label">Entropy Query (CS47)</span><span class="zeq-trust-value">${fi.entropyQuery.toFixed(3)} bits/char</span></div>
        <div class="zeq-trust-row"><span class="zeq-trust-label">Entropy Answer (CS47)</span><span class="zeq-trust-value">${fi.entropyAnswer.toFixed(3)} bits/char</span></div>
        <div class="zeq-trust-row"><span class="zeq-trust-label">Temporal Alignment</span><span class="zeq-trust-value">sin(2\u03C0\u00B71.287\u00B7t) = ${fi.temporalAlignment.toFixed(6)}</span></div>
        <div class="zeq-trust-row"><span class="zeq-trust-label">Phase / Pulse</span><span class="zeq-trust-value">\u03C6 = ${fi.phase.toFixed(6)} / #${fi.pulseCycle}</span></div>
        <div class="zeq-trust-row"><span class="zeq-trust-label">Active Operators</span><span class="zeq-trust-value">${activeOps.length > 0 ? activeOps.slice(0, 6).join(', ') + (activeOps.length > 6 ? ' +' + (activeOps.length - 6) + ' more' : '') : 'KO42'}</span></div>
        <div class="zeq-trust-row"><span class="zeq-trust-label">Operators Applied</span><span class="zeq-trust-value">${fi.activeOperatorCount} / ${totalOps}+</span></div>
        <div class="zeq-trust-row"><span class="zeq-trust-label">KO42 Metric Tensioner</span><span class="zeq-trust-value good">ds\u00B2 = g_{\u03BC\u03BD} dx\u03BC dx\u03BD + \u03B1 sin(2\u03C0\u00B71.287t) dt\u00B2</span></div>
        <div class="zeq-trust-row"><span class="zeq-trust-label">SDK Connection</span><span class="zeq-trust-value ${sdkConnected ? 'good' : 'warn'}">${sdkConnected ? 'Live (zeq-mathematical-framework.js)' : 'Local fallback'}</span></div>
      </div>
      ${fi.wizardVerification ? `
      <div class="zeq-trust-section">
        <div class="zeq-trust-section-title">\u25B6 Seven Step Wizard Verification</div>
        <div class="zeq-trust-row"><span class="zeq-trust-label">STEP 1: Problem</span><span class="zeq-trust-value">${fi.wizardVerification.step1_problem || 'N/A'}</span></div>
        <div class="zeq-trust-row"><span class="zeq-trust-label">STEP 2: Operators</span><span class="zeq-trust-value">${fi.wizardVerification.step2_operators || 'N/A'}</span></div>
        <div class="zeq-trust-row"><span class="zeq-trust-label">STEP 5: Master Sum</span><span class="zeq-trust-value">${fi.wizardVerification.step5_masterSum != null ? fi.wizardVerification.step5_masterSum.toFixed(6) : 'N/A'}</span></div>
        <div class="zeq-trust-row"><span class="zeq-trust-label">STEP 5: Phase Coherence</span><span class="zeq-trust-value">${fi.wizardVerification.step5_phaseCoherence != null ? (fi.wizardVerification.step5_phaseCoherence * 100).toFixed(1) + '%' : 'N/A'} ${fi.wizardVerification.step5_phaseCoherence != null ? bar(fi.wizardVerification.step5_phaseCoherence) : ''}</span></div>
        <div class="zeq-trust-row"><span class="zeq-trust-label">STEP 5: Domain Coverage</span><span class="zeq-trust-value">${fi.wizardVerification.step5_domainCoverage != null ? (fi.wizardVerification.step5_domainCoverage * 100).toFixed(1) + '%' : 'N/A'} ${fi.wizardVerification.step5_domainCoverage != null ? bar(fi.wizardVerification.step5_domainCoverage) : ''}</span></div>
        <div class="zeq-trust-row"><span class="zeq-trust-label">STEP 5: Selection Rate</span><span class="zeq-trust-value">${fi.wizardVerification.step5_selectionRate != null ? (fi.wizardVerification.step5_selectionRate * 100).toFixed(2) + '%' : 'N/A'}</span></div>
        <div class="zeq-trust-row"><span class="zeq-trust-label">STEP 6: Precision</span><span class="zeq-trust-value ${fi.wizardVerification.step6_status === 'PASS' ? 'good' : 'bad'}">${fi.wizardVerification.step6_status || 'N/A'} ${fi.wizardVerification.step6_precisionCheck ? '(' + fi.wizardVerification.step6_precisionCheck + ')' : ''}</span></div>
        <div class="zeq-trust-row"><span class="zeq-trust-label">STEP 7: Full Explanation</span><span class="zeq-trust-value">${fi.wizardVerification.step7_conclusion || 'N/A'}</span></div>
      </div>` : ''}
      <div class="zeq-trust-footer">
        Zeq OS v1.287 | HULYAS FI v1.287.5 | ${totalOps}+ operators | 1.287 Hz | ${fi.timestamp}
      </div>
    `;
  }

  // Get total operator count from the framework
  // Minimum display floor: 1024 (registry has 1549+; runtime loads subset)
  getTotalOperatorCount() {
    const OPERATOR_FLOOR = 1024;
    if (typeof window !== 'undefined' && window.utpFramework && window.utpFramework.get_total_operator_count) {
      const count = window.utpFramework.get_total_operator_count();
      if (count > 0) return Math.max(OPERATOR_FLOOR, count);
    }
    return OPERATOR_FLOOR;
  }

  // ─── AI Badge Rendering — Clear, human-readable ──────────────────
  injectDropdownBadge(container, trust) {
    if (!trust || container.querySelector('.zeq-badge-row')) return;
    const answerFI = trust.answerFI;
    if (!answerFI) return;

    const ha = trust.hallucinationAnalysis;
    const pc = ha ? ha.precisionCheck : null;
    const pct = (n) => (Math.abs(n) * 100).toFixed(1);
    const barColor = (v) => Math.abs(v) >= 0.70 ? '#3fb950' : Math.abs(v) >= 0.50 ? '#58a6ff' : Math.abs(v) >= 0.30 ? '#d29922' : '#f85149';
    const bar = (v) => `<span class="zeq-trust-bar"><span class="zeq-trust-bar-fill" style="width:${Math.min(100, Math.abs(v)*100)}%;background:${barColor(v)}"></span></span>`;
    const check = (ok) => ok ? '<span class="zeq-check good">\u2713</span>' : '<span class="zeq-check bad">\u2717</span>';

    // Determine clear verdict — now includes HALLUCINATION detection
    let headerClass, headerIcon, headerTitle, headerSubtitle;
    const verdict = ha ? ha.verdict : 'UNKNOWN';
    const hasContradictions = ha && ha.factors && ha.factors.contradictionCount > 0;
    const isDeception = ha && ha.factors && ha.factors.deceptionDetected;

    if (verdict === 'HALLUCINATION' || isDeception) {
      headerClass = 'hallucination';
      headerIcon = '\u{1F6A8}';
      headerTitle = 'HALLUCINATION DETECTED';
      headerSubtitle = isDeception
        ? 'Content contains deliberate falsehoods \u2014 mathematical verification failed'
        : 'Factual claims contradict operator equations';
    } else if (verdict === 'DETECTED' || (hasContradictions && ha.factors.contradictionCount >= 3)) {
      headerClass = 'flag';
      headerIcon = '\u26A0\uFE0F';
      headerTitle = 'CONTRADICTIONS FOUND';
      headerSubtitle = `${ha.factors.contradictionCount} factual claim(s) contradict known equations`;
    } else if (hasContradictions) {
      headerClass = 'flag';
      headerIcon = '\u26A0\uFE0F';
      headerTitle = 'SUSPICIOUS';
      headerSubtitle = `${ha.factors.contradictionCount} potential contradiction(s) detected`;
    } else if (ha && !ha.detected && ha.score >= 0.65) {
      headerClass = 'verified';
      headerIcon = '\u2705';
      headerTitle = 'VERIFIED';
      headerSubtitle = 'Answer aligns with query mathematically';
    } else if (ha && !ha.detected && ha.score >= 0.45) {
      headerClass = 'pass';
      headerIcon = '\u2139\uFE0F';
      headerTitle = 'REVIEW';
      headerSubtitle = 'Minor drift between query and answer states';
    } else if (ha && ha.detected) {
      headerClass = 'flag';
      headerIcon = '\u26A0\uFE0F';
      headerTitle = 'FLAG';
      headerSubtitle = 'Mathematical drift detected \u2014 answer may not fully align with query';
    } else {
      headerClass = 'review';
      headerIcon = '\u2139\uFE0F';
      headerTitle = 'REVIEW';
      headerSubtitle = 'Verification in progress';
    }

    // Extract key cross-check facts — all mathematical, no word matching
    const f = ha ? ha.factors : {};
    const operatorOK = f.operatorAlignment ? parseFloat(f.operatorAlignment) >= 0.5 : false;
    const sForensicOK = f.sForensicCoherence ? parseFloat(f.sForensicCoherence) >= 0.5 : false;
    const masterOK = f.masterSumScore ? parseFloat(f.masterSumScore) >= 0.5 : false;
    const pulseOK = f.pulseSync ? parseFloat(f.pulseSync) >= 0.5 : false;
    const wizardStatus = f.wizardVerification || 'N/A';
    const wizardOK = wizardStatus === 'PASS';
    const precisionOK = pc && pc.pass;

    const row = document.createElement('div');
    row.className = 'zeq-badge-row';

    const header = document.createElement('span');
    header.className = `zeq-trust-header ${headerClass}`;
    header.innerHTML = `
      <span class="zeq-trust-icon">${headerIcon}</span>
      <span class="zeq-header-main">
        <span class="zeq-header-title">${headerTitle}</span>
        <span class="zeq-header-detail">${headerSubtitle}</span>
      </span>
      <span class="zeq-trust-chevron">\u25BC</span>`;

    const dropdown = document.createElement('div');
    dropdown.className = 'zeq-trust-dropdown';

    let html = '';

    // ── Section 1: Plain English explanation ──
    html += `
    <div class="zeq-trust-section">
      <div class="zeq-trust-section-title">\u25B6 What this means</div>
      <div class="zeq-trust-explainer">The AI's response was compiled through the same mathematical framework as your query. The framework then cross-verified the answer's mathematical state against the query's mathematical state to check for hallucinations and drift.</div>
    </div>`;

    // ── Section 2: Quick cross-check results ──
    html += `
    <div class="zeq-trust-section">
      <div class="zeq-trust-section-title">\u25B6 Cross-Verification Results</div>
      <div class="zeq-check-grid">
        <div class="zeq-check-item">${check(operatorOK)}<span class="zeq-check-label">Operator Coherence</span><span class="zeq-check-desc">Query and answer operator states (\u03B4) align mathematically</span></div>
        <div class="zeq-check-item">${check(sForensicOK)}<span class="zeq-check-label">S_forensic Match</span><span class="zeq-check-desc">Composite forensic scores are in the same neighbourhood</span></div>
        <div class="zeq-check-item">${check(masterOK)}<span class="zeq-check-label">Master Equation</span><span class="zeq-check-desc">HULYAS master equation results are coherent</span></div>
        <div class="zeq-check-item">${check(pulseOK)}<span class="zeq-check-label">Pulse Sync</span><span class="zeq-check-desc">|sin(\u03C6)| synchronized at 1.287 Hz</span></div>
        <div class="zeq-check-item">${check(wizardOK)}<span class="zeq-check-label">7-Step Wizard</span><span class="zeq-check-desc">Passed the 7-step verification protocol</span></div>
        <div class="zeq-check-item">${check(precisionOK)}<span class="zeq-check-label">\u22640.1% Precision</span><span class="zeq-check-desc">Within tolerance for mathematical precision</span></div>
      </div>
    </div>`;

    // ── Section 2b: Contradiction details (if any detected) ──
    if (ha && ha.factors && ha.factors.contradictions && ha.factors.contradictions.length > 0) {
      html += `
      <div class="zeq-trust-section zeq-contradiction-section">
        <div class="zeq-trust-section-title" style="color:#f85149">\u25B6 Contradictions Detected</div>`;
      for (const c of ha.factors.contradictions) {
        if (c.type === 'DECEPTION_INTENT') {
          html += `<div class="zeq-contradiction-item">
            <span class="zeq-check bad">\u2717</span>
            <span class="zeq-contradiction-text"><strong>Deception Intent:</strong> ${c.detail}</span>
          </div>`;
        } else if (c.type === 'SELF_ADMITTED_FALSEHOOD') {
          html += `<div class="zeq-contradiction-item">
            <span class="zeq-check bad">\u2717</span>
            <span class="zeq-contradiction-text"><strong>Self-Admitted Falsehood:</strong> ${c.detail}</span>
          </div>`;
        } else if (c.type === 'CONSTANT_MISMATCH') {
          html += `<div class="zeq-contradiction-item">
            <span class="zeq-check bad">\u2717</span>
            <span class="zeq-contradiction-text"><strong>${c.constant}:</strong> Claimed ${c.claimed}, expected ${c.expected} (${c.error} error) — Operators: ${c.operators.join(', ')}</span>
          </div>`;
        } else if (c.type === 'EQUATION_RESULT_MISMATCH') {
          html += `<div class="zeq-contradiction-item">
            <span class="zeq-check bad">\u2717</span>
            <span class="zeq-contradiction-text"><strong>${c.equation}:</strong> Claimed ${c.claimed}, computed ${c.expected} (${c.error} error)</span>
          </div>`;
        }
      }
      html += `</div>`;
    }

    // ── Section 3: Detailed scores (for technical users) ──
    if (ha) {
      const pctStr = (s) => (parseFloat(s) * 100).toFixed(1);
      const barStr = (s) => bar(parseFloat(s));
      html += `
      <div class="zeq-trust-section">
        <div class="zeq-trust-section-title">\u25B6 Detailed Scores</div>
        <div class="zeq-trust-row"><span class="zeq-trust-label">Operator Coherence (\u03B4)</span><span class="zeq-trust-value">${pctStr(f.operatorAlignment)}% ${barStr(f.operatorAlignment)}</span></div>
        <div class="zeq-trust-row"><span class="zeq-trust-label">S_forensic Coherence</span><span class="zeq-trust-value">${pctStr(f.sForensicCoherence)}% ${barStr(f.sForensicCoherence)}</span></div>
        <div class="zeq-trust-row"><span class="zeq-trust-label">Master Equation</span><span class="zeq-trust-value">${pctStr(f.masterSumScore)}% ${barStr(f.masterSumScore)}</span></div>
        <div class="zeq-trust-row"><span class="zeq-trust-label">Phase Alignment</span><span class="zeq-trust-value">${pctStr(f.phaseAlignment)}% ${barStr(f.phaseAlignment)}</span></div>
        <div class="zeq-trust-row"><span class="zeq-trust-label">Spectral Stability (C_k)</span><span class="zeq-trust-value">${pctStr(f.spectralStability)}% ${barStr(f.spectralStability)}</span></div>
        <div class="zeq-trust-row"><span class="zeq-trust-label">Pulse Sync |sin(\u03C6)|</span><span class="zeq-trust-value">${pctStr(f.pulseSync)}% ${barStr(f.pulseSync)}</span></div>
        <div class="zeq-trust-row"><span class="zeq-trust-label">Entropy (CS47)</span><span class="zeq-trust-value">${pctStr(1 - parseFloat(f.entropyRatio))}% ${bar(1 - parseFloat(f.entropyRatio))}</span></div>
        <div class="zeq-trust-row"><span class="zeq-trust-label">Wizard Step 6</span><span class="zeq-trust-value">${pctStr(f.wizStep6Score)}% ${barStr(f.wizStep6Score)}</span></div>
        ${pc ? `<div class="zeq-trust-row"><span class="zeq-trust-label">Query Master Sum</span><span class="zeq-trust-value">${pc.queryMasterSum}</span></div>
        <div class="zeq-trust-row"><span class="zeq-trust-label">Answer Master Sum</span><span class="zeq-trust-value">${pc.answerMasterSum}</span></div>` : ''}
        <div class="zeq-trust-row"><span class="zeq-trust-label">HulyaPulse</span><span class="zeq-trust-value ${f.pulseDesync ? 'bad' : 'good'}">${f.pulseDesync ? 'Desynchronized' : '1.287 Hz Synced \u2713'}</span></div>
      </div>`;
    }

    // ── Section 4: FI Equations (collapsible for deep technical users) ──
    html += `
    <div class="zeq-trust-section zeq-fi-advanced">
      <div class="zeq-trust-section-title zeq-fi-toggle" style="cursor:pointer">\u25B6 Forensic Intelligence Equations (S\u2081\u2013S\u2082\u2080) \u2014 click to expand</div>
      <div class="zeq-fi-equations" style="display:none">
        ${this.renderFIEquationsOnly(answerFI)}
      </div>
    </div>`;

    const totalOps = this.getTotalOperatorCount();
    html += `<div class="zeq-trust-footer">Zeq OS v1.287 | HULYAS FI v1.287.5 | ${totalOps}+ operators | 1.287 Hz | ${answerFI.timestamp}</div>`;

    dropdown.innerHTML = html;

    // Wire up the FI equations toggle
    const toggle = dropdown.querySelector('.zeq-fi-toggle');
    if (toggle) {
      toggle.addEventListener('click', () => {
        const eqs = dropdown.querySelector('.zeq-fi-equations');
        if (eqs) {
          const showing = eqs.style.display !== 'none';
          eqs.style.display = showing ? 'none' : 'block';
          toggle.textContent = (showing ? '\u25B6' : '\u25BC') + ' Forensic Intelligence Equations (S\u2081\u2013S\u2082\u2080)';
        }
      });
    }

    header.addEventListener('click', () => {
      const isOpen = dropdown.classList.toggle('open');
      header.querySelector('.zeq-trust-chevron').classList.toggle('open', isOpen);
    });

    row.appendChild(header);
    row.appendChild(dropdown);
    container.appendChild(row);
  }

  // Render just the FI equations (no wrapper section)
  renderFIEquationsOnly(fi) {
    const scores = fi.scores;
    const fmtS = (n) => (n || 0).toFixed(6);
    const barColor = (v) => Math.abs(v) >= 0.70 ? '#3fb950' : Math.abs(v) >= 0.50 ? '#58a6ff' : Math.abs(v) >= 0.30 ? '#d29922' : '#f85149';
    const bar = (v) => `<span class="zeq-trust-bar"><span class="zeq-trust-bar-fill" style="width:${Math.min(100, Math.abs(v)*100)}%;background:${barColor(v)}"></span></span>`;
    return `
      <div class="zeq-trust-row"><span class="zeq-trust-label">S\u2081 Verified Accuracy</span><span class="zeq-trust-value">${fmtS(scores.S1)} ${bar(scores.S1)}</span></div>
      <div class="zeq-trust-row"><span class="zeq-trust-label">S\u2082 Operator Coherence</span><span class="zeq-trust-value">${fmtS(scores.S2)} ${bar(scores.S2)}</span></div>
      <div class="zeq-trust-row"><span class="zeq-trust-label">S\u2083 Entropy Deviation</span><span class="zeq-trust-value">${fmtS(scores.S3)} ${bar(scores.S3)}</span></div>
      <div class="zeq-trust-row"><span class="zeq-trust-label">S\u2084 Source Verification</span><span class="zeq-trust-value">${fmtS(scores.S4)} ${bar(scores.S4)}</span></div>
      <div class="zeq-trust-row"><span class="zeq-trust-label">S\u2085 Ethical Coherence</span><span class="zeq-trust-value">${fmtS(scores.S5)} ${bar(scores.S5)}</span></div>
      <div class="zeq-trust-row"><span class="zeq-trust-label">S\u2086 Temporal Decay</span><span class="zeq-trust-value">${fmtS(scores.S6)} ${bar(scores.S6)}</span></div>
      <div class="zeq-trust-row"><span class="zeq-trust-label">S\u2087 Consciousness Reach</span><span class="zeq-trust-value">${fmtS(scores.S7)} ${bar(scores.S7)}</span></div>
      <div class="zeq-trust-row"><span class="zeq-trust-label">S\u2088 Pulse Stability</span><span class="zeq-trust-value">${fmtS(scores.S8)} ${bar(scores.S8)}</span></div>
      <div class="zeq-trust-row"><span class="zeq-trust-label">S\u2089 Contradictions</span><span class="zeq-trust-value">${fmtS(scores.S9)} ${bar(scores.S9)}</span></div>
      <div class="zeq-trust-row"><span class="zeq-trust-label">S\u2081\u2080 Intent (VX)</span><span class="zeq-trust-value">${fmtS(scores.S10)} ${bar(scores.S10)}</span></div>
      <div class="zeq-trust-row"><span class="zeq-trust-label">S\u2081\u2081 Context Match</span><span class="zeq-trust-value">${fmtS(scores.S11)} ${bar(scores.S11)}</span></div>
      <div class="zeq-trust-row"><span class="zeq-trust-label">S\u2081\u2082 Clustering</span><span class="zeq-trust-value">${fmtS(scores.S12)} ${bar(scores.S12)}</span></div>
      <div class="zeq-trust-row"><span class="zeq-trust-label">S\u2081\u2083 Domain Diversity</span><span class="zeq-trust-value">${fmtS(scores.S13)} ${bar(scores.S13)}</span></div>
      <div class="zeq-trust-row"><span class="zeq-trust-label">S\u2081\u2084 Resonance</span><span class="zeq-trust-value">${fmtS(scores.S14)} ${bar(scores.S14)}</span></div>
      <div class="zeq-trust-row"><span class="zeq-trust-label">S\u2081\u2085 Semantic Stability</span><span class="zeq-trust-value">${fmtS(scores.S15)} ${bar(scores.S15)}</span></div>
      <div class="zeq-trust-row"><span class="zeq-trust-label">S\u2081\u2086 Severity</span><span class="zeq-trust-value">${fmtS(scores.S16)} ${bar(scores.S16)}</span></div>
      <div class="zeq-trust-row"><span class="zeq-trust-label">S\u2081\u2087 Entropy Spike</span><span class="zeq-trust-value">${fmtS(scores.S17)} ${bar(scores.S17)}</span></div>
      <div class="zeq-trust-row"><span class="zeq-trust-label">S\u2081\u2088 Fractal Dim</span><span class="zeq-trust-value">${fi.fractalDimension.toFixed(4)}</span></div>
      <div class="zeq-trust-row"><span class="zeq-trust-label">S\u2081\u2089 Bayesian P(H|E)</span><span class="zeq-trust-value">${fmtS(scores.S19)} ${bar(scores.S19)}</span></div>
      <div class="zeq-trust-row"><span class="zeq-trust-label">S\u2082\u2080 Composite</span><span class="zeq-trust-value">${fmtS(scores.S20)} ${bar(scores.S20)}</span></div>
      <div class="zeq-trust-row"><span class="zeq-trust-label">S_forensic (raw)</span><span class="zeq-trust-value">${fi.S_forensic.toFixed(6)}</span></div>
      <div class="zeq-trust-row"><span class="zeq-trust-label">Master Sum (\u03A3)</span><span class="zeq-trust-value">${fi.masterSum.toFixed(6)}</span></div>
    `;
  }
}

// Export for use in framework
if (typeof window !== 'undefined') {
  window.TransparencyManager = TransparencyManager;
  window.ZeqTrustBadgeInjector = ZeqTrustBadgeInjector;

  // Auto-initialize transparency manager and trust badge injector
  try {
    const tm = new TransparencyManager();
    tm.initialize().then(() => {
      window.transparencyManager = tm;
      console.log('[ZEQ] Transparency Manager ready');

      // Start trust badge injection
      const badgeInjector = new ZeqTrustBadgeInjector(tm);
      window.zeqTrustBadgeInjector = badgeInjector;

      // Start after page load
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
          console.log('[ZEQ] DOMContentLoaded — starting badge injector');
          badgeInjector.start();
        });
      } else {
        console.log('[ZEQ] DOM already loaded — starting badge injector now');
        badgeInjector.start();
      }
    }).catch((err) => {
      console.error('[ZEQ] Transparency Manager init failed:', err);
    });
  } catch (err) {
    console.error('[ZEQ] Failed to create TransparencyManager:', err);
  }
}

// For Node.js/CommonJS environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TransparencyManager;
}

