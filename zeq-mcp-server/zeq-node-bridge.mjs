import fs from 'fs';
import path from 'path';
import url from 'url';
import vm from 'vm';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

let middlewarePromise = null;

async function loadFrameworkMiddleware() {
  if (middlewarePromise) {
    return middlewarePromise;
  }

  middlewarePromise = (async () => {
    const frameworkPath =
      process.env.ZEQ_FRAMEWORK_PATH ||
      path.resolve(__dirname, '..', 'client', 'public', 'zeq-mathematical-framework.js');

    const code = await fs.promises.readFile(frameworkPath, 'utf8');

    const context = {
      window: {},
      console,
      Math,
      Date,
      setTimeout,
      clearTimeout,
    };

    vm.createContext(context);
    vm.runInContext(code, context, { filename: 'zeq-mathematical-framework.js' });

    const framework = context.window.ZeqOSFramework;
    if (!framework || typeof framework.ZeqOSMiddleware !== 'function') {
      throw new Error('ZeqOSFramework.ZeqOSMiddleware not found after loading framework file');
    }

    const middleware = new framework.ZeqOSMiddleware();
    return middleware;
  })();

  return middlewarePromise;
}

/**
 * Process a user message through the Zeq OS framework.
 * Returns the raw framework result so MCP clients can inspect
 * mathematicalPrompt, activeOperators, domains, diagnostics, etc.
 */
export async function processQueryWithFramework(message) {
  const middleware = await loadFrameworkMiddleware();
  const zeqResult = middleware.processQuery(message);

  return {
    zeqResult,
  };
}




