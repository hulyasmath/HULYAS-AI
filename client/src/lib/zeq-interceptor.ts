/**
 * Zeq OS Mathematical Framework Interceptor
 * This ensures ALL messages are processed through the framework before reaching the API
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
    __zeqFrameworkLoaded?: boolean;
    __zeqInterceptorActive?: boolean;
    __zeqFrameworkReady?: boolean;
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
 * Wait for both framework components to be available
 */
function waitForFramework(timeout = 10000): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }

    // Check if both components are already loaded
    if (window.zeqMiddleware && window.utpFramework) {
      window.__zeqFrameworkLoaded = true;
      resolve(true);
      return;
    }

    // Poll for both framework components
    const startTime = Date.now();
    const checkInterval = setInterval(() => {
      if (window.zeqMiddleware && window.utpFramework) {
        clearInterval(checkInterval);
        window.__zeqFrameworkLoaded = true;
        console.log('✅ Zeq OS: Both framework components loaded and ready');
        resolve(true);
      } else if (Date.now() - startTime > timeout) {
        clearInterval(checkInterval);
        console.error('❌ Zeq OS: Framework components failed to load within timeout', {
          hasZeqMiddleware: !!window.zeqMiddleware,
          hasUtpFramework: !!window.utpFramework
        });
        resolve(false);
      }
    }, 100);
  });
}

/**
 * Process text through BOTH framework components
 */
export function processThroughFramework(text: string): string {
  if (!text || typeof text !== 'string') {
    return text;
  }

  try {
    if (typeof window === 'undefined' || !window.zeqMiddleware || !window.utpFramework) {
      console.warn('⚠️ Zeq OS: Framework components not available, using original text', {
        hasZeqMiddleware: typeof window !== 'undefined' && !!window.zeqMiddleware,
        hasUtpFramework: typeof window !== 'undefined' && !!window.utpFramework
      });
      return text;
    }

    console.log('🔄 Zeq OS [Interceptor]: Processing text through both framework components', {
      textPreview: text.substring(0, 100),
      textLength: text.length
    });

    // Step 1: Process through ZeqOSMiddleware
    const zeqResult = window.zeqMiddleware.processQuery(text);
    
    // Step 2: Calculate all operators through UTPWithOperators
    const utpResult = window.utpFramework.calculate_operators(true, text);
    
    // Step 3: Use mathematical prompt
    const processedText = zeqResult.mathematicalPrompt;

    console.log('✅ Zeq OS [Interceptor]: Text processed through both components', {
      originalLength: text.length,
      processedLength: processedText.length,
      operatorCount: Object.keys(utpResult.operators || {}).length,
      activeOperators: zeqResult.activeOperators?.length || 0,
      domains: zeqResult.domains
    });

    return processedText;
  } catch (error) {
    console.error('❌ Zeq OS [Interceptor]: Processing error', error);
    return text;
  }
}

/**
 * Initialize framework interceptor
 */
export async function initializeZeqInterceptor() {
  if (typeof window === 'undefined') {
    return;
  }

  if (window.__zeqInterceptorActive) {
    console.log('✅ Zeq OS: Interceptor already active');
    return;
  }

  console.log('🚀 Zeq OS: Initializing interceptor...');

  try {
    // Wait for framework with timeout
    const frameworkReady = await waitForFramework(5000); // Reduced timeout to 5 seconds
    
    if (!frameworkReady) {
      console.warn('⚠️ Zeq OS: Framework not ready, continuing without interceptor');
      // Don't block app initialization - continue without framework
      return;
    }

    window.__zeqInterceptorActive = true;
    console.log('✅ Zeq OS: Interceptor initialized and active');
  } catch (error) {
    console.error('❌ Zeq OS: Error initializing interceptor:', error);
    // Don't throw - allow app to continue
  }
}

// Auto-initialize when module loads
if (typeof window !== 'undefined') {
  // Wait a bit for framework script to load
  setTimeout(() => {
    initializeZeqInterceptor().catch(err => {
      console.error('❌ Zeq OS: Failed to initialize interceptor', err);
    });
  }, 1000);
}

