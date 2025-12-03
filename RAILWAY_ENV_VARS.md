# Railway Environment Variables Documentation

This document lists all environment variables required for deploying LibreChat on Railway.

## Table of Contents
1. [Core Server Configuration](#core-server-configuration)
2. [Database](#database)
3. [Authentication & Security](#authentication--security)
4. [AI Provider API Keys](#ai-provider-api-keys)
5. [Meilisearch (Optional)](#meilisearch-optional)
6. [RAG API (Optional)](#rag-api-optional)
7. [Stripe Integration](#stripe-integration)
8. [Web Search (SearXNG)](#web-search-searxng)
9. [Feature Flags](#feature-flags)
10. [Other Configuration](#other-configuration)

---

## Core Server Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `3080` | Server port (Railway sets this automatically) |
| `HOST` | No | `0.0.0.0` | Server host (should be `0.0.0.0` for Railway) |
| `NODE_ENV` | No | `production` | Node environment |
| `DOMAIN_CLIENT` | Yes* | - | Client domain URL (e.g., `https://your-app.up.railway.app`) |
| `DOMAIN_SERVER` | Yes* | - | Server domain URL (usually same as DOMAIN_CLIENT) |
| `TRUST_PROXY` | No | `1` | Number of proxies to trust (set to `1` for Railway) |

\* Required after initial deployment when Railway assigns a domain

---

## Database

### MongoDB (Required)

Railway provides MongoDB as a service. The connection string is automatically provided via environment variables.

| Variable | Required | Source | Description |
|----------|----------|--------|-------------|
| `MONGO_URI` | Yes | Railway MongoDB Service | MongoDB connection string (e.g., `mongodb://mongo:27017/railway`) |

**How to get it:**
1. In Railway, add a MongoDB database service
2. Railway will automatically provide `MONGO_URI` environment variable
3. Or copy the connection string from the MongoDB service settings

---

## Authentication & Security

| Variable | Required | Description | How to Generate |
|----------|----------|-------------|-----------------|
| `JWT_SECRET` | Yes | Secret for JWT token signing | Generate random 32+ character string |
| `JWT_REFRESH_SECRET` | Yes | Secret for JWT refresh tokens | Generate random 32+ character string |
| `JWT_EXPIRY` | No | JWT token expiry (e.g., `15m`) | Default: `15m` |
| `JWT_REFRESH_EXPIRY` | No | JWT refresh token expiry (e.g., `720h`) | Default: `720h` |
| `SESSION_EXPIRY` | No | Session expiry in milliseconds | Default: `7200000` (2 hours) |
| `CREDS_KEY` | Yes | Encryption key for credentials | Generate 32-byte hex string |
| `CREDS_IV` | Yes | Initialization vector for encryption | Generate 16-byte hex string |

**Generate secrets:**
```bash
# JWT secrets (32+ characters)
openssl rand -base64 32

# CREDS_KEY (32 bytes hex)
openssl rand -hex 32

# CREDS_IV (16 bytes hex)
openssl rand -hex 16
```

---

## AI Provider API Keys

Add API keys for the AI providers you want to use. Only add the ones you need.

| Variable | Required | Provider | Description |
|----------|----------|----------|-------------|
| `DEEPSEEK_API_KEY` | No | DeepSeek | DeepSeek API key (starts with `sk-`) |
| `OPENROUTER_KEY` | No | OpenRouter | OpenRouter API key (starts with `sk-or-v1-`) |
| `OPENAI_API_KEY` | No | OpenAI | OpenAI API key (for GPT models and RAG embeddings) |
| `ANTHROPIC_API_KEY` | No | Anthropic | Anthropic API key (for Claude models) |
| `GOOGLE_API_KEY` | No | Google | Google API key (for Gemini models) |
| `GROQ_API_KEY` | No | Groq | Groq API key (for Llama models) |
| `MISTRAL_API_KEY` | No | Mistral | Mistral AI API key |
| `AZURE_OPENAI_API_KEY` | No | Azure OpenAI | Azure OpenAI API key |
| `AZURE_OPENAI_API_INSTANCE_NAME` | No | Azure OpenAI | Azure OpenAI instance name |
| `AZURE_OPENAI_API_DEPLOYMENT_NAME` | No | Azure OpenAI | Azure OpenAI deployment name |
| `AZURE_OPENAI_API_VERSION` | No | Azure OpenAI | Azure OpenAI API version (e.g., `2024-02-15-preview`) |

**Note:** Configure these in `librechat.yaml` as well. The file uses environment variable references like `${DEEPSEEK_API_KEY}`.

---

## Meilisearch (Optional)

Meilisearch is used for search functionality. If not deployed, search features will be disabled.

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `MEILI_HOST` | No | - | Meilisearch host URL (e.g., `http://meilisearch:7700`) |
| `MEILI_MASTER_KEY` | No | - | Meilisearch master key for authentication |
| `MEILI_NO_ANALYTICS` | No | `true` | Disable Meilisearch analytics |

**Options:**
1. **Deploy as separate Railway service** (recommended if needed)
2. **Use external Meilisearch instance** (set `MEILI_HOST` to external URL)
3. **Disable** (leave variables unset, search features will be disabled)

---

## RAG API (Optional)

RAG (Retrieval Augmented Generation) allows the AI to search through uploaded documents.

### PostgreSQL (Required for RAG)

Railway provides PostgreSQL. The connection details are automatically provided.

| Variable | Required | Source | Description |
|----------|----------|--------|-------------|
| `POSTGRES_DB` | Yes* | Railway PostgreSQL Service | PostgreSQL database name |
| `POSTGRES_USER` | Yes* | Railway PostgreSQL Service | PostgreSQL username |
| `POSTGRES_PASSWORD` | Yes* | Railway PostgreSQL Service | PostgreSQL password |
| `POSTGRES_HOST` | Yes* | Railway PostgreSQL Service | PostgreSQL host (service name or URL) |
| `POSTGRES_PORT` | No | Railway PostgreSQL Service | PostgreSQL port (default: `5432`) |

\* Required only if using RAG API

**How to get it:**
1. In Railway, add a PostgreSQL database service
2. Railway will automatically provide `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`
3. Map these to the variables above, or use Railway's provided variables directly

### RAG API Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `RAG_PORT` | No | `8000` | RAG API port |
| `RAG_API_URL` | No | - | RAG API URL (e.g., `http://rag-api:8000`) |
| `EMBEDDINGS_PROVIDER` | No | `openai` | Embedding provider: `openai`, `anthropic`, `google`, `azure_openai` |
| `EMBEDDINGS_MODEL` | No | `text-embedding-3-small` | Embedding model name |

**Note:** RAG API must be deployed as a separate Railway service if you want RAG functionality.

---

## Stripe Integration

Required only if using Stripe for payments/subscriptions.

| Variable | Required | Description |
|----------|----------|-------------|
| `STRIPE_SECRET_KEY` | Yes* | Stripe secret key (starts with `sk_`) |
| `STRIPE_PUBLISHABLE_KEY` | Yes* | Stripe publishable key (starts with `pk_`) |
| `STRIPE_WEBHOOK_SECRET` | Yes* | Stripe webhook secret (starts with `whsec_`) |

\* Required only if using Stripe

**Webhook URL:** `https://your-app.up.railway.app/api/stripe/webhook`

---

## Web Search (SearXNG)

SearXNG is used for web search functionality. Typically deployed externally or as a separate service.

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SEARXNG_INSTANCE_URL` | No | - | SearXNG instance URL (e.g., `https://searxng.example.com`) |
| `SEARXNG_API_KEY` | No | - | SearXNG API key (optional, not required for basic setup) |

**Options:**
1. **Use external SearXNG instance** (set `SEARXNG_INSTANCE_URL`)
2. **Deploy as separate Railway service** (set URL to Railway service URL)
3. **Disable web search** (leave unset)

---

## Feature Flags

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `ALLOW_REGISTRATION` | No | `false` | Allow new user registration |
| `ALLOW_SOCIAL_LOGIN` | No | `false` | Enable social login (OAuth) |
| `DISABLE_COMPRESSION` | No | `false` | Disable response compression |

---

## Other Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `INDEX_CACHE_CONTROL` | No | `no-cache, no-store, must-revalidate` | Cache control for index.html |
| `INDEX_PRAGMA` | No | `no-cache` | Pragma header for index.html |
| `INDEX_EXPIRES` | No | `0` | Expires header for index.html |

---

## Quick Reference: Minimum Required Variables

For a basic deployment, you need at minimum:

1. **Core:**
   - `DOMAIN_CLIENT` (after Railway assigns domain)
   - `DOMAIN_SERVER` (after Railway assigns domain)

2. **Database:**
   - `MONGO_URI` (from Railway MongoDB service)

3. **Security:**
   - `JWT_SECRET`
   - `JWT_REFRESH_SECRET`
   - `CREDS_KEY`
   - `CREDS_IV`

4. **At least one AI provider:**
   - `DEEPSEEK_API_KEY` OR
   - `OPENROUTER_KEY` OR
   - `OPENAI_API_KEY` (etc.)

---

## Setting Variables in Railway

1. Go to your Railway project
2. Select your service
3. Go to **Variables** tab
4. Click **+ New Variable**
5. Add variable name and value
6. Click **Add**

**Note:** Railway automatically provides database connection variables for MongoDB and PostgreSQL services. Check the service's **Variables** tab to see what's available.

---

## Environment Variable Priority

1. Railway service variables (highest priority)
2. Railway project variables
3. Default values in code (lowest priority)

---

## Security Notes

- **Never commit** `.env` files or secrets to Git
- Use Railway's **Variables** feature for all secrets
- Rotate secrets periodically
- Use strong, random values for `JWT_SECRET`, `JWT_REFRESH_SECRET`, `CREDS_KEY`, and `CREDS_IV`

