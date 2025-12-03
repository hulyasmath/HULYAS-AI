/**
 * Zeq OS Framework Test - Run this to verify framework is working
 * Call: window.testZeqFramework() in browser console
 */

declare global {
  interface Window {
    testZeqFramework: () => void;
    zeqMiddleware?: any;
    utpFramework?: any;
    ZeqOSFramework?: any;
    __zeqFrameworkReady?: boolean;
  }
}

export function testZeqFramework() {
  console.log('=== ZEQ OS FRAMEWORK TEST ===');
  
  // Test 1: Check if framework loaded
  console.log('1. ZeqOSFramework exists:', !!window.ZeqOSFramework);
  console.log('2. zeqMiddleware exists:', !!window.zeqMiddleware);
  console.log('3. utpFramework exists:', !!window.utpFramework);
  console.log('4. Framework Ready flag:', !!window.__zeqFrameworkReady);
  
  if (!window.ZeqOSFramework) {
    console.error('❌ FAIL: ZeqOSFramework not found - framework script did not load');
    return false;
  }
  
  // Test 2: Try to create instances if they don't exist
  if (!window.zeqMiddleware) {
    try {
      window.zeqMiddleware = new window.ZeqOSFramework.ZeqOSMiddleware();
      console.log('✅ Created zeqMiddleware');
    } catch (e) {
      console.error('❌ FAIL: Could not create zeqMiddleware:', e);
      return false;
    }
  }
  
  if (!window.utpFramework) {
    try {
      window.utpFramework = new window.ZeqOSFramework.UTPWithOperators("big_bang", 1.287);
      console.log('✅ Created utpFramework');
    } catch (e) {
      console.error('❌ FAIL: Could not create utpFramework:', e);
      return false;
    }
  }
  
  // Test 3: Process a test message
  const testMessage = "Hello, this is a test";
  console.log('5. Testing with message:', testMessage);
  
  try {
    const zeqResult = window.zeqMiddleware.processQuery(testMessage);
    console.log('6. ZeqOSMiddleware result:', {
      hasPrompt: !!zeqResult.mathematicalPrompt,
      promptLength: zeqResult.mathematicalPrompt?.length || 0,
      promptPreview: zeqResult.mathematicalPrompt?.substring(0, 200) || 'N/A',
      changed: zeqResult.mathematicalPrompt !== testMessage
    });
    
    const utpResult = window.utpFramework.calculate_operators(true, testMessage);
    console.log('7. UTPWithOperators result:', {
      operatorCount: Object.keys(utpResult.operators || {}).length,
      hasOperators: Object.keys(utpResult.operators || {}).length > 0
    });
    
    if (zeqResult.mathematicalPrompt && zeqResult.mathematicalPrompt !== testMessage && Object.keys(utpResult.operators || {}).length > 0) {
      console.log('✅✅✅ FRAMEWORK IS WORKING! ✅✅✅');
      console.log('Processed prompt:', zeqResult.mathematicalPrompt.substring(0, 500));
      return true;
    } else {
      console.error('❌ FAIL: Framework processed but result is same as input or no operators');
      return false;
    }
  } catch (e) {
    console.error('❌ FAIL: Error processing message:', e);
    return false;
  }
}

// Make it available globally
if (typeof window !== 'undefined') {
  window.testZeqFramework = testZeqFramework;
}




