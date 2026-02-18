/**
 * Zeq OS Network Interceptor
 * Intercepts fetch/SSE requests and processes messages through the framework
 * Network-level interception for framework processing
 */

declare global {
  interface Window {
    ZeqOSFramework?: {
      ZeqOSMiddleware: new () => ZeqOSMiddleware;
      version?: string;
      frameworkName?: string;
    };
    zeqMiddleware?: ZeqOSMiddleware;
    utpFramework?: {
      calculate_operators: (query_mode: boolean, userQuery: string) => {
        operators: Record<string, any>;
        frameworkState: any;
      };
    };
    __zeqNetworkInterceptorActive?: boolean;
  }
}

interface ZeqOSMiddleware {
  processQuery(userQuery: string): ZeqOSResult;
}

interface ZeqOSResult {
  originalQuery: string;
  mathematicalPrompt: string;
  pulseCycle: number;
  phase: number;
  activeOperators: string[];
  domains: string[];
  mathematicalState: any;
  truthVector: any;
  informationIntegrity: number;
  crossDomainHarmony: number;
  auditTrail: string[];
  timestamp: string;
}

/**
 * EXACT PATTERN FROM math.html - Use global zeqMathematicalPrompt variable
 * This matches math.html's streamGen() function which uses the global variable
 */
function processText(text: string): string {
  if (!text || typeof text !== 'string') {
    return text;
  }

  try {
    // EXACT from math.html line 18455 - Use global zeqMathematicalPrompt
    if (typeof window !== 'undefined' && window.zeqMathematicalPrompt) {
      console.log('📤 Zeq OS [Network]: Using global zeqMathematicalPrompt (math.html pattern)', {
        promptLength: window.zeqMathematicalPrompt.length,
        originalTextLength: text.length
      });
      
      // Return the global prompt (EXACT from math.html streamGen pattern)
      return window.zeqMathematicalPrompt;
    }
    
    // Fallback: If global not available, process now
    if (typeof window === 'undefined' || !window.zeqMiddleware || !window.utpFramework) {
      console.warn('⚠️ Zeq OS [Network]: Framework not available, using original text');
      return text;
    }

    console.log('🔄 Zeq OS [Network]: Processing text (fallback - global prompt not available)', {
      textPreview: text.substring(0, 100),
      textLength: text.length
    });

    // Step 1: Process through ZeqOSMiddleware
    const zeqResult = window.zeqMiddleware.processQuery(text);
    
    // Step 2: Calculate all operators through UTPWithOperators
    const utpResult = window.utpFramework.calculate_operators(true, text);
    
    // Step 3: Use mathematical prompt
    const processedText = zeqResult.mathematicalPrompt;

    console.log('✅ Zeq OS [Network]: Text processed (fallback)', {
      originalLength: text.length,
      processedLength: processedText.length,
      operatorCount: Object.keys(utpResult.operators || {}).length
    });

    return processedText;
  } catch (error) {
    console.error('❌ Zeq OS [Network]: Processing error', error);
    return text;
  }
}

/**
 * Initialize network interceptor
 */
export function initializeNetworkInterceptor() {
  if (typeof window === 'undefined') {
    return;
  }

  if (window.__zeqNetworkInterceptorActive) {
    console.log('✅ Zeq OS: Network interceptor already active');
    return;
  }

  console.log('🚀 Zeq OS: Initializing network interceptor...');

  // Wait for both framework components to load
  const checkFramework = setInterval(() => {
    if (window.zeqMiddleware && window.utpFramework) {
      clearInterval(checkFramework);
      activateInterceptor();
    }
  }, 100);

  // Stop checking after 10 seconds
  setTimeout(() => {
    clearInterval(checkFramework);
    if (window.zeqMiddleware && window.utpFramework) {
      activateInterceptor();
    } else {
      console.error('❌ Zeq OS: Framework components not loaded, network interceptor not activated', {
        hasZeqMiddleware: !!window.zeqMiddleware,
        hasUtpFramework: !!window.utpFramework
      });
    }
  }, 10000);
}

function activateInterceptor() {
  if (window.__zeqNetworkInterceptorActive) {
    return;
  }

  window.__zeqNetworkInterceptorActive = true;

  // Intercept SSE.js constructor if available
  if (typeof window !== 'undefined') {
    // Store original SSE if it exists
    const SSE = (window as any).SSE;
    if (SSE) {
      const OriginalSSE = SSE;
      // Only intercept SSE requests to the same origin (LibreChat API)
      const trustedOrigin = window.location.origin;
      (window as any).SSE = class extends OriginalSSE {
        constructor(url: string, options: any) {
          // Only intercept requests to our own API, not third-party SSE connections
          const isLocalApi = url.startsWith('/') || url.startsWith(trustedOrigin);
          // Process payload if it's a string (JSON) and targeting our API
          if (isLocalApi && options?.payload && typeof options.payload === 'string') {
            try {
              const payload = JSON.parse(options.payload);
              
              // Find and process user message text
              if (payload.text) {
                const processedText = processText(payload.text);
                payload.text = processedText;
                options.payload = JSON.stringify(payload);
                console.log('✅ Zeq OS [Network]: SSE payload processed');
              } else if (payload.messages && Array.isArray(payload.messages)) {
                // Process last user message
                const lastUserMsg = payload.messages.findLast((m: any) => 
                  m.role === 'user' || m.role === 'User'
                );
                if (lastUserMsg && lastUserMsg.content) {
                  const processedContent = processText(lastUserMsg.content);
                  lastUserMsg.content = processedContent;
                  options.payload = JSON.stringify(payload);
                  console.log('✅ Zeq OS [Network]: SSE messages payload processed');
                }
              }
            } catch (e) {
              console.warn('⚠️ Zeq OS [Network]: Failed to process SSE payload', e);
            }
          }

          super(url, options);
        }
      };
      console.log('✅ Zeq OS: SSE interceptor installed');
    }
  }

  console.log('✅ Zeq OS: Network interceptor activated');
}

// Auto-initialize
if (typeof window !== 'undefined') {
  // Wait for framework script to load
  setTimeout(() => {
    initializeNetworkInterceptor();
  }, 2000);
}

