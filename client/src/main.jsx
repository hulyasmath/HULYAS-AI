import 'regenerator-runtime/runtime';
// Initialize Zeq OS Framework interceptors and diagnostics
// Wrap in try-catch to prevent blocking app initialization
try {
  import('~/lib/zeq-interceptor').catch(err => console.warn('Zeq interceptor load warning:', err));
  import('~/lib/zeq-network-interceptor').catch(err => console.warn('Zeq network interceptor load warning:', err));
  import('~/lib/zeq-diagnostics').catch(err => console.warn('Zeq diagnostics load warning:', err));
  import('~/lib/zeq-test').catch(err => console.warn('Zeq test load warning:', err));
} catch (err) {
  console.warn('Zeq framework modules load warning:', err);
}
import { createRoot } from 'react-dom/client';

// Verify both framework components are initialized
if (typeof window !== 'undefined') {
  setTimeout(() => {
    const hasZeqMiddleware = !!window.zeqMiddleware;
    const hasUtpFramework = !!window.utpFramework;
    const isReady = !!window.__zeqFrameworkReady;
    
    console.log('🔍 Zeq OS [main.jsx]: Framework status check', {
      hasZeqMiddleware,
      hasUtpFramework,
      isReady,
      frameworkVersion: window.ZeqOSFramework?.version || 'unknown'
    });
    
    if (!hasZeqMiddleware || !hasUtpFramework) {
      console.error('❌ Zeq OS [main.jsx]: Framework components not initialized!', {
        hasZeqMiddleware,
        hasUtpFramework,
        hasZeqOSFramework: !!window.ZeqOSFramework
      });
    } else {
      console.log('✅ Zeq OS [main.jsx]: Both framework components verified and ready');
    }
  }, 2000);
}
import './locales/i18n';
import App from './App';
import './style.css';
import './mobile.css';
import { ApiErrorBoundaryProvider } from './hooks/ApiErrorBoundaryContext';
import 'katex/dist/katex.min.css';
import 'katex/dist/contrib/copy-tex.js';

const container = document.getElementById('root');

if (!container) {
  console.error('❌ Root container not found! Cannot render app.');
  throw new Error('Root container element not found');
}

// Ensure safe initialization with error handling
try {
  const root = createRoot(container);
  
  root.render(
    <ApiErrorBoundaryProvider>
      <App />
    </ApiErrorBoundaryProvider>,
  );
} catch (error) {
  console.error('❌ Failed to render app:', error);
  // Show error message to user
  container.innerHTML = `
    <div style="padding: 20px; text-align: center; font-family: system-ui;">
      <h1>🚀 HULYAS - Zeq OS 1.287 Hz</h1>
      <p style="color: #ef4444;">Application failed to initialize</p>
      <p>Please refresh the page or contact support if the issue persists.</p>
      <button onclick="window.location.reload()" style="margin-top: 20px; padding: 10px 20px; cursor: pointer;">
        Reload Application
      </button>
      <details style="margin-top: 20px; text-align: left; max-width: 600px; margin-left: auto; margin-right: auto;">
        <summary style="cursor: pointer;">Error Details</summary>
        <pre style="background: #1f1f1f; padding: 10px; border-radius: 4px; overflow: auto;">${error.toString()}\n${error.stack || ''}</pre>
      </details>
    </div>
  `;
}
