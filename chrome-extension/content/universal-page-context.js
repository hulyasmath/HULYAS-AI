// Zeq OS Network Interception - Page Context Script for Universal Platforms
// Handles Gemini, Perplexity, Groq, and other platforms

(function() {
  'use strict';
  
  console.log('🚀 Zeq OS [Page Context - Universal]: Network interception script executing...');
  
  // Detect platform
  const hostname = window.location.hostname;
  let platform = 'universal';
  if (hostname.includes('gemini.google.com') || hostname.includes('bard.google.com')) {
    platform = 'gemini';
  } else if (hostname.includes('perplexity.ai')) {
    platform = 'perplexity';
  } else if (hostname.includes('groq.com')) {
    platform = 'groq';
  }
  
  // Intercept fetch in page context
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    const url = args[0];
    const options = args[1] || {};
    
    // DO NOT intercept WebAssembly (.wasm) files or binary data
    if (typeof url === 'string') {
      if (url.endsWith('.wasm') || 
          url.includes('.wasm?') || 
          url.includes('.wasm&') ||
          url.includes('/wasm/') ||
          (url.includes('wasm') && (url.includes('worker') || url.includes('module')))) {
        return originalFetch.apply(this, args);
      }
      if (options.headers && (
        options.headers['Content-Type']?.includes('application/wasm') || 
        options.headers['content-type']?.includes('application/wasm') ||
        options.headers['Accept']?.includes('application/wasm') ||
        options.headers['accept']?.includes('application/wasm')
      )) {
        return originalFetch.apply(this, args);
      }
      if (options.body instanceof ArrayBuffer || 
          options.body instanceof Blob ||
          ArrayBuffer.isView(options.body)) {
        return originalFetch.apply(this, args);
      }
      if (options.responseType === 'arraybuffer' || options.responseType === 'blob') {
        return originalFetch.apply(this, args);
      }
    }
    
    // Intercept API requests
    if (typeof url === 'string' && options.body) {
      // Check if this is a chat/message API request
      const isAPIRequest = 
        url.includes('/chat') || 
        url.includes('/message') || 
        url.includes('/completion') ||
        url.includes('/api/chat') ||
        url.includes('/v1/chat') ||
        url.includes('/v1/completions') ||
        url.includes('/conversation') ||
        url.includes('/stream') ||
        url.includes('/completions') ||
        url.includes('/generate') ||
        url.includes('/query') ||
        (hostname.includes('gemini') && url.includes('/v1beta')) ||
        (hostname.includes('perplexity') && (url.includes('/chat') || url.includes('/api'))) ||
        (hostname.includes('groq') && (url.includes('/chat') || url.includes('/v1')));
      
      if (isAPIRequest) {
        console.log('🎯 Zeq OS [Page Context - Universal]: Intercepted API fetch:', url.substring(0, 100));
        
        try {
          const bodyData = typeof options.body === 'string' ? JSON.parse(options.body) : options.body;
          let needsProcessing = false;
          let originalContent = '';
          
          // Find user message
          if (bodyData.messages && Array.isArray(bodyData.messages)) {
            const lastUserMessage = bodyData.messages.filter(m => m.role === 'user' || m.role === 'User').pop();
            if (lastUserMessage) {
              originalContent = lastUserMessage.content || lastUserMessage.text || '';
              if (originalContent && !originalContent.trim().startsWith('{') && originalContent.length > 0) {
                needsProcessing = true;
              }
            }
          } else if (bodyData.prompt || bodyData.query || bodyData.message || bodyData.contents) {
            originalContent = bodyData.prompt || bodyData.query || bodyData.message || 
                            (bodyData.contents && bodyData.contents[0]?.parts?.[0]?.text) || '';
            if (originalContent && !originalContent.trim().startsWith('{') && originalContent.length > 0) {
              needsProcessing = true;
            }
          }
          
          if (needsProcessing) {
            console.log('🔄 Zeq OS [Page Context - Universal]: Message needs processing');
            
            const requestId = Date.now() + Math.random();
            window.postMessage({
              type: 'ZEQ_PROCESS_REQUEST',
              requestId: requestId,
              originalContent: originalContent,
              bodyData: bodyData,
              platform: platform
            }, '*');
            
            return new Promise((resolve, reject) => {
              let responded = false;
              const timeout = setTimeout(() => {
                if (!responded) {
                  responded = true;
                  console.warn('⏱️ Zeq OS [Page Context - Universal]: Processing timeout, using original');
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
                  
                  console.log('✅ Zeq OS [Page Context - Universal]: Received processed message');
                  
                  // Replace message content
                  if (bodyData.messages) {
                    for (let i = bodyData.messages.length - 1; i >= 0; i--) {
                      if (bodyData.messages[i].role === 'user' || bodyData.messages[i].role === 'User') {
                        bodyData.messages[i].content = event.data.processedContent;
                        bodyData.messages[i].text = event.data.processedContent;
                        break;
                      }
                    }
                  } else if (bodyData.contents && Array.isArray(bodyData.contents)) {
                    // Gemini format
                    if (bodyData.contents[0] && bodyData.contents[0].parts) {
                      bodyData.contents[0].parts[0].text = event.data.processedContent;
                    }
                  } else {
                    if (bodyData.prompt) bodyData.prompt = event.data.processedContent;
                    if (bodyData.query) bodyData.query = event.data.processedContent;
                    if (bodyData.message) bodyData.message = event.data.processedContent;
                  }
                  
                  options.body = typeof options.body === 'string' ? JSON.stringify(bodyData) : bodyData;
                  resolve(originalFetch.apply(this, args));
                }
              };
              
              window.addEventListener('message', handler);
            });
          }
        } catch (e) {
          console.error('Zeq OS [Page Context - Universal]: Fetch error', e);
        }
      }
    }
    
    return originalFetch.apply(this, args);
  };
  
  console.log('✅ Zeq OS [Page Context - Universal]: Network interception installed for', platform);
})();

