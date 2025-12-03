// Zeq OS Mathematical Framework - Claude Content Script
// Intercepts Claude (Anthropic) input and processes through mathematical framework

(function() {
  'use strict';

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
  
  if (typeof ZeqOSFramework !== 'undefined') {
      try {
        zeqMiddleware = new ZeqOSFramework.ZeqOSMiddleware();
        frameworkReady = true;
        console.log('✅ Zeq OS: Claude framework initialized successfully!');
        // Initialize transparency manager after framework is ready
        initTransparencyManager();
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
          console.log('✅ Zeq OS: Claude framework initialized successfully (delayed)!');
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
          settings = { enabled: true, platforms: { claude: true } };
        } else if (response) {
          settings = response;
        }
      });
    } else {
      settings = { enabled: true, platforms: { claude: true } };
    }
  } catch (error) {
    console.warn('Zeq OS: Error sending getSettings message:', error);
    settings = { enabled: true, platforms: { claude: true } };
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

  // Find Claude input box (contenteditable div)
  function findInputBox() {
    const selectors = [
      'div[contenteditable="true"][data-placeholder]',
      'div[contenteditable="true"]',
      'textarea[placeholder*="Message"]',
      'textarea[placeholder*="message"]',
      'div[role="textbox"]'
    ];

    for (const selector of selectors) {
      const elements = document.querySelectorAll(selector);
      for (const element of elements) {
        // Claude's input is usually the last contenteditable div
        if (element.offsetParent !== null && element.isContentEditable) {
          const placeholder = element.getAttribute('data-placeholder') || element.getAttribute('placeholder') || '';
          if (placeholder.toLowerCase().includes('message') || placeholder.toLowerCase().includes('claude')) {
            return element;
          }
        }
      }
    }
    
    // Fallback: return the last visible contenteditable
    const allEditable = document.querySelectorAll('div[contenteditable="true"]');
    for (let i = allEditable.length - 1; i >= 0; i--) {
      if (allEditable[i].offsetParent !== null) {
        return allEditable[i];
      }
    }
    
    return null;
  }

  // Find submit button
  function findSubmitButton() {
    const selectors = [
      'button[aria-label*="Send"]',
      'button[aria-label*="send"]',
      'button:has(svg)',
      'button[type="submit"]'
    ];

    for (const selector of selectors) {
      const buttons = document.querySelectorAll(selector);
      for (const button of buttons) {
        const ariaLabel = button.getAttribute('aria-label') || '';
        if (ariaLabel.toLowerCase().includes('send') && !button.disabled) {
          return button;
        }
      }
    }
    return null;
  }

  // Get text from contenteditable
  function getInputText(element) {
    if (element.tagName === 'TEXTAREA' || element.tagName === 'INPUT') {
      return element.value;
    } else if (element.contentEditable === 'true') {
      return element.innerText || element.textContent || '';
    }
    return '';
  }

  // Set text in contenteditable
  function setInputText(element, text) {
    if (element.tagName === 'TEXTAREA' || element.tagName === 'INPUT') {
      element.value = text;
      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('change', { bubbles: true }));
    } else if (element.contentEditable === 'true') {
      // Clear existing content
      element.innerHTML = '';
      element.textContent = text;
      element.innerText = text;
      
      // Trigger input events
      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('textInput', { bubbles: true }));
      
      // Move cursor to end
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
    if (!settings.enabled || !settings.platforms?.claude) {
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
          platform: 'claude',
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
            platform: 'claude',
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
    console.log('🚀 Zeq OS: Injecting network interception into page context for Claude...');
    
    // Check if already injected
    if (window.zeqClaudeInterceptionInjected || document.zeqClaudeInterceptionInjected) {
      console.log('⚠️ Zeq OS: Claude network interception already injected');
      return;
    }
    
    try {
      if (typeof chrome === 'undefined' || !chrome.runtime) {
        console.error('❌ Zeq OS: chrome.runtime not available');
        return;
      }
      
      const script = document.createElement('script');
      script.src = chrome.runtime.getURL('content/claude-page-context.js');
      script.onload = () => {
        console.log('✅ Zeq OS: Claude network interception script loaded');
        window.zeqClaudeInterceptionInjected = true;
        document.zeqClaudeInterceptionInjected = true;
        script.remove();
      };
      script.onerror = (error) => {
        console.error('❌ Zeq OS: Failed to load Claude network interception script', error);
        console.error('❌ Zeq OS: Script URL:', chrome.runtime.getURL('content/claude-page-context.js'));
      };
      (document.head || document.documentElement).appendChild(script);
      console.log('📤 Zeq OS: Claude network interception script tag added to DOM');
    } catch (e) {
      console.error('Zeq OS: Failed to inject Claude network interception', e);
    }
  }

  // Listen for processing requests from page context
  window.addEventListener('message', (event) => {
    if (event.source !== window) return;
    
    if (event.data && event.data.type === 'ZEQ_PROCESS_REQUEST') {
      console.log('📥 Zeq OS [Content Script - Claude]: Received processing request, ID:', event.data.requestId);
      
      if (!frameworkReady || !zeqMiddleware) {
        console.warn('⚠️ Zeq OS: Framework not ready, sending original message back');
        window.postMessage({
          type: 'ZEQ_PROCESSED_RESPONSE',
          requestId: event.data.requestId,
          processedContent: event.data.originalContent
        }, '*');
        return;
      }
      
      if (!settings.enabled || !settings.platforms?.claude) {
        console.log('⚠️ Zeq OS: Claude disabled in settings, sending original message back');
        window.postMessage({
          type: 'ZEQ_PROCESSED_RESPONSE',
          requestId: event.data.requestId,
          processedContent: event.data.originalContent
        }, '*');
        return;
      }
      
      const originalContent = event.data.originalContent;
      console.log('🔄 Zeq OS [Content Script - Claude]: Processing message:', originalContent.substring(0, 50));
      
      try {
        // EXACTLY like index.html: processQuery to get mathematicalPrompt
        const zeqResult = zeqMiddleware.processQuery(originalContent);
        const processedMessage = zeqResult.mathematicalPrompt;
        
        if (!processedMessage) {
          console.error('❌ Zeq OS: Framework did not return mathematicalPrompt!');
          window.postMessage({
            type: 'ZEQ_PROCESSED_RESPONSE',
            requestId: event.data.requestId,
            processedContent: originalContent
          }, '*');
          return;
        }
        
        console.log('✅ Zeq OS [Content Script - Claude]: Processing complete, sending back. Length:', processedMessage.length);
        
        window.postMessage({
          type: 'ZEQ_PROCESSED_RESPONSE',
          requestId: event.data.requestId,
          processedContent: processedMessage
        }, '*');
      } catch (error) {
        console.error('❌ Zeq OS [Content Script - Claude]: Processing error, using original', error);
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
      console.log('Zeq OS: Claude input box detected (network interception handles all processing)');
    }
  }

  // Use MutationObserver to handle dynamically loaded content
  const observer = new MutationObserver(() => {
    const inputBox = findInputBox();
    if (inputBox && !inputBox.dataset.zeqIntercepted) {
      inputBox.dataset.zeqIntercepted = 'true';
      console.log('Zeq OS: Claude input box detected via MutationObserver (network interception handles all processing)');
      // DO NOT call interception functions - network interception is the only method
    }
  });

  // Inject network interception
  if (document.head || document.documentElement) {
    injectNetworkInterception();
  } else {
    document.addEventListener('DOMContentLoaded', injectNetworkInterception);
  }

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

