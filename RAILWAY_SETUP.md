# Railway Setup Guide for LibreChat

This guide walks you through deploying LibreChat to Railway step-by-step.

## Prerequisites

- ✅ Railway account (subscribed/paid plan recommended)
- ✅ GitHub account with LibreChat repository
- ✅ Railway connected to your GitHub account
- ✅ All API keys ready (see `RAILWAY_ENV_VARS.md`)

## Step 1: Create Railway Project

1. Log in to [Railway](https://railway.app)
2. Click **+ New Project**
3. Select **Deploy from GitHub repo**
4. Choose your LibreChat repository
5. Railway will create a new project

## Step 2: Add MongoDB Service

1. In your Railway project, click **+ New**
2. Select **Database** → **MongoDB**
3. Railway will provision MongoDB automatically
4. Wait for the service to be ready (green status)
5. **Important:** Railway automatically provides `MONGO_URI` environment variable
   - Go to MongoDB service → **Variables** tab
   - Copy the `MONGO_URI` value (you'll need it later)

## Step 3: Add PostgreSQL Service (Optional - for RAG)

If you want RAG (Retrieval Augmented Generation) functionality:

1. In your Railway project, click **+ New**
2. Select **Database** → **PostgreSQL**
3. Railway will provision PostgreSQL automatically
4. Wait for the service to be ready
5. **Important:** Railway automatically provides PostgreSQL connection variables:
   - `PGHOST`
   - `PGPORT`
   - `PGUSER`
   - `PGPASSWORD`
   - `PGDATABASE`
6. Go to PostgreSQL service → **Variables** tab to see these

**Note:** If you don't need RAG, you can skip this step.

## Step 4: Configure Main Application Service

Railway should have automatically created a service from your GitHub repo. If not:

1. Click **+ New** → **GitHub Repo**
2. Select your LibreChat repository
3. Railway will detect the `Dockerfile` and `railway.json`

### 4.1 Configure Build Settings

1. Go to your main service (the one from GitHub)
2. Click **Settings** tab
3. Verify:
   - **Build Command:** (auto-detected from Dockerfile)
   - **Start Command:** `npm run backend` (from railway.json)
   - **Dockerfile Path:** `Dockerfile`

### 4.2 Set Environment Variables

Go to your main service → **Variables** tab and add the following:

#### Core Configuration

```bash
HOST=0.0.0.0
NODE_ENV=production
TRUST_PROXY=1
```

**Note:** `PORT` is automatically set by Railway - don't override it.

#### Database Connection

```bash
MONGO_URI=<paste from MongoDB service Variables tab>
```

**How to get it:**
1. Go to MongoDB service → **Variables** tab
2. Find `MONGO_URI`
3. Copy the value
4. Paste into main service variables

#### Domain Configuration

**Important:** Set these AFTER Railway assigns your domain (Step 6)

```bash
DOMAIN_CLIENT=https://your-app-name.up.railway.app
DOMAIN_SERVER=https://your-app-name.up.railway.app
```

#### Authentication & Security

Generate these using the commands in `RAILWAY_ENV_VARS.md`:

```bash
JWT_SECRET=<generate-random-32-char-string>
JWT_REFRESH_SECRET=<generate-random-32-char-string>
JWT_EXPIRY=15m
JWT_REFRESH_EXPIRY=720h
SESSION_EXPIRY=7200000
CREDS_KEY=<generate-32-byte-hex>
CREDS_IV=<generate-16-byte-hex>
```

#### AI Provider API Keys

Add the API keys you want to use:

```bash
DEEPSEEK_API_KEY=sk-your-deepseek-key
OPENROUTER_KEY=sk-or-v1-your-openrouter-key
OPENAI_API_KEY=sk-your-openai-key
# Add others as needed
```

#### Optional Services

**Meilisearch (if using):**
```bash
MEILI_HOST=http://meilisearch:7700
MEILI_MASTER_KEY=<generate-random-key>
MEILI_NO_ANALYTICS=true
```

**RAG API (if using):**
```bash
RAG_PORT=8000
RAG_API_URL=http://rag-api:8000
POSTGRES_DB=<from-postgres-service>
POSTGRES_USER=<from-postgres-service>
POSTGRES_PASSWORD=<from-postgres-service>
POSTGRES_HOST=<from-postgres-service>
EMBEDDINGS_PROVIDER=openai
EMBEDDINGS_MODEL=text-embedding-3-small
OPENAI_API_KEY=sk-your-openai-key  # Required for embeddings
```

**SearXNG (if using external instance):**
```bash
SEARXNG_INSTANCE_URL=https://your-searxng-instance.com
SEARXNG_API_KEY=your-searxng-key  # Optional
```

**Stripe (if using):**
```bash
STRIPE_SECRET_KEY=sk_live_your-secret-key
STRIPE_PUBLISHABLE_KEY=pk_live_your-publishable-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
```

**Feature Flags:**
```bash
ALLOW_REGISTRATION=true
ALLOW_SOCIAL_LOGIN=false
```

### 4.3 Link Services (for internal communication)

Railway services in the same project can communicate via service names:

1. Go to your main service → **Settings** → **Networking**
2. Ensure services are in the same project (they can communicate automatically)
3. Use service names in URLs:
   - MongoDB: `mongodb://mongo:27017/railway` (Railway provides this)
   - PostgreSQL: Use `PGHOST` from PostgreSQL service

## Step 5: Deploy

1. Railway will automatically deploy when you push to GitHub
2. Or manually trigger: Service → **Deployments** → **Redeploy**
3. Monitor the build logs:
   - Service → **Deployments** → Click on latest deployment
   - Watch for build errors

## Step 6: Configure Domain

1. Wait for deployment to complete
2. Go to your main service → **Settings** → **Networking**
3. Click **Generate Domain** (or use custom domain)
4. Railway will assign a domain like `your-app-name.up.railway.app`
5. **Update environment variables:**
   ```bash
   DOMAIN_CLIENT=https://your-app-name.up.railway.app
   DOMAIN_SERVER=https://your-app-name.up.railway.app
   ```
6. Redeploy the service (Railway will auto-redeploy when variables change)

## Step 7: Optional Services Setup

### 7.1 Meilisearch (Optional)

If you want Meilisearch for search functionality:

**Option A: Deploy as Separate Service**
1. Create new service → **Empty Service**
2. Add Dockerfile:
   ```dockerfile
   FROM getmeili/meilisearch:v1.12.3
   ```
3. Set environment variables:
   ```bash
   MEILI_MASTER_KEY=<generate-random-key>
   MEILI_NO_ANALYTICS=true
   ```
4. Update main service:
   ```bash
   MEILI_HOST=http://meilisearch-service-name:7700
   MEILI_MASTER_KEY=<same-key-as-above>
   ```

**Option B: Use External Instance**
- Set `MEILI_HOST` to external URL in main service variables

**Option C: Disable**
- Leave Meilisearch variables unset (search features will be disabled)

### 7.2 RAG API (Optional)

If you want RAG functionality:

1. **Deploy RAG API as separate service:**
   - Create new service → **Empty Service**
   - Use image: `ghcr.io/danny-avila/librechat-rag-api-dev-lite:latest`
   - Set environment variables:
     ```bash
     DB_HOST=<postgres-service-name>
     DB_PORT=5432
     POSTGRES_DB=<from-postgres-variables>
     POSTGRES_USER=<from-postgres-variables>
     POSTGRES_PASSWORD=<from-postgres-variables>
     RAG_PORT=8000
     EMBEDDINGS_PROVIDER=openai
     EMBEDDINGS_MODEL=text-embedding-3-small
     OPENAI_API_KEY=sk-your-openai-key
     ```
2. **Update main service:**
   ```bash
   RAG_API_URL=http://rag-api-service-name:8000
   ```

### 7.3 SearXNG (Optional)

SearXNG is typically deployed externally or as a separate service:

1. **Use external instance:**
   - Set `SEARXNG_INSTANCE_URL` in main service variables

2. **Deploy as separate service:**
   - Create new service → **Empty Service**
   - Use image: `searxng/searxng:latest`
   - Set `SEARXNG_INSTANCE_URL` to Railway service URL

## Step 8: Verify Deployment

1. **Check service status:**
   - All services should show green/healthy status

2. **Check logs:**
   - Main service → **Logs** tab
   - Look for: "Server listening on all interfaces at port..."
   - Check for any errors

3. **Test the application:**
   - Visit your Railway domain: `https://your-app-name.up.railway.app`
   - Should see LibreChat login/registration page

4. **Test health endpoint:**
   - Visit: `https://your-app-name.up.railway.app/api/health`
   - Should return: `OK`

## Step 9: Create Admin User

Once deployed, create your first admin user:

### Option A: Via Railway CLI

1. Install Railway CLI: `npm i -g @railway/cli`
2. Login: `railway login`
3. Link project: `railway link`
4. Run command:
   ```bash
   railway run npm run create-user
   ```

### Option B: Via Railway Dashboard

1. Go to your main service
2. Click **Settings** → **Service Settings**
3. Use **Run Command** feature (if available)
4. Run: `npm run create-user`

### Option C: Via Registration (if enabled)

1. Visit your Railway domain
2. Click **Register** (if `ALLOW_REGISTRATION=true`)
3. Create account
4. First user is automatically admin

## Step 10: Configure Stripe Webhook (if using Stripe)

1. Go to [Stripe Dashboard](https://dashboard.stripe.com) → **Webhooks**
2. Click **Add endpoint**
3. Enter URL: `https://your-app-name.up.railway.app/api/stripe/webhook`
4. Select events to listen to
5. Copy webhook secret
6. Add to Railway variables: `STRIPE_WEBHOOK_SECRET`

## Troubleshooting

### Build Fails

- Check build logs in Railway dashboard
- Verify Dockerfile is correct
- Ensure all dependencies are in package.json

### Application Won't Start

- Check application logs
- Verify all required environment variables are set
- Check MongoDB connection string format
- Verify PORT is not overridden (Railway sets it automatically)

### Database Connection Errors

- Verify `MONGO_URI` is correct
- Check MongoDB service is running
- Ensure services are in the same Railway project

### Domain Not Working

- Wait a few minutes for DNS propagation
- Verify `DOMAIN_CLIENT` and `DOMAIN_SERVER` are set correctly
- Check service is deployed and running

### 500 Errors

- Check application logs
- Verify JWT secrets are set
- Check CREDS_KEY and CREDS_IV are set
- Verify API keys are valid

## Next Steps

- Configure custom domain (optional)
- Set up monitoring/alerts
- Configure backups for MongoDB
- Review and optimize resource usage
- Set up CI/CD for automatic deployments

## Useful Railway Commands

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link project
railway link

# View logs
railway logs

# Run command in service
railway run <command>

# Open service in browser
railway open
```

## Support

- [Railway Documentation](https://docs.railway.app)
- [LibreChat Documentation](https://docs.librechat.ai)
- Check `DEPLOYMENT_CHECKLIST.md` for verification steps

