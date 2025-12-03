// Zeq OS Mathematical Framework - ChatGPT Content Script
// Intercepts ChatGPT input and processes through mathematical framework

(function() {
  'use strict';
  
  console.log('🚀🚀🚀 Zeq OS: ChatGPT content script STARTING...');
  console.log('🔍 Zeq OS: Current URL:', window.location.href);
  console.log('🔍 Zeq OS: Document ready state:', document.readyState);

  // Wait for framework to load
  let frameworkReady = false;
  let zeqMiddleware = null;
  
  if (typeof ZeqOSFramework !== 'undefined') {
    try {
      zeqMiddleware = new ZeqOSFramework.ZeqOSMiddleware();
      frameworkReady = true;
      console.log('✅ Zeq OS: ChatGPT framework initialized successfully!');
    } catch (error) {
      console.error('Zeq OS: Error initializing framework:', error);
    }
  } else {
    console.error('Zeq OS: Framework not loaded - waiting...');
    // Wait for framework to load
    const checkFramework = setInterval(() => {
      if (typeof ZeqOSFramework !== 'undefined') {
        try {
          zeqMiddleware = new ZeqOSFramework.ZeqOSMiddleware();
          frameworkReady = true;
          console.log('✅ Zeq OS: ChatGPT framework initialized successfully (delayed)!');
          clearInterval(checkFramework);
        } catch (error) {
          console.error('Zeq OS: Error initializing framework:', error);
        }
      }
    }, 100);
    
    // Stop checking after 10 seconds
    setTimeout(() => {
      clearInterval(checkFramework);
      if (!frameworkReady) {
        console.error('Zeq OS: Framework failed to load after 10 seconds');
      }
    }, 10000);
  }

  let isProcessing = false;
  let settings = { enabled: true };

  // Get settings from storage
  try {
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      chrome.runtime.sendMessage({ action: 'getSettings' }, (response) => {
        if (chrome.runtime.lastError) {
          console.warn('Zeq OS: Error getting settings:', chrome.runtime.lastError.message);
          settings = { enabled: true, platforms: { chatgpt: true } };
        } else if (response) {
          settings = response;
        }
      });
    } else {
      settings = { enabled: true, platforms: { chatgpt: true } };
    }
  } catch (error) {
    console.warn('Zeq OS: Error sending getSettings message:', error);
    settings = { enabled: true, platforms: { chatgpt: true } };
  }

  // Listen for settings updates
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'settingsUpdated') {
      settings = request.settings;
      sendResponse({ success: true });
      return false; // Not async
    }
    return false; // Not handled
  });

  // Find ChatGPT input box - Enhanced selectors
  function findInputBox() {
    const selectors = [
      'textarea[data-id="root"]',
      'textarea#prompt-textarea',
      'textarea[placeholder*="Message"]',
      'textarea[placeholder*="message"]',
      'textarea[placeholder*="Ask"]',
      'div[contenteditable="true"][role="textbox"]',
      'div[contenteditable="true"]',
      'textarea'
    ];

    for (const selector of selectors) {
      const elements = document.querySelectorAll(selector);
      for (const element of elements) {
        if (element && element.offsetParent !== null) {
          const rect = element.getBoundingClientRect();
          // Input boxes are usually at least 100px wide
          if (rect.width > 100 && rect.height > 20) {
            console.log('✅ Zeq OS: Found input box with selector:', selector, element);
            return element;
          }
        }
      }
    }
    
    // Fallback: look for any visible textarea
    const allTextareas = document.querySelectorAll('textarea, div[contenteditable="true"]');
    for (const element of allTextareas) {
      if (element && element.offsetParent !== null) {
        const rect = element.getBoundingClientRect();
        if (rect.width > 100 && rect.height > 20) {
          console.log('✅ Zeq OS: Found input box (fallback):', element);
          return element;
        }
      }
    }
    
    console.warn('⚠️ Zeq OS: No input box found');
    return null;
  }

  // Process message through framework
  function processMessage(message) {
    if (!settings.enabled || !settings.platforms?.chatgpt) {
      return message;
    }
    
    if (!frameworkReady || !zeqMiddleware || isProcessing) {
      console.warn('Zeq OS: Framework not ready or already processing');
      return message;
    }
    
    try {
      isProcessing = true;
      console.log('🔄 Zeq OS: Processing message through framework:', message.substring(0, 50));
      
      const zeqResult = zeqMiddleware.processQuery(message);
      const processedMessage = zeqResult.mathematicalPrompt;
      
      if (processedMessage) {
        console.log('✅ Zeq OS: Framework processing complete, returning JSON prompt');
        return processedMessage; // Return raw JSON prompt
      } else {
        console.warn('⚠️ Zeq OS: Framework did not return mathematicalPrompt');
        return message;
      }
    } catch (error) {
      console.error('❌ Zeq OS: Error processing message:', error);
      return message;
    } finally {
      isProcessing = false;
    }
  }

  // ENABLED: Network interception is the PRIMARY method
  function injectNetworkInterception() {
    console.log('🔄 Zeq OS: Injecting network interception script...');
    
    try {
      const script = document.createElement('script');
      script.src = chrome.runtime.getURL('content/chatgpt-page-context.js');
      script.onload = function() {
        console.log('✅ Zeq OS: Network interception script loaded successfully');
        this.remove();
      };
      script.onerror = function() {
        console.error('❌ Zeq OS: Failed to load network interception script');
      };
      (document.head || document.documentElement).appendChild(script);
    } catch (error) {
      console.error('❌ Zeq OS: Error injecting network interception:', error);
    }
  }

  // Listen for processing requests from page context (if network interception is ever enabled)
  window.addEventListener('message', (event) => {
    if (event.source !== window) return;
    
    if (event.data && event.data.type === 'ZEQ_PROCESS_REQUEST') {
      console.log('📥 Zeq OS [Content Script - ChatGPT]: Received processing request, ID:', event.data.requestId);
      
      if (!frameworkReady || !zeqMiddleware) {
        console.warn('⚠️ Zeq OS: Framework not ready, sending original message back');
        window.postMessage({
          type: 'ZEQ_PROCESSED_RESPONSE',
          requestId: event.data.requestId,
          processedContent: event.data.originalContent
        }, '*');
        return;
      }
      
      if (!settings.enabled || !settings.platforms?.chatgpt) {
        console.log('⚠️ Zeq OS: ChatGPT disabled in settings, sending original message back');
        window.postMessage({
          type: 'ZEQ_PROCESSED_RESPONSE',
          requestId: event.data.requestId,
          processedContent: event.data.originalContent
        }, '*');
        return;
      }
      
      const originalContent = event.data.originalContent;
      console.log('🔄 Zeq OS [Content Script - ChatGPT]: Processing message:', originalContent.substring(0, 50));
      
      try {
        const zeqResult = zeqMiddleware.processQuery(originalContent);
        let processedMessage = zeqResult.mathematicalPrompt;
        
        if (!processedMessage) {
          console.error('❌ Zeq OS: Framework did not return mathematicalPrompt!');
          window.postMessage({
            type: 'ZEQ_PROCESSED_RESPONSE',
            requestId: event.data.requestId,
            processedContent: originalContent
          }, '*');
          return;
        }
        
        // EXACTLY like DeepSeek: Send the RAW JSON prompt directly
        // No truncation - framework generation should be concise from the start
        console.log('✅ Zeq OS [Content Script - ChatGPT]: Processing complete, sending RAW JSON prompt. Length:', processedMessage.length);
        
        window.postMessage({
          type: 'ZEQ_PROCESSED_RESPONSE',
          requestId: event.data.requestId,
          processedContent: processedMessage
        }, '*');
      } catch (error) {
        console.error('❌ Zeq OS [Content Script - ChatGPT]: Processing error, using original', error);
        window.postMessage({
          type: 'ZEQ_PROCESSED_RESPONSE',
          requestId: event.data.requestId,
          processedContent: originalContent
        }, '*');
      }
    }
  });

  // Initialize - Network interception only
  function initialize() {
    // Inject network interception - DO NOT touch input box
    console.log('✅ Zeq OS: Initializing network interception (input box disabled to prevent crashes)');
    injectNetworkInterception();
  }

  // Use MutationObserver - NO input box interception
  const observer = new MutationObserver(() => {
    // Do nothing - network interception handles everything
  });

  // Network interception is DISABLED - using input box interception instead
  injectNetworkInterception();

  // Start observing
  if (document.body) {
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    initialize();
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
      initialize();
      injectNetworkInterception();
    });
  }

})();
