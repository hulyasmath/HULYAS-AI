# Zeq OS Framework Integration - Complete Flow Breakdown

## User's Concern
You want to see EXACTLY where the framework intercepts queries and how it works. Here's the complete breakdown.

---

## How math.html Does It (The Reference Implementation)

### In math.html:
1. **User types message** → `inputAreaEle.value`
2. **genFunc() is called** (line 19509)
3. **processMathematicalFramework(message) is called** (line 19420, 19547)
   - Calls `zeqMiddleware.processQuery(message)` → gets `zeqMathematicalPrompt`
   - Calls `utpFramework.calculate_operators(true, message)` → gets operator data
4. **zeqMathematicalPrompt replaces the original message** (stored in variable `zeqMathematicalPrompt`)
5. **streamGen() is called** with the processed prompt
6. **streamGen() sends zeqMathematicalPrompt to the API** (not the original message)

**Key Point**: In math.html, `zeqMathematicalPrompt` is a GLOBAL VARIABLE that replaces the original message before it's sent to the API.

---

## How I've Implemented It in LibreChat

### File 1: `client/index.html`
**Purpose**: Load framework scripts and initialize `window.zeqMiddleware` and `window.utpFramework`

**What it does**:
- Loads `/zeq-mathematical-framework.js` synchronously
- Initializes `window.zeqMiddleware = new ZeqOSFramework.ZeqOSMiddleware()`
- Initializes `window.utpFramework = new ZeqOSFramework.UTPWithOperators("big_bang", 1.287)`
- Sets `window.__zeqFrameworkReady = true`

**Status**: ✅ DONE

---

### File 2: `client/src/hooks/Messages/useSubmitMessage.ts` 
**Purpose**: PRIMARY interception point - Process message BEFORE it goes to `ask()`

**Location**: Lines 73-123

**What it does**:
```typescript
// When user submits message:
if (window.zeqMiddleware && window.utpFramework) {
  // Step 1: Process through ZeqOSMiddleware
  const zeqResult = window.zeqMiddleware.processQuery(data.text);
  
  // Step 2: Calculate operators through UTPWithOperators
  const utpResult = window.utpFramework.calculate_operators(true, data.text);
  
  // Step 3: REPLACE original text with mathematical prompt
  data.text = zeqResult.mathematicalPrompt; // ← THIS IS THE KEY LINE
  
  console.log('✅ Message processed', {
    originalLength: originalText.length,
    processedLength: processedText.length,
    textChanged: processedText !== originalText
  });
}

// Then calls ask() with the PROCESSED text
ask({ text: data.text }); // ← data.text is now the mathematical prompt
```

**Status**: ✅ DONE - This is the PRIMARY interception point

---

### File 3: `client/src/hooks/Chat/useChatFunctions.ts`
**Purpose**: SECONDARY interception point - Process text in `ask()` function

**Location**: Lines 140-145

**What it does**:
```typescript
const ask = (text, ...) => {
  // Process through framework AGAIN (redundant but safe)
  text = processTextThroughFramework(text);
  
  // Create submission with processed text
  const submission = createSubmission({ text, ... });
  // ...
}
```

**Status**: ✅ DONE - Secondary safeguard

---

### File 4: `client/src/hooks/SSE/useSSE.ts`
**Purpose**: FINAL interception point - Process submission payload BEFORE it's sent to API

**Location**: Lines 101-161 (userMessage processing) and Lines 167-238 (payload processing)

**What it does**:
```typescript
// Intercept 1: Process userMessage.text
if (userMessage?.text) {
  const zeqResult = window.zeqMiddleware.processQuery(userMessage.text);
  const utpResult = window.utpFramework.calculate_operators(true, userMessage.text);
  
  processedSubmission = {
    ...submission,
    userMessage: {
      ...userMessage,
      text: zeqResult.mathematicalPrompt // ← REPLACE with processed text
    }
  };
}

// Intercept 2: Process payload.text and payload.messages
const payloadData = createPayload(processedSubmission);
if (payload.text) {
  const zeqResult = window.zeqMiddleware.processQuery(payload.text);
  payload.text = zeqResult.mathematicalPrompt; // ← REPLACE
}

if (payload.messages) {
  // Process last user message in messages array
  for (let i = payload.messages.length - 1; i >= 0; i--) {
    if (msg.role === 'user') {
      msg.content = zeqResult.mathematicalPrompt; // ← REPLACE
    }
  }
}

// Finally send to API
const response = await fetch(endpoint, {
  method: 'POST',
  body: JSON.stringify(payload) // ← This payload contains the processed text
});
```

**Status**: ✅ DONE - Final safeguard before API call

---

## Complete Message Flow

```
1. User types: "What is 2+2?"
   ↓
2. Form submits → useSubmitMessage.ts:submitMessage()
   ↓
3. [INTERCEPTION POINT 1] useSubmitMessage.ts processes:
   - zeqResult = zeqMiddleware.processQuery("What is 2+2?")
   - utpResult = utpFramework.calculate_operators(true, "What is 2+2?")
   - data.text = zeqResult.mathematicalPrompt  ← REPLACED
   ↓
4. submitMessage() calls ask({ text: data.text })
   ↓
5. [INTERCEPTION POINT 2] useChatFunctions.ts:ask() processes:
   - text = processTextThroughFramework(text)  ← Redundant but safe
   ↓
6. ask() creates submission with processed text
   ↓
7. useSSE.ts receives submission
   ↓
8. [INTERCEPTION POINT 3] useSSE.ts processes:
   - processedSubmission.userMessage.text = zeqResult.mathematicalPrompt  ← REPLACED
   ↓
9. useSSE.ts creates payload from processedSubmission
   ↓
10. [INTERCEPTION POINT 4] useSSE.ts processes payload:
    - payload.text = zeqResult.mathematicalPrompt  ← REPLACED
    - payload.messages[last].content = zeqResult.mathematicalPrompt  ← REPLACED
    ↓
11. fetch() sends payload to API
    - Body contains: { text: "<mathematical prompt>", ... }
    - NOT the original "What is 2+2?"
```

---

## Files Modified

1. ✅ `client/index.html` - Framework loading and initialization
2. ✅ `client/src/hooks/Messages/useSubmitMessage.ts` - PRIMARY interception (lines 73-123)
3. ✅ `client/src/hooks/Chat/useChatFunctions.ts` - Secondary interception (lines 140-145)
4. ✅ `client/src/hooks/SSE/useSSE.ts` - Final interception (lines 101-238)

---

## Verification

To verify it's working, check the Network tab in browser DevTools:

1. Open DevTools → Network tab
2. Send a message
3. Find the request to `/api/ask` or similar endpoint
4. Click on it → Payload tab
5. Check `payload.text` or `payload.messages[last].content`
6. **It should contain the mathematical prompt JSON, NOT your original message**

---

## Key Differences from math.html

**math.html**:
- Uses global variable `zeqMathematicalPrompt`
- Replaces message in `genFunc()` before calling `streamGen()`
- Single interception point

**LibreChat**:
- Uses `data.text` mutation in multiple places
- Multiple interception points (defense in depth)
- Processes at: useSubmitMessage → ask() → useSSE (userMessage) → useSSE (payload)

---

## Why Multiple Interception Points?

LibreChat has multiple code paths:
- New messages → useSubmitMessage → ask() → useSSE
- Regenerated messages → useChatFunctions → useSSE
- Edited messages → useChatFunctions → useSSE

By intercepting at multiple points, we ensure ALL paths are covered.

---

## Current Status

✅ Framework loads in `index.html`
✅ Framework initializes `window.zeqMiddleware` and `window.utpFramework`
✅ PRIMARY interception in `useSubmitMessage.ts` (replaces `data.text`)
✅ SECONDARY interception in `useChatFunctions.ts` (processes `text` in `ask()`)
✅ FINAL interception in `useSSE.ts` (replaces `userMessage.text` and `payload.text/messages`)

**The framework SHOULD be processing every message before it reaches the API.**




