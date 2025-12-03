// Zeq OS Mathematical Framework - Universal Content Script
// Generic fallback for other AI platforms (Perplexity, Groq, Poe, Bard, Gemini, etc.)

(function() {
  'use strict';

  // Wait for framework to load
  if (typeof ZeqOSFramework === 'undefined') {
    console.error('Zeq OS Framework not loaded');
    return;
  }

  // Initialize framework
  const zeqMiddleware = new ZeqOSFramework.ZeqOSMiddleware();
  let isProcessing = false;
  let settings = { enabled: true };
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

  // Initialize transparency manager on load
  initTransparencyManager();

  // Get settings from storage
  try {
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      chrome.runtime.sendMessage({ action: 'getSettings' }, (response) => {
        if (chrome.runtime.lastError) {
          console.warn('Zeq OS: Error getting settings:', chrome.runtime.lastError.message);
          settings = { enabled: true, platforms: { universal: true } };
        } else if (response) {
          settings = response;
        }
      });
    } else {
      settings = { enabled: true, platforms: { universal: true } };
    }
  } catch (error) {
    console.warn('Zeq OS: Error sending getSettings message:', error);
    settings = { enabled: true, platforms: { universal: true } };
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

  // Find input box using generic selectors
  function findInputBox() {
    const selectors = [
      'textarea[placeholder*="Ask"]',
      'textarea[placeholder*="ask"]',
      'textarea[placeholder*="Message"]',
      'textarea[placeholder*="message"]',
      'textarea[placeholder*="Type"]',
      'textarea[placeholder*="type"]',
      'div[contenteditable="true"][role="textbox"]',
      'div[contenteditable="true"]',
      'textarea',
      'input[type="text"]'
    ];

    for (const selector of selectors) {
      const elements = document.querySelectorAll(selector);
      for (const element of elements) {
        // Check if element is visible and likely an input box
        if (element.offsetParent !== null) {
          const rect = element.getBoundingClientRect();
          // Input boxes are usually at least 100px wide
          if (rect.width > 100) {
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
      'button[type="submit"]',
      'button[aria-label*="Send"]',
      'button[aria-label*="send"]',
      'button[aria-label*="Submit"]',
      'button[aria-label*="submit"]',
      'button:has(svg)',
      'button[class*="send"]',
      'button[class*="submit"]'
    ];

    for (const selector of selectors) {
      const buttons = document.querySelectorAll(selector);
      for (const button of buttons) {
        if (!button.disabled && button.offsetParent !== null) {
          const ariaLabel = (button.getAttribute('aria-label') || '').toLowerCase();
          const className = (button.className || '').toLowerCase();
          if (ariaLabel.includes('send') || ariaLabel.includes('submit') || 
              className.includes('send') || className.includes('submit')) {
            return button;
          }
        }
      }
    }
    
    // Fallback: find button near input box
    const inputBox = findInputBox();
    if (inputBox) {
      const container = inputBox.closest('form, div[role="form"], div');
      if (container) {
        const buttons = container.querySelectorAll('button');
        for (const button of buttons) {
          if (!button.disabled && button.offsetParent !== null) {
            return button;
          }
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
    if (!settings.enabled || !settings.platforms?.universal) {
      return originalMessage;
    }

    // Detect specific platform for logging
    const hostname = window.location.hostname;
    let platformName = 'universal';
    if (hostname.includes('gemini.google.com') || hostname.includes('bard.google.com')) {
      platformName = 'gemini';
    } else if (hostname.includes('perplexity.ai')) {
      platformName = 'perplexity';
    } else if (hostname.includes('groq.com')) {
      platformName = 'groq';
    }

    try {
      console.log('Zeq OS: Processing message through mathematical framework...');
      const result = zeqMiddleware.processQuery(originalMessage);
      const mathematicalPrompt = result.mathematicalPrompt;
      
      console.log('Zeq OS: Framework processing complete', {
        originalQuery: result.originalQuery,
        operatorCount: result.activeOperators?.length || 0,
        domains: result.domains,
        platform: platformName
      });

      // Log to transparency manager
      if (transparencyManager) {
        transparencyManager.logProcessing({
          userQuery: originalMessage,
          platform: platformName,
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
            platform: platformName,
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

  // Intercept form submission
  function interceptSubmission(inputBox) {
    let form = inputBox.closest('form');
    if (!form) {
      const submitButton = findSubmitButton();
      if (submitButton) {
        form = submitButton.closest('form') || inputBox.closest('div[role="form"]');
      }
    }

    if (form) {
      form.addEventListener('submit', (e) => {
        if (isProcessing) return;
        
        const originalMessage = getInputText(inputBox).trim();
        if (!originalMessage) return;

        e.preventDefault();
        e.stopPropagation();
        isProcessing = true;

        const processedMessage = processMessage(originalMessage);
        setInputText(inputBox, processedMessage);

        // Trigger submission after a brief delay
        setTimeout(() => {
          form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
          const submitBtn = findSubmitButton();
          if (submitBtn) {
            submitBtn.click();
          }
          isProcessing = false;
        }, 100);
      }, true);
    }
  }

  // Intercept Enter key
  function interceptEnterKey(inputBox) {
    inputBox.addEventListener('keydown', (e) => {
      // Try both Enter and Cmd/Ctrl+Enter
      if (e.key === 'Enter' && (!e.shiftKey || e.ctrlKey || e.metaKey)) {
        const originalMessage = getInputText(inputBox).trim();
        if (!originalMessage || isProcessing) return;

        e.preventDefault();
        e.stopPropagation();
        isProcessing = true;

        const processedMessage = processMessage(originalMessage);
        setInputText(inputBox, processedMessage);

        // Trigger Enter key after processing
        setTimeout(() => {
          const enterEvent = new KeyboardEvent('keydown', {
            key: 'Enter',
            code: 'Enter',
            keyCode: 13,
            which: 13,
            ctrlKey: e.ctrlKey,
            metaKey: e.metaKey,
            bubbles: true,
            cancelable: true
          });
          inputBox.dispatchEvent(enterEvent);
          
          // Also try clicking submit button
          const submitBtn = findSubmitButton();
          if (submitBtn) {
            setTimeout(() => submitBtn.click(), 50);
          }
          
          isProcessing = false;
        }, 100);
      }
    }, true);
  }

  // Intercept submit button
  function interceptSubmitButton(inputBox) {
    const submitButton = findSubmitButton();
    if (submitButton) {
      submitButton.addEventListener('click', (e) => {
        if (isProcessing) return;
        
        const originalMessage = getInputText(inputBox).trim();
        if (!originalMessage) return;

        e.preventDefault();
        e.stopPropagation();
        isProcessing = true;

        const processedMessage = processMessage(originalMessage);
        setInputText(inputBox, processedMessage);

        // Trigger click after processing
        setTimeout(() => {
          submitButton.click();
          isProcessing = false;
        }, 100);
      }, true);
    }
  }

  // Inject network interception into page context
  function injectNetworkInterception() {
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('content/universal-page-context.js');
    script.onload = function() {
      this.remove();
    };
    (document.head || document.documentElement).appendChild(script);
  }

  // Listen for processing requests from page context
  window.addEventListener('message', (event) => {
    if (event.source !== window) return;
    
    if (event.data && event.data.type === 'ZEQ_PROCESS_REQUEST') {
      console.log('📥 Zeq OS [Universal]: Received processing request');
      
      if (!zeqMiddleware) {
        console.warn('⚠️ Zeq OS: Framework not ready');
        window.postMessage({
          type: 'ZEQ_PROCESSED_RESPONSE',
          requestId: event.data.requestId,
          processedContent: event.data.originalContent
        }, '*');
        return;
      }
      
      if (!settings.enabled || !settings.platforms?.universal) {
        window.postMessage({
          type: 'ZEQ_PROCESSED_RESPONSE',
          requestId: event.data.requestId,
          processedContent: event.data.originalContent
        }, '*');
        return;
      }
      
      const originalContent = event.data.originalContent;
      try {
        const processedMessage = processMessage(originalContent);
        window.postMessage({
          type: 'ZEQ_PROCESSED_RESPONSE',
          requestId: event.data.requestId,
          processedContent: processedMessage
        }, '*');
      } catch (error) {
        console.error('❌ Zeq OS: Processing error', error);
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
      interceptSubmission(inputBox);
      interceptEnterKey(inputBox);
      interceptSubmitButton(inputBox);
      console.log('Zeq OS: Universal interception initialized');
    } else {
      // Retry if input box not found (page still loading)
      setTimeout(initialize, 1000);
    }
    
    // Inject network interception
    injectNetworkInterception();
  }

  // Use MutationObserver to handle dynamically loaded content
  const observer = new MutationObserver(() => {
    const inputBox = findInputBox();
    if (inputBox && !inputBox.dataset.zeqIntercepted) {
      inputBox.dataset.zeqIntercepted = 'true';
      interceptSubmission(inputBox);
      interceptEnterKey(inputBox);
      interceptSubmitButton(inputBox);
    }
  });

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
    });
  }

})();

