// Zeq OS Network Interception - Page Context Script for Claude
// This file is injected into the page context (not isolated content script context)
// to intercept fetch and XHR requests

(function() {
  'use strict';
  
  console.log('🚀 Zeq OS [Page Context - Claude]: Network interception script executing...');
  
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
    
    // Intercept Claude API requests
    if (typeof url === 'string' && options.body) {
      const method = options.method || 'GET';
      const isPOST = method.toUpperCase() === 'POST';
      
      // Log all POST requests to Claude domain for debugging (but filter out analytics)
      if ((url.includes('claude.ai') || url.includes('anthropic.com') || url.includes('api.anthropic.com')) && isPOST) {
        const isAnalytics = url.includes('/v1/i') || url.includes('/v1/p') || url.includes('/v1/t') || url.includes('statsig.anthropic.com') || url.includes('/sentry');
        if (!isAnalytics) {
          console.log('🔍 Zeq OS [Page Context - Claude]: POST Fetch detected (non-analytics):', url.substring(0, 200), 'Method:', method);
        }
      }
      
      // Check if this is a Claude chat API request - exclude analytics/tracking endpoints
      // Exclude: /v1/i (identify), /v1/p (page), /v1/t (track), statsig, sentry, analytics
      const isAnalyticsEndpoint = (
        url.includes('/v1/i') || // Segment identify
        url.includes('/v1/p') || // Segment page
        url.includes('/v1/t') || // Segment track
        url.includes('statsig.anthropic.com') || // Statsig analytics
        url.includes('/sentry') || // Sentry error tracking
        url.includes('/analytics') || // Analytics
        url.includes('segment.com') // Segment analytics
      );
      
      const isClaudeAPI = (
        !isAnalyticsEndpoint &&
        (url.includes('claude.ai') || url.includes('api.anthropic.com')) && 
        isPOST && (
          url.includes('/api/messages') ||
          url.includes('/v1/messages') ||
          url.includes('/api/complete') ||
          url.includes('/api/completion') ||
          url.includes('/complete') ||
          url.includes('/completion') ||
          (url.includes('claude.ai') && url.includes('/api/') && !url.includes('/v1/')) // Claude.ai API but not analytics
        )
      );
      
      // Also check body content for messages array (fallback detection)
      let bodyHasMessages = false;
      if (!isClaudeAPI && !isAnalyticsEndpoint && (url.includes('claude.ai') || url.includes('api.anthropic.com')) && isPOST) {
        try {
          const bodyData = typeof options.body === 'string' ? JSON.parse(options.body) : options.body;
          if (bodyData && bodyData.messages && Array.isArray(bodyData.messages) && bodyData.messages.length > 0) {
            bodyHasMessages = true;
            console.log('🎯 Zeq OS [Page Context - Claude]: Detected chat request by body content (has messages array):', url);
          }
        } catch (e) {
          // Ignore parse errors
        }
      }
      
      if (isClaudeAPI || bodyHasMessages) {
        console.log('🎯 Zeq OS [Page Context - Claude]: Intercepted API fetch:', url);
        
        try {
          const bodyData = typeof options.body === 'string' ? JSON.parse(options.body) : options.body;
          console.log('📦 Zeq OS [Page Context - Claude]: Parsed body keys:', Object.keys(bodyData));
          
          let needsProcessing = false;
          let originalContent = '';
          
          // Find the last user message - Claude uses messages array
          if (bodyData.messages && Array.isArray(bodyData.messages)) {
            console.log('📝 Zeq OS [Page Context - Claude]: Found messages array, length:', bodyData.messages.length);
            for (let i = bodyData.messages.length - 1; i >= 0; i--) {
              const msg = bodyData.messages[i];
              console.log('📝 Zeq OS [Page Context - Claude]: Message', i, 'role:', msg.role, 'keys:', Object.keys(msg));
              if (msg.role === 'user' || msg.role === 'User') {
                originalContent = msg.content || msg.text || '';
                if (Array.isArray(originalContent)) {
                  // Claude sometimes uses array format for content
                  originalContent = originalContent.map(c => typeof c === 'string' ? c : c.text || '').join('');
                }
                console.log('📝 Zeq OS [Page Context - Claude]: Found user message, content length:', originalContent.length);
                if (originalContent && !originalContent.trim().startsWith('{') && originalContent.length > 0) {
                  needsProcessing = true;
                  console.log('📝 Zeq OS [Page Context - Claude]: Found user message to process:', originalContent.substring(0, 50));
                }
                break;
              }
            }
          } else if (bodyData.prompt || bodyData.query || bodyData.message || bodyData.text) {
            originalContent = bodyData.prompt || bodyData.query || bodyData.message || bodyData.text;
            if (originalContent && !originalContent.trim().startsWith('{') && originalContent.length > 0) {
              needsProcessing = true;
              console.log('📝 Zeq OS [Page Context - Claude]: Found content in prompt/query/message/text field');
            }
          } else {
            console.log('⚠️ Zeq OS [Page Context - Claude]: No recognizable message structure found. Body keys:', Object.keys(bodyData));
          }
          
          if (needsProcessing) {
            console.log('🔄 Zeq OS [Page Context - Claude]: Message needs processing');
            
            // Request processing from content script
            const requestId = Date.now() + Math.random();
            window.postMessage({
              type: 'ZEQ_PROCESS_REQUEST',
              requestId: requestId,
              originalContent: originalContent,
              bodyData: bodyData
            }, '*');
            
            console.log('📤 Zeq OS [Page Context - Claude]: Sent processing request, ID:', requestId);
            
            // Wait for response (with timeout)
            return new Promise((resolve, reject) => {
              let responded = false;
              const timeout = setTimeout(() => {
                if (!responded) {
                  responded = true;
                  console.warn('⏱️ Zeq OS [Page Context - Claude]: Processing timeout (2s), using original message');
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
                  
                  console.log('✅ Zeq OS [Page Context - Claude]: Received processed message, length:', event.data.processedContent.length);
                  
                  // Replace last user message content with mathematical prompt
                  if (bodyData.messages) {
                    for (let i = bodyData.messages.length - 1; i >= 0; i--) {
                      const msg = bodyData.messages[i];
                      if (msg.role === 'user' || msg.role === 'User') {
                        msg.content = event.data.processedContent;
                        msg.text = event.data.processedContent;
                        console.log('✅ Zeq OS [Page Context - Claude]: Replaced user message at index', i, 'with mathematical prompt');
                        break;
                      }
                    }
                  } else {
                    if (bodyData.prompt) bodyData.prompt = event.data.processedContent;
                    if (bodyData.query) bodyData.query = event.data.processedContent;
                    if (bodyData.message) bodyData.message = event.data.processedContent;
                    if (bodyData.text) bodyData.text = event.data.processedContent;
                  }
                  
                  // Update the body in options
                  const modifiedOptions = { ...options };
                  modifiedOptions.body = typeof options.body === 'string' ? JSON.stringify(bodyData) : bodyData;
                  console.log('🚀 Zeq OS [Page Context - Claude]: Sending processed message to Claude');
                  resolve(originalFetch.apply(this, [url, modifiedOptions]));
                }
              };
              
              window.addEventListener('message', handler);
            });
          } else {
            console.log('⏭️ Zeq OS [Page Context - Claude]: Message does not need processing');
          }
        } catch (e) {
          console.error('Zeq OS [Page Context - Claude]: Fetch error', e);
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
      
      // Check if this is a Claude chat API request - exclude analytics/tracking endpoints
      const isAnalyticsEndpoint = (
        url.includes('/v1/i') || // Segment identify
        url.includes('/v1/p') || // Segment page
        url.includes('/v1/t') || // Segment track
        url.includes('statsig.anthropic.com') || // Statsig analytics
        url.includes('/sentry') || // Sentry error tracking
        url.includes('/analytics') || // Analytics
        url.includes('segment.com') // Segment analytics
      );
      
      const isClaudeAPI = (
        !isAnalyticsEndpoint &&
        (url.includes('claude.ai') || url.includes('api.anthropic.com')) && 
        isPOST && (
          url.includes('/api/messages') ||
          url.includes('/v1/messages') ||
          url.includes('/api/complete') ||
          url.includes('/api/completion') ||
          url.includes('/complete') ||
          url.includes('/completion') ||
          (url.includes('claude.ai') && url.includes('/api/') && !url.includes('/v1/')) // Claude.ai API but not analytics
        )
      );
      
      if (isClaudeAPI) {
        console.log('🎯 Zeq OS [Page Context - Claude]: Intercepted API XHR:', url);
        
        try {
          const bodyData = JSON.parse(data);
          let needsProcessing = false;
          let originalContent = '';
          
          // Find the last user message
          if (bodyData.messages && Array.isArray(bodyData.messages)) {
            for (let i = bodyData.messages.length - 1; i >= 0; i--) {
              const msg = bodyData.messages[i];
              if (msg.role === 'user' || msg.role === 'User') {
                originalContent = msg.content || msg.text || '';
                if (Array.isArray(originalContent)) {
                  originalContent = originalContent.map(c => typeof c === 'string' ? c : c.text || '').join('');
                }
                if (originalContent && !originalContent.trim().startsWith('{') && originalContent.length > 0) {
                  needsProcessing = true;
                }
                break;
              }
            }
          } else if (bodyData.prompt || bodyData.query || bodyData.message || bodyData.text) {
            originalContent = bodyData.prompt || bodyData.query || bodyData.message || bodyData.text;
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
                
                // Replace last user message content
                if (bodyData.messages) {
                  for (let i = bodyData.messages.length - 1; i >= 0; i--) {
                    const msg = bodyData.messages[i];
                    if (msg.role === 'user' || msg.role === 'User') {
                      msg.content = event.data.processedContent;
                      msg.text = event.data.processedContent;
                      break;
                    }
                  }
                } else {
                  if (bodyData.prompt) bodyData.prompt = event.data.processedContent;
                  if (bodyData.query) bodyData.query = event.data.processedContent;
                  if (bodyData.message) bodyData.message = event.data.processedContent;
                  if (bodyData.text) bodyData.text = event.data.processedContent;
                }
                
                const processedData = JSON.stringify(bodyData);
                console.log('✅ Zeq OS [Page Context - Claude]: Using processed message for XHR');
                originalXHRSend.call(xhr, processedData);
              }
            };
            
            window.addEventListener('message', handler);
            
            // Timeout fallback
            setTimeout(() => {
              window.removeEventListener('message', handler);
              console.warn('⏱️ Zeq OS [Page Context - Claude]: XHR processing timeout, using original');
              originalXHRSend.call(xhr, data);
            }, 2000);
            
            return;
          }
        } catch (e) {
          console.error('Zeq OS [Page Context - Claude]: XHR error', e);
        }
      }
    }
    
    return originalXHRSend.apply(this, [data]);
  };
  
  console.log('✅ Zeq OS [Page Context - Claude]: Network interception installed successfully!');
})();

