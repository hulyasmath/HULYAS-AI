# Zeq OS Framework Verification Guide

## Quick Test in Browser Console

After the app loads, open browser console and run:

```javascript
// Test 1: Check if framework is loaded
console.log('ZeqOSFramework:', !!window.ZeqOSFramework);
console.log('zeqMiddleware:', !!window.zeqMiddleware);
console.log('utpFramework:', !!window.utpFramework);
console.log('Framework Ready:', !!window.__zeqFrameworkReady);

// Test 2: Test processing
if (window.zeqMiddleware && window.utpFramework) {
  const testText = "Hello, this is a test";
  const zeqResult = window.zeqMiddleware.processQuery(testText);
  const utpResult = window.utpFramework.calculate_operators(true, testText);
  
  console.log('Zeq Result:', {
    hasPrompt: !!zeqResult.mathematicalPrompt,
    promptLength: zeqResult.mathematicalPrompt?.length,
    promptPreview: zeqResult.mathematicalPrompt?.substring(0, 200)
  });
  
  console.log('UTP Result:', {
    hasOperators: !!utpResult.operators,
    operatorCount: Object.keys(utpResult.operators || {}).length
  });
  
  if (zeqResult.mathematicalPrompt && zeqResult.mathematicalPrompt !== testText && Object.keys(utpResult.operators || {}).length > 0) {
    console.log('✅ Framework is working!');
  } else {
    console.error('❌ Framework test failed');
  }
} else {
  console.error('❌ Framework components not available');
}
```

## Expected Console Output on Page Load

You should see:
1. `✅ Zeq OS: Middleware initialized`
2. `✅ Zeq OS: Framework initialized with operators` (or `already exists`)
3. `✅ Zeq OS: Framework fully initialized and verified` with operator count

## When Sending a Message

You should see:
1. `🔄 Zeq OS [useSubmitMessage]: Processing message through framework`
2. `✅ Zeq OS [useSubmitMessage]: Message processed` with operator count
3. `🔄 Zeq OS [useSSE]: Processing userMessage.text before API call`
4. `✅ Zeq OS [useSSE]: Text processed through both components`

## Network Tab Verification

1. Open Network tab
2. Send a message
3. Find the request to `/api/agents/...` or similar
4. Check the request payload
5. The `text` field should contain the processed mathematical prompt (JSON format), NOT the original user text

## Troubleshooting

If framework doesn't load:
- Check console for script loading errors
- Verify files exist in `client/public/`
- Check that scripts load before React app starts
- Look for `❌ Zeq OS:` error messages

If processing doesn't happen:
- Check `window.zeqMiddleware` and `window.utpFramework` exist
- Verify `window.__zeqFrameworkReady === true`
- Check console for `⚠️ Zeq OS [useSubmitMessage]: Framework not available`




