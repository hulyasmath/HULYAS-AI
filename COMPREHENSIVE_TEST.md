# Comprehensive Framework Test Checklist

## Step 1: Verify Files Exist
- [ ] `client/public/zeq-mathematical-framework.js` exists
- [ ] `client/public/pdf-manager.js` exists  
- [ ] `client/public/transparency-manager.js` exists

## Step 2: Verify index.html Loading
- [ ] Scripts load in correct order: pdf-manager.js → transparency-manager.js → zeq-mathematical-framework.js
- [ ] Scripts load synchronously (no defer, no async)
- [ ] Initialization script runs after framework loads
- [ ] `window.zeqMiddleware` is created
- [ ] `window.utpFramework` is created
- [ ] `window.__zeqFrameworkReady = true` is set

## Step 3: Verify No Chrome APIs
- [ ] No `chrome.storage` in public files
- [ ] No `chrome.runtime` in public files
- [ ] All storage uses `localStorage`

## Step 4: Verify Interception Points
- [ ] `useSubmitMessage.ts` processes `data.text` (lines 73-123)
- [ ] `useChatFunctions.ts` processes `text` in `ask()` (line 144)
- [ ] `useSSE.ts` processes `userMessage.text` (lines 101-161)
- [ ] `useSSE.ts` processes `payload.text` and `payload.messages` (lines 167-238)

## Step 5: Test in Browser
1. Open DevTools Console
2. Refresh page
3. Check for console logs:
   - `🚀 Zeq OS: Starting initialization script...`
   - `✅ Zeq OS: Middleware initialized`
   - `✅ Zeq OS: Framework initialized with operators`
   - `✅✅✅ Zeq OS: Framework fully initialized and ready ✅✅✅`
4. Type `window.zeqMiddleware` in console - should return object
5. Type `window.utpFramework` in console - should return object
6. Type `window.__zeqFrameworkReady` in console - should return `true`
7. Send a test message
8. Check Network tab → find `/api/ask` request
9. Check Payload → `payload.text` should be JSON (mathematical prompt), NOT your original message

## Step 6: Verify Processing
- [ ] Console shows: `🔄 Zeq OS [useSubmitMessage]: Processing message through framework`
- [ ] Console shows: `✅ Zeq OS [useSubmitMessage]: Message processed`
- [ ] Console shows operator count > 0
- [ ] Network request payload contains processed text (JSON)




