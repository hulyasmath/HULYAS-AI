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
const root = createRoot(container);

root.render(
  <ApiErrorBoundaryProvider>
    <App />
  </ApiErrorBoundaryProvider>,
);
