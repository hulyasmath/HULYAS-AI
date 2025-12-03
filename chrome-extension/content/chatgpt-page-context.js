// Zeq OS Network Interception - Page Context Script for ChatGPT
// This file is injected into the page context (not isolated content script context)
// to intercept fetch and XHR requests
// EXACTLY like deepseek-page-context.js

(function() {
  'use strict';
  
  console.log('🚀 Zeq OS [Page Context - ChatGPT]: Network interception script executing...');
  
  // Intercept fetch in page context
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    const url = args[0];
    const options = args[1] || {};
    
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
    }
    
    // Intercept ChatGPT API requests
    if (typeof url === 'string' && options.body) {
      // Check if this is a chat/message API request
      if (
        url.includes('chatgpt.com') || 
        url.includes('openai.com') ||
        url.includes('/backend-anon/') ||
        url.includes('/conversation') ||
        url.includes('/api/chat') ||
        url.includes('/v1/chat') ||
        url.includes('/v1/completions')
      ) {
        // Skip analytics endpoints
        if (url.includes('/ces/') || url.includes('/v1/t') || url.includes('/v1/p') || url.includes('/v1/i') || 
            url.includes('/v1/rgstr') || url.includes('/analytics') || url.includes('/track') || url.includes('/segment') || url.includes('statsig') || url.includes('/sentry')) {
          return originalFetch.apply(this, args);
        }
        
        console.log('🎯 Zeq OS [Page Context - ChatGPT]: Intercepted chat API fetch:', url);
        
        try {
          const bodyData = typeof options.body === 'string' ? JSON.parse(options.body) : options.body;
          let needsProcessing = false;
          let originalContent = '';
          
          // Find the last user message
          if (bodyData.messages && Array.isArray(bodyData.messages)) {
            for (let i = bodyData.messages.length - 1; i >= 0; i--) {
              const msg = bodyData.messages[i];
              const isUser = msg.role === 'user' || msg.role === 'User' || msg.author?.role === 'user' || msg.author?.role === 'User';
              
              if (isUser) {
                // Extract content - handle ALL possible formats
                let contentValue = msg.content;
                
                // Case 1: Already an object (not a string)
                if (typeof contentValue === 'object' && contentValue !== null) {
                  if (Array.isArray(contentValue)) {
                    contentValue = contentValue.map(p => {
                      if (typeof p === 'string') return p;
                      if (p && typeof p === 'object') return p.text || p.content || '';
                      return String(p || '');
                    }).join('');
                  } else if (contentValue.parts && Array.isArray(contentValue.parts)) {
                    contentValue = contentValue.parts.map(p => {
                      if (typeof p === 'string') return p;
                      if (p && typeof p === 'object') return p.text || p.content || '';
                      return String(p || '');
                    }).join('');
                  } else if (contentValue.text) {
                    contentValue = contentValue.text;
                  } else if (contentValue.content) {
                    contentValue = contentValue.content;
                  } else {
                    contentValue = String(contentValue);
                  }
                }
                // Case 2: JSON string format
                else if (typeof contentValue === 'string' && contentValue.trim().startsWith('{')) {
                  try {
                    const parsed = JSON.parse(contentValue);
                    if (parsed.parts && Array.isArray(parsed.parts)) {
                      contentValue = parsed.parts.map(p => {
                        if (typeof p === 'string') return p;
                        if (p && typeof p === 'object') return p.text || p.content || '';
                        return String(p || '');
                      }).join('');
                    } else if (parsed.text) {
                      contentValue = parsed.text;
                    } else if (parsed.content) {
                      contentValue = parsed.content;
                    }
                  } catch (e) {
                    // Use as-is if parsing fails
                  }
                }
                
                originalContent = contentValue || msg.text || '';
                
                // Ensure originalContent is a string
                if (typeof originalContent !== 'string') {
                  originalContent = String(originalContent || '');
                }
                
                // Safety check
                if (originalContent === '[object Object]' || originalContent === '') {
                  if (msg.text) originalContent = String(msg.text);
                  else if (msg.parts && Array.isArray(msg.parts)) {
                    originalContent = msg.parts.map(p => typeof p === 'string' ? p : (p?.text || '')).join('');
                  }
                }
                
                // Only process if it's not already a JSON prompt
                if (originalContent && typeof originalContent === 'string' && originalContent.trim() && !originalContent.trim().startsWith('{') && originalContent.length > 0) {
                  needsProcessing = true;
                  console.log('📝 Zeq OS [Page Context - ChatGPT]: Found user message to process:', originalContent.substring(0, 50));
                } else {
                  console.log('⏭️ Zeq OS [Page Context - ChatGPT]: Message already processed or empty');
                }
                break;
              }
            }
          } else if (bodyData.prompt || bodyData.query || bodyData.message) {
            originalContent = bodyData.prompt || bodyData.query || bodyData.message;
            
            // Ensure originalContent is a string
            if (typeof originalContent !== 'string') {
              originalContent = String(originalContent || '');
            }
            
            if (originalContent && typeof originalContent === 'string' && originalContent.trim() && !originalContent.trim().startsWith('{') && originalContent.length > 0) {
              needsProcessing = true;
            }
          }
          
          if (needsProcessing) {
            console.log('🔄 Zeq OS [Page Context - ChatGPT]: Message needs processing, original:', originalContent.substring(0, 50));
            
            // Request processing from content script
            const requestId = Date.now() + Math.random();
            window.postMessage({
              type: 'ZEQ_PROCESS_REQUEST',
              requestId: requestId,
              originalContent: originalContent,
              bodyData: bodyData
            }, '*');
            
            console.log('📤 Zeq OS [Page Context - ChatGPT]: Sent processing request, ID:', requestId);
            
            // Wait for response (with timeout)
            return new Promise((resolve, reject) => {
              let responded = false;
              const timeout = setTimeout(() => {
                if (!responded) {
                  responded = true;
                  console.warn('⏱️ Zeq OS [Page Context - ChatGPT]: Processing timeout (2s), using original message');
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
                  
                  console.log('✅ Zeq OS [Page Context - ChatGPT]: Received processed message, length:', event.data.processedContent.length);
                  
                  // CRITICAL: Check TOTAL request body size (not just message content)
                  // ChatGPT's limit is on the ENTIRE request body including all messages
                  const processedContent = event.data.processedContent;
                  
                  // CRITICAL: Preserve exact request structure - only modify content
                  if (bodyData.messages) {
                    for (let i = bodyData.messages.length - 1; i >= 0; i--) {
                      const msg = bodyData.messages[i];
                      const isUser = msg.role === 'user' || msg.role === 'User' || msg.author?.role === 'user' || msg.author?.role === 'User';
                      
                      if (isUser) {
                        // Preserve original structure exactly - ChatGPT is very strict
                        if (typeof msg.content === 'string') {
                          // Original was JSON string - parse and update parts only
                          try {
                            const contentFormat = JSON.parse(msg.content);
                            if (contentFormat.parts && Array.isArray(contentFormat.parts)) {
                              // Preserve ALL other properties, only update parts[0]
                              contentFormat.parts[0] = processedContent;
                              msg.content = JSON.stringify(contentFormat);
                            } else {
                              // No parts array - create standard format
                              msg.content = JSON.stringify({
                                content_type: 'text',
                                parts: [processedContent]
                              });
                            }
                          } catch (e) {
                            // Not valid JSON - use standard format
                            msg.content = JSON.stringify({
                              content_type: 'text',
                              parts: [processedContent]
                            });
                          }
                        } else if (Array.isArray(msg.content)) {
                          // Content is array - replace first element
                          msg.content[0] = processedContent;
                        } else if (msg.content && typeof msg.content === 'object') {
                          // Content is object - preserve structure
                          if (msg.content.parts && Array.isArray(msg.content.parts)) {
                            msg.content.parts[0] = processedContent;
                          } else {
                            msg.content.text = processedContent;
                          }
                        } else {
                          // Fallback to standard format
                          msg.content = JSON.stringify({
                            content_type: 'text',
                            parts: [processedContent]
                          });
                        }
                        
                        console.log('✅ Zeq OS [Page Context - ChatGPT]: Replaced user message at index', i);
                        break;
                      }
                    }
                  } else {
                    if (bodyData.prompt) bodyData.prompt = processedContent;
                    if (bodyData.query) bodyData.query = processedContent;
                    if (bodyData.message) bodyData.message = processedContent;
                  }
                  
                  // CRITICAL: Preserve original body format (string vs object)
                  // ChatGPT expects string format for this endpoint
                  options.body = JSON.stringify(bodyData);
                  console.log('🚀 Zeq OS [Page Context - ChatGPT]: Sending processed message to ChatGPT');
                  resolve(originalFetch.apply(this, args));
                }
              };
              
              window.addEventListener('message', handler);
            });
          } else {
            console.log('⏭️ Zeq OS [Page Context - ChatGPT]: Message does not need processing');
          }
        } catch (e) {
          console.error('Zeq OS [Page Context - ChatGPT]: Fetch error', e);
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
    
    // Intercept ChatGPT API XHR requests
    if (url && data && typeof data === 'string') {
      if (
        url.includes('chatgpt.com') || 
        url.includes('openai.com') ||
        url.includes('/backend-anon/') ||
        url.includes('/conversation') ||
        url.includes('/api/chat') ||
        url.includes('/v1/chat')
      ) {
        // Skip analytics
        if (url.includes('/ces/') || url.includes('/v1/t') || url.includes('/v1/p') || url.includes('/v1/i') || 
            url.includes('/v1/rgstr') || url.includes('/analytics') || url.includes('/track') || url.includes('/segment') || url.includes('statsig') || url.includes('/sentry')) {
          return originalXHRSend.apply(this, [data]);
        }
        
        console.log('🎯 Zeq OS [Page Context - ChatGPT]: Intercepted chat API XHR:', url);
        
        try {
          const bodyData = JSON.parse(data);
          let needsProcessing = false;
          let originalContent = '';
          
          if (bodyData.messages && Array.isArray(bodyData.messages)) {
            for (let i = bodyData.messages.length - 1; i >= 0; i--) {
              const msg = bodyData.messages[i];
              const isUser = msg.role === 'user' || msg.role === 'User' || msg.author?.role === 'user' || msg.author?.role === 'User';
              
              if (isUser) {
                // Extract content - handle ALL possible formats (same as fetch handler)
                let contentValue = msg.content;
                
                if (typeof contentValue === 'object' && contentValue !== null) {
                  if (Array.isArray(contentValue)) {
                    contentValue = contentValue.map(p => {
                      if (typeof p === 'string') return p;
                      if (p && typeof p === 'object') return p.text || p.content || '';
                      return String(p || '');
                    }).join('');
                  } else if (contentValue.parts && Array.isArray(contentValue.parts)) {
                    contentValue = contentValue.parts.map(p => {
                      if (typeof p === 'string') return p;
                      if (p && typeof p === 'object') return p.text || p.content || '';
                      return String(p || '');
                    }).join('');
                  } else if (contentValue.text) {
                    contentValue = contentValue.text;
                  } else if (contentValue.content) {
                    contentValue = contentValue.content;
                  } else {
                    contentValue = String(contentValue);
                  }
                }
                else if (typeof contentValue === 'string' && contentValue.trim().startsWith('{')) {
                  try {
                    const parsed = JSON.parse(contentValue);
                    if (parsed.parts && Array.isArray(parsed.parts)) {
                      contentValue = parsed.parts.map(p => {
                        if (typeof p === 'string') return p;
                        if (p && typeof p === 'object') return p.text || p.content || '';
                        return String(p || '');
                      }).join('');
                    } else if (parsed.text) {
                      contentValue = parsed.text;
                    } else if (parsed.content) {
                      contentValue = parsed.content;
                    }
                  } catch (e) {
                    // Use as-is
                  }
                }
                
                originalContent = contentValue || msg.text || '';
                
                // Ensure originalContent is a string
                if (typeof originalContent !== 'string') {
                  originalContent = String(originalContent || '');
                }
                
                // Safety check
                if (originalContent === '[object Object]' || originalContent === '') {
                  if (msg.text) originalContent = String(msg.text);
                  else if (msg.parts && Array.isArray(msg.parts)) {
                    originalContent = msg.parts.map(p => typeof p === 'string' ? p : (p?.text || '')).join('');
                  }
                }
                
                if (originalContent && typeof originalContent === 'string' && originalContent.trim() && !originalContent.trim().startsWith('{') && originalContent.length > 0) {
                  needsProcessing = true;
                }
                break;
              }
            }
          } else if (bodyData.prompt || bodyData.query || bodyData.message) {
            originalContent = bodyData.prompt || bodyData.query || bodyData.message;
            
            // Ensure originalContent is a string
            if (typeof originalContent !== 'string') {
              originalContent = String(originalContent || '');
            }
            
            if (originalContent && typeof originalContent === 'string' && originalContent.trim() && !originalContent.trim().startsWith('{') && originalContent.length > 0) {
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
                
                // Replace last user message content
                if (bodyData.messages) {
                  for (let i = bodyData.messages.length - 1; i >= 0; i--) {
                    const msg = bodyData.messages[i];
                    const isUser = msg.role === 'user' || msg.role === 'User' || msg.author?.role === 'user' || msg.author?.role === 'User';
                    
                    if (isUser) {
                      const processedContent = event.data.processedContent;
                      
                      let contentFormat = null;
                      if (typeof msg.content === 'string' && msg.content.trim().startsWith('{')) {
                        try {
                          contentFormat = JSON.parse(msg.content);
                        } catch (e) {
                          // Use standard format
                        }
                      }
                      
                      if (contentFormat) {
                        contentFormat.parts = [processedContent];
                        msg.content = JSON.stringify(contentFormat);
                      } else {
                        msg.content = JSON.stringify({
                          content_type: 'text',
                          parts: [processedContent]
                        });
                      }
                      break;
                    }
                  }
                } else {
                  if (bodyData.prompt) bodyData.prompt = event.data.processedContent;
                  if (bodyData.query) bodyData.query = event.data.processedContent;
                  if (bodyData.message) bodyData.message = event.data.processedContent;
                }
                
                const processedData = JSON.stringify(bodyData);
                console.log('✅ Zeq OS [Page Context - ChatGPT]: Using processed message for XHR');
                originalXHRSend.call(xhr, processedData);
              }
            };
            
            window.addEventListener('message', handler);
            
            // Timeout fallback
            setTimeout(() => {
              window.removeEventListener('message', handler);
              console.warn('⏱️ Zeq OS [Page Context - ChatGPT]: XHR processing timeout, using original');
              originalXHRSend.call(xhr, data);
            }, 2000);
            
            return;
          }
        } catch (e) {
          console.error('Zeq OS [Page Context - ChatGPT]: XHR error', e);
        }
      }
    }
    
    return originalXHRSend.apply(this, [data]);
  };
  
  console.log('✅ Zeq OS [Page Context - ChatGPT]: Network interception installed successfully!');
})();
