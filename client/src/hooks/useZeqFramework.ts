import { useCallback } from 'react';

declare global {
  interface Window {
    ZeqOSFramework?: {
      ZeqOSMiddleware: new () => ZeqOSMiddleware;
      version?: string;
      frameworkName?: string;
    };
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
 * Zeq OS Mathematical Framework Hook
 * Always processes all messages through the mathematical framework before sending to AI
 */
// Wait for framework to load (with timeout)
function waitForFramework(timeout = 5000): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }

    if (window.ZeqOSFramework && window.ZeqOSFramework.ZeqOSMiddleware) {
      resolve(true);
      return;
    }

    const startTime = Date.now();
    const checkInterval = setInterval(() => {
      if (window.ZeqOSFramework && window.ZeqOSFramework.ZeqOSMiddleware) {
        clearInterval(checkInterval);
        resolve(true);
      } else if (Date.now() - startTime > timeout) {
        clearInterval(checkInterval);
        console.warn('Zeq OS Framework: Timeout waiting for framework to load');
        resolve(false);
      }
    }, 100);
  });
}

export function useZeqFramework() {
  const processMessage = useCallback(async (userText: string): Promise<string> => {
    try {
      // Wait for framework to be available
      const frameworkReady = await waitForFramework();
      
      if (!frameworkReady) {
        console.warn('Zeq OS Framework not available, using original message');
        return userText;
      }

      // Ensure framework is loaded
      if (typeof window === 'undefined' || typeof window.ZeqOSFramework === 'undefined') {
        console.warn('Zeq OS Framework not loaded, using original message');
        return userText;
      }

      // Initialize middleware instance
      const ZeqOSMiddleware = window.ZeqOSFramework.ZeqOSMiddleware;
      if (!ZeqOSMiddleware) {
        console.warn('ZeqOSMiddleware class not found, using original message');
        return userText;
      }

      const zeqMiddleware = new ZeqOSMiddleware();

      // Process query through mathematical framework
      const result = zeqMiddleware.processQuery(userText);

      // Extract the mathematical prompt (JSON string)
      const mathematicalPrompt = result.mathematicalPrompt;

      console.log('Zeq OS: Message processed through mathematical framework', {
        originalQuery: result.originalQuery,
        operatorCount: result.activeOperators?.length || 0,
        domains: result.domains,
        frameworkVersion: window.ZeqOSFramework.version || '1.287'
      });

      return mathematicalPrompt;
    } catch (error) {
      console.error('Zeq OS Framework processing error:', error);
      // Fallback to original text if processing fails
      return userText;
    }
  }, []);

  return { processMessage };
}

