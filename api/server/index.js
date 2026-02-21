require('dotenv').config();
const fs = require('fs');
const path = require('path');
require('module-alias')({ base: path.resolve(__dirname, '..') });
const cors = require('cors');
const axios = require('axios');
const express = require('express');
const passport = require('passport');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const { logger } = require('@librechat/data-schemas');
const mongoSanitize = require('express-mongo-sanitize');
const {
  isEnabled,
  ErrorController,
  performStartupChecks,
  initializeFileStorage,
} = require('@librechat/api');
const { connectDb, indexSync } = require('~/db');
const initializeOAuthReconnectManager = require('./services/initializeOAuthReconnectManager');
const createValidateImageRequest = require('./middleware/validateImageRequest');
const { jwtLogin, ldapLogin, passportLogin } = require('~/strategies');
const { updateInterfacePermissions } = require('~/models/interface');
const { checkMigrations } = require('./services/start/migration');
const initializeMCPs = require('./services/initializeMCPs');
const configureSocialLogins = require('./socialLogins');
const { getAppConfig } = require('./services/Config');
const staticCache = require('./utils/staticCache');
const noIndex = require('./middleware/noIndex');
const { seedDatabase } = require('~/models');
const { assignProPlanToAdmins, promoteConfiguredAdmin } = require('~/models/Plan');
// Zeq Patterns system
const { seedDefaultPatterns } = require('~/models/ZeqPattern');
const { seedDefaultCategories } = require('~/models/ZeqPatternCategory');
const { seedDefaultMessages } = require('~/models/ZeqCoherenceMessage');
const { initDailyScheduler } = require('./services/ZeqPatternGenerator');
const routes = require('./routes');

const { PORT, HOST, ALLOW_SOCIAL_LOGIN, DISABLE_COMPRESSION, TRUST_PROXY } = process.env ?? {};

// Allow PORT=0 to be used for automatic free port assignment
const port = isNaN(Number(PORT)) ? 3080 : Number(PORT);
const host = HOST || 'localhost';
const trusted_proxy = Number(TRUST_PROXY) || 1; /* trust first proxy by default */

const app = express();

const startServer = async () => {
  if (typeof Bun !== 'undefined') {
    axios.defaults.headers.common['Accept-Encoding'] = 'gzip';
  }
  await connectDb();

  logger.info('Connected to MongoDB');
  indexSync().catch((err) => {
    logger.error('[indexSync] Background sync failed:', err);
  });

  app.disable('x-powered-by');
  app.set('trust proxy', trusted_proxy);

  await seedDatabase();
  // Promote configured admin email, then assign Pro plan to all admins
  try { await promoteConfiguredAdmin(); } catch(e) { logger.warn('[ZEQ] promoteConfiguredAdmin failed:', e.message); }
  try { await assignProPlanToAdmins(); } catch(e) { logger.warn('[ZEQ] assignProPlanToAdmins failed:', e.message); }
  const appConfig = await getAppConfig();
  initializeFileStorage(appConfig);
  await performStartupChecks(appConfig);
  await updateInterfacePermissions(appConfig);

  const indexPath = path.join(appConfig.paths.dist, 'index.html');
  let indexHTML = fs.readFileSync(indexPath, 'utf8');

  // In order to provide support to serving the application in a sub-directory
  // We need to update the base href if the DOMAIN_CLIENT is specified and not the root path
  if (process.env.DOMAIN_CLIENT) {
    const clientUrl = new URL(process.env.DOMAIN_CLIENT);
    const baseHref = clientUrl.pathname.endsWith('/')
      ? clientUrl.pathname
      : `${clientUrl.pathname}/`;
    if (baseHref !== '/') {
      logger.info(`Setting base href to ${baseHref}`);
      indexHTML = indexHTML.replace(/base href="\/"/, `base href="${baseHref}"`);
    }
  }

  app.get('/health', (_req, res) => res.status(200).send('OK'));

  // Build verification endpoint - returns deployed version info
  app.get('/api/build-info', (_req, res) => {
    const fs = require('fs');
    const path = require('path');
    let buildInfo = 'unknown';
    try {
      buildInfo = fs.readFileSync(path.join(__dirname, '../../.build-info'), 'utf-8');
    } catch (e) { /* file may not exist */ }
    res.json({
      version: 'a6982ba',
      buildTimestamp: new Date().toISOString(),
      commit: process.env.RAILWAY_GIT_COMMIT_SHA || 'unknown',
      branch: process.env.RAILWAY_GIT_BRANCH || 'unknown',
      buildInfo: buildInfo.trim(),
      uptime: process.uptime(),
    });
  });

  /* Middleware */
  app.use(noIndex);
  app.use(express.json({ limit: '3mb' }));
  app.use(express.urlencoded({ extended: true, limit: '3mb' }));
  // Manual MongoDB operator sanitization (express-mongo-sanitize incompatible with Express 5)
  app.use((req, _res, next) => {
    const sanitize = (obj) => {
      if (obj && typeof obj === 'object') {
        for (const key of Object.keys(obj)) {
          if (key.startsWith('$')) {
            delete obj[key];
          } else if (typeof obj[key] === 'object') {
            sanitize(obj[key]);
          }
        }
      }
    };
    if (req.body) { sanitize(req.body); }
    if (req.params) { sanitize(req.params); }
    next();
  });
  app.use(cors());
  app.use(cookieParser());

  if (!isEnabled(DISABLE_COMPRESSION)) {
    app.use(compression());
  } else {
    console.warn('Response compression has been disabled via DISABLE_COMPRESSION.');
  }

  // Serve framework JS files from public directory BEFORE staticCache (so they match first)
  // This must be before any static middleware to ensure it matches
  app.get('/zeq-mathematical-framework.js', (req, res, next) => {
    const filePath = path.join(appConfig.paths.publicPath, 'zeq-mathematical-framework.js');
    if (fs.existsSync(filePath)) {
      res.type('application/javascript');
      return res.sendFile(filePath, (err) => {
        if (err && !res.headersSent) {
          next();
        }
      });
    }
    next();
  });
  app.get('/pdf-manager.js', (req, res, next) => {
    const filePath = path.join(appConfig.paths.publicPath, 'pdf-manager.js');
    if (fs.existsSync(filePath)) {
      res.type('application/javascript');
      return res.sendFile(filePath, (err) => {
        if (err && !res.headersSent) next();
      });
    }
    next();
  });
  app.get('/transparency-manager.js', (req, res, next) => {
    const filePath = path.join(appConfig.paths.publicPath, 'transparency-manager.js');
    if (fs.existsSync(filePath)) {
      res.type('application/javascript');
      return res.sendFile(filePath, (err) => {
        if (err && !res.headersSent) next();
      });
    }
    next();
  });

  app.use(staticCache(appConfig.paths.dist));
  app.use(staticCache(appConfig.paths.publicPath)); // Serve public directory for framework JS files
  app.use(staticCache(appConfig.paths.fonts));
  app.use(staticCache(appConfig.paths.assets));

  if (!ALLOW_SOCIAL_LOGIN) {
    console.warn('Social logins are disabled. Set ALLOW_SOCIAL_LOGIN=true to enable them.');
  }

  /* OAUTH */
  app.use(passport.initialize());
  passport.use(jwtLogin());
  passport.use(passportLogin());

  /* LDAP Auth */
  if (process.env.LDAP_URL && process.env.LDAP_USER_SEARCH_BASE) {
    passport.use(ldapLogin);
  }

  if (isEnabled(ALLOW_SOCIAL_LOGIN)) {
    await configureSocialLogins(app);
  }

  app.use('/oauth', routes.oauth);
  /* API Endpoints */
  app.use('/api/auth', routes.auth);
  if (routes.adminAuth) { app.use('/api/admin', routes.adminAuth); }
  app.use('/api/actions', routes.actions);
  app.use('/api/keys', routes.keys);
  if (routes.apiKeys) { app.use('/api/api-keys', routes.apiKeys); }
  app.use('/api/user', routes.user);
  app.use('/api/search', routes.search);
  app.use('/api/messages', routes.messages);
  app.use('/api/convos', routes.convos);
  app.use('/api/presets', routes.presets);
  app.use('/api/prompts', routes.prompts);
  app.use('/api/categories', routes.categories);
  app.use('/api/endpoints', routes.endpoints);
  app.use('/api/balance', routes.balance);
  app.use('/api/models', routes.models);
  app.use('/api/config', routes.config);
  app.use('/api/assistants', routes.assistants);
  app.use('/api/files', await routes.files.initialize());
  app.use('/images/', createValidateImageRequest(appConfig.secureImageLinks), routes.staticRoute);
  app.use('/api/share', routes.share);
  app.use('/api/roles', routes.roles);
  app.use('/api/agents', routes.agents);
  app.use('/api/banner', routes.banner);
  app.use('/api/memories', routes.memories);
  app.use('/api/permissions', routes.accessPermissions);
  app.use('/api/tags', routes.tags);
  app.use('/api/mcp', routes.mcp);
  // Zeq OS custom routes
  app.use('/api/transparency', routes.transparency);
  app.use('/api/zeq/operators', routes.zeqOperators);
  app.use('/api/zeq', routes.zeqProcess);
  app.use('/api/zeq', routes.zeqLogs);
  app.use('/api/zeq-patterns', routes.zeqPatterns);
  
  // MCP API Key validation endpoint (no JWT required, validates key itself)
  const { mcpApiKeyController } = require('~/server/controllers/MCPApiKeyController');
  app.post('/api/mcp/validate-key', mcpApiKeyController.validateApiKey);
  
  // MCP API Key management routes (JWT required)
  app.use('/api/mcp/apikey', routes.mcpApiKey);
  
  // Public plans endpoint for registration
  const { getPublicPlans } = require('~/server/controllers/AdminController');
  app.get('/api/plans/public', getPublicPlans);
  
  // Stripe routes
  app.use('/api/stripe', routes.stripe);

  app.use(ErrorController);

  // Catch-all route for SPA - only serve HTML for GET requests to non-API routes
  app.use((req, res) => {
    // Don't serve HTML for API routes or non-GET requests
    if (req.path.startsWith('/api/') || req.method !== 'GET') {
      return res.status(404).json({ message: 'Route not found', path: req.path, method: req.method });
    }

    res.set({
      'Cache-Control': process.env.INDEX_CACHE_CONTROL || 'no-cache, no-store, must-revalidate',
      Pragma: process.env.INDEX_PRAGMA || 'no-cache',
      Expires: process.env.INDEX_EXPIRES || '0',
    });

    const lang = req.cookies.lang || req.headers['accept-language']?.split(',')[0] || 'en-US';
    const langRegex = /^[a-zA-Z]{2,3}(-[a-zA-Z0-9]{2,8})?$/;
    const saneLang = langRegex.test(lang) ? lang : 'en-US';
    let updatedIndexHtml = indexHTML.replace(/lang="en-US"/g, `lang="${saneLang}"`);

    res.type('html');
    res.send(updatedIndexHtml);
  });

  app.listen(port, host, async () => {
    if (host === '0.0.0.0') {
      logger.info(
        `Server listening on all interfaces at port ${port}. Use http://localhost:${port} to access it`,
      );
    } else {
      logger.info(`Server listening at http://${host == '0.0.0.0' ? 'localhost' : host}:${port}`);
    }

    await initializeMCPs();
    await initializeOAuthReconnectManager();
    await checkMigrations();

    // Zeq Patterns: seed data and start daily scheduler
    try { await seedDefaultCategories(); } catch(e) { logger.warn('[ZEQ] seedDefaultCategories failed:', e.message); }
    try { await seedDefaultMessages(); } catch(e) { logger.warn('[ZEQ] seedDefaultMessages failed:', e.message); }
    try { await seedDefaultPatterns(); } catch(e) { logger.warn('[ZEQ] seedDefaultPatterns failed:', e.message); }
    try { initDailyScheduler(); } catch(e) { logger.warn('[ZEQ] initDailyScheduler failed:', e.message); }
  });
};

startServer();

let messageCount = 0;
process.on('uncaughtException', (err) => {
  if (!err.message.includes('fetch failed')) {
    logger.error('There was an uncaught error:', err);
  }

  if (err.message && err.message?.toLowerCase()?.includes('abort')) {
    logger.warn('There was an uncatchable abort error.');
    return;
  }

  if (err.message.includes('GoogleGenerativeAI')) {
    logger.warn(
      '\n\n`GoogleGenerativeAI` errors cannot be caught due to an upstream issue, see: https://github.com/google-gemini/generative-ai-js/issues/303',
    );
    return;
  }

  if (err.message.includes('fetch failed')) {
    if (messageCount === 0) {
      logger.warn('Meilisearch error, search will be disabled');
      messageCount++;
    }

    return;
  }

  if (err.message.includes('OpenAIError') || err.message.includes('ChatCompletionMessage')) {
    logger.error(
      '\n\nAn Uncaught `OpenAIError` error may be due to your reverse-proxy setup or stream configuration, or a bug in the `openai` node package.',
    );
    return;
  }

  if (err.stack && err.stack.includes('@librechat/agents')) {
    logger.error(
      '\n\nAn error occurred in the agents system. The error has been logged and the app will continue running.',
      {
        message: err.message,
        stack: err.stack,
      },
    );
    return;
  }

  process.exit(1);
});

/** Export app for easier testing purposes */
module.exports = app;
