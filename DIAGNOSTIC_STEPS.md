# Zeq OS Framework Diagnostic Steps

## IMMEDIATE TEST - Run in Browser Console

After page loads, paste this in console:

```javascript
(function() {
  console.log('=== ZEQ OS FRAMEWORK DIAGNOSTIC ===');
  console.log('1. ZeqOSFramework exists:', !!window.ZeqOSFramework);
  console.log('2. zeqMiddleware exists:', !!window.zeqMiddleware);
  console.log('3. utpFramework exists:', !!window.utpFramework);
  console.log('4. Framework Ready flag:', !!window.__zeqFrameworkReady);
  
  if (window.ZeqOSFramework) {
    console.log('5. ZeqOSMiddleware class:', !!window.ZeqOSFramework.ZeqOSMiddleware);
    console.log('6. UTPWithOperators class:', !!window.ZeqOSFramework.UTPWithOperators);
  }
  
  if (window.zeqMiddleware && window.utpFramework) {
    try {
      const test = "test message";
      const zeq = window.zeqMiddleware.processQuery(test);
      const utp = window.utpFramework.calculate_operators(true, test);
      console.log('7. Processing test - Zeq prompt length:', zeq.mathematicalPrompt?.length || 0);
      console.log('8. Processing test - UTP operator count:', Object.keys(utp.operators || {}).length);
      console.log('9. Prompt preview:', zeq.mathematicalPrompt?.substring(0, 100) || 'N/A');
      console.log('✅ Framework is WORKING');
    } catch (e) {
      console.error('❌ Framework test FAILED:', e);
    }
  } else {
    console.error('❌ Framework components missing');
    if (window.ZeqOSFramework) {
      console.log('Attempting to create instances...');
      try {
        if (!window.zeqMiddleware) {
          window.zeqMiddleware = new window.ZeqOSFramework.ZeqOSMiddleware();
          console.log('✅ Created zeqMiddleware');
        }
        if (!window.utpFramework) {
          window.utpFramework = new window.ZeqOSFramework.UTPWithOperators("big_bang", 1.287);
          console.log('✅ Created utpFramework');
        }
        window.__zeqFrameworkReady = true;
        console.log('✅ Framework manually initialized');
      } catch (e) {
        console.error('❌ Failed to create instances:', e);
      }
    }
  }
})();
```

## When Sending a Message

1. Open Network tab
2. Send a message
3. Look for console logs:
   - `🔄 Zeq OS [useSubmitMessage]: Processing message through framework`
   - `✅ Zeq OS [useSubmitMessage]: Message processed`
4. In Network tab, find the API request
5. Check the request payload - the `text` field should be JSON (processed), not your original text

## If Framework Not Loading

Check browser console for:
- Script loading errors (404, CORS, etc.)
- `❌ Zeq OS:` error messages
- Framework initialization errors

## Quick Fix Command

If framework exists but instances don't, run in console:

```javascript
if (window.ZeqOSFramework && !window.zeqMiddleware) {
  window.zeqMiddleware = new window.ZeqOSFramework.ZeqOSMiddleware();
  console.log('✅ zeqMiddleware created');
}
if (window.ZeqOSFramework && !window.utpFramework) {
  window.utpFramework = new window.ZeqOSFramework.UTPWithOperators("big_bang", 1.287);
  console.log('✅ utpFramework created');
}
window.__zeqFrameworkReady = true;
console.log('✅ Framework ready');
```




