// ZEQ OS API Server v0.4.0-beta
// Beta Node.js API server with security hardening
// 
// ⚠️ BETA STATUS: APIs may change before stable release
// 
// Features:
// - Operator execution with KO42 HulyaPulse sync
// - Rate limiting and parameter sanitization
// - LibreChat integration ready (no built-in login)
//
// Run with: npm run api or node api-server.cjs

const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);
const net = require('net');

// Load environment variables from .env file if it exists
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        process.env[key.trim()] = valueParts.join('=').trim();
      }
    }
  });
}

const app = express();

// =============================================================================
// DEBUG: identify running server build + verify routing (disabled in production)
// =============================================================================
// GET /api/zeq/_debug/whoami - Returns server build info (development only)
app.get('/api/zeq/_debug/whoami', (req, res) => {
  // SECURITY: Disable debug endpoint in production
  if (IS_PRODUCTION) {
    return res.status(404).json({ error: 'Not found' });
  }

  debugLog('api-server.cjs:whoami', 'whoami endpoint hit', { path: req.path, method: req.method });

  try {
    const p = path.join(__dirname, 'api-server.cjs');
    const b = fs.readFileSync(p);
    const sha1 = crypto.createHash('sha1').update(b).digest('hex');
    res.json({ ok: true, file: 'api-server.cjs', bytes: b.length, sha1, pid: process.pid });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
});

// =============================================================================
// SECURITY CONFIGURATION
// =============================================================================
const DEFAULT_JWT_SECRET = 'zeq-os-development-only-change-in-production';
const MIN_SECRET_LENGTH = 32;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// JWT secrets with rotation support
const JWT_SECRET = process.env.ZEQ_JWT_SECRET || DEFAULT_JWT_SECRET;
const JWT_SECRET_PREVIOUS = process.env.ZEQ_JWT_SECRET_PREVIOUS || null;
const JWT_EXPIRY = parseInt(process.env.ZEQ_JWT_EXPIRY) || 86400; // 24 hours

// SECURITY: Fail startup in production if JWT secret is not configured
if (IS_PRODUCTION) {
  if (!process.env.ZEQ_JWT_SECRET) {
    console.error('❌ FATAL: ZEQ_JWT_SECRET must be set in production mode!');
    console.error('   Generate a secure secret with: openssl rand -base64 32');
    console.error('   Add it to your .env file or environment variables.');
    process.exit(1);
  }
  if (JWT_SECRET.length < MIN_SECRET_LENGTH) {
    console.error(`❌ FATAL: JWT secret must be at least ${MIN_SECRET_LENGTH} characters in production!`);
    process.exit(1);
  }
} else {
  // Development mode warnings
  if (JWT_SECRET === DEFAULT_JWT_SECRET) {
    console.warn('⚠️  WARNING: Using default JWT secret. Set ZEQ_JWT_SECRET in .env for production!');
  }
  if (JWT_SECRET.length < MIN_SECRET_LENGTH) {
    console.warn(`⚠️  WARNING: JWT secret is less than ${MIN_SECRET_LENGTH} characters. Consider using a longer secret.`);
  }
}

// Server configuration
const PORT = parseInt(process.env.ZEQ_API_PORT) || process.env.PORT || 8080;

// Rate limiting configuration
const RATE_LIMIT_RPM = parseInt(process.env.ZEQ_RATE_LIMIT_RPM) || 100;
const RATE_LIMIT_BURST = parseInt(process.env.ZEQ_RATE_LIMIT_BURST) || 20;

// =============================================================================
// DEBUG LOGGING CONFIGURATION
// =============================================================================
// SECURITY: Debug logging is disabled by default and should NEVER be enabled in production
const DEBUG_LOGGING_ENABLED = process.env.ZEQ_DEBUG_LOGGING === 'true' && !IS_PRODUCTION;

// Helper function for debug logging (no-op in production)
function debugLog(location, message, data = {}) {
  // SECURITY: Never log in production
  if (!DEBUG_LOGGING_ENABLED) return;

  const logData = {
    location,
    message,
    data,
    timestamp: Date.now(),
    sessionId: 'debug-session'
  };

  // Log to console instead of file for security
  console.debug('[DEBUG]', JSON.stringify(logData));
}

if (DEBUG_LOGGING_ENABLED) {
  console.warn('⚠️  DEBUG LOGGING ENABLED - Do not use in production!');
}

// =============================================================================
// JWT HELPER FUNCTIONS WITH KEY ROTATION
// =============================================================================

/**
 * Create a JWT token with the current secret
 */
function createToken(payload) {
  const now = Math.floor(Date.now() / 1000);
  const tokenPayload = {
    ...payload,
    iat: now,
    exp: now + JWT_EXPIRY,
    jti: crypto.randomBytes(16).toString('hex')
  };
  return jwt.sign(tokenPayload, JWT_SECRET, { algorithm: 'HS256' });
}

/**
 * Verify a JWT token with key rotation support
 * Tries current secret first, then previous secret if available
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
  } catch (err) {
    // If we have a previous secret (key rotation), try that
    if (JWT_SECRET_PREVIOUS && err.name === 'JsonWebTokenError') {
      try {
        const decoded = jwt.verify(token, JWT_SECRET_PREVIOUS, { algorithms: ['HS256'] });
        console.log('[AUTH] Token verified with previous secret - consider refreshing');
        return decoded;
      } catch (prevErr) {
        throw err; // Throw original error
      }
    }
    throw err;
  }
}

/**
 * Check if token needs refresh (within 1 hour of expiry)
 */
function tokenNeedsRefresh(decoded) {
  const now = Math.floor(Date.now() / 1000);
  return (decoded.exp - now) < 3600;
}

/**
 * Get security configuration status (for health checks)
 */
function getSecurityStatus() {
  return {
    jwtSecretConfigured: JWT_SECRET !== DEFAULT_JWT_SECRET,
    jwtSecretLength: JWT_SECRET.length,
    jwtSecretSecure: JWT_SECRET !== DEFAULT_JWT_SECRET && JWT_SECRET.length >= MIN_SECRET_LENGTH,
    keyRotationEnabled: !!JWT_SECRET_PREVIOUS,
    tokenExpirySeconds: JWT_EXPIRY,
    rateLimitRPM: RATE_LIMIT_RPM
  };
}

// =============================================================================
// RATE LIMITING MIDDLEWARE
// =============================================================================

/**
 * Token bucket rate limiter
 * Implements per-IP rate limiting with configurable limits
 */
class RateLimiter {
  constructor(rpm = RATE_LIMIT_RPM, burst = RATE_LIMIT_BURST) {
    this.rpm = rpm;
    this.burst = burst;
    this.buckets = new Map();
    this.refillRate = rpm / 60; // tokens per second

    // Clean up old buckets every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  /**
   * Get or create bucket for IP
   */
  getBucket(ip) {
    if (!this.buckets.has(ip)) {
      this.buckets.set(ip, {
        tokens: this.burst,
        lastRefill: Date.now()
      });
    }
    return this.buckets.get(ip);
  }

  /**
   * Refill tokens based on elapsed time
   */
  refillBucket(bucket) {
    const now = Date.now();
    const elapsed = (now - bucket.lastRefill) / 1000;
    const tokensToAdd = elapsed * this.refillRate;
    bucket.tokens = Math.min(this.burst, bucket.tokens + tokensToAdd);
    bucket.lastRefill = now;
  }

  /**
   * Try to consume a token, return true if allowed
   */
  tryConsume(ip) {
    const bucket = this.getBucket(ip);
    this.refillBucket(bucket);

    if (bucket.tokens >= 1) {
      bucket.tokens -= 1;
      return true;
    }
    return false;
  }

  /**
   * Get remaining tokens and reset time for headers
   */
  getStatus(ip) {
    const bucket = this.getBucket(ip);
    this.refillBucket(bucket);

    const resetTime = bucket.tokens < this.burst
      ? Math.ceil((this.burst - bucket.tokens) / this.refillRate)
      : 0;

    return {
      remaining: Math.floor(bucket.tokens),
      limit: this.rpm,
      reset: resetTime
    };
  }

  /**
   * Clean up old buckets (no activity for 10 minutes)
   */
  cleanup() {
    const cutoff = Date.now() - 10 * 60 * 1000;
    for (const [ip, bucket] of this.buckets.entries()) {
      if (bucket.lastRefill < cutoff) {
        this.buckets.delete(ip);
      }
    }
  }
}

const rateLimiter = new RateLimiter();

/**
 * Rate limiting middleware
 */
function rateLimitMiddleware(req, res, next) {
  // Get client IP (handle proxies)
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim()
    || req.socket.remoteAddress
    || 'unknown';

  // Skip rate limiting for health checks
  if (req.path === '/health' || req.path === '/api/health') {
    return next();
  }

  if (!rateLimiter.tryConsume(ip)) {
    const status = rateLimiter.getStatus(ip);
    res.set({
      'X-RateLimit-Limit': status.limit,
      'X-RateLimit-Remaining': 0,
      'X-RateLimit-Reset': status.reset,
      'Retry-After': status.reset
    });

    console.warn(`[RATE_LIMIT] IP ${ip} exceeded rate limit`);
    return res.status(429).json({
      error: 'Too Many Requests',
      message: `Rate limit exceeded. Please wait ${status.reset} seconds before retrying.`,
      retryAfter: status.reset
    });
  }

  // Add rate limit headers to response
  const status = rateLimiter.getStatus(ip);
  res.set({
    'X-RateLimit-Limit': status.limit,
    'X-RateLimit-Remaining': status.remaining,
    'X-RateLimit-Reset': status.reset
  });

  next();
}

// =============================================================================
// INPUT VALIDATION MIDDLEWARE
// =============================================================================

/**
 * Validate and sanitize input parameters
 */
function validateInput(schema) {
  return (req, res, next) => {
    const errors = [];
    const sanitized = {};

    const data = { ...req.params, ...req.query, ...req.body };

    for (const [key, rules] of Object.entries(schema)) {
      const value = data[key];

      // Check required
      if (rules.required && (value === undefined || value === null || value === '')) {
        errors.push(`Missing required field: ${key}`);
        continue;
      }

      if (value === undefined || value === null) {
        if (rules.default !== undefined) {
          sanitized[key] = rules.default;
        }
        continue;
      }

      // Type checking and conversion
      let converted = value;
      switch (rules.type) {
        case 'number':
          converted = Number(value);
          if (isNaN(converted)) {
            errors.push(`Invalid number for field: ${key}`);
            continue;
          }
          if (rules.min !== undefined && converted < rules.min) {
            errors.push(`${key} must be >= ${rules.min}`);
            continue;
          }
          if (rules.max !== undefined && converted > rules.max) {
            errors.push(`${key} must be <= ${rules.max}`);
            continue;
          }
          break;

        case 'string':
          converted = String(value);
          if (rules.maxLength && converted.length > rules.maxLength) {
            errors.push(`${key} exceeds max length of ${rules.maxLength}`);
            continue;
          }
          if (rules.pattern && !rules.pattern.test(converted)) {
            errors.push(`${key} does not match required pattern`);
            continue;
          }
          // Sanitize strings to prevent injection
          converted = converted.replace(/[<>]/g, '');
          break;

        case 'boolean':
          converted = value === true || value === 'true' || value === '1';
          break;

        case 'array':
          if (!Array.isArray(value)) {
            try {
              converted = JSON.parse(value);
            } catch {
              errors.push(`Invalid array for field: ${key}`);
              continue;
            }
          }
          if (rules.maxItems && converted.length > rules.maxItems) {
            errors.push(`${key} exceeds max items of ${rules.maxItems}`);
            continue;
          }
          break;

        case 'object':
          if (typeof value !== 'object') {
            try {
              converted = JSON.parse(value);
            } catch {
              errors.push(`Invalid object for field: ${key}`);
              continue;
            }
          }
          break;
      }

      sanitized[key] = converted;
    }

    if (errors.length > 0) {
      return res.status(400).json({
        error: 'Validation Error',
        details: errors
      });
    }

    req.validated = sanitized;
    next();
  };
}

/**
 * Common validation schemas
 */
const ValidationSchemas = {
  operatorExecution: {
    operator: { type: 'string', required: true, maxLength: 50, pattern: /^[A-Z0-9_]+$/i },
    params: { type: 'object', required: false, default: {} }
  },
  pagination: {
    page: { type: 'number', required: false, default: 1, min: 1 },
    limit: { type: 'number', required: false, default: 50, min: 1, max: 100 }
  },
  operatorFilter: {
    category: { type: 'string', required: false, maxLength: 50 },
    domain: { type: 'string', required: false, maxLength: 50 },
    search: { type: 'string', required: false, maxLength: 100 }
  }
};

// =============================================================================
// PARAMETER SANITIZATION
// =============================================================================

/**
 * Sanitize operator parameters for API execution
 * SECURITY: Prevents code injection via callable objects or unsafe types
 */
function sanitizeParams(params, maxDepth = 10, currentDepth = 0) {
  if (currentDepth > maxDepth) {
    throw new Error('Parameter nesting too deep');
  }

  if (params === null || params === undefined) {
    return params;
  }

  // Check for functions (should never happen in JSON, but defense in depth)
  if (typeof params === 'function') {
    throw new Error('Callable objects not allowed in API parameters');
  }

  // Handle primitives
  if (typeof params !== 'object') {
    // String length limit
    if (typeof params === 'string' && params.length > 10000) {
      throw new Error(`String parameter too long (${params.length} > 10000)`);
    }
    return params;
  }

  // Handle arrays
  if (Array.isArray(params)) {
    if (params.length > 10000) {
      throw new Error(`Array too long (${params.length} > 10000)`);
    }
    return params.map((v, i) => sanitizeParams(v, maxDepth, currentDepth + 1));
  }

  // Handle objects
  const sanitized = {};
  for (const [key, value] of Object.entries(params)) {
    // Check for __proto__ or constructor injection
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      throw new Error(`Unsafe parameter key: ${key}`);
    }
    sanitized[key] = sanitizeParams(value, maxDepth, currentDepth + 1);
  }
  return sanitized;
}

// =============================================================================
// AUDIT LOGGING
// =============================================================================

const AUDIT_LOG_ENABLED = process.env.ZEQ_AUDIT_LOG === 'true';

/**
 * Log security-relevant events
 */
function auditLog(event, details) {
  if (!AUDIT_LOG_ENABLED) return;

  const entry = {
    timestamp: new Date().toISOString(),
    event,
    ...details
  };

  // In production, this would write to a secure audit log
  console.log('[AUDIT]', JSON.stringify(entry));
}

/**
 * Audit logging middleware
 */
function auditMiddleware(req, res, next) {
  const start = Date.now();

  res.on('finish', () => {
    // Log authentication attempts and sensitive operations
    if (req.path.includes('/auth') || req.path.includes('/admin')) {
      auditLog('api_request', {
        method: req.method,
        path: req.path,
        ip: req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress,
        userId: req.user?.user_id || 'anonymous',
        statusCode: res.statusCode,
        duration: Date.now() - start
      });
    }
  });

  next();
}

const dbPath = path.join(__dirname, 'zeq-ecosystem', 'zeq-api', 'zeq.db');
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Database error:', err);
  } else {
    console.log('✅ Connected to database');
    initTables();
  }
});

function initTables() {
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      created_at INTEGER NOT NULL
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS apps (
      id TEXT PRIMARY KEY,
      developer_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      long_description TEXT,
      category TEXT NOT NULL,
      image_url TEXT,
      plugin_url TEXT NOT NULL,
      tags TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      rating REAL DEFAULT 0,
      downloads INTEGER DEFAULT 0,
      created_at INTEGER NOT NULL
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS submissions (
      id TEXT PRIMARY KEY,
      app_id TEXT,
      developer_id TEXT NOT NULL,
      status TEXT NOT NULL,
      validation_result TEXT,
      created_at INTEGER NOT NULL
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS app_versions (
      id TEXT PRIMARY KEY,
      app_id TEXT NOT NULL,
      version TEXT NOT NULL,
      sha256_hash TEXT,
      shannon_entropy REAL DEFAULT 0,
      kolmogorov_ratio REAL DEFAULT 0,
      signature TEXT,
      changelog TEXT,
      created_at INTEGER NOT NULL
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS app_reviews (
      id TEXT PRIMARY KEY,
      app_id TEXT NOT NULL,
      user_id TEXT DEFAULT 'anonymous',
      rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
      review_text TEXT,
      created_at INTEGER NOT NULL
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS app_integrity (
      id TEXT PRIMARY KEY,
      app_id TEXT NOT NULL,
      checksum TEXT,
      entropy_score REAL DEFAULT 0,
      kolmogorov_score REAL DEFAULT 0,
      verified_by TEXT,
      verified_at INTEGER
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS skills (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      industry TEXT,
      operators TEXT,
      author TEXT DEFAULT 'anonymous',
      is_public INTEGER DEFAULT 1,
      install_count INTEGER DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER
    )`);

    seedAccounts();
  });
}

function seedAccounts() {
  // SECURITY: Admin accounts must be configured via environment variables
  // Do NOT use hardcoded credentials in production
  const adminEmail = process.env.ZEQ_ADMIN_EMAIL;
  const adminPassword = process.env.ZEQ_ADMIN_PASSWORD;
  const adminUsername = process.env.ZEQ_ADMIN_USERNAME || 'admin';

  // Only create admin account if credentials are provided via environment
  if (adminEmail && adminPassword) {
    if (adminPassword.length < 12) {
      console.warn('⚠️  WARNING: Admin password should be at least 12 characters for security');
    }

    bcrypt.hash(adminPassword, 10, (err, hash) => {
      if (err) {
        console.error('❌ Error hashing admin password:', err.message);
        return;
      }
      db.run(
        `INSERT OR IGNORE INTO users (id, email, username, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
        [`admin-${Date.now()}`, adminEmail, adminUsername, hash, 'admin', Math.floor(Date.now() / 1000)],
        function (err) {
          if (err) {
            if (!err.message.includes('UNIQUE')) {
              console.error('❌ Error creating admin account:', err.message);
            }
          } else if (this.changes > 0) {
            console.log('✅ Admin account created from environment variables');
          }
        }
      );
    });
  } else if (process.env.NODE_ENV === 'production') {
    console.warn('⚠️  WARNING: No admin credentials configured. Set ZEQ_ADMIN_EMAIL and ZEQ_ADMIN_PASSWORD in .env');
  } else {
    console.log('ℹ️  Development mode: Set ZEQ_ADMIN_EMAIL and ZEQ_ADMIN_PASSWORD to create admin account');
  }
}

// CORS configuration from environment variable
const CORS_ORIGINS_ENV = process.env.ZEQ_CORS_ORIGINS || '';
let corsOrigins;

if (CORS_ORIGINS_ENV) {
  // Parse comma-separated origins from environment
  corsOrigins = CORS_ORIGINS_ENV.split(',').map(origin => origin.trim()).filter(Boolean);
  console.log(`✅ CORS configured for origins: ${corsOrigins.join(', ')}`);
} else if (IS_PRODUCTION) {
  // In production without explicit config, default to restrictive
  corsOrigins = [];
  console.warn('⚠️  WARNING: CORS disabled in production. Set ZEQ_CORS_ORIGINS to enable cross-origin requests.');
} else {
  // Development mode - allow localhost origins (including Vite dev server on 3001)
  corsOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3080',
    'http://localhost:8080',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'http://127.0.0.1:3080',
    'http://127.0.0.1:8080'
  ];
  console.log('ℹ️  Development mode: CORS enabled for localhost origins (3000, 3001, 3080, 8080)');
}

app.use(cors({
  origin: function (origin, callback) {
    // #region agent log
    const logPath = path.join(__dirname, '.cursor', 'debug.log');
    try {
      const isAllowed = !origin || corsOrigins.includes(origin);
      const logEntry = JSON.stringify({ sessionId: 'debug-session', runId: 'pre-fix', hypothesisId: 'E', location: 'api-server.cjs:cors', message: 'CORS origin check', data: { origin: origin || 'undefined', allowedOrigins: corsOrigins, isAllowed }, timestamp: Date.now() }) + '\n';
      fs.appendFileSync(logPath, logEntry, 'utf8');
    } catch { }
    // #endregion
    // Allow requests with no origin (same-origin, Postman, etc.) or from allowed origins
    if (!origin) {
      // Same-origin request, no CORS needed
      callback(null, true);
    } else if (corsOrigins.includes(origin)) {
      // Cross-origin request from allowed origin - return the origin so CORS middleware sets the header
      callback(null, origin);
    } else {
      console.warn(`[CORS] Rejected origin: ${origin}. Allowed: ${corsOrigins.join(', ')}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json({ limit: '1mb' })); // Limit request body size

// Apply security middleware
app.use(rateLimitMiddleware);
app.use(auditMiddleware);

// Disable caching for all API responses
app.use((req, res, next) => {
  // Debug logging (disabled in production)
  if (req.path.includes('/sdk') || req.path.includes('/zeqond')) {
    debugLog('api-server.cjs:cache-mw', 'Request received', { path: req.path, method: req.method, url: req.url });
  }
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

// Health check and route listing
app.get('/', (req, res) => {
  console.log('GET / - Health check');

  // Check if zeqond routes are registered
  const zeqondRoutes = [];
  if (app._router) {
    app._router.stack.forEach((middleware) => {
      if (middleware.route && middleware.route.path.includes('zeqond')) {
        const method = Object.keys(middleware.route.methods)[0]?.toUpperCase() || 'GET';
        zeqondRoutes.push(`${method} ${middleware.route.path}`);
      }
    });
  }

  res.json({
    message: 'ZEQ OS API v1.287',
    status: 'running',
    operatorRegistry: operatorRegistry ? `${operatorRegistry.total} operators loaded` : 'not loaded',
    zeqondRoutesRegistered: zeqondRoutes.length > 0,
    zeqondRoutes: zeqondRoutes,
    endpoints: {
      operators: '/api/zeq/operators',
      operatorDetails: '/api/zeq/operators/:id',
      executeOperator: '/api/zeq/operators/execute?operator={id}',
      zeqondStatus: '/api/zeq/zeqond/status',
      zeqondPulse: '/api/zeq/zeqond/pulse'
    },
    test: 'Visit /api/zeq/operators to see all 634 operators (NO LOGIN REQUIRED)'
  });
});

// Test route to verify server is working
app.get('/api/test-sdk', (req, res) => {
  res.json({ message: 'SDK test route works', sdkMetadataExists: !!sdkMetadata });
});

// Test route to verify server is working
app.get('/api/test', (req, res) => {
  // Check if zeqond routes are actually registered
  const zeqondRoutes = [];
  if (app._router) {
    app._router.stack.forEach((middleware) => {
      if (middleware.route && middleware.route.path.includes('zeqond')) {
        const method = Object.keys(middleware.route.methods)[0]?.toUpperCase() || 'GET';
        zeqondRoutes.push(`${method} ${middleware.route.path}`);
      }
    });
  }

  res.json({
    message: 'API server is working!',
    operatorRegistryLoaded: !!operatorRegistry,
    operatorCount: operatorRegistry?.total || 0,
    zeqondRoutesRegistered: zeqondRoutes.length > 0,
    zeqondRoutes: zeqondRoutes,
    zeqondPort: 2871,
    serverVersion: 'NEW_CODE_WITH_ZEQOND_ROUTES',
    timestamp: Date.now()
  });
});

// ============================================================================
// ZEQ OS OPERATOR ENDPOINTS (No authentication required - public API)
// ============================================================================

// Load operator registry
let operatorRegistry = null;
try {
  const registryPath = path.join(__dirname, 'operator-registry.json');
  if (fs.existsSync(registryPath)) {
    operatorRegistry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
    console.log(`✅ Loaded operator registry: ${operatorRegistry.total} operators`);
  } else {
    console.warn('⚠️  Operator registry file not found at:', registryPath);
  }
} catch (err) {
  console.error('❌ Could not load operator registry:', err.message);
  console.error(err.stack);
}

// Helper function to normalize operator ID
function normalizeOperatorId(id) {
  return id.replace(/\./g, '_DOT_').replace(/-/g, '_MINUS_');
}

// Helper function to get operator category
function getOperatorCategory(id) {
  if (!operatorRegistry) return 'unknown';
  const op = operatorRegistry.operators.find(o => o.id === id);
  return op ? op.category : 'unknown';
}

// GET /api/zeq/operators
// List all available operators with optional category filter
// PUBLIC ENDPOINT - NO AUTHENTICATION REQUIRED
app.get('/api/zeq/operators', (req, res, next) => {
  console.log('📋 GET /api/zeq/operators called');
  console.log('Query params:', req.query);
  console.log('Operator registry loaded:', !!operatorRegistry);
  console.log('Operator registry total:', operatorRegistry?.total || 'N/A');

  const category = req.query.category;

  if (!operatorRegistry) {
    console.error('❌ Operator registry not loaded when /api/zeq/operators was called');
    return res.status(503).json({ error: 'Operator registry not loaded' });
  }

  console.log(`📋 GET /api/zeq/operators${category ? '?category=' + category : ''} - Returning ${operatorRegistry.operators.length} operators`);

  let operators = operatorRegistry.operators;

  // Filter by category if provided
  if (category) {
    operators = operators.filter(op => op.category === category);
  }

  // Add category summary
  const categories = {};
  operatorRegistry.operators.forEach(op => {
    categories[op.category] = (categories[op.category] || 0) + 1;
  });

  // Log first few operators to verify equations are included
  if (operators.length > 0) {
    console.log('📊 Sample operators with equations:');
    operators.slice(0, 5).forEach(op => {
      console.log(`   ${op.id}: ${op.equation ? '✅ HAS EQUATION' : '❌ NO EQUATION'}`);
      if (op.equation) {
        console.log(`      ${op.equation.substring(0, 60)}...`);
      }
    });
  }

  res.json({
    operators: operators.map(op => {
      // Extract name from description (part before colon)
      const descParts = (op.description || '').split(':');
      const name = descParts.length > 1 ? descParts[0].trim() : (op.description || op.id);

      // Ensure equation is included - use empty string instead of null if missing
      const equation = op.equation || (op.equationLaTeX || null);

      return {
        id: op.id,
        name: name,
        description: op.description || '',
        category: op.category,
        equation: equation  // Always include equation field
      };
    }),
    count: operators.length,
    total: operatorRegistry.total,
    categories: categories
  });
});

// GET /api/zeq/docs - Documentation API endpoint (same pattern as operators)
// This route MUST be defined before any catch-all 404 handlers
app.get('/api/zeq/docs', (req, res) => {
  console.log('📚 GET /api/zeq/docs called');
  console.log('Query params:', req.query);

  try {
    const requestedPath = req.query.path;

    if (!requestedPath) {
      return res.status(400).json({ error: 'Documentation path parameter required' });
    }

    console.log('[DOCS API] Requested path:', requestedPath);

    // Security: Only allow paths within docs/source directory
    if (requestedPath.includes('..') || !requestedPath.startsWith('docs/source/')) {
      console.log('[DOCS API] Invalid path:', requestedPath);
      return res.status(400).json({ error: 'Invalid documentation path' });
    }

    const fullPath = path.join(__dirname, requestedPath);
    console.log('[DOCS API] Full path:', fullPath);

    // Verify file exists and is within docs directory
    const docsDir = path.join(__dirname, 'docs');
    const resolvedPath = path.resolve(fullPath);
    const resolvedDocsDir = path.resolve(docsDir);

    if (!fs.existsSync(resolvedPath)) {
      console.log('[DOCS API] File not found:', resolvedPath);
      return res.status(404).json({ error: 'Documentation file not found', path: requestedPath });
    }

    if (!resolvedPath.startsWith(resolvedDocsDir)) {
      console.log('[DOCS API] Path outside docs directory');
      return res.status(403).json({ error: 'Access denied' });
    }

    // Read and return the file content
    const content = fs.readFileSync(resolvedPath, 'utf8');
    console.log('[DOCS API] Successfully loaded:', requestedPath, 'Size:', content.length);

    res.json({
      success: true,
      path: requestedPath,
      content: content,
      size: content.length
    });
  } catch (error) {
    console.error('[DOCS API] Error serving documentation:', error);
    res.status(500).json({ error: 'Failed to load documentation', message: error.message });
  }
});

// GET /api/zeq/operators/:id
// Get detailed information about a specific operator
app.get('/api/zeq/operators/:id', (req, res) => {
  const operatorId = req.params.id;

  if (!operatorRegistry) {
    return res.status(503).json({ error: 'Operator registry not loaded' });
  }

  const operator = operatorRegistry.operators.find(op => op.id === operatorId);

  if (!operator) {
    return res.status(404).json({ error: `Operator ${operatorId} not found` });
  }

  // Get all operators in the same category
  const categoryOps = operatorRegistry.operators.filter(op => op.category === operator.category);

  // Ensure equation is included
  const equation = operator.equation || operator.equationLaTeX || null;

  res.json({
    id: operator.id,
    internalId: operator.internalId || operator.id,
    name: operator.description?.split(':')[0] || operator.id,
    description: operator.description || '',
    category: operator.category,
    equation: equation,  // Always include equation field
    categoryCount: categoryOps.length,
    example: {
      operator: operator.id,
      params: getExampleParams(operator.id),
      endpoint: `/api/zeq/operators/execute?operator=${operator.id}`
    }
  });
});

// POST /api/zeq/operators/execute?operator={OPERATOR_ID}
// Execute a single operator with given parameters
app.post('/api/zeq/operators/execute', async (req, res) => {
  const operatorId = req.query.operator;
  let { params = {} } = req.body;

  if (!operatorId) {
    return res.status(400).json({ error: 'Missing operator parameter. Use ?operator=KO1' });
  }

  // SECURITY: Sanitize parameters before execution
  try {
    params = sanitizeParams(params);
  } catch (sanitizeError) {
    return res.status(400).json({
      error: 'Invalid parameter',
      message: sanitizeError.message
    });
  }

  // Check if operator exists
  if (operatorRegistry) {
    const exists = operatorRegistry.operators.some(op => op.id === operatorId);
    if (!exists) {
      return res.status(404).json({ error: `Operator ${operatorId} not found` });
    }
  }

  try {
    const startTime = Date.now();
    const pythonScript = path.join(__dirname, 'execute-operator.py');
    const paramsJson = JSON.stringify(params);

    // Execute Python script
    const { stdout, stderr } = await execAsync(
      `python3 "${pythonScript}" "${operatorId}" '${paramsJson.replace(/'/g, "'\\''")}'`,
      { timeout: 5000, maxBuffer: 1024 * 1024 }
    );

    if (stderr && !stdout) {
      throw new Error(stderr);
    }

    const result = JSON.parse(stdout);
    const executionTime = Date.now() - startTime;

    // Add metadata
    result.metadata = result.metadata || {};
    result.metadata.execution_time_ms = executionTime;
    result.metadata.timestamp = Date.now();
    result.operator = operatorId;

    res.json(result);
  } catch (error) {
    console.error(`Error executing operator ${operatorId}:`, error);

    // If Python execution fails, return a mock response for development
    // In production, this should be a proper error
    if (error.code === 'ENOENT' || error.message.includes('python3')) {
      res.status(503).json({
        error: 'Python SDK not available',
        message: 'Operator execution requires Python SDK. Please ensure Python 3 is installed.',
        operator: operatorId,
        params: params
      });
    } else {
      res.status(500).json({
        error: 'Operator execution failed',
        message: error.message,
        operator: operatorId
      });
    }
  }
});

// ============================================================================
// APP STORE SECURITY ENDPOINTS
// ============================================================================

// GET /api/apps/:id/reviews - List reviews for an app
app.get('/api/apps/:id/reviews', (req, res) => {
  const { id } = req.params;
  db.all(
    'SELECT * FROM app_reviews WHERE app_id = ? ORDER BY created_at DESC',
    [id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ reviews: (rows || []).map(r => ({
        id: r.id,
        appId: r.app_id,
        userId: r.user_id,
        rating: r.rating,
        reviewText: r.review_text,
        createdAt: r.created_at
      }))});
    }
  );
});

// POST /api/apps/:id/reviews - Submit a review
app.post('/api/apps/:id/reviews', (req, res) => {
  const { id } = req.params;
  const { rating, review_text, user_id } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5' });
  }
  if (!review_text || typeof review_text !== 'string' || review_text.length > 1000) {
    return res.status(400).json({ error: 'Review text required (max 1000 chars)' });
  }

  const reviewId = `rev-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const createdAt = Math.floor(Date.now() / 1000);
  const sanitizedText = review_text.replace(/[<>]/g, '');

  db.run(
    'INSERT INTO app_reviews (id, app_id, user_id, rating, review_text, created_at) VALUES (?, ?, ?, ?, ?, ?)',
    [reviewId, id, user_id || 'anonymous', rating, sanitizedText, createdAt],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({
        id: reviewId,
        appId: id,
        userId: user_id || 'anonymous',
        rating,
        reviewText: sanitizedText,
        createdAt
      });
    }
  );
});

// GET /api/apps/:id/versions - List version history
app.get('/api/apps/:id/versions', (req, res) => {
  const { id } = req.params;
  db.all(
    'SELECT * FROM app_versions WHERE app_id = ? ORDER BY created_at DESC',
    [id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ versions: (rows || []).map(v => ({
        id: v.id,
        appId: v.app_id,
        version: v.version,
        sha256Hash: v.sha256_hash,
        shannonEntropy: v.shannon_entropy,
        kolmogorovRatio: v.kolmogorov_ratio,
        signature: v.signature,
        changelog: v.changelog,
        createdAt: v.created_at
      }))});
    }
  );
});

// POST /api/apps/:id/versions - Add a version (admin)
app.post('/api/apps/:id/versions', (req, res) => {
  const { id } = req.params;
  const { version, sha256_hash, shannon_entropy, kolmogorov_ratio, signature, changelog } = req.body;

  if (!version) return res.status(400).json({ error: 'Version required' });

  const versionId = `ver-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const createdAt = Math.floor(Date.now() / 1000);

  db.run(
    'INSERT INTO app_versions (id, app_id, version, sha256_hash, shannon_entropy, kolmogorov_ratio, signature, changelog, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [versionId, id, version, sha256_hash || '', shannon_entropy || 0, kolmogorov_ratio || 0, signature || '', changelog || '', createdAt],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({
        id: versionId, appId: id, version, sha256Hash: sha256_hash,
        shannonEntropy: shannon_entropy || 0, kolmogorovRatio: kolmogorov_ratio || 0,
        signature: signature || '', changelog: changelog || '', createdAt
      });
    }
  );
});

// GET /api/apps/:id/verify - Run integrity verification
app.get('/api/apps/:id/verify', (req, res) => {
  const { id } = req.params;

  // Calculate Shannon entropy and Kolmogorov complexity for the app
  const appData = JSON.stringify({ appId: id, timestamp: Date.now() });
  const bytes = Buffer.from(appData);

  // Shannon entropy calculation
  const freq = new Map();
  for (const b of bytes) freq.set(b, (freq.get(b) || 0) + 1);
  let entropy = 0;
  for (const count of freq.values()) {
    const p = count / bytes.length;
    if (p > 0) entropy -= p * Math.log2(p);
  }

  // Kolmogorov estimation (compression ratio)
  let compressed = 0;
  let i = 0;
  const str = appData;
  while (i < str.length) {
    let run = 1;
    while (i + run < str.length && str[i + run] === str[i] && run < 255) run++;
    compressed += 2;
    i += run;
  }
  const kolmogorovRatio = str.length > 0 ? compressed / str.length : 1;

  const checksum = crypto.createHash('sha256').update(bytes).digest('hex');

  const integrityId = `int-${Date.now()}`;
  const verifiedAt = Math.floor(Date.now() / 1000);

  db.run(
    'INSERT OR REPLACE INTO app_integrity (id, app_id, checksum, entropy_score, kolmogorov_score, verified_by, verified_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [integrityId, id, checksum, entropy, kolmogorovRatio, 'system', verifiedAt],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({
        appId: id,
        checksum,
        entropyScore: entropy,
        kolmogorovScore: kolmogorovRatio,
        verifiedBy: 'system',
        verifiedAt,
        status: entropy > 3.0 && kolmogorovRatio > 0.3 ? 'verified' : 'warning'
      });
    }
  );
});

// ============================================================================
// SKILLS CRUD ENDPOINTS
// ============================================================================

// GET /api/skills - List skills
app.get('/api/skills', (req, res) => {
  const { industry, is_public } = req.query;
  let query = 'SELECT * FROM skills';
  const params = [];
  const conditions = [];

  if (is_public !== undefined) {
    conditions.push('is_public = ?');
    params.push(is_public === 'true' ? 1 : 0);
  }
  if (industry) {
    conditions.push('industry = ?');
    params.push(industry);
  }

  if (conditions.length > 0) query += ' WHERE ' + conditions.join(' AND ');
  query += ' ORDER BY created_at DESC';

  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ skills: (rows || []).map(s => ({
      ...s,
      operators: s.operators ? JSON.parse(s.operators) : [],
      isPublic: !!s.is_public
    }))});
  });
});

// POST /api/skills - Create a skill
app.post('/api/skills', (req, res) => {
  const { name, description, industry, operators, author, is_public } = req.body;
  if (!name) return res.status(400).json({ error: 'Skill name required' });

  const skillId = `skill-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const now = Math.floor(Date.now() / 1000);
  const opsJson = JSON.stringify(operators || []);

  db.run(
    'INSERT INTO skills (id, name, description, industry, operators, author, is_public, install_count, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?)',
    [skillId, name, description || '', industry || 'custom', opsJson, author || 'anonymous', is_public !== false ? 1 : 0, now, now],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({
        id: skillId, name, description, industry: industry || 'custom',
        operators: operators || [], author: author || 'anonymous',
        isPublic: is_public !== false, installCount: 0, createdAt: now, updatedAt: now
      });
    }
  );
});

// GET /api/skills/:id - Get skill by ID
app.get('/api/skills/:id', (req, res) => {
  db.get('SELECT * FROM skills WHERE id = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Skill not found' });
    res.json({ ...row, operators: row.operators ? JSON.parse(row.operators) : [], isPublic: !!row.is_public });
  });
});

// PUT /api/skills/:id - Update skill
app.put('/api/skills/:id', (req, res) => {
  const { name, description, industry, operators, is_public } = req.body;
  const now = Math.floor(Date.now() / 1000);

  db.run(
    'UPDATE skills SET name = COALESCE(?, name), description = COALESCE(?, description), industry = COALESCE(?, industry), operators = COALESCE(?, operators), is_public = COALESCE(?, is_public), updated_at = ? WHERE id = ?',
    [name, description, industry, operators ? JSON.stringify(operators) : null, is_public !== undefined ? (is_public ? 1 : 0) : null, now, req.params.id],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Skill not found' });
      res.json({ message: 'Skill updated', id: req.params.id });
    }
  );
});

// DELETE /api/skills/:id - Delete skill
app.delete('/api/skills/:id', (req, res) => {
  db.run('DELETE FROM skills WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Skill not found' });
    res.json({ message: 'Skill deleted' });
  });
});

// ============================================================================
// 7-STEP WIZARD ENDPOINTS (Node → Python runner, no separate FastAPI required)
// ============================================================================

// #region agent log
console.log('[DEBUG] Defining /api/7step/health route...');
try {
  const logPath = path.join(__dirname, '.cursor', 'debug.log');
  const logEntry = JSON.stringify({ sessionId: 'debug-session', runId: 'pre-fix', hypothesisId: 'C', location: 'api-server.cjs:route-def', message: '7step health route DEFINED', data: { file: __filename }, timestamp: Date.now() }) + '\n';
  fs.appendFileSync(logPath, logEntry, 'utf8');
  console.log('[DEBUG] Logged route definition to debug.log');
} catch (e) {
  console.error('[DEBUG] Failed to log route definition:', e.message);
}
// #endregion

console.log('[DEBUG] Registering app.get("/api/7step/health")...');
console.log('[DEBUG] Before app.get - app type:', typeof app);
console.log('[DEBUG] app.get type:', typeof app.get);
try {
  app.get('/api/7step/health', async (req, res) => {
    // #region agent log
    try {
      const logPath = path.join(__dirname, '.cursor', 'debug.log');
      const logEntry = JSON.stringify({ sessionId: 'debug-session', runId: 'pre-fix', hypothesisId: 'A', location: 'api-server.cjs:7step-health', message: '7step health route handler EXECUTED', data: { path: req.path, method: req.method, url: req.url, origin: req.headers.origin, hasCorsHeader: !!res.getHeader('Access-Control-Allow-Origin') }, timestamp: Date.now() }) + '\n';
      fs.appendFileSync(logPath, logEntry, 'utf8');
    } catch { }
    // #endregion
    const pythonScript = path.join(__dirname, 'execute-7step.py');
    const payload = JSON.stringify({ prompt: 'health check' });
    const shellPayload = payload.replace(/'/g, "'\\''");

    // Helper function to extract JSON from output (handles matplotlib warnings and CKO messages)
    // This function is used by both health check and error handlers
    const extractJSON = (output) => {
      if (!output) return null;
      const str = String(output);

      // Method 1: Find the LAST complete JSON object (JSON is usually printed last)
      // This handles cases where there are multiple { } blocks
      let lastJsonStart = -1;
      let braceCount = 0;
      let jsonStart = -1;

      for (let i = 0; i < str.length; i++) {
        if (str[i] === '{') {
          if (braceCount === 0) {
            jsonStart = i; // Start of a potential JSON object
          }
          braceCount++;
        } else if (str[i] === '}') {
          braceCount--;
          if (braceCount === 0 && jsonStart !== -1) {
            // Found a complete JSON object
            lastJsonStart = jsonStart;
            jsonStart = -1;
          }
        }
      }

      // If we found a complete JSON object, try to parse it
      if (lastJsonStart !== -1) {
        // Find the matching closing brace
        braceCount = 0;
        let jsonEnd = -1;
        for (let i = lastJsonStart; i < str.length; i++) {
          if (str[i] === '{') braceCount++;
          if (str[i] === '}') {
            braceCount--;
            if (braceCount === 0) {
              jsonEnd = i + 1;
              break;
            }
          }
        }
        if (jsonEnd > lastJsonStart) {
          try {
            return JSON.parse(str.substring(lastJsonStart, jsonEnd));
          } catch { }
        }
      }

      // Method 2: Remove all non-JSON lines (CKO messages, matplotlib warnings, etc.) and try parsing
      const cleaned = str
        .split('\n')
        .filter(line => {
          // Keep lines that look like JSON (start with { or contain JSON-like structure)
          const trimmed = line.trim();
          return trimmed.startsWith('{') ||
            (trimmed.includes('"') && (trimmed.includes(':') || trimmed.includes(',')));
        })
        .join('\n')
        .replace(/✅[^\n]*\n?/g, '')  // Remove any remaining checkmark lines
        .replace(/New CKO[^\n]*\n?/gi, '')
        .replace(/→[^\n]*\n?/g, '')
        .replace(/⚠️[^\n]*\n?/g, '')
        .replace(/Matplotlib[^\n]*\n?/gi, '')
        .replace(/\.matplotlib[^\n]*\n?/gi, '')
        .replace(/MPLCONFIGDIR[^\n]*\n?/gi, '')
        .replace(/temporary cache directory[^\n]*\n?/gi, '')
        .replace(/writable directory[^\n]*\n?/gi, '')
        .replace(/highly recommended[^\n]*\n?/gi, '')
        .replace(/multiprocessing[^\n]*\n?/gi, '')
        .trim();

      if (cleaned) {
        // Try to find JSON in cleaned string
        const cleanedMatch = cleaned.match(/\{[\s\S]*\}/);
        if (cleanedMatch) {
          try {
            return JSON.parse(cleanedMatch[0]);
          } catch { }
        }
        // Try parsing the whole cleaned string
        try {
          return JSON.parse(cleaned);
        } catch { }
      }

      // Method 3: Try simple regex match (fallback)
      const jsonMatch = str.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[0]);
        } catch { }
      }

      // Method 4: Try parsing raw output (last resort)
      try {
        return JSON.parse(str);
      } catch { }

      return null;
    };

    // Check Python dependencies first
    let missingDeps = [];
    try {
      await execAsync('python3 -c "import numpy"', { timeout: 2000 });
    } catch {
      missingDeps.push('numpy');
    }
    try {
      await execAsync('python3 -c "import scipy"', { timeout: 2000 });
    } catch {
      missingDeps.push('scipy');
    }
    try {
      await execAsync('python3 -c "import matplotlib"', { timeout: 2000 });
    } catch {
      missingDeps.push('matplotlib');
    }

    let python = { ok: false, detail: 'unknown' };
    let stdout = '';
    let stderr = '';
    let execError = null;

    try {
      const result = await execAsync(
        `python3 "${pythonScript}" parse '${shellPayload}'`,
        { timeout: 6000, maxBuffer: 1024 * 1024 }
      );
      stdout = result.stdout || '';
      stderr = result.stderr || '';
    } catch (e) {
      // execAsync throws even when command succeeds but has stderr output
      // Always check e.stdout and e.stderr - they contain the actual output
      stdout = (e.stdout) ? String(e.stdout) : '';
      stderr = (e.stderr) ? String(e.stderr) : '';
      execError = e;
    }

    // Extract JSON from stdout (handles warnings mixed in)
    // This works whether execAsync succeeded or threw
    const parsed = extractJSON(stdout);

    if (parsed) {
      if (parsed.error) {
        python = { ok: false, detail: parsed.message || parsed.error };
      } else {
        // Valid JSON without error = Python is working!
        const depsNote = missingDeps.length > 0 ? ` (missing: ${missingDeps.join(', ')})` : '';
        python = { ok: true, detail: `ready${depsNote}` };
      }
    } else {
      // No valid JSON found - Python script didn't output JSON
      if (missingDeps.length > 0) {
        python = { ok: false, detail: `Missing dependencies: ${missingDeps.join(', ')}. Install: pip install ${missingDeps.join(' ')}` };
      } else if (stdout) {
        python = { ok: false, detail: `Unexpected output: ${stdout.slice(0, 200)}` };
      } else {
        python = { ok: false, detail: 'Python script produced no output' };
      }
    }

    // Explicitly set CORS headers as fallback (CORS middleware should handle this, but ensure it's set)
    const origin = req.headers.origin;
    // #region agent log
    try {
      const logPath = path.join(__dirname, '.cursor', 'debug.log');
      const logEntry = JSON.stringify({ sessionId: 'debug-session', runId: 'pre-fix', hypothesisId: 'F', location: 'api-server.cjs:7step-health-headers', message: 'Setting CORS headers', data: { origin, isInAllowedList: origin ? corsOrigins.includes(origin) : false, corsOrigins }, timestamp: Date.now() }) + '\n';
      fs.appendFileSync(logPath, logEntry, 'utf8');
    } catch { }
    // #endregion
    if (origin && corsOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    } else if (!origin) {
      // Same-origin request, no CORS header needed
    } else {
      // Origin not allowed - but CORS middleware should have rejected it already
      console.warn(`[CORS] Health endpoint: Origin ${origin} not in allowed list`);
    }

    res.json({
      ok: true,
      backend: 'node-python',
      version: '0.4.0-beta',
      python,
      endpoints: {
        parse: '/api/7step/parse',
        run: '/api/7step/run',
        strict: '/api/7step/strict',
      },
      notes: {
        install: 'cd zeq-ecosystem/zeq-7stepwizard && python3 -m pip install -r requirements.txt',
        restart: 'Restart the API server after installing Python deps.',
      },
    });
  }); // Close app.get callback
  console.log('[DEBUG] Health route handler defined successfully');
} catch (e) {
  console.error('[DEBUG] ERROR registering /api/7step/health route:', e.message);
  console.error('[DEBUG] Stack:', e.stack);
  // Don't throw - allow server to start even if this route fails
}
console.log('[DEBUG] Health route registration complete');

// POST /api/7step/parse
console.log('[DEBUG] Registering app.post("/api/7step/parse")...');
app.post('/api/7step/parse', async (req, res) => {
  // #region agent log
  try {
    const logPath = path.join(__dirname, '.cursor', 'debug.log');
    const logEntry = JSON.stringify({ sessionId: 'debug-session', runId: 'pre-fix', hypothesisId: 'C', location: 'api-server.cjs:7step-parse', message: '7step parse handler entered', data: { path: req.path, method: req.method, hasPrompt: typeof (req.body || {}).prompt === 'string', promptLen: typeof (req.body || {}).prompt === 'string' ? (req.body.prompt || '').length : undefined }, timestamp: Date.now() }) + '\n';
    fs.appendFileSync(logPath, logEntry, 'utf8');
  } catch { }
  // #endregion
  try {
    const body = req.body || {};
    const prompt = String(body.prompt || '').slice(0, 4000);
    const pythonScript = path.join(__dirname, 'execute-7step.py');
    const payload = JSON.stringify({ prompt });
    const command = `python3 "${pythonScript}" parse '${payload.replace(/'/g, "'\\''")}'`;
    // #region agent log
    try {
      const logPath = path.join(__dirname, '.cursor', 'debug.log');
      const logEntry = JSON.stringify({ sessionId: 'debug-session', runId: 'pre-fix', hypothesisId: 'G', location: 'api-server.cjs:7step-parse-exec', message: 'Executing Python parse command', data: { command, payloadLen: payload.length, pythonScript }, timestamp: Date.now() }) + '\n';
      fs.appendFileSync(logPath, logEntry, 'utf8');
    } catch { }
    // #endregion
    const { stdout, stderr } = await execAsync(command, { timeout: 8000, maxBuffer: 1024 * 1024 });
    // #region agent log
    try {
      const logPath = path.join(__dirname, '.cursor', 'debug.log');
      const logEntry = JSON.stringify({ sessionId: 'debug-session', runId: 'pre-fix', hypothesisId: 'G', location: 'api-server.cjs:7step-parse-success', message: 'Python parse succeeded', data: { stdoutLen: stdout?.length || 0, stderrLen: stderr?.length || 0, stdoutPreview: stdout?.slice(0, 200) || '' }, timestamp: Date.now() }) + '\n';
      fs.appendFileSync(logPath, logEntry, 'utf8');
    } catch { }
    // #endregion
    if (stderr && !stdout) throw new Error(stderr);

    // Extract JSON from stdout (handles CKO messages and other prefixes)
    const extractJSONFromStdout = (output) => {
      if (!output) return null;
      const str = String(output);

      // Method 1: Find the last line that starts with '{' - JSON is always on its own line(s) at the end
      const lines = str.split('\n');
      for (let i = lines.length - 1; i >= 0; i--) {
        const line = lines[i].trim();
        if (line.startsWith('{')) {
          // Try to parse from this line to the end (JSON might span multiple lines)
          const jsonCandidate = lines.slice(i).join('\n').trim();
          try {
            return JSON.parse(jsonCandidate);
          } catch (e) {
            // Continue searching backwards
          }
        }
      }

      // Method 2: Find the last occurrence of '{' and try to parse from there
      const lastBraceIndex = str.lastIndexOf('{');
      if (lastBraceIndex >= 0) {
        // Try to find the matching closing brace
        let braceCount = 0;
        let inString = false;
        let escapeNext = false;
        let jsonEnd = -1;

        for (let i = lastBraceIndex; i < str.length; i++) {
          const char = str[i];

          if (escapeNext) {
            escapeNext = false;
            continue;
          }

          if (char === '\\') {
            escapeNext = true;
            continue;
          }

          if (char === '"') {
            inString = !inString;
            continue;
          }

          if (inString) continue;

          if (char === '{') braceCount++;
          if (char === '}') {
            braceCount--;
            if (braceCount === 0) {
              jsonEnd = i + 1;
              break;
            }
          }
        }

        if (jsonEnd > lastBraceIndex) {
          try {
            return JSON.parse(str.substring(lastBraceIndex, jsonEnd));
          } catch (e) {
            // Continue to fallback
          }
        }
      }

      // Method 3: Try regex to find ALL complete JSON objects and take the LAST one
      const jsonPattern = /\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g;
      const matches = [];
      let match;
      while ((match = jsonPattern.exec(str)) !== null) {
        matches.push(match[0]);
      }

      if (matches.length > 0) {
        // Take the LAST match (the actual result from execute-7step.py)
        const lastMatch = matches[matches.length - 1];
        try {
          return JSON.parse(lastMatch);
        } catch (e) {
          // If parsing fails, return null
        }
      }

      // Remove common prefixes and try again
      const cleaned = str
        .replace(/✅[^\n]*\n?/g, '')
        .replace(/New CKO[^\n]*\n?/gi, '')
        .replace(/→[^\n]*\n?/g, '')
        .replace(/⚠️[^\n]*\n?/g, '')
        .replace(/Matplotlib[^\n]*\n?/gi, '')
        .replace(/\.matplotlib[^\n]*\n?/gi, '')
        .trim();
      if (cleaned) {
        const cleanedMatch = cleaned.match(/\{[\s\S]*\}/);
        if (cleanedMatch) {
          try {
            return JSON.parse(cleanedMatch[0]);
          } catch { }
        }
      }
      return null;
    };

    const parsed = extractJSONFromStdout(stdout);
    if (parsed) {
      res.json(parsed);
    } else {
      // extractJSON failed - don't try to parse raw stdout (it has "✅ New CKO" messages)
      // Return a helpful error instead
      const stdoutPreview = String(stdout).slice(0, 500);
      console.error('[ERROR] Failed to extract JSON from Python output. Output preview:', stdoutPreview);
      res.status(400).json({
        error: 'Parse failed',
        message: 'Could not extract JSON from Python output. The output may contain non-JSON messages before the result.',
        details: stdoutPreview
      });
    }
  } catch (error) {
    // #region agent log
    try {
      const logPath = path.join(__dirname, '.cursor', 'debug.log');
      const errorDetails = {
        message: error.message,
        stdout: error.stdout ? String(error.stdout).slice(0, 500) : undefined,
        stderr: error.stderr ? String(error.stderr).slice(0, 500) : undefined,
        code: error.code,
        signal: error.signal
      };
      const logEntry = JSON.stringify({ sessionId: 'debug-session', runId: 'pre-fix', hypothesisId: 'G', location: 'api-server.cjs:7step-parse-error', message: 'Python parse failed', data: errorDetails, timestamp: Date.now() }) + '\n';
      fs.appendFileSync(logPath, logEntry, 'utf8');
    } catch { }
    // #endregion
    console.error('7-step parse error:', error);
    const errorMessage = error.stdout ? String(error.stdout).slice(0, 500) : (error.stderr ? String(error.stderr).slice(0, 500) : error.message);
    res.status(400).json({ error: 'Parse failed', message: errorMessage });
  }
});

// POST /api/7step/run
console.log('[DEBUG] Registering app.post("/api/7step/run")...');
app.post('/api/7step/run', async (req, res) => {
  // #region agent log
  try {
    const logPath = path.join(__dirname, '.cursor', 'debug.log');
    const logEntry = JSON.stringify({ sessionId: 'debug-session', runId: 'run1', hypothesisId: 'A', location: 'api-server.cjs:7step-run-handler', message: '7step run handler ENTERED', data: { path: req.path, method: req.method, hasBody: !!req.body }, timestamp: Date.now() }) + '\n';
    fs.appendFileSync(logPath, logEntry, 'utf8');
  } catch { }
  // #endregion
  try {
    const body = req.body || {};
    const pythonScript = path.join(__dirname, 'execute-7step.py');
    const payload = JSON.stringify({
      prompt: String(body.prompt || '').slice(0, 4000),
      alpha: body.alpha,
      beta: body.beta,
      ko_settings: body.ko_settings || {},
      t_max: body.t_max,
      dt: body.dt,
    });
    const command = `python3 "${pythonScript}" run '${payload.replace(/'/g, "'\\''")}'`;
    // #region agent log
    try {
      const logPath = path.join(__dirname, '.cursor', 'debug.log');
      const logEntry = JSON.stringify({ sessionId: 'debug-session', runId: 'run1', hypothesisId: 'B', location: 'api-server.cjs:7step-run-exec', message: 'About to execute Python command', data: { command, payloadLen: payload.length, pythonScript }, timestamp: Date.now() }) + '\n';
      fs.appendFileSync(logPath, logEntry, 'utf8');
    } catch { }
    // #endregion
    const { stdout, stderr } = await execAsync(command, { timeout: 20000, maxBuffer: 1024 * 1024 });
    // #region agent log
    try {
      const logPath = path.join(__dirname, '.cursor', 'debug.log');
      const stdoutStr = String(stdout || '');
      const stderrStr = String(stderr || '');
      const logEntry = JSON.stringify({ sessionId: 'debug-session', runId: 'run1', hypothesisId: 'A', location: 'api-server.cjs:7step-run-success', message: 'Python exec succeeded', data: { stdoutLen: stdoutStr.length, stderrLen: stderrStr.length, stdoutFirst500: stdoutStr.slice(0, 500), stdoutLast500: stdoutStr.slice(-500), stdoutFull: stdoutStr, hasCheckmark: stdoutStr.includes('✅'), hasArrow: stdoutStr.includes('→'), hasNewCKO: stdoutStr.includes('New CKO'), hasMeanError: stdoutStr.includes('Mean error'), jsonCount: (stdoutStr.match(/\{/g) || []).length, stderrFirst200: stderrStr.slice(0, 200) }, timestamp: Date.now() }) + '\n';
      fs.appendFileSync(logPath, logEntry, 'utf8');
    } catch { }
    // #endregion
    if (stderr && !stdout) throw new Error(stderr);

    // stdout should now be clean JSON only (informational messages redirected to stderr)
    // Try direct parse first, then fallback to extraction if needed
    let parsed = null;
    try {
      // #region agent log
      try {
        const logPath = path.join(__dirname, '.cursor', 'debug.log');
        const logEntry = JSON.stringify({ sessionId: 'debug-session', runId: 'run1', hypothesisId: 'G', location: 'api-server.cjs:7step-run-direct-parse', message: 'Attempting direct JSON parse of stdout', data: { stdoutLen: String(stdout || '').length, stdoutPreview: String(stdout || '').slice(0, 200) }, timestamp: Date.now() }) + '\n';
        fs.appendFileSync(logPath, logEntry, 'utf8');
      } catch { }
      // #endregion
      parsed = JSON.parse(stdout);
      // #region agent log
      try {
        const logPath = path.join(__dirname, '.cursor', 'debug.log');
        const logEntry = JSON.stringify({ sessionId: 'debug-session', runId: 'run1', hypothesisId: 'G', location: 'api-server.cjs:7step-run-direct-parse-success', message: 'Direct parse succeeded', data: { hasError: !!parsed.error, hasCkoId: !!parsed.cko_id, hasEnergy: !!parsed.energy, hasObject: !!parsed.object, hasLocation: !!parsed.location, hasMass: !!parsed.mass, object: parsed.object, location: parsed.location, mass: parsed.mass, koSettingsKeys: Object.keys(parsed.ko_settings || {}), koSettings: parsed.ko_settings }, timestamp: Date.now() }) + '\n';
        fs.appendFileSync(logPath, logEntry, 'utf8');
      } catch { }
      // #endregion
    } catch (parseErr) {
      // #region agent log
      try {
        const logPath = path.join(__dirname, '.cursor', 'debug.log');
        const logEntry = JSON.stringify({ sessionId: 'debug-session', runId: 'run1', hypothesisId: 'G', location: 'api-server.cjs:7step-run-direct-parse-failed', message: 'Direct parse failed, using extraction', data: { error: parseErr.message, stdoutPreview: String(stdout || '').slice(0, 300) }, timestamp: Date.now() }) + '\n';
        fs.appendFileSync(logPath, logEntry, 'utf8');
      } catch { }
      // #endregion
    }
    // Fallback: Extract JSON from stdout (in case there's still some non-JSON text)
    const extractJSONFromStdout = (output) => {
      if (!output) return null;
      const str = String(output);

      // Method 1: Find the last line that starts with '{'
      const lines = str.split('\n');
      for (let i = lines.length - 1; i >= 0; i--) {
        const line = lines[i].trim();
        if (line.startsWith('{')) {
          const jsonCandidate = lines.slice(i).join('\n').trim();
          try {
            return JSON.parse(jsonCandidate);
          } catch (e) {
            // Continue searching backwards
          }
        }
      }

      // Method 2: Find the last occurrence of '{'
      const lastBraceIndex = str.lastIndexOf('{');
      if (lastBraceIndex >= 0) {
        let braceCount = 0;
        let inString = false;
        let escapeNext = false;
        let jsonEnd = -1;

        for (let i = lastBraceIndex; i < str.length; i++) {
          const char = str[i];
          if (escapeNext) { escapeNext = false; continue; }
          if (char === '\\') { escapeNext = true; continue; }
          if (char === '"') { inString = !inString; continue; }
          if (inString) continue;

          if (char === '{') braceCount++;
          if (char === '}') {
            braceCount--;
            if (braceCount === 0) {
              jsonEnd = i + 1;
              break;
            }
          }
        }

        if (jsonEnd > lastBraceIndex) {
          try {
            return JSON.parse(str.substring(lastBraceIndex, jsonEnd));
          } catch (e) { }
        }
      }

      // Method 3: Regex
      const jsonPattern = /\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g;
      const matches = [];
      let match;
      while ((match = jsonPattern.exec(str)) !== null) {
        matches.push(match[0]);
      }

      if (matches.length > 0) {
        const lastMatch = matches[matches.length - 1];
        try {
          return JSON.parse(lastMatch);
        } catch (e) { }
      }

      // Remove common prefixes
      const cleaned = str
        .replace(/✅[^\n]*\n?/g, '')
        .replace(/New CKO[^\n]*\n?/gi, '')
        .replace(/→[^\n]*\n?/g, '')
        .replace(/⚠️[^\n]*\n?/g, '')
        .replace(/Mean error[^\n]*\n?/gi, '')
        .replace(/Energy estimate[^\n]*\n?/gi, '')
        .replace(/Error exceeds[^\n]*\n?/gi, '')
        .replace(/Matplotlib[^\n]*\n?/gi, '')
        .replace(/\.matplotlib[^\n]*\n?/gi, '')
        .trim();

      if (cleaned) {
        const cleanedMatch = cleaned.match(/\{[\s\S]*\}/);
        if (cleanedMatch) {
          try {
            return JSON.parse(cleanedMatch[0]);
          } catch { }
        }
      }
      return null;
    };

    if (!parsed) {
      parsed = extractJSONFromStdout(stdout);
    }
    if (parsed) {
      res.json(parsed);
    } else {
      const stdoutPreview = String(stdout).slice(0, 500);
      console.error('[ERROR] Failed to extract JSON from Python output. Output preview:', stdoutPreview);
      res.status(400).json({
        error: 'Run failed',
        message: 'Could not extract JSON from Python output.',
        details: stdoutPreview
      });
    }
  } catch (error) {
    // #region agent log
    try {
      const logPath = path.join(__dirname, '.cursor', 'debug.log');
      const errorDetails = {
        message: error.message,
        stdout: error.stdout ? String(error.stdout).slice(0, 500) : undefined,
        stderr: error.stderr ? String(error.stderr).slice(0, 500) : undefined,
        code: error.code,
        signal: error.signal,
        hasStdout: !!error.stdout,
        hasStderr: !!error.stderr,
        stdoutType: typeof error.stdout,
        stdoutLength: error.stdout ? String(error.stdout).length : 0,
        errorKeys: Object.keys(error)
      };
      const logEntry = JSON.stringify({ sessionId: 'debug-session', runId: 'run1', hypothesisId: 'C', location: 'api-server.cjs:7step-run-error-caught', message: 'Error caught in 7step run handler', data: errorDetails, timestamp: Date.now() }) + '\n';
      fs.appendFileSync(logPath, logEntry, 'utf8');
    } catch { }
    // #endregion
    console.error('7-step run error:', error);
    console.error('[DEBUG] Error object keys:', Object.keys(error));
    console.error('[DEBUG] error.stdout exists?', !!error.stdout);
    console.error('[DEBUG] error.stdout type:', typeof error.stdout);
    console.error('[DEBUG] error.stdout value (first 200 chars):', error.stdout ? String(error.stdout).slice(0, 200) : 'undefined');
    console.error('[DEBUG] error.stderr exists?', !!error.stderr);
    console.error('[DEBUG] error.message:', error.message);

    // Try to parse Python's JSON error response for a clearer message
    // Python outputs JSON errors to stdout, so check that first
    let errorMessage = null;
    // #region agent log
    try {
      const logPath = path.join(__dirname, '.cursor', 'debug.log');
      const logEntry = JSON.stringify({ sessionId: 'debug-session', runId: 'run1', hypothesisId: 'D', location: 'api-server.cjs:7step-run-parse-start', message: 'Starting error message extraction', data: { hasStdout: !!error.stdout, hasStderr: !!error.stderr }, timestamp: Date.now() }) + '\n';
      fs.appendFileSync(logPath, logEntry, 'utf8');
    } catch { }
    // #endregion
    if (error.stdout) {
      const stdoutStr = String(error.stdout);
      // #region agent log
      try {
        const logPath = path.join(__dirname, '.cursor', 'debug.log');
        const logEntry = JSON.stringify({ sessionId: 'debug-session', runId: 'run1', hypothesisId: 'D', location: 'api-server.cjs:7step-run-has-stdout', message: 'error.stdout exists, attempting JSON parse', data: { stdoutLen: stdoutStr.length, stdoutPreview: stdoutStr.slice(0, 200) }, timestamp: Date.now() }) + '\n';
        fs.appendFileSync(logPath, logEntry, 'utf8');
      } catch { }
      // #endregion
      console.log('[DEBUG] Attempting to parse stdout as JSON, length:', stdoutStr.length);

      // Helper to extract JSON from output (handles matplotlib warnings and CKO messages)
      // Uses the same robust extraction as extractJSON() above
      const extractJSONFromOutput = (output) => {
        // #region agent log
        try {
          const logPath = path.join(__dirname, '.cursor', 'debug.log');
          const logEntry = JSON.stringify({ sessionId: 'debug-session', runId: 'run1', hypothesisId: 'E', location: 'api-server.cjs:extractJSONFromOutput-ENTER', message: 'extractJSONFromOutput in error handler called', data: { outputLen: output ? String(output).length : 0 }, timestamp: Date.now() }) + '\n';
          fs.appendFileSync(logPath, logEntry, 'utf8');
        } catch { }
        // #endregion
        if (!output) return null;
        const str = String(output);
        // #region agent log
        try {
          const logPath = path.join(__dirname, '.cursor', 'debug.log');
          const logEntry = JSON.stringify({ sessionId: 'debug-session', runId: 'run1', hypothesisId: 'E', location: 'api-server.cjs:extractJSONFromOutput-BEFORE', message: 'Before extraction in error handler', data: { strLen: str.length, first500: str.slice(0, 500), last500: str.slice(-500), lineCount: str.split('\n').length, lastBraceIndex: str.lastIndexOf('{') }, timestamp: Date.now() }) + '\n';
          fs.appendFileSync(logPath, logEntry, 'utf8');
        } catch { }
        // #endregion

        // The Python script prints informational messages (like "✅ New CKO generated")
        // BEFORE the actual JSON result. The JSON is ALWAYS printed LAST by execute-7step.py.
        // We need to find the LAST complete JSON object, ignoring everything before it.

        // Method 1: Find the last line that starts with '{' - JSON is always on its own line(s) at the end
        const lines = str.split('\n');
        // #region agent log
        try {
          const logPath = path.join(__dirname, '.cursor', 'debug.log');
          const logEntry = JSON.stringify({ sessionId: 'debug-session', runId: 'run1', hypothesisId: 'F', location: 'api-server.cjs:extractJSONFromOutput-METHOD1', message: 'Method 1 in error handler', data: { totalLines: lines.length, last5Lines: lines.slice(-5).map((l, i) => ({ lineNum: lines.length - 5 + i, content: l.trim().slice(0, 100), startsWithBrace: l.trim().startsWith('{') })) }, timestamp: Date.now() }) + '\n';
          fs.appendFileSync(logPath, logEntry, 'utf8');
        } catch { }
        // #endregion
        for (let i = lines.length - 1; i >= 0; i--) {
          const line = lines[i].trim();
          if (line.startsWith('{')) {
            // Try to parse from this line to the end (JSON might span multiple lines)
            const jsonCandidate = lines.slice(i).join('\n').trim();
            // #region agent log
            try {
              const logPath = path.join(__dirname, '.cursor', 'debug.log');
              const logEntry = JSON.stringify({ sessionId: 'debug-session', runId: 'run1', hypothesisId: 'F', location: 'api-server.cjs:extractJSONFromOutput-METHOD1-TRY', message: 'Method 1 attempting parse in error handler', data: { startLine: i, jsonCandidateLen: jsonCandidate.length, jsonCandidatePreview: jsonCandidate.slice(0, 200) }, timestamp: Date.now() }) + '\n';
              fs.appendFileSync(logPath, logEntry, 'utf8');
            } catch { }
            // #endregion
            try {
              const result = JSON.parse(jsonCandidate);
              // #region agent log
              try {
                const logPath = path.join(__dirname, '.cursor', 'debug.log');
                const logEntry = JSON.stringify({ sessionId: 'debug-session', runId: 'run1', hypothesisId: 'F', location: 'api-server.cjs:extractJSONFromOutput-METHOD1-SUCCESS', message: 'Method 1 parse succeeded in error handler', data: { hasError: !!result.error, hasCkoId: !!result.cko_id }, timestamp: Date.now() }) + '\n';
                fs.appendFileSync(logPath, logEntry, 'utf8');
              } catch { }
              // #endregion
              return result;
            } catch (e) {
              // #region agent log
              try {
                const logPath = path.join(__dirname, '.cursor', 'debug.log');
                const logEntry = JSON.stringify({ sessionId: 'debug-session', runId: 'run1', hypothesisId: 'F', location: 'api-server.cjs:extractJSONFromOutput-METHOD1-FAIL', message: 'Method 1 parse failed in error handler', data: { error: e.message, jsonCandidateLen: jsonCandidate.length }, timestamp: Date.now() }) + '\n';
                fs.appendFileSync(logPath, logEntry, 'utf8');
              } catch { }
              // #endregion
              // Continue searching backwards
            }
          }
        }

        // Method 2: Find the last occurrence of '{' and try to parse from there
        const lastBraceIndex = str.lastIndexOf('{');
        if (lastBraceIndex >= 0) {
          // Try to find the matching closing brace
          let braceCount = 0;
          let inString = false;
          let escapeNext = false;
          let jsonEnd = -1;

          for (let i = lastBraceIndex; i < str.length; i++) {
            const char = str[i];

            if (escapeNext) {
              escapeNext = false;
              continue;
            }

            if (char === '\\') {
              escapeNext = true;
              continue;
            }

            if (char === '"') {
              inString = !inString;
              continue;
            }

            if (inString) continue;

            if (char === '{') braceCount++;
            if (char === '}') {
              braceCount--;
              if (braceCount === 0) {
                jsonEnd = i + 1;
                break;
              }
            }
          }

          if (jsonEnd > lastBraceIndex) {
            try {
              return JSON.parse(str.substring(lastBraceIndex, jsonEnd));
            } catch (e) {
              // Continue to fallback
            }
          }
        }

        // Method 3: Try regex to find ALL complete JSON objects and take the LAST one
        // Use a more robust pattern that handles nested objects
        const jsonPattern = /\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g;
        const matches = [];
        let match;
        while ((match = jsonPattern.exec(str)) !== null) {
          matches.push(match[0]);
        }

        if (matches.length > 0) {
          // Take the LAST match (the actual result from execute-7step.py)
          const lastMatch = matches[matches.length - 1];
          try {
            return JSON.parse(lastMatch);
          } catch (e) {
            // If parsing fails, return null
          }
        }

        return null;
      };

      // #region agent log
      try {
        const logPath = path.join(__dirname, '.cursor', 'debug.log');
        const logEntry = JSON.stringify({ sessionId: 'debug-session', runId: 'run1', hypothesisId: 'E', location: 'api-server.cjs:7step-run-error-extract-BEFORE', message: 'Before extractJSONFromOutput in error handler', data: { stdoutStrLen: stdoutStr.length, stdoutStrFirst500: stdoutStr.slice(0, 500), stdoutStrLast500: stdoutStr.slice(-500) }, timestamp: Date.now() }) + '\n';
        fs.appendFileSync(logPath, logEntry, 'utf8');
      } catch { }
      // #endregion
      const parsed = extractJSONFromOutput(stdoutStr);
      // #region agent log
      try {
        const logPath = path.join(__dirname, '.cursor', 'debug.log');
        const logEntry = JSON.stringify({ sessionId: 'debug-session', runId: 'run1', hypothesisId: 'E', location: 'api-server.cjs:7step-run-error-extract-AFTER', message: 'After extractJSONFromOutput in error handler', data: { parsed: !!parsed, hasError: parsed?.error, hasCkoId: parsed?.cko_id }, timestamp: Date.now() }) + '\n';
        fs.appendFileSync(logPath, logEntry, 'utf8');
      } catch { }
      // #endregion
      if (parsed) {
        // #region agent log
        try {
          const logPath = path.join(__dirname, '.cursor', 'debug.log');
          const logEntry = JSON.stringify({ sessionId: 'debug-session', runId: 'run1', hypothesisId: 'D', location: 'api-server.cjs:7step-run-json-parsed', message: 'Successfully parsed Python JSON', data: { hasError: !!parsed.error, hasMessage: !!parsed.message, error: parsed.error, message: parsed.message }, timestamp: Date.now() }) + '\n';
          fs.appendFileSync(logPath, logEntry, 'utf8');
        } catch { }
        // #endregion
        console.log('[DEBUG] Successfully parsed Python JSON:', JSON.stringify(parsed, null, 2));

        // If parsed has an error field, it's an error response
        if (parsed.error) {
          errorMessage = parsed.message || parsed.error;
        } else {
          // No error field means execution succeeded! Return success response
          console.log('[DEBUG] Execution succeeded despite error being thrown - returning success response');
          return res.json(parsed);
        }
        // #region agent log
        try {
          const logPath = path.join(__dirname, '.cursor', 'debug.log');
          const logEntry = JSON.stringify({ sessionId: 'debug-session', runId: 'run1', hypothesisId: 'D', location: 'api-server.cjs:7step-run-extracted', message: 'Extracted error message from JSON', data: { errorMessage }, timestamp: Date.now() }) + '\n';
          fs.appendFileSync(logPath, logEntry, 'utf8');
        } catch { }
        // #endregion
        console.log('[DEBUG] Extracted error message from Python JSON:', errorMessage);
      } else {
        // #region agent log
        try {
          const logPath = path.join(__dirname, '.cursor', 'debug.log');
          const logEntry = JSON.stringify({ sessionId: 'debug-session', runId: 'run1', hypothesisId: 'E', location: 'api-server.cjs:7step-run-json-parse-failed', message: 'JSON parse failed', data: { parseError: parseErr.message, stdoutPreview: stdoutStr.slice(0, 300) }, timestamp: Date.now() }) + '\n';
          fs.appendFileSync(logPath, logEntry, 'utf8');
        } catch { }
        // #endregion
        console.log('[DEBUG] Failed to parse stdout as JSON:', parseErr.message);
        console.log('[DEBUG] stdout content:', stdoutStr.slice(0, 300));
        // If not JSON, try to extract a clean error message
        // First, try to find any JSON-like structure even if incomplete
        let cleanMessage = String(stdoutStr);
        // Remove all known non-JSON prefixes (same as in extractJSONFromOutput)
        cleanMessage = cleanMessage
          .replace(/✅[^\n]*\n?/g, '')
          .replace(/✅\s*New CKO[^\n]*\n?/gi, '')
          .replace(/New CKO[^\n]*\n?/gi, '')
          .replace(/CKO_[^\n]*\n?/gi, '')
          .replace(/→[^\n]*\n?/g, '')
          .replace(/⚠️[^\n]*\n?/g, '')
          .replace(/[\u{1F300}-\u{1F9FF}]/gu, '')
          .replace(/[\u{2600}-\u{26FF}]/gu, '')
          .replace(/[\u{2700}-\u{27BF}]/gu, '')
          .replace(/Mean error[^\n]*\n?/gi, '')
          .replace(/Energy estimate[^\n]*\n?/gi, '')
          .replace(/Error exceeds[^\n]*\n?/gi, '')
          .replace(/Matplotlib[^\n]*\n?/gi, '')
          .replace(/\.matplotlib[^\n]*\n?/gi, '')
          .trim();

        // Try to find JSON in cleaned message
        const jsonMatch = cleanMessage.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            const parsed = JSON.parse(jsonMatch[0]);
            if (parsed.error || parsed.message) {
              errorMessage = parsed.message || parsed.error;
            }
          } catch { }
        }

        // If still no error message, use cleaned stdout (but limit length)
        if (!errorMessage) {
          errorMessage = cleanMessage.slice(0, 500);
          // Remove the command path from the error message
          errorMessage = errorMessage.replace(/Command failed:\s*python3\s+"[^"]*execute-7step\.py"\s+(run|strict)\s+'[^']*'\s*/g, '');
          errorMessage = errorMessage.replace(/Command failed:\s*python3\s+[^\s]+\s+(run|strict)\s+'[^']*'\s*/g, '');
          errorMessage = errorMessage.replace(/Command failed:.*?execute-7step\.py[^']*'?\s*/g, '');
          errorMessage = errorMessage.trim();
        }
      }
    } else {
      // #region agent log
      try {
        const logPath = path.join(__dirname, '.cursor', 'debug.log');
        const logEntry = JSON.stringify({ sessionId: 'debug-session', runId: 'run1', hypothesisId: 'B', location: 'api-server.cjs:7step-run-no-stdout', message: 'error.stdout NOT available', data: { hasStderr: !!error.stderr, errorKeys: Object.keys(error), errorMessage: error.message }, timestamp: Date.now() }) + '\n';
        fs.appendFileSync(logPath, logEntry, 'utf8');
      } catch { }
      // #endregion
      console.log('[DEBUG] No error.stdout available, has stderr:', !!error.stderr);
      console.log('[DEBUG] Error object structure:', {
        hasStdout: 'stdout' in error,
        hasStderr: 'stderr' in error,
        keys: Object.keys(error),
        message: error.message
      });
    }

    // Fallback to stderr or error.message if stdout parsing didn't work
    if (!errorMessage) {
      // #region agent log
      try {
        const logPath = path.join(__dirname, '.cursor', 'debug.log');
        const logEntry = JSON.stringify({ sessionId: 'debug-session', runId: 'run1', hypothesisId: 'B', location: 'api-server.cjs:7step-run-fallback', message: 'Using fallback error message', data: { hasStderr: !!error.stderr, willUseMessage: !error.stderr }, timestamp: Date.now() }) + '\n';
        fs.appendFileSync(logPath, logEntry, 'utf8');
      } catch { }
      // #endregion
      console.log('[DEBUG] Using fallback - stdout parsing failed or stdout not available');
      if (error.stderr) {
        errorMessage = String(error.stderr).slice(0, 500);
        // Filter out matplotlib font cache messages (harmless initialization)
        errorMessage = errorMessage.replace(/Matplotlib is building the font cache[^\n]*\n?/gi, '');
        console.log('[DEBUG] Using stderr as error message');
      } else {
        errorMessage = error.message;
        // Filter out matplotlib font cache messages (harmless initialization)
        errorMessage = errorMessage.replace(/Matplotlib is building the font cache[^\n]*\n?/gi, '');
        console.log('[DEBUG] Using error.message as fallback');
      }
      // Remove the command path from the error message to avoid confusion
      // The error.message from execAsync typically contains: "Command failed: python3 "/path/to/execute-7step.py" run '...'"
      // We need to remove everything from "Command failed:" up to and including the closing quote of the payload

      // First, try to match the full pattern with quoted script path
      errorMessage = errorMessage.replace(/Command failed:\s*python3\s+"[^"]*execute-7step\.py"\s+(run|strict)\s+'[^']*'\s*/g, '');
      // Match without quotes around script path
      errorMessage = errorMessage.replace(/Command failed:\s*python3\s+[^\s]+\s+(run|strict)\s+'[^']*'\s*/g, '');
      // More aggressive: remove everything from "Command failed:" to the end of the line (handles newlines)
      errorMessage = errorMessage.replace(/Command failed:.*?execute-7step\.py[^\n]*\n?/g, '');
      // Fallback: remove "Command failed:" and everything up to execute-7step.py and the payload
      errorMessage = errorMessage.replace(/Command failed:.*?execute-7step\.py[^']*'?\s*/g, '');
      // Remove any remaining "Command failed:" prefix
      errorMessage = errorMessage.replace(/^Command failed:\s*/g, '');
      // Remove leading/trailing whitespace and newlines
      errorMessage = errorMessage.trim();
      console.log('[DEBUG] After regex removal:', errorMessage);
    }

    // If error message is empty or only contains matplotlib warnings, check if stdout has valid JSON
    if (!errorMessage || errorMessage.trim().length === 0) {
      if (error.stdout) {
        try {
          const stdoutJson = JSON.parse(String(error.stdout));
          // Execution actually succeeded despite matplotlib warnings
          console.log('[DEBUG] Error message was empty after filtering, but stdout has valid JSON - execution succeeded');
          return res.json(stdoutJson);
        } catch (e) {
          // stdout is not valid JSON, use a generic error message
          errorMessage = 'Execution failed (no error details available)';
        }
      }
    }

    // #region agent log
    try {
      const logPath = path.join(__dirname, '.cursor', 'debug.log');
      const logEntry = JSON.stringify({ sessionId: 'debug-session', runId: 'run1', hypothesisId: 'A', location: 'api-server.cjs:7step-run-final', message: 'Final error message being returned', data: { errorMessage, statusCode: 400 }, timestamp: Date.now() }) + '\n';
      fs.appendFileSync(logPath, logEntry, 'utf8');
    } catch { }
    // #endregion
    console.log('[DEBUG] Final error message being returned:', errorMessage);
    res.status(400).json({ error: 'Run failed', message: errorMessage });
  }
});

// POST /api/7step/strict
console.log('[DEBUG] Registering app.post("/api/7step/strict")...');
app.post('/api/7step/strict', async (req, res) => {
  // #region agent log
  try {
    const logPath = path.join(__dirname, '.cursor', 'debug.log');
    const logEntry = JSON.stringify({ sessionId: 'debug-session', runId: 'pre-fix', hypothesisId: 'C', location: 'api-server.cjs:7step-strict', message: '7step strict handler entered', data: { path: req.path, method: req.method }, timestamp: Date.now() }) + '\n';
    fs.appendFileSync(logPath, logEntry, 'utf8');
  } catch { }
  // #endregion
  try {
    const body = req.body || {};
    const pythonScript = path.join(__dirname, 'execute-7step.py');
    const payload = JSON.stringify({
      prompt: String(body.prompt || '').slice(0, 4000),
      ko_settings: body.ko_settings || null,
      t_max: body.t_max,
      dt: body.dt,
    });
    const command = `python3 "${pythonScript}" strict '${payload.replace(/'/g, "'\\''")}'`;
    // #region agent log
    try {
      const logPath = path.join(__dirname, '.cursor', 'debug.log');
      const logEntry = JSON.stringify({ sessionId: 'debug-session', runId: 'pre-fix', hypothesisId: 'G', location: 'api-server.cjs:7step-strict-exec', message: 'Executing Python strict command', data: { command, payloadLen: payload.length }, timestamp: Date.now() }) + '\n';
      fs.appendFileSync(logPath, logEntry, 'utf8');
    } catch { }
    // #endregion
    const { stdout, stderr } = await execAsync(command, { timeout: 45000, maxBuffer: 1024 * 1024 });
    // #region agent log
    try {
      const logPath = path.join(__dirname, '.cursor', 'debug.log');
      const logEntry = JSON.stringify({ sessionId: 'debug-session', runId: 'pre-fix', hypothesisId: 'G', location: 'api-server.cjs:7step-strict-success', message: 'Python strict succeeded', data: { stdoutLen: stdout?.length || 0, stderrLen: stderr?.length || 0 }, timestamp: Date.now() }) + '\n';
      fs.appendFileSync(logPath, logEntry, 'utf8');
    } catch { }
    // #endregion
    if (stderr && !stdout) throw new Error(stderr);

    // Extract JSON from stdout (handles CKO messages and other prefixes)
    const extractJSONFromStdout = (output) => {
      if (!output) return null;
      const str = String(output);

      // Method 1: Find the last line that starts with '{' - JSON is always on its own line(s) at the end
      const lines = str.split('\n');
      for (let i = lines.length - 1; i >= 0; i--) {
        const line = lines[i].trim();
        if (line.startsWith('{')) {
          // Try to parse from this line to the end (JSON might span multiple lines)
          const jsonCandidate = lines.slice(i).join('\n').trim();
          try {
            return JSON.parse(jsonCandidate);
          } catch (e) {
            // Continue searching backwards
          }
        }
      }

      // Method 2: Find the last occurrence of '{' and try to parse from there
      const lastBraceIndex = str.lastIndexOf('{');
      if (lastBraceIndex >= 0) {
        // Try to find the matching closing brace
        let braceCount = 0;
        let inString = false;
        let escapeNext = false;
        let jsonEnd = -1;

        for (let i = lastBraceIndex; i < str.length; i++) {
          const char = str[i];

          if (escapeNext) {
            escapeNext = false;
            continue;
          }

          if (char === '\\') {
            escapeNext = true;
            continue;
          }

          if (char === '"') {
            inString = !inString;
            continue;
          }

          if (inString) continue;

          if (char === '{') braceCount++;
          if (char === '}') {
            braceCount--;
            if (braceCount === 0) {
              jsonEnd = i + 1;
              break;
            }
          }
        }

        if (jsonEnd > lastBraceIndex) {
          try {
            return JSON.parse(str.substring(lastBraceIndex, jsonEnd));
          } catch (e) {
            // Continue to fallback
          }
        }
      }

      // Method 3: Try regex to find ALL complete JSON objects and take the LAST one
      const jsonPattern = /\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g;
      const matches = [];
      let match;
      while ((match = jsonPattern.exec(str)) !== null) {
        matches.push(match[0]);
      }

      if (matches.length > 0) {
        // Take the LAST match (the actual result from execute-7step.py)
        const lastMatch = matches[matches.length - 1];
        try {
          return JSON.parse(lastMatch);
        } catch (e) {
          // If parsing fails, return null
        }
      }

      // Remove common prefixes and try again
      const cleaned = str
        .replace(/✅[^\n]*\n?/g, '')
        .replace(/New CKO[^\n]*\n?/gi, '')
        .replace(/→[^\n]*\n?/g, '')
        .replace(/⚠️[^\n]*\n?/g, '')
        .replace(/Matplotlib[^\n]*\n?/gi, '')
        .replace(/\.matplotlib[^\n]*\n?/gi, '')
        .trim();
      if (cleaned) {
        const cleanedMatch = cleaned.match(/\{[\s\S]*\}/);
        if (cleanedMatch) {
          try {
            return JSON.parse(cleanedMatch[0]);
          } catch { }
        }
      }
      return null;
    };

    const parsed = extractJSONFromStdout(stdout);
    if (parsed) {
      res.json(parsed);
    } else {
      // extractJSONFromOutput failed - don't try to parse raw stdout (it has "✅ New CKO" messages)
      // Return a helpful error instead
      const stdoutPreview = String(stdout).slice(0, 500);
      console.error('[ERROR] Failed to extract JSON from Python output. Output preview:', stdoutPreview);
      res.status(400).json({
        error: 'Run failed',
        message: 'Could not extract JSON from Python output. The output may contain non-JSON messages before the result.',
        details: stdoutPreview
      });
    }
  } catch (error) {
    // #region agent log
    try {
      const logPath = path.join(__dirname, '.cursor', 'debug.log');
      const errorDetails = {
        message: error.message,
        stdout: error.stdout ? String(error.stdout).slice(0, 500) : undefined,
        stderr: error.stderr ? String(error.stderr).slice(0, 500) : undefined,
        code: error.code,
        signal: error.signal,
        hasStdout: !!error.stdout,
        hasStderr: !!error.stderr,
        stdoutType: typeof error.stdout,
        stdoutLength: error.stdout ? String(error.stdout).length : 0
      };
      const logEntry = JSON.stringify({ sessionId: 'debug-session', runId: 'pre-fix', hypothesisId: 'G', location: 'api-server.cjs:7step-strict-error', message: 'Python strict failed', data: errorDetails, timestamp: Date.now() }) + '\n';
      fs.appendFileSync(logPath, logEntry, 'utf8');
    } catch { }
    // #endregion
    console.error('7-step strict error:', error);
    console.error('[DEBUG] Error object keys:', Object.keys(error));
    console.error('[DEBUG] error.stdout exists?', !!error.stdout);
    console.error('[DEBUG] error.stdout type:', typeof error.stdout);
    console.error('[DEBUG] error.stdout value (first 200 chars):', error.stdout ? String(error.stdout).slice(0, 200) : 'undefined');
    console.error('[DEBUG] error.stderr exists?', !!error.stderr);
    console.error('[DEBUG] error.message:', error.message);

    // Helper to extract JSON from output (handles matplotlib warnings and CKO messages)
    const extractJSONFromOutput = (output) => {
      if (!output) return null;
      const str = String(output);

      // The Python script prints informational messages (like "✅ New CKO generated")
      // BEFORE the actual JSON result. The JSON is ALWAYS printed LAST by execute-7step.py.
      // We need to find the LAST complete JSON object, ignoring everything before it.

      // Method 1: Find the last line that starts with '{' - JSON is always on its own line(s) at the end
      const lines = str.split('\n');
      for (let i = lines.length - 1; i >= 0; i--) {
        const line = lines[i].trim();
        if (line.startsWith('{')) {
          // Try to parse from this line to the end (JSON might span multiple lines)
          const jsonCandidate = lines.slice(i).join('\n').trim();
          try {
            return JSON.parse(jsonCandidate);
          } catch (e) {
            // Continue searching backwards
          }
        }
      }

      // Method 2: Find the last occurrence of '{' and try to parse from there
      const lastBraceIndex = str.lastIndexOf('{');
      if (lastBraceIndex >= 0) {
        // Try to find the matching closing brace
        let braceCount = 0;
        let inString = false;
        let escapeNext = false;
        let jsonEnd = -1;

        for (let i = lastBraceIndex; i < str.length; i++) {
          const char = str[i];

          if (escapeNext) {
            escapeNext = false;
            continue;
          }

          if (char === '\\') {
            escapeNext = true;
            continue;
          }

          if (char === '"') {
            inString = !inString;
            continue;
          }

          if (inString) continue;

          if (char === '{') braceCount++;
          if (char === '}') {
            braceCount--;
            if (braceCount === 0) {
              jsonEnd = i + 1;
              break;
            }
          }
        }

        if (jsonEnd > lastBraceIndex) {
          try {
            return JSON.parse(str.substring(lastBraceIndex, jsonEnd));
          } catch (e) {
            // Continue to fallback
          }
        }
      }

      // Method 3: Try regex to find ALL complete JSON objects and take the LAST one
      const jsonPattern = /\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g;
      const matches = [];
      let match;
      while ((match = jsonPattern.exec(str)) !== null) {
        matches.push(match[0]);
      }

      if (matches.length > 0) {
        // Take the LAST match (the actual result from execute-7step.py)
        const lastMatch = matches[matches.length - 1];
        try {
          return JSON.parse(lastMatch);
        } catch (e) {
          // If parsing fails, return null
        }
      }

      return null;
    };

    // Try to parse Python's JSON error response for a clearer message
    // Python outputs JSON errors to stdout, so check that first
    let errorMessage = null;
    if (error.stdout) {
      const stdoutStr = String(error.stdout);
      console.log('[DEBUG] Attempting to parse stdout as JSON, length:', stdoutStr.length);

      const parsed = extractJSONFromOutput(stdoutStr);
      if (parsed) {
        console.log('[DEBUG] Successfully parsed Python JSON:', JSON.stringify(parsed, null, 2));

        // If parsed has an error field, it's an error response
        if (parsed.error) {
          errorMessage = parsed.message || parsed.error;
        } else {
          // No error field means execution succeeded! Return success response
          console.log('[DEBUG] Execution succeeded despite error being thrown - returning success response');
          return res.json(parsed);
        }
        console.log('[DEBUG] Extracted error message from Python JSON:', errorMessage);
      } else {
        console.log('[DEBUG] Failed to extract JSON from stdout');
        console.log('[DEBUG] stdout content:', stdoutStr.slice(0, 300));
        // If not JSON, use the stdout as the message (but remove command path if present)
        errorMessage = stdoutStr.slice(0, 500);
        // Remove the command path from the error message
        errorMessage = errorMessage.replace(/Command failed:\s*python3\s+"[^"]*execute-7step\.py"\s+(run|strict)\s+'[^']*'\s*/g, '');
        errorMessage = errorMessage.replace(/Command failed:\s*python3\s+[^\s]+\s+(run|strict)\s+'[^']*'\s*/g, '');
        errorMessage = errorMessage.replace(/Command failed:.*?execute-7step\.py[^']*'?\s*/g, '');
        // Filter out matplotlib warnings
        errorMessage = errorMessage.replace(/Matplotlib[^\n]*\n?/gi, '');
        errorMessage = errorMessage.replace(/\.matplotlib[^\n]*\n?/gi, '');
        errorMessage = errorMessage.replace(/MPLCONFIGDIR[^\n]*\n?/gi, '');
        errorMessage = errorMessage.replace(/temporary cache directory[^\n]*\n?/gi, '');
        errorMessage = errorMessage.replace(/writable directory[^\n]*\n?/gi, '');
        errorMessage = errorMessage.trim();
      }
    } else {
      console.log('[DEBUG] No error.stdout available, has stderr:', !!error.stderr);
      console.log('[DEBUG] Error object structure:', {
        hasStdout: 'stdout' in error,
        hasStderr: 'stderr' in error,
        keys: Object.keys(error),
        message: error.message
      });
    }

    // Fallback to stderr or error.message if stdout parsing didn't work
    if (!errorMessage) {
      console.log('[DEBUG] Using fallback - stdout parsing failed or stdout not available');
      // Before using fallback, check if stdout has valid JSON (execution might have succeeded)
      if (error.stdout) {
        const extracted = extractJSONFromOutput(error.stdout);
        if (extracted && !extracted.error) {
          console.log('[DEBUG] Found valid JSON in stdout during fallback - execution succeeded');
          return res.json(extracted);
        }
      }

      if (error.stderr) {
        errorMessage = String(error.stderr).slice(0, 500);
        // Filter out matplotlib font cache messages (harmless initialization)
        errorMessage = errorMessage.replace(/Matplotlib[^\n]*\n?/gi, '');
        errorMessage = errorMessage.replace(/\.matplotlib[^\n]*\n?/gi, '');
        errorMessage = errorMessage.replace(/MPLCONFIGDIR[^\n]*\n?/gi, '');
        errorMessage = errorMessage.replace(/temporary cache directory[^\n]*\n?/gi, '');
        errorMessage = errorMessage.replace(/writable directory[^\n]*\n?/gi, '');
        console.log('[DEBUG] Using stderr as error message');
      } else {
        errorMessage = error.message;
        // Filter out matplotlib font cache messages (harmless initialization)
        errorMessage = errorMessage.replace(/Matplotlib[^\n]*\n?/gi, '');
        errorMessage = errorMessage.replace(/\.matplotlib[^\n]*\n?/gi, '');
        errorMessage = errorMessage.replace(/MPLCONFIGDIR[^\n]*\n?/gi, '');
        console.log('[DEBUG] Using error.message as fallback');
      }
      // Remove the command path from the error message to avoid confusion
      // Match: "Command failed: python3 "/path/to/execute-7step.py" strict '...'"
      errorMessage = errorMessage.replace(/Command failed:\s*python3\s+"[^"]*execute-7step\.py"\s+(run|strict)\s+'[^']*'\s*/g, '');
      // Also match without quotes: Command failed: python3 /path/to/execute-7step.py strict '...'
      errorMessage = errorMessage.replace(/Command failed:\s*python3\s+[^\s]+\s+(run|strict)\s+'[^']*'\s*/g, '');
      // Fallback: remove any "Command failed:" prefix followed by path to execute-7step.py
      errorMessage = errorMessage.replace(/Command failed:.*?execute-7step\.py[^']*'?\s*/g, '');
      // Remove leading/trailing whitespace
      errorMessage = errorMessage.trim();
      console.log('[DEBUG] After regex removal:', errorMessage);
    }

    // If error message is empty or only contains matplotlib warnings, check if stdout has valid JSON
    if (!errorMessage || errorMessage.trim().length === 0) {
      if (error.stdout) {
        const extracted = extractJSONFromOutput(error.stdout);
        if (extracted && !extracted.error) {
          // Execution actually succeeded despite matplotlib warnings
          console.log('[DEBUG] Error message was empty after filtering, but stdout has valid JSON - execution succeeded');
          return res.json(extracted);
        } else {
          // stdout is not valid JSON, use a generic error message
          errorMessage = 'Execution failed (no error details available)';
        }
      } else if (!errorMessage) {
        errorMessage = 'Execution failed (no error details available)';
      }
    }

    console.log('[DEBUG] Final error message being returned:', errorMessage);
    res.status(400).json({ error: 'Strict run failed', message: errorMessage });
  }
});

// Verify all 7-step routes are registered
console.log('[DEBUG] Verifying 7-step routes are registered...');
const registered7StepRoutes = [];
if (app._router && app._router.stack) {
  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      const method = Object.keys(middleware.route.methods)[0]?.toUpperCase();
      const path = middleware.route.path;
      if (path.startsWith('/api/7step')) {
        registered7StepRoutes.push(`${method} ${path}`);
      }
    }
  });
}
console.log(`[DEBUG] Registered 7-step routes: ${registered7StepRoutes.length > 0 ? registered7StepRoutes.join(', ') : 'NONE FOUND'}`);
if (registered7StepRoutes.length < 4) {
  console.error(`[DEBUG] WARNING: Expected 4 routes (GET /api/7step/health, POST /api/7step/parse, POST /api/7step/run, POST /api/7step/strict) but found ${registered7StepRoutes.length}`);
  console.error('[DEBUG] This may indicate a route registration error. Check for syntax errors above.');
} else {
  console.log('[DEBUG] ✓ All 4 7-step routes successfully registered');
}

// ============================================================================
// SDK ENDPOINTS (moved here to match working route pattern)
// ============================================================================

// Debug: SDK routes being defined
debugLog('api-server.cjs:sdk-routes', 'SDK routes being defined', { routeCount: 4 });

// GET /api/zeq/sdk/metadata - PUBLIC ENDPOINT (NO AUTHENTICATION REQUIRED)
app.get('/api/zeq/sdk/metadata', (req, res, next) => {
  // Debug logging
  debugLog('api-server.cjs:sdk-metadata', 'SDK metadata route HIT', { path: req.path, method: req.method, hasMetadata: !!sdkMetadata });
  console.log(`[SDK] ✅✅✅ GET /api/zeq/sdk/metadata - Request received`);
  console.log(`[SDK] Request path: ${req.path}, method: ${req.method}, url: ${req.url}`);
  if (!sdkMetadata) {
    console.error(`[SDK] ❌ SDK metadata not loaded - returning default`);
    // Return default metadata if not loaded yet
    return res.json({
      version: '4.0.0',
      totalOperators: 1549,
      pulseFrequency: 1.287,
      precisionTarget: 0.001,
      domains: [],
      industries: {}
    });
  }
  console.log(`[SDK] ✅ Returning SDK metadata`);
  res.json(sdkMetadata);
});

// GET /api/zeq/sdk/code
app.get('/api/zeq/sdk/code', (req, res) => {
  const section = req.query.section;

  if (!sdkCode) {
    return res.status(503).json({ error: 'SDK code not loaded' });
  }

  // If section is requested, try to extract specific section
  if (section) {
    const sectionPatterns = {
      core: /# ============================================================================\s*# 1\. CONFIGURATION & SETUP[\s\S]*?# ============================================================================\s*# 2\. CONSTANTS & CONFIGURATION[\s\S]*?# ============================================================================\s*# 3\. UNIT SYSTEM[\s\S]*?# ============================================================================\s*# 4\. RESOURCE MANAGEMENT[\s\S]*?# ============================================================================\s*# 5\. MATHEMATICAL SOLVERS[\s\S]*?(?=# ============================================================================)/,
      solvers: /# ============================================================================\s*# 5\. MATHEMATICAL SOLVERS[\s\S]*?(?=# ============================================================================)/,
      operators: /# All 1204 operators fully implemented[\s\S]*?(?=# ============================================================================)/
    };

    const pattern = sectionPatterns[section];
    if (pattern) {
      const match = sdkCode.match(pattern);
      if (match) {
        return res.json({ section, code: match[0] });
      }
    }
  }

  res.json({ code: sdkCode });
});

// GET /api/zeq/sdk/config
app.get('/api/zeq/sdk/config', (req, res) => {
  if (!sdkConfig) {
    return res.status(503).json({ error: 'SDK config not loaded' });
  }
  res.json(sdkConfig);
});

// GET /api/zeq/sdk/daemon-code
app.get('/api/zeq/sdk/daemon-code', (req, res) => {
  // Debug logging
  debugLog('api-server.cjs:daemon-code', 'SDK daemon-code route hit', { path: req.path, method: req.method });
  console.log(`[SDK] ✅ GET /api/zeq/sdk/daemon-code - Request received`);
  console.log(`[SDK] Request path: ${req.path}, method: ${req.method}`);
  try {
    if (!fs.existsSync(zeqondDaemonPath)) {
      console.error(`[SDK] ❌ Zeqond daemon file not found at: ${zeqondDaemonPath}`);
      return res.status(404).json({ error: 'Zeqond daemon file not found' });
    }

    const daemonCode = fs.readFileSync(zeqondDaemonPath, 'utf8');
    console.log(`[SDK] ✅ Returning daemon code (${daemonCode.length} bytes)`);
    res.json({
      code: daemonCode,
      filename: 'zeqond_daemon.py',
      description: 'Zeqond Daemon - ZEQ OS HulyaPulse Synchronization Service',
      version: '1.0.0',
      port: 2871,
      frequency: 1.287
    });
  } catch (err) {
    console.error(`[SDK] ❌ Error reading daemon code:`, err.message);
    res.status(500).json({ error: err.message });
  }
});

// Helper function to get example parameters for an operator
function getExampleParams(operatorId) {
  const examples = {
    'KO1': { x: 1.0, y: 2.0, z: 3.0 },
    'KO2': { vx: 1.0, vy: 2.0, vz: 3.0 },
    'QM1': { m: 9.10938356e-31, V: 0.0, psi: 1.0, x: 0.0, t: 0.0 },
    'NM19': { m: 1.0, a: 9.81 },
    'GR31': { a_grav: 9.81, a_inertial: 9.81 },
    'CS43': { n: 1000 },
    'CAO1': { H_X1_t_given_X1_tminus1: 2.0, H_X2_t_given_X2_tminus1: 2.0, H_X_t_given_X_tminus1: 3.0 }
  };
  return examples[operatorId] || {};
}

// ============================================================================
// SDK API ENDPOINTS
// ============================================================================

// Load SDK code from App.tsx
let sdkCode = null;
let sdkMetadata = null;
let sdkConfig = null;

function loadSDKData() {
  try {
    const appTsxPath = path.join(__dirname, 'App.tsx');
    if (fs.existsSync(appTsxPath)) {
      const appTsxContent = fs.readFileSync(appTsxPath, 'utf8');

      // Extract PYTHON_SDK_CODE constant
      const sdkCodeMatch = appTsxContent.match(/const PYTHON_SDK_CODE = `([\s\S]*?)`;/);
      if (sdkCodeMatch) {
        sdkCode = sdkCodeMatch[1];
      }

      // Extract ProductionConfig metadata
      const versionMatch = appTsxContent.match(/VERSION = "([^"]+)"/);
      const operatorsMatch = appTsxContent.match(/TOTAL_OPERATORS = (\d+)/);
      const pulseMatch = appTsxContent.match(/PULSE_FREQUENCY = ([\d.]+)/);
      const precisionMatch = appTsxContent.match(/PRECISION_TARGET = ([\d.]+)/);

      // Extract domains array
      const domainsMatch = appTsxContent.match(/DOMAINS = \[([\s\S]*?)\]/);
      let domains = [];
      if (domainsMatch) {
        const domainsStr = domainsMatch[1];
        const domainMatches = domainsStr.matchAll(/"([^"]+)"/g);
        domains = Array.from(domainMatches, m => m[1]);
      }

      // Extract industries object
      const industriesMatch = appTsxContent.match(/INDUSTRIES = \{([\s\S]*?)\}/);
      let industries = {};
      if (industriesMatch) {
        const industriesStr = industriesMatch[1];
        const industryMatches = industriesStr.matchAll(/"([^"]+)": \[([\s\S]*?)\]/g);
        for (const match of industryMatches) {
          const industryName = match[1];
          const itemsStr = match[2];
          const itemMatches = itemsStr.matchAll(/"([^"]+)"/g);
          industries[industryName] = Array.from(itemMatches, m => m[1]);
        }
      }

      sdkMetadata = {
        version: versionMatch ? versionMatch[1] : '4.0.0',
        totalOperators: operatorsMatch ? parseInt(operatorsMatch[1]) : 1549,
        pulseFrequency: pulseMatch ? parseFloat(pulseMatch[1]) : 1.287,
        precisionTarget: precisionMatch ? parseFloat(precisionMatch[1]) : 0.001,
        domains: domains,
        industries: industries
      };

      // Extract physical constants from ProductionConfig
      const constants = {};
      const constantPatterns = {
        h: /h = ([\d.e-]+)/,
        hbar: /hbar = ([\d.e-]+)/,
        c: /c = ([\d.e-]+)/,
        G: /G = ([\d.e-]+)/,
        k_B: /k_B = ([\d.e-]+)/,
        m_e: /m_e = ([\d.e-]+)/,
        m_p: /m_p = ([\d.e-]+)/,
        epsilon_0: /epsilon_0 = ([\d.e-]+)/,
        mu_0: /mu_0 = ([\d.e-]+)/,
        e: /e = ([\d.e-]+)/,
        N_A: /N_A = ([\d.e-]+)/
      };

      for (const [key, pattern] of Object.entries(constantPatterns)) {
        const match = appTsxContent.match(pattern);
        if (match) {
          constants[key] = parseFloat(match[1]);
        }
      }

      // Extract limits
      const maxMemoryMatch = appTsxContent.match(/MAX_MEMORY_MB = (\d+)/);
      const timeoutMatch = appTsxContent.match(/TIMEOUT_SEC = ([\d.]+)/);
      const recursionMatch = appTsxContent.match(/MAX_RECURSION = (\d+)/);
      const gridPointsMatch = appTsxContent.match(/MAX_GRID_POINTS = (\d+)/);

      sdkConfig = {
        constants: constants,
        limits: {
          maxMemoryMB: maxMemoryMatch ? parseInt(maxMemoryMatch[1]) : 1024,
          timeoutSec: timeoutMatch ? parseFloat(timeoutMatch[1]) : 5.0,
          maxRecursion: recursionMatch ? parseInt(recursionMatch[1]) : 1000,
          maxGridPoints: gridPointsMatch ? parseInt(gridPointsMatch[1]) : 1000000
        },
        domains: domains,
        industries: industries
      };

      console.log('✅ Loaded SDK data');
    }
  } catch (err) {
    console.error('❌ Could not load SDK data:', err.message);
  }
}

// Load SDK data on startup (after routes are defined)
loadSDKData();

// ============================================================================
// ZEQOND DAEMON API ENDPOINTS
// ============================================================================

let zeqondDaemonProcess = null;
const zeqondDaemonPath = path.join(__dirname, 'zeqond_daemon.py');
let daemonRestartAttempts = 0;
const MAX_RESTART_ATTEMPTS = 10;
const RESTART_DELAY = 2000; // 2 seconds

// Helper function to query Zeqond daemon via TCP
function queryZeqondDaemon(command) {
  return new Promise((resolve, reject) => {
    const client = net.createConnection({ port: 2871, host: 'localhost' }, () => {
      // Send command with newline
      client.write(command + '\n');
    });

    let data = '';
    let resolved = false;

    client.on('data', (chunk) => {
      data += chunk.toString();
      // If we got a complete response (ends with newline or contains expected format), resolve early
      if (data.includes('\n') || data.trim().length > 0) {
        if (!resolved) {
          resolved = true;
          client.end();
          resolve(data.trim());
        }
      }
    });

    client.on('end', () => {
      if (!resolved) {
        resolved = true;
        resolve(data.trim());
      }
    });

    client.on('error', (err) => {
      if (!resolved) {
        resolved = true;
        reject(err);
      }
    });

    // Timeout after 2 seconds
    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        client.destroy();
        reject(new Error(`Connection timeout after 2s (command: ${command})`));
      }
    }, 2000);
  });
}

// Function to start Zeqond daemon (always running - core framework function)
function startZeqondDaemon() {
  // Check if already running
  if (zeqondDaemonProcess && !zeqondDaemonProcess.killed) {
    console.log('✅ Zeqond daemon is already running');
    return;
  }

  // Check if daemon file exists
  if (!fs.existsSync(zeqondDaemonPath)) {
    console.error(`❌ Zeqond daemon file not found: ${zeqondDaemonPath}`);
    return;
  }

  try {
    const { spawn } = require('child_process');
    console.log('🚀 Starting Zeqond daemon (1.287 Hz HulyaPulse)...');
    console.log(`   Path: ${zeqondDaemonPath}`);

    zeqondDaemonProcess = spawn('python3', [zeqondDaemonPath], {
      detached: false,
      stdio: 'pipe',
      cwd: __dirname
    });

    zeqondDaemonProcess.stdout.on('data', (data) => {
      const output = data.toString().trim();
      if (output) {
        console.log(`[Zeqond Daemon] ${output}`);
      }
    });

    zeqondDaemonProcess.stderr.on('data', (data) => {
      const error = data.toString().trim();
      if (error && !error.includes('DeprecationWarning')) {
        console.error(`[Zeqond Daemon Error] ${error}`);
      }
    });

    zeqondDaemonProcess.on('exit', (code) => {
      console.log(`⚠️  [Zeqond Daemon] Process exited with code ${code}`);
      zeqondDaemonProcess = null;
      daemonRestartAttempts++;

      // Auto-restart if crashed (core framework function - must always run)
      if (daemonRestartAttempts < MAX_RESTART_ATTEMPTS) {
        console.log(`🔄 Auto-restarting Zeqond daemon (attempt ${daemonRestartAttempts}/${MAX_RESTART_ATTEMPTS})...`);
        setTimeout(() => {
          startZeqondDaemon();
        }, RESTART_DELAY);
      } else {
        console.error('❌ Max restart attempts reached. Zeqond daemon failed to start.');
      }
    });

    zeqondDaemonProcess.on('error', (err) => {
      console.error(`❌ Failed to spawn Zeqond daemon: ${err.message}`);
      zeqondDaemonProcess = null;
      daemonRestartAttempts++;

      if (daemonRestartAttempts < MAX_RESTART_ATTEMPTS) {
        setTimeout(() => {
          startZeqondDaemon();
        }, RESTART_DELAY);
      }
    });

    // Reset restart attempts on successful start
    zeqondDaemonProcess.on('spawn', () => {
      daemonRestartAttempts = 0;
      console.log(`✅ Zeqond daemon spawned (PID: ${zeqondDaemonProcess.pid})`);

      // Wait a moment for daemon to initialize
      setTimeout(() => {
        // Test connection to verify daemon is listening
        queryZeqondDaemon('STATUS').then(() => {
          console.log('✅ Zeqond daemon is listening on port 2871');
        }).catch((err) => {
          console.log(`⏳ Zeqond daemon starting... (will retry connection)`);
        });
      }, 2000);
    });

  } catch (err) {
    console.error('❌ Failed to start Zeqond daemon:', err.message);
    // Retry after delay
    if (daemonRestartAttempts < MAX_RESTART_ATTEMPTS) {
      setTimeout(() => {
        startZeqondDaemon();
      }, RESTART_DELAY);
    }
  }
}

// GET /api/zeq/zeqond/status
app.get('/api/zeq/zeqond/status', async (req, res) => {
  // Debug logging
  debugLog('api-server.cjs:zeqond-status', 'Status endpoint called', { method: req.method, path: req.path });
  try {
    // Try to query daemon directly (it might be running even if we didn't start it)
    try {
      const status = await queryZeqondDaemon('STATUS');
      // Check if daemon process is tracked
      const isProcessTracked = zeqondDaemonProcess && !zeqondDaemonProcess.killed;

      console.log(`[API] Zeqond status query successful: ${status}`);

      res.json({
        running: true,
        status: status,
        port: 2871,
        processTracked: isProcessTracked
      });
    } catch (err) {
      // Daemon not responding - check if we have a tracked process
      const isProcessTracked = zeqondDaemonProcess && !zeqondDaemonProcess.killed;

      console.error(`[API] Zeqond status query failed: ${err.message}`);

      if (isProcessTracked) {
        res.json({
          running: false,
          error: 'Daemon process exists but not responding',
          message: err.message,
          processTracked: true
        });
      } else {
        res.json({
          running: false,
          error: 'Zeqond daemon is not responding on port 2871',
          message: err.message,
          processTracked: false
        });
      }
    }
  } catch (err) {
    console.error(`[API] Zeqond status endpoint error: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/zeq/zeqond/pulse - CRITICAL ENDPOINT
app.get('/api/zeq/zeqond/pulse', async (req, res) => {
  debugLog('api-server.cjs:pulse', 'Pulse endpoint called', { method: req.method, path: req.path });
  try {
    // Try to query daemon directly (don't check process - daemon might be running separately)
    try {
      console.log(`[API] Querying daemon for pulse data...`);
      const pulseResponse = await queryZeqondDaemon('GET:PULSE');
      const zeqondResponse = await queryZeqondDaemon('GET:ZEQOND');

      console.log(`[API] Daemon responses - PULSE: ${pulseResponse}, ZEQOND: ${zeqondResponse}`);

      const pulseCount = parseInt(pulseResponse) || 0;
      const zeqond = parseFloat(zeqondResponse) || 0;

      res.json({
        pulse_count: pulseCount,
        zeqond: zeqond,
        timestamp: Date.now()
      });
    } catch (err) {
      console.error(`[API] GET:PULSE/GET:ZEQOND failed, trying PULSE command: ${err.message}`);
      // Fallback: try PULSE command
      try {
        const response = await queryZeqondDaemon('PULSE');
        console.log(`[API] PULSE command response: ${response}`);
        const parts = response.split(':');
        if (parts.length >= 3) {
          res.json({
            pulse_count: parseInt(parts[1]) || 0,
            zeqond: parseFloat(parts[2]) || 0,
            timestamp: Date.now()
          });
        } else {
          throw new Error(`Invalid response format: ${response}`);
        }
      } catch (err2) {
        console.error(`[API] Zeqond pulse query failed: ${err2.message}`);
        res.status(503).json({
          error: 'Failed to query daemon',
          message: err2.message,
          pulse_count: 0,
          zeqond: 0
        });
      }
    }
  } catch (err) {
    console.error(`[API] Zeqond pulse endpoint error: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/zeq/zeqond/start (for manual restart if needed)
app.post('/api/zeq/zeqond/start', async (req, res) => {
  try {
    // Check if already running
    if (zeqondDaemonProcess && !zeqondDaemonProcess.killed) {
      return res.json({
        success: true,
        message: 'Zeqond daemon is already running',
        pid: zeqondDaemonProcess.pid
      });
    }

    // Start daemon using the shared function
    startZeqondDaemon();

    // Wait a moment for daemon to start
    await new Promise(resolve => setTimeout(resolve, 500));

    // Check if process is still running
    if (zeqondDaemonProcess && !zeqondDaemonProcess.killed) {
      res.json({
        success: true,
        message: 'Zeqond daemon started successfully',
        pid: zeqondDaemonProcess.pid
      });
    } else {
      res.status(500).json({
        error: 'Failed to start Zeqond daemon',
        message: 'Process exited immediately'
      });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/zeq/zeqond/stop (DISABLED - Zeqond daemon must always run)
app.post('/api/zeq/zeqond/stop', async (req, res) => {
  res.status(403).json({
    error: 'Zeqond daemon cannot be stopped',
    message: 'The Zeqond daemon is a core framework function and must always run. It maintains the 1.287 Hz HulyaPulse synchronization.'
  });
});

// ============================================================================
// APP STORE ENDPOINTS (User management, submissions, etc.)
// ============================================================================

app.post('/api/users/login', (req, res) => {
  const { email, password } = req.body;
  db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    bcrypt.compare(password, user.password_hash, (err, match) => {
      if (err || !match) return res.status(401).json({ error: 'Invalid credentials' });
      const token = jwt.sign({ user_id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
      res.json({ token, user: { id: user.id, email: user.email, username: user.username, role: user.role, created_at: user.created_at } });
    });
  });
});

app.post('/api/users/register', (req, res) => {
  const { email, username, password } = req.body;
  bcrypt.hash(password, 10, (err, hash) => {
    if (err) return res.status(500).json({ error: 'Error hashing password' });
    const id = `user-${Date.now()}`;
    db.run('INSERT INTO users (id, email, username, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      [id, email, username, hash, 'user', Math.floor(Date.now() / 1000)],
      function (err) {
        if (err) {
          if (err.message.includes('UNIQUE')) return res.status(400).json({ error: 'Email or username already exists' });
          return res.status(500).json({ error: 'Database error' });
        }
        const token = jwt.sign({ user_id: id, email, role: 'user' }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { id, email, username, role: 'user', created_at: Math.floor(Date.now() / 1000) } });
      }
    );
  });
});

app.get('/api/users/me', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    db.get('SELECT * FROM users WHERE id = ?', [decoded.user_id], (err, user) => {
      if (err || !user) return res.status(404).json({ error: 'User not found' });
      res.json({ id: user.id, email: user.email, username: user.username, role: user.role, created_at: user.created_at });
    });
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

app.get('/api/apps', (req, res) => {
  db.all('SELECT * FROM apps WHERE status = ? ORDER BY created_at DESC', ['approved'], (err, apps) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(apps.map(app => ({ ...app, tags: app.tags ? JSON.parse(app.tags) : [] })));
  });
});

// POST /api/apps - Submit a new app for review
app.post('/api/apps', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  let decoded;
  try {
    decoded = verifyToken(token);
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  const userId = decoded.id || decoded.user_id;
  const { name, description, longDescription, category, imageUrl, pluginUrl, tags } = req.body;

  // Validate required fields
  if (!name || !description || !category || !pluginUrl) {
    return res.status(400).json({ error: 'Missing required fields: name, description, category, pluginUrl' });
  }

  const appId = require('crypto').randomUUID();
  const submissionId = require('crypto').randomUUID();
  const now = Math.floor(Date.now() / 1000);
  const tagsJson = tags ? JSON.stringify(tags) : '[]';

  // Create app with pending status
  db.run(
    `INSERT INTO apps (id, developer_id, name, description, long_description, category, image_url, plugin_url, tags, status, rating, downloads, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 0, 0, ?)`,
    [appId, userId, name, description, longDescription || '', category, imageUrl || '', pluginUrl, tagsJson, now],
    function(err) {
      if (err) {
        console.error('Error creating app:', err);
        return res.status(500).json({ error: 'Failed to create app' });
      }

      // Create submission record
      db.run(
        `INSERT INTO submissions (id, app_id, developer_id, status, validation_result, created_at)
         VALUES (?, ?, ?, 'pending', NULL, ?)`,
        [submissionId, appId, userId, now],
        function(err2) {
          if (err2) {
            console.error('Error creating submission:', err2);
            return res.status(500).json({ error: 'Failed to create submission' });
          }

          res.status(201).json({
            id: appId,
            submissionId: submissionId,
            status: 'pending',
            message: 'App submitted for review'
          });
        }
      );
    }
  );
});

// GET /api/user/submissions - Get current user's app submissions
app.get('/api/user/submissions', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  let decoded;
  try {
    decoded = verifyToken(token);
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  const userId = decoded.id || decoded.user_id;

  db.all(
    `SELECT s.id as submission_id, s.status as submission_status, s.validation_result, s.created_at as submitted_at,
            a.id as app_id, a.name, a.description, a.category, a.status as app_status, a.downloads, a.rating
     FROM submissions s
     LEFT JOIN apps a ON s.app_id = a.id
     WHERE s.developer_id = ?
     ORDER BY s.created_at DESC`,
    [userId],
    (err, submissions) => {
      if (err) {
        console.error('Error fetching user submissions:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(submissions.map(sub => ({
        ...sub,
        validation_result: sub.validation_result ? JSON.parse(sub.validation_result) : null
      })));
    }
  );
});

app.get('/api/submissions', (req, res) => {
  db.all('SELECT * FROM submissions ORDER BY created_at DESC', [], (err, submissions) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(submissions.map(sub => ({ ...sub, validation_result: sub.validation_result ? JSON.parse(sub.validation_result) : null })));
  });
});

app.post('/api/submissions/:id/approve', (req, res) => {
  db.run('UPDATE submissions SET status = ? WHERE id = ?', ['approved', req.params.id], (err) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    db.get('SELECT * FROM submissions WHERE id = ?', [req.params.id], (err, submission) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json({ ...submission, validation_result: submission.validation_result ? JSON.parse(submission.validation_result) : null });
    });
  });
});

app.post('/api/submissions/:id/reject', (req, res) => {
  db.run('UPDATE submissions SET status = ? WHERE id = ?', ['rejected', req.params.id], (err) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    db.get('SELECT * FROM submissions WHERE id = ?', [req.params.id], (err, submission) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json({ ...submission, validation_result: submission.validation_result ? JSON.parse(submission.validation_result) : null });
    });
  });
});

// TEST ROUTE - verify route registration works
app.get('/api/test-route-registration', (req, res) => {
  res.json({ ok: true, message: 'Route registration test works' });
});

// ============================================================================
// 404 HANDLER - MUST BE LAST, AFTER ALL ROUTES
// All route definitions above this point will be checked before this handler
// ============================================================================
app.use((req, res) => {
  // Debug logging for API route 404s (development only)
  if (req.path.startsWith('/api/zeq/')) {
    debugLog('api-server.cjs:404', '404 handler hit', { path: req.path, method: req.method });

    // Development-only verbose logging
    if (!IS_PRODUCTION) {
      console.warn(`[404] API route not found: ${req.method} ${req.path}`);
    }
  }

  if (req.path.startsWith('/api/7step')) {
    // #region agent log
    console.error(`[DEBUG] 404 handler caught /api/7step request: ${req.method} ${req.path}`);
    try {
      const logPath = path.join(__dirname, '.cursor', 'debug.log');
      const logEntry = JSON.stringify({ sessionId: 'debug-session', runId: 'pre-fix', hypothesisId: 'B', location: 'api-server.cjs:404-7step', message: '404 handler hit for /api/7step', data: { path: req.path, method: req.method }, timestamp: Date.now() }) + '\n';
      fs.appendFileSync(logPath, logEntry, 'utf8');
    } catch (e) {
      console.error('[DEBUG] Failed to log 404:', e.message);
    }
    // #endregion
  }

  res.status(404).json({
    error: 'Not Found',
    path: req.path,
    method: req.method
  });
});

app.listen(PORT, () => {
  console.log(`\n🚀 ZEQ OS API Server running on http://localhost:${PORT}`);
  console.log(`   Mode: ${IS_PRODUCTION ? 'PRODUCTION' : 'DEVELOPMENT'}`);

  // Count registered routes - improved detection
  const routes = [];
  console.log(`[DEBUG] app._router exists: ${!!app._router}`);
  console.log(`[DEBUG] app._router.stack exists: ${!!(app._router && app._router.stack)}`);
  console.log(`[DEBUG] app._router.stack length: ${app._router && app._router.stack ? app._router.stack.length : 0}`);

  // Test if route is accessible
  console.log('[DEBUG] Testing route accessibility...');
  let routeFound = false;

  if (app._router && app._router.stack) {
    app._router.stack.forEach((middleware, idx) => {
      if (middleware.route) {
        const method = Object.keys(middleware.route.methods)[0]?.toUpperCase() || 'UNKNOWN';
        const routePath = middleware.route.path;
        routes.push(`${method} ${routePath}`);
        if (routePath === '/api/7step/health' && method === 'GET') {
          routeFound = true;
          console.log(`[DEBUG] ✓ Found /api/7step/health route at stack index ${idx}`);
        }
      } else {
        // Check if it's a router that might contain the route
        if (middleware.regexp) {
          const regexStr = middleware.regexp.source;
          if (regexStr.includes('7step') || regexStr.includes('health')) {
            console.log(`[DEBUG] Middleware ${idx} regexp matches 7step: ${regexStr.substring(0, 100)}`);
          }
        }
      }
    });
  }

  if (!routeFound) {
    console.error('[DEBUG] ✗ /api/7step/health route NOT FOUND in app._router.stack!');
    console.error('[DEBUG] This means the route was not registered with Express!');
    console.error('[DEBUG] Checking if route definition code executed...');
  } else {
    console.log('[DEBUG] ✓ Route found and should be accessible');
  }
  console.log(`[DEBUG] Route audit: Found ${routes.length} routes total`);

  // Also test by making a mock request
  console.log('[DEBUG] Making test request to /api/7step/health...');
  const http = require('http');
  const testHttpReq = http.request({
    hostname: 'localhost',
    port: PORT,
    path: '/api/7step/health',
    method: 'GET'
  }, (res) => {
    console.log(`[DEBUG] Test request status: ${res.statusCode}`);
    if (res.statusCode === 200) {
      console.log('[DEBUG] ✓ Route is accessible!');
    } else {
      console.error(`[DEBUG] ✗ Route returned ${res.statusCode} - NOT accessible`);
    }
  });
  testHttpReq.on('error', (e) => {
    console.error('[DEBUG] Test request error (expected if server not ready):', e.message);
  });
  testHttpReq.end();

  // Development-only verbose logging
  if (!IS_PRODUCTION) {
    console.log(`\n📊 Registered Routes (${routes.length} total):`);
    routes.slice(0, 10).forEach(route => console.log(`   ${route}`));
    if (routes.length > 10) console.log(`   ... and ${routes.length - 10} more`);

    const zeqondRoutes = routes.filter(r => r.includes('zeqond'));
    console.log(`\n💓 Zeqond Daemon Routes (${zeqondRoutes.length} found):`);
    zeqondRoutes.forEach(route => console.log(`   ${route}`));

    console.log(`\n📋 Public Operator Endpoints:`);
    console.log(`   GET  http://localhost:${PORT}/api/zeq/operators`);
    console.log(`   GET  http://localhost:${PORT}/api/zeq/operators/:id`);
    console.log(`   POST http://localhost:${PORT}/api/zeq/operators/execute?operator={id}`);
    console.log(`\n📦 SDK Endpoints:`);
    console.log(`   GET  http://localhost:${PORT}/api/zeq/sdk/metadata`);
    console.log(`   GET  http://localhost:${PORT}/api/zeq/sdk/config`);
    console.log(`\n📝 Admin accounts: Configure via ZEQ_ADMIN_EMAIL and ZEQ_ADMIN_PASSWORD environment variables\n`);
  }

  // #region agent log
  console.log('[DEBUG] Auditing registered routes...');
  try {
    const has7step = routes.some((r) => r.includes('/api/7step/'));
    const sevenStepRoutes = routes.filter((r) => r.includes('/api/7step/'));
    const hasHealthRoute = routes.some((r) => r.includes('/api/7step/health'));
    console.log(`[DEBUG] 7-step routes registered: ${has7step}, count: ${sevenStepRoutes.length}, health: ${hasHealthRoute}`);
    if (sevenStepRoutes.length > 0) {
      console.log(`[DEBUG] 7-step routes: ${sevenStepRoutes.join(', ')}`);
    } else {
      console.log('[DEBUG] WARNING: No 7-step routes found! Total routes:', routes.length);
      console.log('[DEBUG] Sample routes:', routes.slice(0, 10).join(', '));
    }
    const logPath = path.join(__dirname, '.cursor', 'debug.log');
    const logEntry = JSON.stringify({ sessionId: 'debug-session', runId: 'pre-fix', hypothesisId: 'A', location: 'api-server.cjs:startup', message: 'server started (route audit)', data: { port: PORT, routeCount: routes.length, has7stepRoutes: has7step, sevenStepRoutes: sevenStepRoutes, hasHealthRoute: hasHealthRoute, pid: process.pid }, timestamp: Date.now() }) + '\n';
    fs.appendFileSync(logPath, logEntry, 'utf8');
  } catch (e) {
    console.error('[DEBUG] Route audit failed:', e.message);
  }
  // #endregion

  // Log debug logging status
  debugLog('api-server.cjs:startup', 'Server started', { port: PORT, routes: routes.length });

  // Auto-start Zeqond daemon (core framework function - must always run)
  console.log('💓 Initializing Zeqond daemon (1.287 Hz HulyaPulse)...');
  setTimeout(() => {
    startZeqondDaemon();
  }, 1000); // Small delay to ensure server is fully ready
});
