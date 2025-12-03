// Zeq OS Mathematical Framework - DeepSeek Content Script
// Intercepts DeepSeek input and processes through mathematical framework

console.log('🚀 Zeq OS: DeepSeek content script STARTING...');

(function() {
  'use strict';

  console.log('🚀 Zeq OS: DeepSeek script wrapper executing...');

  // Wait for framework to load with retry
  let zeqMiddleware = null;
  let frameworkReady = false;
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

  function initFramework() {
    console.log('Zeq OS: Checking for framework...', {
      ZeqOSFramework: typeof ZeqOSFramework,
      hasMiddleware: typeof ZeqOSFramework !== 'undefined' && typeof ZeqOSFramework.ZeqOSMiddleware !== 'undefined'
    });
    
    if (typeof ZeqOSFramework !== 'undefined' && ZeqOSFramework.ZeqOSMiddleware) {
      try {
        zeqMiddleware = new ZeqOSFramework.ZeqOSMiddleware();
        frameworkReady = true;
        console.log('✅ Zeq OS: Framework initialized successfully!');
        // Initialize transparency manager after framework is ready
        initTransparencyManager();
        return true;
      } catch (error) {
        console.error('❌ Zeq OS: Framework initialization error', error);
        return false;
      }
    } else {
      console.warn('⚠️ Zeq OS: Framework not available yet. ZeqOSFramework:', typeof ZeqOSFramework);
    }
    return false;
  }

  // Try to initialize framework immediately
  if (!initFramework()) {
    // Retry after a delay
    setTimeout(() => {
      if (!initFramework()) {
        console.error('Zeq OS: Framework failed to load after retry');
        console.log('Zeq OS: Available globals:', Object.keys(window).filter(k => k.includes('Zeq') || k.includes('zeq')));
      }
    }, 1000);
  }
  let isProcessing = false;
  let settings = { enabled: true };

  // Get settings from storage
  try {
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      chrome.runtime.sendMessage({ action: 'getSettings' }, (response) => {
        if (chrome.runtime.lastError) {
          console.warn('Zeq OS: Error getting settings:', chrome.runtime.lastError.message);
          // Use defaults
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
    // Use defaults
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

  // Find DeepSeek input box
  function findInputBox() {
    const selectors = [
      'textarea[placeholder*="Ask"]',
      'textarea[placeholder*="ask"]',
      'textarea[placeholder*="Message"]',
      'textarea[placeholder*="message"]',
      'textarea[placeholder*="输入"]',
      'textarea[placeholder*="请输入"]',
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
          // Input boxes are usually at least 100px wide and have some height
          if (rect.width > 100 && rect.height > 20) {
            // Check if it's in a chat/input area
            const parent = element.closest('form, [role="form"], [class*="input"], [class*="chat"], [class*="message"]');
            if (parent || element.getAttribute('placeholder')) {
              return element;
            }
          }
        }
      }
    }
    
    // Fallback: look for any visible textarea or contenteditable
    const allTextareas = document.querySelectorAll('textarea, div[contenteditable="true"]');
    for (const element of allTextareas) {
      if (element.offsetParent !== null) {
        const rect = element.getBoundingClientRect();
        if (rect.width > 100 && rect.height > 20) {
          return element;
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
      'button[aria-label*="提交"]',
      'button[aria-label*="发送"]',
      'button[class*="send"]',
      'button[class*="submit"]',
      'button:has(svg)',
      'button[disabled="false"]'
    ];

    for (const selector of selectors) {
      const buttons = document.querySelectorAll(selector);
      for (const button of buttons) {
        if (!button.disabled && button.offsetParent !== null) {
          const ariaLabel = (button.getAttribute('aria-label') || '').toLowerCase();
          const className = (button.className || '').toLowerCase();
          const text = (button.textContent || '').toLowerCase();
          if (ariaLabel.includes('send') || ariaLabel.includes('submit') || 
              ariaLabel.includes('发送') || ariaLabel.includes('提交') ||
              className.includes('send') || className.includes('submit') ||
              text.includes('send') || text.includes('发送')) {
            return button;
          }
        }
      }
    }
    
    // Fallback: find button near input box
    const inputBox = findInputBox();
    if (inputBox) {
      const container = inputBox.closest('form, div[role="form"], div, section');
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
      // Also trigger React/other framework events
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
      nativeInputValueSetter.call(element, text);
      element.dispatchEvent(new Event('input', { bubbles: true }));
    } else if (element.contentEditable === 'true') {
      element.innerHTML = '';
      element.textContent = text;
      element.innerText = text;
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

  // Process message through framework (EXACTLY like index.html does)
  function processMessage(originalMessage) {
    if (!settings.enabled || !settings.platforms?.universal) {
      console.log('Zeq OS: Extension disabled in settings');
      return originalMessage;
    }

    if (!frameworkReady || !zeqMiddleware) {
      console.warn('Zeq OS: Framework not ready, using original message');
      return originalMessage;
    }

    try {
      console.log('🔄 Zeq OS: Processing message through mathematical framework...', originalMessage.substring(0, 50));
      
      // EXACTLY like index.html line 17872: const zeqResult = zeqMiddleware.processQuery(message);
      const zeqResult = zeqMiddleware.processQuery(originalMessage);
      
      if (!zeqResult) {
        console.error('❌ Zeq OS: Framework returned null/undefined');
        return originalMessage;
      }
      
      // EXACTLY like index.html line 17873: zeqMathematicalPrompt = zeqResult.mathematicalPrompt;
      const zeqMathematicalPrompt = zeqResult.mathematicalPrompt;
      
      if (!zeqMathematicalPrompt) {
        console.error('❌ Zeq OS: Framework did not return mathematicalPrompt!');
        return originalMessage;
      }
      
      // Verify the prompt contains framework description and main42Operators
      const hasFrameworkDesc = zeqMathematicalPrompt.includes('frameworkDescription');
      const hasMain42 = zeqMathematicalPrompt.includes('main42Operators');
      const hasOperators = zeqMathematicalPrompt.includes('"operators"');
      const hasMain42Summary = zeqMathematicalPrompt.includes('MAIN 42 OPERATORS');
      const hasON0 = zeqMathematicalPrompt.includes('ON0');
      const hasQM1 = zeqMathematicalPrompt.includes('QM1');
      const hasReference = zeqMathematicalPrompt.includes('zenodo.16992771');
      
      console.log('✅ Zeq OS: Framework processing complete', {
        originalQuery: zeqResult.originalQuery,
        operatorCount: zeqResult.activeOperators?.length || 0,
        domains: zeqResult.domains,
        promptLength: zeqMathematicalPrompt.length,
        promptPreview: zeqMathematicalPrompt.substring(0, 500),
        hasFrameworkDescription: hasFrameworkDesc,
        hasMain42Operators: hasMain42,
        hasMain42Summary: hasMain42Summary,
        hasOperatorsArray: hasOperators,
        hasON0: hasON0,
        hasQM1: hasQM1,
        hasReference: hasReference,
        promptContainsMain42: hasON0 || hasQM1 || zeqMathematicalPrompt.includes('NM18') || zeqMathematicalPrompt.includes('GR31')
      });
      
      // Log the first 2000 characters to see what's actually being sent
      console.log('📋 Zeq OS: FULL PROMPT PREVIEW (first 2000 chars):', zeqMathematicalPrompt.substring(0, 2000));
      
      if (!hasFrameworkDesc || !hasMain42 || !hasOperators) {
        console.error('❌ Zeq OS: CRITICAL - Prompt missing required components!', {
          hasFrameworkDesc,
          hasMain42,
          hasOperators,
          hasMain42Summary,
          promptLength: zeqMathematicalPrompt.length
        });
      }
      
      // Try to parse and verify JSON structure
      try {
        // Find JSON part (after the summary)
        const jsonStart = zeqMathematicalPrompt.indexOf('{');
        if (jsonStart > 0) {
          const jsonPart = zeqMathematicalPrompt.substring(jsonStart);
          const parsed = JSON.parse(jsonPart);
          console.log('✅ Zeq OS: JSON structure verified:', {
            hasFrameworkDesc: !!parsed.frameworkDescription,
            hasMain42InJSON: !!parsed.frameworkDescription?.main42Operators,
            main42CoreCount: parsed.frameworkDescription?.main42Operators?.coreOperators ? Object.keys(parsed.frameworkDescription.main42Operators.coreOperators).length : 0,
            operatorsCount: parsed.operators?.length || 0,
            totalOperators: parsed.totalOperators
          });
        }
      } catch (e) {
        console.warn('⚠️ Zeq OS: Could not parse JSON from prompt', e);
      }

      // Log to transparency manager
      if (transparencyManager) {
        transparencyManager.logProcessing({
          userQuery: originalMessage,
          platform: 'deepseek',
          url: window.location.href,
          mathematicalPrompt: zeqMathematicalPrompt,
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
        }).catch(err => {
          console.warn('Transparency Manager: Failed to log entry', err);
        });
      } else if (typeof TransparencyManager !== 'undefined') {
        // Fallback: initialize and log if not already initialized
        const manager = new TransparencyManager();
        manager.initialize().then(() => {
          manager.logProcessing({
            userQuery: originalMessage,
            platform: 'deepseek',
            url: window.location.href,
            mathematicalPrompt: zeqMathematicalPrompt,
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
        });
      }

      // Return the mathematical prompt (JSON string) - this replaces the user's message
      // EXACTLY like index.html line 16931: return { role: item.role, content: zeqMathematicalPrompt };
      return zeqMathematicalPrompt;
    } catch (error) {
      console.error('❌ Zeq OS: Framework processing error', error);
      return originalMessage; // Fallback to original
    }
  }

  // Intercept network requests (fetch and XHR)
  function interceptNetworkRequests() {
    // Intercept fetch
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
      const url = args[0];
      const options = args[1] || {};
      
      // Log all fetch requests for debugging
      if (typeof url === 'string' && (url.includes('deepseek') || url.includes('api'))) {
        console.log('Zeq OS: Fetch request detected:', url);
      }
      
      // Check if this is a chat/message API request
      if (typeof url === 'string' && (
        url.includes('/chat') || 
        url.includes('/message') || 
        url.includes('/completion') ||
        url.includes('/api/chat') ||
        url.includes('/v1/chat') ||
        url.includes('/v1/completions') ||
        url.includes('/conversation') ||
        url.includes('/stream') ||
        url.includes('deepseek.com') && (url.includes('/chat') || url.includes('/api'))
      )) {
        console.log('Zeq OS: Intercepted fetch request to:', url);
        console.log('Zeq OS: Request options:', {
          method: options.method || 'GET',
          headers: options.headers,
          hasBody: !!options.body
        });
        
        // Try to get the message from request body
        if (options.body) {
          try {
            let bodyData;
            if (typeof options.body === 'string') {
              bodyData = JSON.parse(options.body);
            } else if (options.body instanceof FormData) {
              // Handle FormData
              const formDataObj = {};
              for (let [key, value] of options.body.entries()) {
                formDataObj[key] = value;
              }
              bodyData = formDataObj;
            } else {
              bodyData = options.body;
            }
            
            console.log('Zeq OS: Request body structure:', Object.keys(bodyData));
            
            if (bodyData.messages && Array.isArray(bodyData.messages)) {
              // Get the last user message
              const userMessages = bodyData.messages.filter(m => m.role === 'user' || m.role === 'User');
              if (userMessages.length > 0) {
                const lastUserMessage = userMessages[userMessages.length - 1];
                const originalContent = lastUserMessage.content || lastUserMessage.text || '';
                
                if (originalContent && !originalContent.startsWith('{')) {
                  console.log('Zeq OS: Processing message from fetch request:', originalContent.substring(0, 50));
                  const processedMessage = processMessage(originalContent);
                  
                  // Replace the message content
                  lastUserMessage.content = processedMessage;
                  lastUserMessage.text = processedMessage;
                  
                // Update the body
                if (typeof options.body === 'string') {
                  options.body = JSON.stringify(bodyData);
                } else {
                  options.body = bodyData;
                }
                console.log('Zeq OS: Replaced message with mathematical prompt (length:', processedMessage.length, ')');
                }
              }
            } else if (bodyData.prompt || bodyData.query || bodyData.message) {
              const originalContent = bodyData.prompt || bodyData.query || bodyData.message;
              if (originalContent && !originalContent.startsWith('{')) {
                console.log('Zeq OS: Processing message from fetch request:', originalContent.substring(0, 50));
                const processedMessage = processMessage(originalContent);
                
                if (bodyData.prompt) bodyData.prompt = processedMessage;
                if (bodyData.query) bodyData.query = processedMessage;
                if (bodyData.message) bodyData.message = processedMessage;
                
                options.body = JSON.stringify(bodyData);
                console.log('Zeq OS: Replaced message with mathematical prompt');
              }
            }
          } catch (error) {
            console.error('Zeq OS: Error processing fetch body', error);
          }
        }
      }
      
      return originalFetch.apply(this, args);
    };

    // Intercept XMLHttpRequest
    const originalXHROpen = XMLHttpRequest.prototype.open;
    const originalXHRSend = XMLHttpRequest.prototype.send;

    XMLHttpRequest.prototype.open = function(method, url, ...rest) {
      this._zeqUrl = url;
      this._zeqMethod = method;
      return originalXHROpen.apply(this, [method, url, ...rest]);
    };

    XMLHttpRequest.prototype.send = function(data) {
      const url = this._zeqUrl;
      
      // Log all XHR requests for debugging
      if (url && (url.includes('deepseek') || url.includes('api'))) {
        console.log('Zeq OS: XHR request detected:', url);
      }
      
      if (url && (
        url.includes('/chat') || 
        url.includes('/message') || 
        url.includes('/completion') ||
        url.includes('/api/chat') ||
        url.includes('/v1/chat') ||
        url.includes('/v1/completions') ||
        url.includes('/conversation') ||
        url.includes('/stream') ||
        (url.includes('deepseek.com') && (url.includes('/chat') || url.includes('/api')))
      )) {
        console.log('Zeq OS: Intercepted XHR request to:', url);
        console.log('Zeq OS: XHR data type:', typeof data, 'length:', data ? data.length : 0);
        
        if (data && typeof data === 'string') {
          try {
            const bodyData = JSON.parse(data);
            if (bodyData.messages && Array.isArray(bodyData.messages)) {
              const userMessages = bodyData.messages.filter(m => m.role === 'user' || m.role === 'User');
              if (userMessages.length > 0) {
                const lastUserMessage = userMessages[userMessages.length - 1];
                const originalContent = lastUserMessage.content || lastUserMessage.text || '';
                
                if (originalContent && !originalContent.startsWith('{')) {
                  console.log('Zeq OS: Processing message from XHR request:', originalContent.substring(0, 50));
                  const processedMessage = processMessage(originalContent);
                  
                  lastUserMessage.content = processedMessage;
                  lastUserMessage.text = processedMessage;
                  
                  data = JSON.stringify(bodyData);
                  console.log('Zeq OS: Replaced message with mathematical prompt');
                }
              }
            } else if (bodyData.prompt || bodyData.query || bodyData.message) {
              const originalContent = bodyData.prompt || bodyData.query || bodyData.message;
              if (originalContent && !originalContent.startsWith('{')) {
                console.log('Zeq OS: Processing message from XHR request:', originalContent.substring(0, 50));
                const processedMessage = processMessage(originalContent);
                
                if (bodyData.prompt) bodyData.prompt = processedMessage;
                if (bodyData.query) bodyData.query = processedMessage;
                if (bodyData.message) bodyData.message = processedMessage;
                
                data = JSON.stringify(bodyData);
                console.log('Zeq OS: Replaced message with mathematical prompt');
              }
            }
          } catch (error) {
            console.error('Zeq OS: Error processing XHR body', error);
          }
        }
      }
      
      return originalXHRSend.apply(this, [data]);
    };

    console.log('Zeq OS: Network request interception enabled');
  }

  // Intercept form submission (backup method) - DISABLED: Network interception handles this
  // DO NOT modify input box - network interception will handle message replacement
  function interceptSubmission(inputBox) {
    // Network interception is primary method - this is disabled to prevent input box modification
    // The mathematical prompt should NEVER appear in the input box
    return;
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

  // Initialize interception
  function initialize() {
    const inputBox = findInputBox();
    if (inputBox) {
      console.log('Zeq OS: DeepSeek input box found', {
        tagName: inputBox.tagName,
        type: inputBox.type,
        placeholder: inputBox.placeholder || inputBox.getAttribute('data-placeholder'),
        className: inputBox.className,
        id: inputBox.id
      });
      
      if (!inputBox.dataset.zeqIntercepted) {
        inputBox.dataset.zeqIntercepted = 'true';
        // Network interception is PRIMARY and ONLY method - DO NOT modify input box
        // The mathematical prompt should NEVER appear in the input box
        // All message processing happens in network interception only
        console.log('Zeq OS: DeepSeek input box detected (network interception handles all processing)');
      }
    } else {
      console.log('Zeq OS: DeepSeek input box not found, retrying...');
      // Log all textareas and contenteditables for debugging
      const allTextareas = document.querySelectorAll('textarea, div[contenteditable="true"]');
      console.log('Zeq OS: Found textareas/contenteditables:', allTextareas.length);
      allTextareas.forEach((el, idx) => {
        const rect = el.getBoundingClientRect();
        console.log(`Zeq OS: Element ${idx}:`, {
          tagName: el.tagName,
          visible: el.offsetParent !== null,
          size: `${rect.width}x${rect.height}`,
          placeholder: el.placeholder || el.getAttribute('data-placeholder') || 'none'
        });
      });
    }
  }

  // Use MutationObserver to handle dynamically loaded content
  const observer = new MutationObserver(() => {
    const inputBox = findInputBox();
    if (inputBox && !inputBox.dataset.zeqIntercepted) {
      inputBox.dataset.zeqIntercepted = 'true';
      console.log('Zeq OS: DeepSeek input box detected via MutationObserver (network interception handles all processing)', inputBox);
      // DO NOT call interception functions - network interception is the only method
    }
  });

  // Inject network interception into page context using script tag (web_accessible_resources)
  function injectNetworkInterception() {
    console.log('🚀 Zeq OS: Injecting network interception into page context...');
    
    // Inject script file using script tag (file is in web_accessible_resources)
    try {
      const script = document.createElement('script');
      script.src = chrome.runtime.getURL('content/deepseek-page-context.js');
      script.onload = () => {
        console.log('✅ Zeq OS: Network interception script loaded');
        script.remove();
      };
      script.onerror = () => {
        console.error('❌ Zeq OS: Failed to load network interception script');
      };
      (document.head || document.documentElement).appendChild(script);
    } catch (e) {
      console.error('Zeq OS: Failed to inject network interception', e);
    }
    
    // OLD METHOD (blocked by CSP) - keeping as comment for reference
    /*
    const script = document.createElement('script');
    script.textContent = `
      console.log('🚀 Zeq OS [Page Context]: Network interception script executing...');
      (function() {
        // Create a message channel for synchronous communication
        const zeqMessageQueue = [];
        let zeqProcessing = false;
        
        // Listen for processed messages from content script
        window.addEventListener('message', function(event) {
          if (event.data && event.data.type === 'ZEQ_PROCESSED_RESPONSE') {
            const { requestId, processedBody } = event.data;
            const queued = zeqMessageQueue.find(q => q.id === requestId);
            if (queued) {
              queued.resolve(processedBody);
              zeqMessageQueue.splice(zeqMessageQueue.indexOf(queued), 1);
            }
          }
        });
        
        // Intercept fetch in page context
        const originalFetch = window.fetch;
        window.fetch = function(...args) {
          const url = args[0];
          const options = args[1] || {};
          
      // DO NOT intercept WebAssembly (.wasm) files or binary data - let them pass through immediately
      // This prevents interference with DeepSeek's WebAssembly loading
      if (typeof url === 'string') {
        // Skip .wasm files (multiple patterns to catch all variations)
        if (url.endsWith('.wasm') || 
            url.includes('.wasm?') || 
            url.includes('.wasm&') ||
            url.includes('/wasm/') ||
            (url.includes('wasm') && (url.includes('worker') || url.includes('module')))) {
          return originalFetch.apply(this, args);
        }
        // Skip if Content-Type indicates WebAssembly
        if (options.headers && (
          options.headers['Content-Type']?.includes('application/wasm') || 
          options.headers['content-type']?.includes('application/wasm') ||
          options.headers['Accept']?.includes('application/wasm') ||
          options.headers['accept']?.includes('application/wasm')
        )) {
          return originalFetch.apply(this, args);
        }
        // Skip binary data (ArrayBuffer, Blob, TypedArray)
        if (options.body instanceof ArrayBuffer || 
            options.body instanceof Blob ||
            ArrayBuffer.isView(options.body)) {
          return originalFetch.apply(this, args);
        }
        // Skip if response type is arraybuffer (WebAssembly loading)
        if (options.responseType === 'arraybuffer' || options.responseType === 'blob') {
          return originalFetch.apply(this, args);
        }
      }
          
          // Intercept ALL fetch requests to catch DeepSeek's API calls
          if (typeof url === 'string' && options.body) {
            // Log all fetch requests for debugging
            if (url.includes('deepseek.com') || url.includes('/api/') || url.includes('/v1/')) {
              console.log('🔍 Zeq OS [Page Context]: Fetch detected:', url.substring(0, 100));
            }
            
            // Check if this is a chat/message API request
            if (
              url.includes('/chat') || 
              url.includes('/message') || 
              url.includes('/completion') ||
              url.includes('/api/chat') ||
              url.includes('/v1/chat') ||
              url.includes('/v1/completions') ||
              url.includes('/conversation') ||
              url.includes('/stream') ||
              url.includes('/completions') ||
              (url.includes('deepseek.com') && (url.includes('/chat') || url.includes('/api') || url.includes('/v1')))
            ) {
              console.log('🎯 Zeq OS [Page Context]: Intercepted chat API fetch:', url);
            
            try {
              const bodyData = typeof options.body === 'string' ? JSON.parse(options.body) : options.body;
              let needsProcessing = false;
              let originalContent = '';
              
              if (bodyData.messages && Array.isArray(bodyData.messages)) {
                const userMessages = bodyData.messages.filter(m => m.role === 'user' || m.role === 'User');
                if (userMessages.length > 0) {
                  const lastMsg = userMessages[userMessages.length - 1];
                  originalContent = lastMsg.content || lastMsg.text || '';
                  if (originalContent && !originalContent.startsWith('{') && originalContent.length > 0) {
                    needsProcessing = true;
                  }
                }
              } else if (bodyData.prompt || bodyData.query || bodyData.message) {
                originalContent = bodyData.prompt || bodyData.query || bodyData.message;
                if (originalContent && !originalContent.startsWith('{') && originalContent.length > 0) {
                  needsProcessing = true;
                }
              }
              
              if (needsProcessing) {
                console.log('🔄 Zeq OS [Page Context]: Message needs processing, original:', originalContent.substring(0, 50));
                
                // Request processing from content script
                const requestId = Date.now() + Math.random();
                window.postMessage({
                  type: 'ZEQ_PROCESS_REQUEST',
                  requestId: requestId,
                  originalContent: originalContent,
                  bodyData: bodyData
                }, '*');
                
                console.log('📤 Zeq OS [Page Context]: Sent processing request, ID:', requestId);
                
                // Wait for response (with timeout)
                return new Promise((resolve, reject) => {
                  let responded = false;
                  const timeout = setTimeout(() => {
                    if (!responded) {
                      responded = true;
                      console.warn('⏱️ Zeq OS [Page Context]: Processing timeout (500ms), using original message');
                      resolve(originalFetch.apply(this, args));
                    }
                  }, 2000); // Increased timeout to 2 seconds
                  
                  const handler = (event) => {
                    // Only process messages from same window
                    if (event.source !== window) return;
                    
                    if (event.data && event.data.type === 'ZEQ_PROCESSED_RESPONSE' && event.data.requestId === requestId) {
                      if (responded) return;
                      responded = true;
                      
                      clearTimeout(timeout);
                      window.removeEventListener('message', handler);
                      
                      console.log('✅ Zeq OS [Page Context]: Received processed message, length:', event.data.processedContent.length);
                      
                      // EXACTLY like index.html line 16931: Replace last user message content with zeqMathematicalPrompt
                      if (bodyData.messages) {
                        // Find and replace the LAST user message (like index.html does)
                        for (let i = bodyData.messages.length - 1; i >= 0; i--) {
                          if (bodyData.messages[i].role === 'user' || bodyData.messages[i].role === 'User') {
                            // Replace content with mathematical prompt
                            bodyData.messages[i].content = event.data.processedContent;
                            bodyData.messages[i].text = event.data.processedContent;
                            console.log('✅ Zeq OS [Page Context]: Replaced user message at index', i, 'with mathematical prompt');
                            break; // Only replace the last one
                          }
                        }
                      } else {
                        if (bodyData.prompt) bodyData.prompt = event.data.processedContent;
                        if (bodyData.query) bodyData.query = event.data.processedContent;
                        if (bodyData.message) bodyData.message = event.data.processedContent;
                      }
                      
                      options.body = typeof options.body === 'string' ? JSON.stringify(bodyData) : bodyData;
                      console.log('🚀 Zeq OS [Page Context]: Sending processed message to DeepSeek');
                      resolve(originalFetch.apply(this, args));
                    }
                  };
                  
                  window.addEventListener('message', handler);
                });
              } else {
                console.log('⏭️ Zeq OS [Page Context]: Message does not need processing (already processed or empty)');
              }
            } catch (e) {
              console.error('Zeq OS [Page Context]: Fetch error', e);
            }
          }
          
          return originalFetch.apply(this, args);
        };
        
        // Intercept XHR in page context
        const originalXHROpen = XMLHttpRequest.prototype.open;
        const originalXHRSend = XMLHttpRequest.prototype.send;
        
        XMLHttpRequest.prototype.open = function(method, url, ...rest) {
          this._zeqUrl = url;
          this._zeqMethod = method;
          return originalXHROpen.apply(this, [method, url, ...rest]);
        };
        
        XMLHttpRequest.prototype.send = function(data) {
          const url = this._zeqUrl;
          const xhr = this;
          
          // Intercept ALL XHR requests to catch DeepSeek's API calls
          if (url && data && typeof data === 'string') {
            // Log all XHR requests for debugging
            if (url.includes('deepseek.com') || url.includes('/api/') || url.includes('/v1/')) {
              console.log('🔍 Zeq OS [Page Context]: XHR detected:', url.substring(0, 100));
            }
            
            // Check if this is a chat/message API request
            if (
              url.includes('/chat') || 
              url.includes('/message') || 
              url.includes('/completion') ||
              url.includes('/api/chat') ||
              url.includes('/v1/chat') ||
              url.includes('/v1/completions') ||
              url.includes('/conversation') ||
              url.includes('/stream') ||
              url.includes('/completions') ||
              (url.includes('deepseek.com') && (url.includes('/chat') || url.includes('/api') || url.includes('/v1')))
            ) {
              console.log('🎯 Zeq OS [Page Context]: Intercepted chat API XHR:', url);
            
            try {
              const bodyData = JSON.parse(data);
              let needsProcessing = false;
              let originalContent = '';
              
              // EXACTLY like index.html: Replace the LAST user message with zeqMathematicalPrompt
              if (bodyData.messages && Array.isArray(bodyData.messages)) {
                const lastUserMessage = bodyData.messages.filter(m => m.role === 'user' || m.role === 'User').pop();
                if (lastUserMessage) {
                  originalContent = lastUserMessage.content || lastUserMessage.text || '';
                  if (originalContent && !originalContent.trim().startsWith('{') && originalContent.length > 0) {
                    needsProcessing = true;
                  }
                }
              } else if (bodyData.prompt || bodyData.query || bodyData.message) {
                originalContent = bodyData.prompt || bodyData.query || bodyData.message;
                if (originalContent && !originalContent.trim().startsWith('{') && originalContent.length > 0) {
                  needsProcessing = true;
                }
              }
              
              if (needsProcessing) {
                const requestId = Date.now() + Math.random();
                
                window.postMessage({
                  type: 'ZEQ_PROCESS_REQUEST',
                  requestId: requestId,
                  originalContent: originalContent,
                  bodyData: bodyData
                }, '*');
                
                // Wait for response
                const handler = (event) => {
                  if (event.data && event.data.type === 'ZEQ_PROCESSED_RESPONSE' && event.data.requestId === requestId) {
                    window.removeEventListener('message', handler);
                    
                    // EXACTLY like index.html: Replace last user message content
                    if (bodyData.messages) {
                      for (let i = bodyData.messages.length - 1; i >= 0; i--) {
                        if (bodyData.messages[i].role === 'user' || bodyData.messages[i].role === 'User') {
                          bodyData.messages[i].content = event.data.processedContent;
                          bodyData.messages[i].text = event.data.processedContent;
                          break;
                        }
                      }
                    } else {
                      if (bodyData.prompt) bodyData.prompt = event.data.processedContent;
                      if (bodyData.query) bodyData.query = event.data.processedContent;
                      if (bodyData.message) bodyData.message = event.data.processedContent;
                    }
                    
                    const processedData = JSON.stringify(bodyData);
                    console.log('✅ Zeq OS [Page Context]: Using processed message for XHR');
                    originalXHRSend.call(xhr, processedData);
                  }
                };
                
                window.addEventListener('message', handler);
                
                // Timeout fallback
                setTimeout(() => {
                  window.removeEventListener('message', handler);
                  console.warn('⏱️ Zeq OS [Page Context]: XHR processing timeout, using original');
                  originalXHRSend.call(xhr, data);
                }, 2000);
                
                return;
              }
            } catch (e) {
              console.error('Zeq OS [Page Context]: XHR error', e);
            }
          }
          
          return originalXHRSend.apply(this, [data]);
        };
        
        console.log('✅ Zeq OS [Page Context]: Network interception installed successfully!');
      })();
    `;
    (document.head || document.documentElement).appendChild(script);
    script.remove();
    */
  }

  // Listen for processing requests from page context
  window.addEventListener('message', (event) => {
    // Only process messages from same window
    if (event.source !== window) return;
    
    if (event.data && event.data.type === 'ZEQ_PROCESS_REQUEST') {
      console.log('📥 Zeq OS [Content Script]: Received processing request, ID:', event.data.requestId);
      
      if (!frameworkReady || !zeqMiddleware) {
        console.warn('⚠️ Zeq OS: Framework not ready, sending original message back');
        window.postMessage({
          type: 'ZEQ_PROCESSED_RESPONSE',
          requestId: event.data.requestId,
          processedContent: event.data.originalContent
        }, '*');
        return;
      }
      
      const originalContent = event.data.originalContent;
      console.log('🔄 Zeq OS [Content Script]: Processing message:', originalContent.substring(0, 50));
      
      try {
        const processedMessage = processMessage(originalContent);
        console.log('✅ Zeq OS [Content Script]: Processing complete, sending back. Length:', processedMessage.length);
        
        window.postMessage({
          type: 'ZEQ_PROCESSED_RESPONSE',
          requestId: event.data.requestId,
          processedContent: processedMessage
        }, '*');
      } catch (error) {
        console.error('❌ Zeq OS [Content Script]: Processing error, using original', error);
        window.postMessage({
          type: 'ZEQ_PROCESSED_RESPONSE',
          requestId: event.data.requestId,
          processedContent: originalContent
        }, '*');
      }
    }
  });

  // Start network interception in content script context (backup)
  interceptNetworkRequests();
  
  // Inject into page context (primary method)
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
    console.log('Zeq OS: Starting DeepSeek initialization...');
    initialize();
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
      console.log('Zeq OS: DOMContentLoaded - starting DeepSeek initialization...');
      initialize();
    });
  }

  // Also try after delays for slow-loading pages
  setTimeout(() => {
    console.log('Zeq OS: Retry 1 (2s delay)');
    initialize();
  }, 2000);
  
  setTimeout(() => {
    console.log('Zeq OS: Retry 2 (5s delay)');
    initialize();
  }, 5000);
  
  setTimeout(() => {
    console.log('Zeq OS: Retry 3 (10s delay)');
    initialize();
  }, 10000);

  // Log framework status
  console.log('📊 Zeq OS: DeepSeek script loaded. Framework status:', {
    frameworkAvailable: typeof ZeqOSFramework !== 'undefined',
    frameworkReady: frameworkReady,
    settings: settings,
    windowLocation: window.location.href,
    documentReady: document.readyState
  });
  
  // Check if we're on DeepSeek
  if (window.location.href.includes('deepseek.com')) {
    console.log('✅ Zeq OS: Confirmed on DeepSeek domain');
  } else {
    console.warn('⚠️ Zeq OS: Not on DeepSeek domain:', window.location.href);
  }
  
  // Test framework immediately
  setTimeout(() => {
    if (frameworkReady && zeqMiddleware) {
      try {
        const testResult = zeqMiddleware.processQuery('test');
        console.log('Zeq OS: Framework test successful', {
          hasResult: !!testResult,
          hasPrompt: !!testResult?.mathematicalPrompt
        });
      } catch (error) {
        console.error('Zeq OS: Framework test failed', error);
      }
    } else {
      console.warn('Zeq OS: Framework not ready for testing');
    }
  }, 2000);

})();

