# Zeq OS Framework Implementation Comparison

## Overview
This document compares the original `math.html` implementation with the LibreChat integration.

---

## 1. Framework Loading & Initialization

### math.html (Original)
```html
<!-- Scripts loaded in order -->
<script src="lib/pdf-manager.js"></script>
<script src="lib/transparency-manager.js"></script>
<script src="lib/zeq-mathematical-framework.js"></script>

<script>
// Export singleton for convenience
let zeqMiddleware = null;
let utpFramework = null;

// Initialize framework safely with error handling
function initializeZeqFramework() {
    try {
        if (!zeqMiddleware) {
            zeqMiddleware = new ZeqOSMiddleware();  // Direct class access
            console.log('✅ Zeq OS: Middleware initialized');
        }
        if (!utpFramework) {
            utpFramework = new UTPWithOperators("big_bang", 1.287);
            console.log('✅ Zeq OS: Framework initialized with operators');
            window.utpFramework = utpFramework;
        }
        return true;
    } catch (error) {
        console.error('❌ Zeq OS: Framework initialization error:', error);
        // Fallback framework creation
        return false;
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeZeqFramework);
} else {
    initializeZeqFramework();
}
</script>
```

### LibreChat Implementation (client/index.html)
```html
<!-- Scripts loaded from /public directory -->
<script src="/pdf-manager.js"></script>
<script src="/transparency-manager.js"></script>
<script src="/zeq-mathematical-framework.js"></script>

<script>
// IMMEDIATE LOG - MUST APPEAR FIRST
(function() {
    console.log('%c🚀🚀🚀 ZEQ OS MATHEMATICAL FRAMEWORK STARTING 🚀🚀🚀', 
        'font-size: 20px; font-weight: bold; color: #00ff00; background: #000; padding: 10px;');
    console.log('📅 Zeq OS: Initialization started at', new Date().toISOString());
})();

// Initialize framework - EXACT pattern from math.html
let zeqMiddleware = null;
let utpFramework = null;

function initializeZeqFramework() {
    console.log('🔄 Zeq OS: initializeZeqFramework() called');
    try {
        if (typeof window.ZeqOSFramework === 'undefined') {
            console.error('❌ Zeq OS: ZeqOSFramework not available');
            return false;
        }
        
        if (!zeqMiddleware) {
            zeqMiddleware = new window.ZeqOSFramework.ZeqOSMiddleware();  // Via window.ZeqOSFramework
            window.zeqMiddleware = zeqMiddleware;
            console.log('✅ Zeq OS: Middleware initialized');
        }
        
        if (!utpFramework) {
            utpFramework = new window.ZeqOSFramework.UTPWithOperators("big_bang", 1.287);
            window.utpFramework = utpFramework;
            console.log('✅ Zeq OS: Framework initialized with operators');
        }
        
        window.__zeqFrameworkReady = true;
        console.log('%c✅✅✅ ZEQ OS FRAMEWORK READY ✅✅✅', 
            'font-size: 16px; font-weight: bold; color: #00ff00; background: #000; padding: 5px;');
        
        // Verify it works
        try {
            const testResult = window.zeqMiddleware.processQuery("test");
            const utpResult = window.utpFramework.calculate_operators(true, "test");
            console.log('✅ Zeq OS: Framework verified - processQuery works, operator count:', 
                Object.keys(utpResult.operators || {}).length);
        } catch (testError) {
            console.error('❌ Zeq OS: Framework verification failed:', testError);
        }
        
        return true;
    } catch (error) {
        console.error('❌ Zeq OS: Initialization error:', error);
        return false;
    }
}

// Initialize immediately
initializeZeqFramework();

// Also on DOMContentLoaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeZeqFramework);
}

// Retry if not ready
setTimeout(() => {
    if (!window.__zeqFrameworkReady) {
        console.warn('⚠️ Zeq OS: Retrying initialization...');
        initializeZeqFramework();
    }
}, 500);
</script>
```

### Key Differences:
1. **Class Access**: 
   - `math.html`: Direct class access (`new ZeqOSMiddleware()`)
   - LibreChat: Via namespace (`new window.ZeqOSFramework.ZeqOSMiddleware()`)
2. **Verification**: LibreChat adds immediate test to verify framework works
3. **Retry Logic**: LibreChat adds retry mechanism if framework not ready
4. **Logging**: LibreChat has more extensive logging for debugging

---

## 2. Query Processing Flow

### math.html (Original)
```javascript
// In math.html, processing happens in the UI event handlers
// When user submits a query:

// Step 1: Process through ZeqOSMiddleware
const zeqResult = zeqMiddleware.processQuery(userQuery);
zeqMathematicalPrompt = zeqResult.mathematicalPrompt;

// Step 2: Calculate all operators through UTPWithOperators
const utpResult = utpFramework.calculate_operators(true, userQuery);
utpOperatorData = utpResult.operators;

// Step 3: Replace user message with mathematical prompt
// Then send to API
```

### LibreChat Implementation

#### Primary Interception: `client/src/hooks/Messages/useSubmitMessage.ts`
```typescript
const submitMessage = async (data: { text: string }) => {
  // Process through framework if available
  if (window.zeqMiddleware && window.utpFramework && data.text) {
    try {
      console.log('🔄 Zeq OS [useSubmitMessage]: Processing message through framework', {
        textPreview: data.text.substring(0, 100),
        textLength: data.text.length,
        frameworkReady: !!window.__zeqFrameworkReady
      });
      
      // Step 1: Process through ZeqOSMiddleware (generates mathematical prompt)
      const zeqResult = window.zeqMiddleware.processQuery(data.text);
      
      // Step 2: Calculate all operators through UTPWithOperators
      const utpResult = window.utpFramework.calculate_operators(true, data.text);
      
      // Step 3: Replace text with mathematical prompt
      const originalText = data.text;
      const processedText = zeqResult.mathematicalPrompt || originalText;
      data.text = processedText; // FORCE replace
      
      console.log('✅ Zeq OS [useSubmitMessage]: Message processed', {
        originalLength: originalText.length,
        processedLength: processedText.length,
        operatorCount: Object.keys(utpResult.operators || {}).length,
        activeOperators: zeqResult.activeOperators?.length || 0,
        textChanged: processedText !== originalText
      });
    } catch (error) {
      console.error('❌ Zeq OS [useSubmitMessage]: Processing error', error);
    }
  }
  
  // Continue with normal submission flow
  // ... existing code ...
};
```

#### Secondary Safeguard: `client/src/hooks/SSE/useSSE.ts`
```typescript
// Zeq OS Mathematical Framework - ALWAYS process text before API call (secondary safeguard)
let processedSubmission = submission;
if (userMessage?.text) {
  const originalText = userMessage.text;
  
  if (typeof window !== 'undefined' && window.zeqMiddleware && window.utpFramework) {
    try {
      // Step 1: Process through ZeqOSMiddleware
      const zeqResult = window.zeqMiddleware.processQuery(originalText);
      
      // Step 2: Calculate all operators through UTPWithOperators
      const utpResult = window.utpFramework.calculate_operators(true, originalText);
      
      // Step 3: Use mathematical prompt
      processedText = zeqResult.mathematicalPrompt;
      
      console.log('✅ Zeq OS [useSSE]: Text processed through both components', {
        originalLength: originalText.length,
        processedLength: processedText.length,
        operatorCount: Object.keys(utpResult.operators || {}).length
      });
    } catch (error) {
      console.error('❌ Zeq OS [useSSE]: Processing error', error);
      processedText = originalText;
    }
  }
  
  // Always update submission with processed text
  processedSubmission = {
    ...submission,
    userMessage: {
      ...userMessage,
      text: processedText
    }
  };
}
```

### Key Differences:
1. **Integration Points**: 
   - `math.html`: Single UI handler
   - LibreChat: Multiple interception points (useSubmitMessage, useSSE, network interceptor)
2. **Error Handling**: LibreChat has try-catch at every point with fallback to original text
3. **Logging**: LibreChat logs at every step for debugging
4. **Multiple Safeguards**: LibreChat processes at 3 different points to ensure no message bypasses framework

---

## 3. Network Interception

### math.html (Original)
- No network interception needed - direct API calls from the page

### LibreChat Implementation
**File**: `client/src/lib/zeq-network-interceptor.ts`
```typescript
/**
 * Zeq OS Network Interceptor
 * Intercepts fetch/SSE requests and processes messages through the framework
 * Network-level interception for framework processing
 */

// Intercepts window.fetch to process API requests
const originalFetch = window.fetch;
window.fetch = async function(...args) {
  // Process request body if it contains user messages
  // Apply framework processing before sending to API
  // ...
};
```

**Purpose**: Third layer of interception to catch any messages that bypass React hooks

---

## 4. Framework File Location

### math.html (Original)
```
math.html
├── lib/
│   ├── pdf-manager.js
│   ├── transparency-manager.js
│   └── zeq-mathematical-framework.js
```

### LibreChat Implementation
```
client/
├── public/
│   ├── pdf-manager.js          (served at /pdf-manager.js)
│   ├── transparency-manager.js (served at /transparency-manager.js)
│   └── zeq-mathematical-framework.js (served at /zeq-mathematical-framework.js)
└── index.html (loads from /public via Vite)
```

**Key Difference**: 
- `math.html`: Relative paths (`lib/...`)
- LibreChat: Absolute paths from `/public` directory (Vite serves static files)

---

## 5. Storage Usage

### math.html (Original)
- Uses `localStorage` for tracking sent operators
- Uses `localStorage` for transparency logs

### LibreChat Implementation
- **REMOVED** all `localStorage` usage from framework
- Framework now processes queries without state tracking
- `getProgressiveOperators()` simplified to return selected operators immediately

**Reason**: LibreChat has its own storage system (Recoil + MongoDB), framework should be stateless

---

## 6. Chrome Extension Dependencies

### math.html (Original)
- No Chrome extension APIs (standalone HTML page)

### LibreChat Implementation
- **REMOVED** all Chrome extension APIs (`chrome.storage`, `chrome.runtime`)
- **REMOVED** all Chrome references from comments
- Pure web application code

---

## 7. Framework Initialization Timing

### math.html (Original)
```javascript
// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeZeqFramework);
} else {
    initializeZeqFramework();
}
```

### LibreChat Implementation
```javascript
// Initialize immediately (scripts load synchronously)
initializeZeqFramework();

// Also on DOMContentLoaded (backup)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeZeqFramework);
}

// Retry if not ready (safety net)
setTimeout(() => {
    if (!window.__zeqFrameworkReady) {
        console.warn('⚠️ Zeq OS: Retrying initialization...');
        initializeZeqFramework();
    }
}, 500);
```

**Key Difference**: LibreChat has multiple initialization attempts to ensure framework loads

---

## 8. Files Modified in LibreChat

### Core Framework Files
1. `client/public/zeq-mathematical-framework.js` - Main framework (removed localStorage, Chrome APIs)
2. `client/public/pdf-manager.js` - PDF manager (removed Chrome APIs)
3. `client/public/transparency-manager.js` - Transparency manager (removed Chrome APIs)

### Integration Files
4. `client/index.html` - Framework loading and initialization
5. `client/src/hooks/Messages/useSubmitMessage.ts` - Primary message processing
6. `client/src/hooks/SSE/useSSE.ts` - Secondary safeguard processing
7. `client/src/lib/zeq-network-interceptor.ts` - Network-level interception
8. `client/src/main.jsx` - Initializes network interceptor on app load

---

## 9. Processing Flow Comparison

### math.html Flow
```
User Input → UI Handler → Framework Processing → API Call
```

### LibreChat Flow
```
User Input 
  → useSubmitMessage.ts (Primary Processing)
    → useSSE.ts (Secondary Safeguard)
      → Network Interceptor (Final Safeguard)
        → API Call
```

**Key Difference**: LibreChat has 3 layers of interception to ensure NO message bypasses framework

---

## 10. Verification & Logging

### math.html (Original)
- Basic console logs
- Error handling with fallback

### LibreChat Implementation
- **Extensive logging** at every step:
  - Framework loading
  - Initialization
  - Message processing
  - Operator calculation
  - Text replacement
  - Error handling
- **Verification test** on initialization
- **Status checks** before processing

---

## Summary of Key Changes

| Aspect | math.html | LibreChat |
|--------|-----------|-----------|
| **Class Access** | Direct (`new ZeqOSMiddleware()`) | Namespace (`window.ZeqOSFramework.ZeqOSMiddleware()`) |
| **Storage** | Uses `localStorage` | Removed (stateless) |
| **Chrome APIs** | None | Removed all references |
| **Processing Points** | 1 (UI handler) | 3 (useSubmitMessage, useSSE, network) |
| **Error Handling** | Basic | Extensive with fallbacks |
| **Logging** | Minimal | Comprehensive |
| **Initialization** | Single attempt | Multiple attempts with retry |
| **Verification** | None | Immediate test on load |
| **File Location** | `lib/` directory | `/public` directory (Vite) |

---

## What Makes LibreChat Implementation More Robust

1. **Multiple Interception Points**: Ensures no message can bypass framework
2. **Extensive Logging**: Easy to debug if framework not working
3. **Retry Logic**: Handles async script loading issues
4. **Verification**: Tests framework immediately on load
5. **Error Handling**: Graceful fallback if framework fails
6. **Stateless**: No storage dependencies, pure processing
7. **Native Web App**: No Chrome extension code

---

## Testing Checklist

When you refresh LibreChat, you should see:
1. ✅ `🚀🚀🚀 ZEQ OS MATHEMATICAL FRAMEWORK STARTING 🚀🚀🚀` (immediately)
2. ✅ `✅ Zeq OS: Middleware initialized`
3. ✅ `✅ Zeq OS: Framework initialized with operators`
4. ✅ `✅✅✅ ZEQ OS FRAMEWORK READY ✅✅✅`
5. ✅ `✅ Zeq OS: Framework verified - processQuery works`

If you DON'T see these, the framework is NOT loading correctly.




