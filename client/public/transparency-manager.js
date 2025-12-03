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
          // Fallback: return 0 to indicate calculation needed
          return 0;
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
          // Fallback: return 0 to indicate calculation needed
          return 0;
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

// Export for use in framework
if (typeof window !== 'undefined') {
  window.TransparencyManager = TransparencyManager;
}

// For Node.js/CommonJS environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TransparencyManager;
}

