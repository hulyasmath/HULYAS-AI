# Zeq OS Framework Debugging Guide

## Errors You're Seeing (NOT from Framework)

### Error 1: InvalidNodeTypeError
```
chunk-AT5TJBOC.js:30 Uncaught (in promise) InvalidNodeTypeError: 
Failed to execute 'setStartBefore' on 'Range': the given Node has no parent.
```

**This is NOT from Zeq OS framework:**
- Comes from `chunk-AT5TJBOC.js` (bundled code)
- Functions: `getIsPageReadable`, `getCriticalClusters`
- This is a **readability parser library** (likely a browser extension or LibreChat feature)
- **NOT related to mathematical framework**

### Error 2: API 404
```
POST http://localhost:3080/api/convos/gen_title 404 (Not Found)
```

**This is NOT from Zeq OS framework:**
- This is a **LibreChat API endpoint** that doesn't exist
- Related to conversation title generation
- **NOT related to mathematical framework**

### Error 3: Chrome Extension Message Channel
```
Uncaught (in promise) Error: A listener indicated an asynchronous response 
by returning true, but the message channel closed before a response was received
```

**This is NOT from Zeq OS framework:**
- ✅ **Verified**: NO Chrome APIs in framework files
- ✅ **Verified**: NO message listeners in framework files
- Could be:
  1. **Browser extension installed** (check your browser extensions)
  2. **Service worker** (LibreChat's service worker)
  3. **Other LibreChat code**

---

## How to Verify Framework is Working

### Step 1: Check Console on Page Load

When you refresh the page, you MUST see these logs:

```
🚀🚀🚀 ZEQ OS MATHEMATICAL FRAMEWORK STARTING 🚀🚀🚀
📅 Zeq OS: Initialization started at [timestamp]
🔄 Zeq OS: initializeZeqFramework() called
✅ Zeq OS: Middleware initialized
✅ Zeq OS: Framework initialized with operators
✅✅✅ ZEQ OS FRAMEWORK READY ✅✅✅
✅ Zeq OS: Framework verified - processQuery works, operator count: [number]
```

**If you DON'T see these logs:**
- Framework is NOT loading
- Check browser console for script loading errors
- Check Network tab - are `/zeq-mathematical-framework.js` files loading?

### Step 2: Check When Sending a Message

When you send a message, you should see:

```
🔄 Zeq OS [useSubmitMessage]: Processing message through framework
✅ Zeq OS [useSubmitMessage]: Message processed
   - originalLength: [number]
   - processedLength: [number]
   - operatorCount: [number]
   - textChanged: true/false
```

**If you DON'T see these logs:**
- Framework is not intercepting messages
- Check if `window.zeqMiddleware` and `window.utpFramework` exist

### Step 3: Verify Framework Objects

Open browser console and run:

```javascript
// Check if framework is loaded
console.log('ZeqOSFramework:', typeof window.ZeqOSFramework);
console.log('zeqMiddleware:', typeof window.zeqMiddleware);
console.log('utpFramework:', typeof window.utpFramework);
console.log('Framework Ready:', window.__zeqFrameworkReady);

// Test framework
if (window.zeqMiddleware) {
  const result = window.zeqMiddleware.processQuery("test query");
  console.log('Framework test result:', result);
}
```

**Expected output:**
```
ZeqOSFramework: "object"
zeqMiddleware: "object"
utpFramework: "object"
Framework Ready: true
Framework test result: { mathematicalPrompt: "...", activeOperators: [...] }
```

---

## Troubleshooting

### Framework Not Loading

1. **Check Network Tab:**
   - Open DevTools → Network tab
   - Refresh page
   - Look for:
     - `/zeq-mathematical-framework.js` (should be 200 OK)
     - `/pdf-manager.js` (should be 200 OK)
     - `/transparency-manager.js` (should be 200 OK)

2. **Check Console for Script Errors:**
   - Look for red errors related to framework files
   - Common issues:
     - 404 errors (file not found)
     - Syntax errors in framework files
     - CORS errors

3. **Check File Locations:**
   ```bash
   ls -la client/public/zeq-mathematical-framework.js
   ls -la client/public/pdf-manager.js
   ls -la client/public/transparency-manager.js
   ```

### Framework Loading But Not Processing Messages

1. **Check if framework is initialized:**
   ```javascript
   console.log(window.__zeqFrameworkReady); // Should be true
   ```

2. **Check interception points:**
   - `useSubmitMessage.ts` - Primary interception
   - `useSSE.ts` - Secondary safeguard
   - `zeq-network-interceptor.ts` - Network-level interception

3. **Check for errors in processing:**
   - Look for `❌ Zeq OS [useSubmitMessage]: Processing error` in console
   - Check if errors are being caught and logged

### Messages Not Being Processed

1. **Verify text is being replaced:**
   - Send a message
   - Check Network tab → Find the API request
   - Look at request payload
   - Check if `text` field contains processed mathematical prompt

2. **Check processing logs:**
   - Look for `✅ Zeq OS [useSubmitMessage]: Message processed`
   - Check `textChanged: true` in logs
   - Verify `processedLength` is different from `originalLength`

---

## Common Issues

### Issue: Framework logs don't appear

**Possible causes:**
1. Scripts not loading (check Network tab)
2. Scripts loading after React app (check script order in index.html)
3. Console filter hiding logs (check console filter settings)

**Solution:**
- Ensure scripts load synchronously (no `defer` or `async`)
- Check script order in `index.html`

### Issue: Framework loads but messages not processed

**Possible causes:**
1. Framework not initialized (`window.__zeqFrameworkReady` is false)
2. Interception points not active
3. Errors in processing (check console)

**Solution:**
- Verify `window.zeqMiddleware` and `window.utpFramework` exist
- Check for processing errors in console
- Verify interception code is running

### Issue: Chrome extension errors

**Possible causes:**
1. Browser extension installed (not our code)
2. Service worker issue
3. Other LibreChat code using Chrome APIs

**Solution:**
- Disable browser extensions
- Check service worker registration
- Verify no Chrome APIs in our framework files (already verified)

---

## Quick Test

Run this in browser console:

```javascript
// Complete framework test
(async function() {
  console.log('=== ZEQ OS FRAMEWORK TEST ===');
  
  // 1. Check if framework loaded
  console.log('1. Framework loaded:', {
    ZeqOSFramework: typeof window.ZeqOSFramework,
    zeqMiddleware: typeof window.zeqMiddleware,
    utpFramework: typeof window.utpFramework,
    ready: window.__zeqFrameworkReady
  });
  
  // 2. Test processing
  if (window.zeqMiddleware && window.utpFramework) {
    const testQuery = "What is 2+2?";
    console.log('2. Testing with query:', testQuery);
    
    try {
      const zeqResult = window.zeqMiddleware.processQuery(testQuery);
      const utpResult = window.utpFramework.calculate_operators(true, testQuery);
      
      console.log('3. Processing result:', {
        mathematicalPrompt: zeqResult.mathematicalPrompt?.substring(0, 200),
        operatorCount: Object.keys(utpResult.operators || {}).length,
        activeOperators: zeqResult.activeOperators?.length || 0
      });
      
      console.log('✅ Framework is working!');
    } catch (error) {
      console.error('❌ Framework test failed:', error);
    }
  } else {
    console.error('❌ Framework not initialized!');
  }
})();
```

---

## What to Report

If framework is not working, please provide:

1. **Console logs on page load:**
   - Do you see `🚀🚀🚀 ZEQ OS MATHEMATICAL FRAMEWORK STARTING`?
   - Do you see `✅ Zeq OS: Middleware initialized`?

2. **Console logs when sending message:**
   - Do you see `🔄 Zeq OS [useSubmitMessage]: Processing message`?
   - Do you see `✅ Zeq OS [useSubmitMessage]: Message processed`?

3. **Network tab:**
   - Are framework files loading? (200 OK?)
   - What does the API request payload look like?

4. **Framework test results:**
   - Run the test above and share results

---

## Important Notes

- **The errors you're seeing are NOT from the framework**
- **They're from other parts of LibreChat or browser extensions**
- **The framework can work even if those errors appear**
- **Focus on verifying framework logs, not those errors**




