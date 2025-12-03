// Zeq OS Network Interception - Page Context Script for Grok (X/Twitter)
// This file is injected into the page context (not isolated content script context)
// to intercept fetch and XHR requests

(function() {
  'use strict';
  
  console.log('🚀🚀🚀 Zeq OS [Page Context - Grok]: SCRIPT IS RUNNING!');
  console.log('🚀🚀🚀 Zeq OS [Page Context - Grok]: Network interception script executing...');
  console.log('🔍 Zeq OS [Page Context - Grok]: Current URL:', window.location.href);
  console.log('🔍 Zeq OS [Page Context - Grok]: Window.fetch type:', typeof window.fetch);
  
  // Intercept fetch in page context
  const originalFetch = window.fetch;
  let fetchCallCount = 0;
  window.fetch = function(...args) {
    fetchCallCount++;
    const url = args[0];
    const options = args[1] || {};
    
    // LOG EVERY SINGLE FETCH CALL to Twitter/X domains
    if (typeof url === 'string' && (url.includes('twitter.com') || url.includes('x.com'))) {
      const method = options.method || 'GET';
      console.log(`📡 Zeq OS [Page Context - Grok]: Fetch call #${fetchCallCount} - ${method} ${url}`);
    }
    
    // DO NOT intercept WebAssembly (.wasm) files or binary data
    if (typeof url === 'string') {
      if (url.endsWith('.wasm') || url.includes('.wasm?') || url.includes('.wasm&')) {
        return originalFetch.apply(this, args);
      }
      if (options.headers && (options.headers['Content-Type']?.includes('application/wasm') || options.headers['content-type']?.includes('application/wasm'))) {
        return originalFetch.apply(this, args);
      }
      if (options.body instanceof ArrayBuffer || options.body instanceof Blob) {
        return originalFetch.apply(this, args);
      }
      
      // DO NOT intercept authentication/login requests - these cause CORS errors
      if (url.includes('accounts.x.ai') || 
          url.includes('accounts.twitter.com') ||
          url.includes('/sign-in') ||
          url.includes('/sign-up') ||
          url.includes('/check-login') ||
          url.includes('/login') ||
          url.includes('/auth') ||
          url.includes('/oauth') ||
          url.includes('/authenticate')) {
        return originalFetch.apply(this, args);
      }
    }
    
    // Intercept Grok/X API requests - EXACTLY like DeepSeek: check body content FIRST
    if (typeof url === 'string' && options.body) {
      // Check body content FIRST - if it has message content, it's likely a chat request
      let bodyHasMessage = false;
      let bodyData = null;
      
      try {
        bodyData = typeof options.body === 'string' ? JSON.parse(options.body) : options.body;
        
        // Check for various message formats (like DeepSeek checks for messages array)
        if (bodyData && (
          bodyData.text || 
          bodyData.status || 
          bodyData.message || 
          (bodyData.messages && Array.isArray(bodyData.messages)) ||
          (bodyData.variables && bodyData.variables.query) || // GraphQL query
          (bodyData.query && bodyData.query.includes('grok')) // GraphQL with grok
        )) {
          bodyHasMessage = true;
          console.log('🎯 Zeq OS [Page Context - Grok]: Detected chat request by body content:', url);
        }
      } catch (e) {
        // Ignore parse errors
      }
      
      // Also check URL pattern for X/Twitter domains
      // BUT skip authentication endpoints (already filtered above, but double-check here)
      const method = options.method || 'GET';
      const isPOST = method.toUpperCase() === 'POST';
      const isGrokDomain = (url.includes('twitter.com') || url.includes('x.com') || url.includes('api.x.com') || url.includes('api.twitter.com')) &&
                          !url.includes('accounts.x.ai') &&
                          !url.includes('accounts.twitter.com') &&
                          !url.includes('/sign-in') &&
                          !url.includes('/sign-up') &&
                          !url.includes('/check-login') &&
                          !url.includes('/login') &&
                          !url.includes('/auth');
      
      if (bodyHasMessage || (isGrokDomain && isPOST)) {
        console.log('🎯 Zeq OS [Page Context - Grok]: Intercepted API fetch:', url);
        
        try {
          // Use already parsed bodyData if available, otherwise parse
          if (!bodyData) {
            bodyData = typeof options.body === 'string' ? JSON.parse(options.body) : options.body;
          }
          console.log('📦 Zeq OS [Page Context - Grok]: Parsed body keys:', Object.keys(bodyData));
          
          let needsProcessing = false;
          let originalContent = '';
          
          // Find the message content - Grok might use different structures
          // Check GraphQL query first
          if (bodyData.variables && bodyData.variables.query) {
            originalContent = bodyData.variables.query || '';
            if (originalContent && !originalContent.trim().startsWith('{') && originalContent.length > 0) {
              needsProcessing = true;
              console.log('📝 Zeq OS [Page Context - Grok]: Found content in GraphQL variables.query field');
            }
          } else if (bodyData.query && typeof bodyData.query === 'string' && bodyData.query.includes('grok')) {
            // GraphQL query string - extract the actual query text from variables
            if (bodyData.variables && bodyData.variables.input) {
              originalContent = bodyData.variables.input.text || bodyData.variables.input.message || '';
              if (originalContent && !originalContent.trim().startsWith('{') && originalContent.length > 0) {
                needsProcessing = true;
                console.log('📝 Zeq OS [Page Context - Grok]: Found content in GraphQL variables.input field');
              }
            }
          } else if (bodyData.text || bodyData.status) {
            originalContent = bodyData.text || bodyData.status || '';
            if (originalContent && !originalContent.trim().startsWith('{') && originalContent.length > 0) {
              needsProcessing = true;
              console.log('📝 Zeq OS [Page Context - Grok]: Found content in text/status field');
            }
          } else if (bodyData.message || bodyData.content) {
            originalContent = bodyData.message || bodyData.content || '';
            if (originalContent && !originalContent.trim().startsWith('{') && originalContent.length > 0) {
              needsProcessing = true;
              console.log('📝 Zeq OS [Page Context - Grok]: Found content in message/content field');
            }
          } else if (bodyData.messages && Array.isArray(bodyData.messages)) {
            console.log('📝 Zeq OS [Page Context - Grok]: Found messages array, length:', bodyData.messages.length);
            for (let i = bodyData.messages.length - 1; i >= 0; i--) {
              const msg = bodyData.messages[i];
              if (msg.role === 'user' || msg.role === 'User' || msg.content) {
                originalContent = msg.content || msg.text || '';
                if (originalContent && !originalContent.trim().startsWith('{') && originalContent.length > 0) {
                  needsProcessing = true;
                  console.log('📝 Zeq OS [Page Context - Grok]: Found user message to process:', originalContent.substring(0, 50));
                }
                break;
              }
            }
          } else {
            console.log('⚠️ Zeq OS [Page Context - Grok]: No recognizable message structure found. Body keys:', Object.keys(bodyData));
            console.log('⚠️ Zeq OS [Page Context - Grok]: Full body data (first 500 chars):', JSON.stringify(bodyData).substring(0, 500));
          }
          
          if (needsProcessing) {
            console.log('🔄 Zeq OS [Page Context - Grok]: Message needs processing');
            
            // Request processing from content script
            const requestId = Date.now() + Math.random();
            window.postMessage({
              type: 'ZEQ_PROCESS_REQUEST',
              requestId: requestId,
              originalContent: originalContent,
              bodyData: bodyData
            }, '*');
            
            console.log('📤 Zeq OS [Page Context - Grok]: Sent processing request, ID:', requestId);
            
            // Wait for response (with timeout)
            return new Promise((resolve, reject) => {
              let responded = false;
              const timeout = setTimeout(() => {
                if (!responded) {
                  responded = true;
                  console.warn('⏱️ Zeq OS [Page Context - Grok]: Processing timeout (2s), using original message');
                  resolve(originalFetch.apply(this, args));
                }
              }, 2000);
              
              const handler = (event) => {
                if (event.source !== window) return;
                
                if (event.data && event.data.type === 'ZEQ_PROCESSED_RESPONSE' && event.data.requestId === requestId) {
                  if (responded) return;
                  responded = true;
                  
                  clearTimeout(timeout);
                  window.removeEventListener('message', handler);
                  
                  console.log('✅ Zeq OS [Page Context - Grok]: Received processed message, length:', event.data.processedContent.length);
                  
                  // Replace content with mathematical prompt - handle all formats
                  if (bodyData.variables && bodyData.variables.query) {
                    bodyData.variables.query = event.data.processedContent;
                  } else if (bodyData.variables && bodyData.variables.input) {
                    if (bodyData.variables.input.text) bodyData.variables.input.text = event.data.processedContent;
                    if (bodyData.variables.input.message) bodyData.variables.input.message = event.data.processedContent;
                  } else if (bodyData.text) {
                    bodyData.text = event.data.processedContent;
                  } else if (bodyData.status) {
                    bodyData.status = event.data.processedContent;
                  } else if (bodyData.message) {
                    bodyData.message = event.data.processedContent;
                  } else if (bodyData.content) {
                    bodyData.content = event.data.processedContent;
                  } else if (bodyData.messages) {
                    for (let i = bodyData.messages.length - 1; i >= 0; i--) {
                      const msg = bodyData.messages[i];
                      if (msg.role === 'user' || msg.role === 'User' || msg.content) {
                        msg.content = event.data.processedContent;
                        msg.text = event.data.processedContent;
                        break;
                      }
                    }
                  }
                  
                  // Update the body in options
                  const modifiedOptions = { ...options };
                  modifiedOptions.body = typeof options.body === 'string' ? JSON.stringify(bodyData) : bodyData;
                  console.log('🚀 Zeq OS [Page Context - Grok]: Sending processed message to Grok');
                  resolve(originalFetch.apply(this, [url, modifiedOptions]));
                }
              };
              
              window.addEventListener('message', handler);
            });
          } else {
            console.log('⏭️ Zeq OS [Page Context - Grok]: Message does not need processing');
          }
        } catch (e) {
          console.error('Zeq OS [Page Context - Grok]: Fetch error', e);
        }
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
    
    // DO NOT intercept WebAssembly (.wasm) files or binary data
    if (typeof url === 'string') {
      if (url.endsWith('.wasm') || url.includes('.wasm?') || url.includes('.wasm&')) {
        return originalXHRSend.call(xhr, data);
      }
      if (data instanceof ArrayBuffer || data instanceof Blob) {
        return originalXHRSend.call(xhr, data);
      }
    }
    
    if (url && data && typeof data === 'string') {
      const method = this._zeqMethod || 'GET';
      const isPOST = method.toUpperCase() === 'POST';
      
      // Check body content FIRST - if it has message content, it's likely a chat request
      let bodyHasMessage = false;
      let bodyData = null;
      if ((url.includes('twitter.com') || url.includes('x.com') || url.includes('api.x.com') || url.includes('api.twitter.com')) && isPOST) {
        try {
          bodyData = JSON.parse(data);
          // Check for various message formats
          if (bodyData && (
            bodyData.text || 
            bodyData.status || 
            bodyData.message || 
            (bodyData.messages && Array.isArray(bodyData.messages)) ||
            (bodyData.variables && bodyData.variables.query) || // GraphQL query
            (bodyData.query && bodyData.query.includes('grok')) // GraphQL with grok
          )) {
            bodyHasMessage = true;
            console.log('🎯 Zeq OS [Page Context - Grok]: Detected chat request by body content (XHR):', url);
          }
        } catch (e) {
          // Ignore parse errors, will parse again below
        }
      }
      
      // Check if this is a Grok API request by URL pattern
      const isGrokAPI = (
        (url.includes('twitter.com') || url.includes('x.com') || url.includes('api.x.com') || url.includes('api.twitter.com')) && 
        isPOST && (
          url.includes('/grok') ||
          url.includes('/2/grok') ||
          url.includes('/api/grok') ||
          url.includes('/chat') ||
          url.includes('/compose') ||
          url.includes('/1.1/statuses') ||
          url.includes('/graphql') || // Grok might use GraphQL
          url.includes('/2/timeline') // Twitter timeline API
        )
      );
      
      if (isGrokAPI || bodyHasMessage) {
        console.log('🎯 Zeq OS [Page Context - Grok]: Intercepted API XHR:', url);
        
        try {
          // Use already parsed bodyData if available, otherwise parse
          if (!bodyData) {
            bodyData = JSON.parse(data);
          }
          let needsProcessing = false;
          let originalContent = '';
          
          // Find the message content - Grok might use different structures
          // Check GraphQL query first
          if (bodyData.variables && bodyData.variables.query) {
            originalContent = bodyData.variables.query || '';
            if (originalContent && !originalContent.trim().startsWith('{') && originalContent.length > 0) {
              needsProcessing = true;
            }
          } else if (bodyData.query && typeof bodyData.query === 'string' && bodyData.query.includes('grok')) {
            // GraphQL query string - extract the actual query text from variables
            if (bodyData.variables && bodyData.variables.input) {
              originalContent = bodyData.variables.input.text || bodyData.variables.input.message || '';
              if (originalContent && !originalContent.trim().startsWith('{') && originalContent.length > 0) {
                needsProcessing = true;
              }
            }
          } else if (bodyData.text || bodyData.status) {
            originalContent = bodyData.text || bodyData.status || '';
            if (originalContent && !originalContent.trim().startsWith('{') && originalContent.length > 0) {
              needsProcessing = true;
            }
          } else if (bodyData.message || bodyData.content) {
            originalContent = bodyData.message || bodyData.content || '';
            if (originalContent && !originalContent.trim().startsWith('{') && originalContent.length > 0) {
              needsProcessing = true;
            }
          } else if (bodyData.messages && Array.isArray(bodyData.messages)) {
            for (let i = bodyData.messages.length - 1; i >= 0; i--) {
              const msg = bodyData.messages[i];
              if (msg.role === 'user' || msg.role === 'User' || msg.content) {
                originalContent = msg.content || msg.text || '';
                if (originalContent && !originalContent.trim().startsWith('{') && originalContent.length > 0) {
                  needsProcessing = true;
                }
                break;
              }
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
                
                // Replace content
                if (bodyData.variables && bodyData.variables.query) {
                  bodyData.variables.query = event.data.processedContent;
                } else if (bodyData.variables && bodyData.variables.input) {
                  if (bodyData.variables.input.text) bodyData.variables.input.text = event.data.processedContent;
                  if (bodyData.variables.input.message) bodyData.variables.input.message = event.data.processedContent;
                } else if (bodyData.text) {
                  bodyData.text = event.data.processedContent;
                } else if (bodyData.status) {
                  bodyData.status = event.data.processedContent;
                } else if (bodyData.message) {
                  bodyData.message = event.data.processedContent;
                } else if (bodyData.content) {
                  bodyData.content = event.data.processedContent;
                } else if (bodyData.messages) {
                  for (let i = bodyData.messages.length - 1; i >= 0; i--) {
                    const msg = bodyData.messages[i];
                    if (msg.role === 'user' || msg.role === 'User' || msg.content) {
                      msg.content = event.data.processedContent;
                      msg.text = event.data.processedContent;
                      break;
                    }
                  }
                }
                
                const processedData = JSON.stringify(bodyData);
                console.log('✅ Zeq OS [Page Context - Grok]: Using processed message for XHR');
                originalXHRSend.call(xhr, processedData);
              }
            };
            
            window.addEventListener('message', handler);
            
            // Timeout fallback
            setTimeout(() => {
              window.removeEventListener('message', handler);
              console.warn('⏱️ Zeq OS [Page Context - Grok]: XHR processing timeout, using original');
              originalXHRSend.call(xhr, data);
            }, 2000);
            
            return;
          }
        } catch (e) {
          console.error('Zeq OS [Page Context - Grok]: XHR error', e);
        }
      }
    }
    
    return originalXHRSend.apply(this, [data]);
  };
  
  console.log('✅ Zeq OS [Page Context - Grok]: Network interception installed successfully!');
})();

