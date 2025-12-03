// Zeq OS Mathematical Framework - Background Service Worker
// Manages framework state and cross-tab communication

// Initialize extension on install
chrome.runtime.onInstalled.addListener(() => {
  console.log('Zeq OS Mathematical Framework extension installed');
  
  // Set default settings
  chrome.storage.sync.set({
    enabled: true,
    platforms: {
      chatgpt: true,
      claude: true,
      grok: true,
      universal: true
    }
  });
});

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'processQuery') {
    // Framework processing is done in content script context
    // This is just for coordination if needed
    sendResponse({ success: true });
    return false; // Not async
  }
  
  if (request.action === 'getSettings') {
    chrome.storage.sync.get(['enabled', 'platforms'], (result) => {
      try {
        sendResponse({
          enabled: result.enabled !== false,
          platforms: result.platforms || {
            chatgpt: true,
            claude: true,
            grok: true,
            universal: true
          }
        });
      } catch (error) {
        // Channel may have closed, ignore
        console.warn('Zeq OS: Could not send response (channel closed)', error);
      }
    });
    return true; // Keep channel open for async response
  }
  
  if (request.action === 'updateSettings') {
    chrome.storage.sync.set(request.settings, () => {
      try {
        sendResponse({ success: true });
      } catch (error) {
        // Channel may have closed, ignore
        console.warn('Zeq OS: Could not send response (channel closed)', error);
      }
    });
    return true; // Keep channel open for async response
  }
  
  if (request.action === 'broadcastSettings') {
    // Broadcast settings to all tabs
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, {
          action: 'settingsUpdated',
          settings: request.settings
        }).catch(() => {
          // Ignore errors
        });
      });
    });
    sendResponse({ success: true });
    return false; // Not async
  }
  
  if (request.action === 'injectPageScript') {
    // Inject page context script using chrome.scripting API
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          files: ['content/deepseek-page-context.js'],
          world: 'MAIN' // Inject into page context, not isolated world
        }).then(() => {
          console.log('Zeq OS: Page context script injected successfully');
        }).catch((error) => {
          console.error('Zeq OS: Failed to inject page context script', error);
        });
      }
    });
    sendResponse({ success: true });
    return false; // Not async
  }
  
  return false; // Not handled
});

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
  // Popup will handle this, but we can add logic here if needed
});

