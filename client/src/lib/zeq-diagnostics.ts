/**
 * Zeq OS Framework Diagnostics
 * Run this to verify the framework is working
 */

export function runZeqDiagnostics() {
  console.log('=== ZEQ OS FRAMEWORK DIAGNOSTICS ===');
  
  if (typeof window === 'undefined') {
    console.error('❌ Window is undefined');
    return false;
  }

  // Check 1: Framework namespace exists
  const hasFramework = typeof window.ZeqOSFramework !== 'undefined';
  console.log('1. ZeqOSFramework namespace exists:', hasFramework);
  
  if (!hasFramework) {
    console.error('❌ ZeqOSFramework not found on window object');
    console.log('Available window properties:', Object.keys(window).filter(k => 
      k.toLowerCase().includes('zeq') || 
      k.toLowerCase().includes('framework')
    ));
    return false;
  }

  // Check 2: Framework structure
  const framework = window.ZeqOSFramework;
  console.log('2. Framework object:', framework);
  console.log('3. Framework version:', framework.version);
  console.log('4. Framework name:', framework.frameworkName);

  // Check 3: ZeqOSMiddleware class exists
  const hasMiddlewareClass = typeof framework.ZeqOSMiddleware !== 'undefined';
  console.log('5. ZeqOSMiddleware class exists:', hasMiddlewareClass);
  
  // Check 4: zeqMiddleware instance exists
  const hasZeqMiddleware = typeof window.zeqMiddleware !== 'undefined';
  console.log('6. zeqMiddleware instance exists:', hasZeqMiddleware);
  
  // Check 5: utpFramework instance exists
  const hasUtpFramework = typeof window.utpFramework !== 'undefined';
  console.log('7. utpFramework instance exists:', hasUtpFramework);
  
  if (!hasZeqMiddleware || !hasUtpFramework) {
    console.error('❌ Framework components not initialized!', {
      hasZeqMiddleware,
      hasUtpFramework,
      hasMiddlewareClass
    });
    return false;
  }

  // Check 6: Can process a query through both components
  try {
    const testQuery = "Hello, this is a test message for Zeq OS";
    console.log('8. Testing with query:', testQuery);
    
    // Test ZeqOSMiddleware
    const zeqResult = window.zeqMiddleware.processQuery(testQuery);
    console.log('9. ZeqOSMiddleware result:', {
      originalQuery: zeqResult.originalQuery,
      hasMathematicalPrompt: !!zeqResult.mathematicalPrompt,
      promptLength: zeqResult.mathematicalPrompt?.length || 0,
      promptPreview: zeqResult.mathematicalPrompt?.substring(0, 200) || 'N/A',
      operatorCount: zeqResult.activeOperators?.length || 0,
      domains: zeqResult.domains
    });
    
    // Test UTPWithOperators
    const utpResult = window.utpFramework.calculate_operators(true, testQuery);
    console.log('10. UTPWithOperators result:', {
      hasOperators: !!utpResult.operators,
      operatorCount: Object.keys(utpResult.operators || {}).length,
      hasFrameworkState: !!utpResult.frameworkState
    });
    
    if (zeqResult.mathematicalPrompt && zeqResult.mathematicalPrompt !== testQuery && Object.keys(utpResult.operators || {}).length > 0) {
      console.log('✅ Both framework components are working correctly!');
      return true;
    } else {
      console.warn('⚠️ Framework processed but may not be working correctly', {
        promptChanged: zeqResult.mathematicalPrompt !== testQuery,
        hasOperators: Object.keys(utpResult.operators || {}).length > 0
      });
      return false;
    }
  } catch (error) {
    console.error('❌ Error testing framework:', error);
    return false;
  }
}

// Auto-run diagnostics after a delay
if (typeof window !== 'undefined') {
  setTimeout(() => {
    console.log('🔍 Running Zeq OS diagnostics...');
    runZeqDiagnostics();
  }, 3000);
}

