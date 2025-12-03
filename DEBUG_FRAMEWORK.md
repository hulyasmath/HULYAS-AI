# Debug Framework Issues

## Step 1: Check Console on Page Load

Open browser console and look for:
- `✅ Zeq OS: Middleware initialized`
- `✅ Zeq OS: Framework initialized with operators`
- `✅ Zeq OS: Framework fully initialized and verified`

If you see `❌` errors, note what they say.

## Step 2: Verify Framework is Available

In browser console, run:
```javascript
console.log('ZeqOSFramework:', !!window.ZeqOSFramework);
console.log('zeqMiddleware:', !!window.zeqMiddleware);
console.log('utpFramework:', !!window.utpFramework);
console.log('Framework Ready:', !!window.__zeqFrameworkReady);
```

All should be `true`.

## Step 3: Test Framework Manually

In browser console, run:
```javascript
if (window.zeqMiddleware && window.utpFramework) {
  const test = "Hello world";
  const zeq = window.zeqMiddleware.processQuery(test);
  const utp = window.utpFramework.calculate_operators(true, test);
  console.log('Zeq Result:', zeq.mathematicalPrompt?.substring(0, 200));
  console.log('UTP Operators:', Object.keys(utp.operators).length);
  console.log('✅ Framework works!');
} else {
  console.error('❌ Framework not available');
}
```

## Step 4: Send a Message and Check Console

When you send a message, you should see:
1. `🔄 Zeq OS [useSubmitMessage]: Processing message through framework`
2. `✅ Zeq OS [useSubmitMessage]: Message processed` with operator count

If you see `⚠️ Zeq OS [useSubmitMessage]: Framework not available`, the framework didn't load.

## Step 5: Check Network Tab

1. Open Network tab
2. Send a message
3. Find the API request (usually `/api/agents/...` or similar)
4. Click on it
5. Go to "Payload" or "Request" tab
6. Look for `text` field - it should contain JSON (the processed prompt), NOT your original text

## Common Issues

### Framework not loading
- Check browser console for script loading errors
- Verify files exist: `http://localhost:3090/pdf-manager.js` (should return 200)
- Check for CORS errors

### Framework loads but doesn't process
- Check `window.__zeqFrameworkReady` is `true`
- Verify both `window.zeqMiddleware` and `window.utpFramework` exist
- Check console for processing errors

### KaTeX error (setStartBefore)
- This is unrelated to the framework
- It's from math rendering library
- Should not block framework functionality
- Can be ignored if framework is working




