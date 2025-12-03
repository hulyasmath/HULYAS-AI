// Zeq OS Mathematical Framework - Grok (X/Twitter) Content Script
// Intercepts Grok input and processes through mathematical framework

console.log('🚀🚀🚀🚀🚀 ZEQ OS GROK CONTENT SCRIPT LOADING 🚀🚀🚀🚀🚀');
console.log('🔍 Zeq OS: Current URL:', window.location.href);
console.log('🔍 Zeq OS: Document ready state:', document.readyState);
console.log('🔍 Zeq OS: Window object:', typeof window);
console.log('🔍 Zeq OS: Document object:', typeof document);

(function() {
  'use strict';
  
  console.log('🚀🚀🚀 Zeq OS: Grok content script STARTING...');
  console.log('🔍 Zeq OS: Current URL:', window.location.href);
  console.log('🔍 Zeq OS: Document ready state:', document.readyState);
  console.log('🔍 Zeq OS: ZeqOSFramework available?', typeof ZeqOSFramework);
  console.log('🔍 Zeq OS: TransparencyManager available?', typeof TransparencyManager);

  // Wait for framework to load
  let frameworkReady = false;
  let zeqMiddleware = null;
  let transparencyManager = null;

  // Initialize transparency manager
  async function initTransparencyManager() {
    if (typeof TransparencyManager !== 'undefined') {
      try {
        transparencyManager = new TransparencyManager();
        await transparencyManager.initialize();
        window.transparencyManager = transparencyManager; // Make it globally accessible
        console.log('✅ Zeq OS: Transparency Manager initialized');
      } catch (error) {
        console.warn('⚠️ Zeq OS: Transparency Manager initialization failed', error);
      }
    }
  }
  
  console.log('🔍 Zeq OS: Checking for ZeqOSFramework...', {
    exists: typeof ZeqOSFramework !== 'undefined',
    hasMiddleware: typeof ZeqOSFramework !== 'undefined' && typeof ZeqOSFramework.ZeqOSMiddleware !== 'undefined',
    allKeys: typeof ZeqOSFramework !== 'undefined' ? Object.keys(ZeqOSFramework) : []
  });

  if (typeof ZeqOSFramework !== 'undefined') {
      try {
        console.log('🔄 Zeq OS: Creating ZeqOSMiddleware instance...');
        zeqMiddleware = new ZeqOSFramework.ZeqOSMiddleware();
        frameworkReady = true;
        console.log('✅ Zeq OS: Grok framework initialized successfully!');
        console.log('✅ Zeq OS: zeqMiddleware type:', typeof zeqMiddleware);
        console.log('✅ Zeq OS: zeqMiddleware has processQuery?', typeof zeqMiddleware.processQuery === 'function');
        // Initialize transparency manager after framework is ready
        initTransparencyManager();
      } catch (error) {
        console.error('❌ Zeq OS: Error initializing framework:', error);
        console.error('❌ Zeq OS: Error stack:', error.stack);
      }
  } else {
    console.error('⚠️ Zeq OS: Framework not loaded - waiting...');
    console.error('⚠️ Zeq OS: Available window keys:', Object.keys(window).filter(k => k.includes('Zeq') || k.includes('zeq')));
    // Wait for framework to load
    const checkFramework = setInterval(() => {
      if (typeof ZeqOSFramework !== 'undefined') {
        try {
          zeqMiddleware = new ZeqOSFramework.ZeqOSMiddleware();
          frameworkReady = true;
          console.log('✅ Zeq OS: Grok framework initialized successfully (delayed)!');
          // Initialize transparency manager after framework is ready
          initTransparencyManager();
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
          settings = { enabled: true, platforms: { grok: true } };
        } else if (response) {
          settings = response;
        }
      });
    } else {
      settings = { enabled: true, platforms: { grok: true } };
    }
  } catch (error) {
    console.warn('Zeq OS: Error sending getSettings message:', error);
    settings = { enabled: true, platforms: { grok: true } };
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

  // Find Grok input box
  function findInputBox() {
    const selectors = [
      'div[contenteditable="true"][data-testid="tweetTextarea_0"]',
      'div[contenteditable="true"][role="textbox"]',
      'textarea[data-testid="tweetTextarea_0"]',
      'div[contenteditable="true"]',
      'textarea[placeholder*="Grok"]',
      'textarea[placeholder*="grok"]'
    ];

    for (const selector of selectors) {
      const elements = document.querySelectorAll(selector);
      for (const element of elements) {
        const parent = element.closest('[data-testid*="grok"], [aria-label*="Grok"], [aria-label*="grok"]');
        if (parent || element.offsetParent !== null) {
          const placeholder = element.getAttribute('placeholder') || element.getAttribute('data-placeholder') || '';
          if (placeholder.toLowerCase().includes('grok') || parent) {
            return element;
          }
        }
      }
    }
    return null;
  }

  // Find submit button
  function findSubmitButton() {
    const selectors = [
      'button[data-testid="tweetButton"]',
      'button[aria-label*="Post"]',
      'button[aria-label*="Send"]',
      'button[type="submit"]'
    ];

    for (const selector of selectors) {
      const buttons = document.querySelectorAll(selector);
      for (const button of buttons) {
        const ariaLabel = button.getAttribute('aria-label') || '';
        if ((ariaLabel.toLowerCase().includes('post') || ariaLabel.toLowerCase().includes('send')) && !button.disabled) {
          return button;
        }
      }
    }
    return null;
  }

  // Get text from input
  function getInputText(element) {
    if (element.tagName === 'TEXTAREA' || element.tagName === 'INPUT') {
      return element.value;
    } else if (element.contentEditable === 'true') {
      return element.innerText || element.textContent || '';
    }
    return '';
  }

  // Set text in input
  function setInputText(element, text) {
    if (element.tagName === 'TEXTAREA' || element.tagName === 'INPUT') {
      element.value = text;
      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('change', { bubbles: true }));
    } else if (element.contentEditable === 'true') {
      element.innerHTML = '';
      element.textContent = text;
      element.innerText = text;
      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('textInput', { bubbles: true }));
      const range = document.createRange();
      const selection = window.getSelection();
      range.selectNodeContents(element);
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }

  // Process message through framework
  function processMessage(originalMessage) {
    if (!settings.enabled || !settings.platforms?.grok) {
      return originalMessage;
    }

    try {
      console.log('Zeq OS: Processing message through mathematical framework...');
      const result = zeqMiddleware.processQuery(originalMessage);
      const mathematicalPrompt = result.mathematicalPrompt;
      
      console.log('Zeq OS: Framework processing complete', {
        originalQuery: result.originalQuery,
        operatorCount: result.activeOperators?.length || 0,
        domains: result.domains
      });

      // Log to transparency manager
      if (transparencyManager) {
        transparencyManager.logProcessing({
          userQuery: originalMessage,
          platform: 'grok',
          url: window.location.href,
          mathematicalPrompt: mathematicalPrompt,
          pulseCycle: result.pulseCycle,
          phase: result.phase,
          activeOperators: result.activeOperators,
          domains: result.domains,
          mathematicalState: result.mathematicalState,
          truthVector: result.truthVector,
          informationIntegrity: result.informationIntegrity,
          crossDomainHarmony: result.crossDomainHarmony,
          auditTrail: result.auditTrail,
          timestamp: result.timestamp
        }).catch(err => console.warn('Transparency Manager: Failed to log', err));
      } else if (typeof TransparencyManager !== 'undefined') {
        // Fallback: initialize and log if not already initialized
        const manager = new TransparencyManager();
        manager.initialize().then(() => {
          transparencyManager = manager;
          window.transparencyManager = manager;
          manager.logProcessing({
            userQuery: originalMessage,
            platform: 'grok',
            url: window.location.href,
            mathematicalPrompt: mathematicalPrompt,
            pulseCycle: result.pulseCycle,
            phase: result.phase,
            activeOperators: result.activeOperators,
            domains: result.domains,
            mathematicalState: result.mathematicalState,
            truthVector: result.truthVector,
            informationIntegrity: result.informationIntegrity,
            crossDomainHarmony: result.crossDomainHarmony,
            auditTrail: result.auditTrail,
            timestamp: result.timestamp
          }).catch(err => console.warn('Transparency Manager: Failed to log', err));
        });
      }

      return mathematicalPrompt;
    } catch (error) {
      console.error('Zeq OS: Framework processing error', error);
      return originalMessage; // Fallback to original
    }
  }

  // Intercept Enter key - DISABLED: Network interception handles this
  // DO NOT modify input box - network interception will handle message replacement
  function interceptEnterKey(inputBox) {
    // Network interception is primary method - this is disabled to prevent input box modification
    // The mathematical prompt should NEVER appear in the input box
    return;
  }

  // Intercept submit button - DISABLED: Network interception handles this
  // DO NOT modify input box - network interception will handle message replacement
  function interceptSubmitButton(inputBox) {
    // Network interception is primary method - this is disabled to prevent input box modification
    // The mathematical prompt should NEVER appear in the input box
    return;
  }

  // Inject network interception into page context
  function injectNetworkInterception() {
    console.log('🚀 Zeq OS: Injecting network interception into page context for Grok...');
    console.log('🔍 Zeq OS: chrome.runtime available?', typeof chrome !== 'undefined' && !!chrome.runtime);
    
    // Check if already injected
    if (window.zeqGrokInterceptionInjected || document.zeqGrokInterceptionInjected) {
      console.log('⚠️ Zeq OS: Grok network interception already injected');
      return;
    }
    
    try {
      if (typeof chrome === 'undefined' || !chrome.runtime) {
        console.error('❌ Zeq OS: chrome.runtime not available');
        return;
      }
      
      const scriptUrl = chrome.runtime.getURL('content/grok-page-context.js');
      console.log('📤 Zeq OS: Attempting to inject script from URL:', scriptUrl);
      
      const script = document.createElement('script');
      script.src = scriptUrl;
      script.onload = () => {
        console.log('✅ Zeq OS: Grok network interception script loaded successfully');
        window.zeqGrokInterceptionInjected = true;
        document.zeqGrokInterceptionInjected = true;
        script.remove();
      };
      script.onerror = (error) => {
        console.error('❌ Zeq OS: Failed to load Grok network interception script', error);
        console.error('❌ Zeq OS: Script URL:', chrome.runtime.getURL('content/grok-page-context.js'));
        console.error('❌ Zeq OS: Check if grok-page-context.js is in web_accessible_resources');
      };
      (document.head || document.documentElement).appendChild(script);
      console.log('📤 Zeq OS: Grok network interception script tag added to DOM');
    } catch (e) {
      console.error('❌ Zeq OS: Failed to inject Grok network interception', e);
      console.error('❌ Zeq OS: Error stack:', e.stack);
    }
  }

  // Listen for processing requests from page context
  window.addEventListener('message', (event) => {
    if (event.source !== window) return;
    
    if (event.data && event.data.type === 'ZEQ_PROCESS_REQUEST') {
      console.log('📥 Zeq OS [Content Script - Grok]: Received processing request, ID:', event.data.requestId);
      
      if (!frameworkReady || !zeqMiddleware) {
        console.warn('⚠️ Zeq OS: Framework not ready, sending original message back');
        window.postMessage({
          type: 'ZEQ_PROCESSED_RESPONSE',
          requestId: event.data.requestId,
          processedContent: event.data.originalContent
        }, '*');
        return;
      }
      
      if (!settings.enabled || !settings.platforms?.grok) {
        console.log('⚠️ Zeq OS: Grok disabled in settings, sending original message back');
        window.postMessage({
          type: 'ZEQ_PROCESSED_RESPONSE',
          requestId: event.data.requestId,
          processedContent: event.data.originalContent
        }, '*');
        return;
      }
      
      const originalContent = event.data.originalContent;
      console.log('🔄 Zeq OS [Content Script - Grok]: Processing message:', originalContent.substring(0, 50));
      
      try {
        console.log('🔄 Zeq OS [Content Script - Grok]: Starting framework processing...');
        // EXACTLY like index.html: processQuery to get mathematicalPrompt
        const zeqResult = zeqMiddleware.processQuery(originalContent);
        console.log('✅ Zeq OS [Content Script - Grok]: Framework processQuery returned:', {
          hasMathematicalPrompt: !!zeqResult.mathematicalPrompt,
          promptLength: zeqResult.mathematicalPrompt?.length || 0,
          operatorCount: zeqResult.activeOperators?.length || 0
        });
        
        const processedMessage = zeqResult.mathematicalPrompt;
        
        if (!processedMessage) {
          console.error('❌ Zeq OS: Framework did not return mathematicalPrompt!', zeqResult);
          window.postMessage({
            type: 'ZEQ_PROCESSED_RESPONSE',
            requestId: event.data.requestId,
            processedContent: originalContent
          }, '*');
          return;
        }
        
        // Log to transparency manager
        if (transparencyManager) {
          transparencyManager.logProcessing({
            userQuery: originalContent,
            platform: 'grok',
            url: window.location.href,
            mathematicalPrompt: processedMessage,
            pulseCycle: zeqResult.pulseCycle,
            phase: zeqResult.phase,
            activeOperators: zeqResult.activeOperators,
            domains: zeqResult.domains,
            mathematicalState: zeqResult.mathematicalState,
            truthVector: zeqResult.truthVector,
            informationIntegrity: zeqResult.informationIntegrity,
            crossDomainHarmony: zeqResult.crossDomainHarmony,
            auditTrail: zeqResult.auditTrail,
            timestamp: zeqResult.timestamp
          }).catch(err => console.warn('Transparency Manager: Failed to log', err));
        }
        
        console.log('✅ Zeq OS [Content Script - Grok]: Processing complete, sending back. Length:', processedMessage.length);
        
        window.postMessage({
          type: 'ZEQ_PROCESSED_RESPONSE',
          requestId: event.data.requestId,
          processedContent: processedMessage
        }, '*');
      } catch (error) {
        console.error('❌ Zeq OS [Content Script - Grok]: Processing error, using original', error);
        console.error('❌ Zeq OS [Content Script - Grok]: Error stack:', error.stack);
        window.postMessage({
          type: 'ZEQ_PROCESSED_RESPONSE',
          requestId: event.data.requestId,
          processedContent: originalContent
        }, '*');
      }
    }
  });

  // Initialize interception
  function initialize() {
    const inputBox = findInputBox();
    if (inputBox) {
      // Network interception is PRIMARY and ONLY method - DO NOT modify input box
      // The mathematical prompt should NEVER appear in the input box
      // All message processing happens in network interception only
      console.log('Zeq OS: Grok input box detected (network interception handles all processing)');
    }
  }

  // Use MutationObserver to handle dynamically loaded content
  const observer = new MutationObserver(() => {
    const inputBox = findInputBox();
    if (inputBox && !inputBox.dataset.zeqIntercepted) {
      inputBox.dataset.zeqIntercepted = 'true';
      console.log('Zeq OS: Grok input box detected via MutationObserver (network interception handles all processing)');
      // DO NOT call interception functions - network interception is the only method
    }
  });

  // Inject network interception immediately
  console.log('🔄 Zeq OS: Attempting to inject network interception...');
  injectNetworkInterception();
  
  // Also inject on DOMContentLoaded if not already done
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      console.log('🔄 Zeq OS: DOMContentLoaded - injecting network interception again');
      injectNetworkInterception();
    });
  }

  // Start observing
  if (document.body) {
    console.log('✅ Zeq OS: Document body exists, starting observer');
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    initialize();
  } else {
    console.log('⏳ Zeq OS: Document body not ready, waiting for DOMContentLoaded');
    document.addEventListener('DOMContentLoaded', () => {
      console.log('✅ Zeq OS: DOMContentLoaded - starting observer');
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
      initialize();
      injectNetworkInterception();
    });
  }

  // Also try injecting after a delay to ensure it happens
  setTimeout(() => {
    console.log('🔄 Zeq OS: Delayed injection attempt (3s)');
    injectNetworkInterception();
  }, 3000);

  console.log('✅ Zeq OS: Grok content script initialization complete');

})();

// Log after IIFE to confirm script loaded
console.log('✅✅✅ ZEQ OS GROK CONTENT SCRIPT FULLY LOADED ✅✅✅');
