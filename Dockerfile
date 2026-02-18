# v0.8.1-rc1
# CACHE_BUST: 2026-02-18T14:45:00Z-librechat-deploy - UPDATE THIS TIMESTAMP TO FORCE FRESH BUILD

# Cache busting - Railway will automatically provide these build args
# If not provided, use defaults that change on each build
ARG RAILWAY_GIT_COMMIT
ARG RAILWAY_GIT_BRANCH
ARG CACHE_BUST=2026-02-18T14:45:00Z-librechat-deploy

# Base node image
FROM node:20-alpine AS node

# Use the cache bust arg to invalidate cache - this forces fresh builds
RUN echo "Build cache bust: ${CACHE_BUST}" && \
    echo "Git commit: ${RAILWAY_GIT_COMMIT:-local-build}" && \
    echo "Git branch: ${RAILWAY_GIT_BRANCH:-unknown}" && \
    echo "Timestamp: $(date -u +'%Y-%m-%dT%H:%M:%SZ')"

# Install jemalloc
RUN apk add --no-cache jemalloc
RUN apk add --no-cache python3 py3-pip uv

# Set environment variable to use jemalloc
ENV LD_PRELOAD=/usr/lib/libjemalloc.so.2

# Add `uv` for extended MCP support
COPY --from=ghcr.io/astral-sh/uv:0.6.13 /uv /uvx /bin/
RUN uv --version

RUN mkdir -p /app && chown node:node /app
WORKDIR /app

USER node

# Copy build ID file first to bust cache - this file changes on each commit
COPY --chown=node:node .railway-build-id /app/.railway-build-id

COPY --chown=node:node package.json package-lock.json ./
COPY --chown=node:node api/package.json ./api/package.json
COPY --chown=node:node client/package.json ./client/package.json
COPY --chown=node:node packages/data-provider/package.json ./packages/data-provider/package.json
COPY --chown=node:node packages/data-schemas/package.json ./packages/data-schemas/package.json
COPY --chown=node:node packages/api/package.json ./packages/api/package.json

RUN \
    touch .env ; \
    mkdir -p /app/client/public/images /app/api/logs /app/uploads ; \
    npm config set fetch-retry-maxtimeout 1200000 ; \
    npm config set fetch-retries 10 ; \
    npm config set fetch-retry-mintimeout 30000 ; \
    npm ci --no-audit && \
    npm install --no-save --legacy-peer-deps winston-daily-rotate-file && \
    # Explicitly install lucide-react to ensure it's available for packages/client build
    npm install --no-save lucide-react@^0.394.0 && \
    # Ensure all workspace dependencies are properly linked
    npm install --workspaces --no-save

COPY --chown=node:node . .

# Verify essential files are present before build
RUN test -f packages/api/src/memory/config.ts || (echo "ERROR: memory/config.ts not found in build context!" && exit 1)

# Add build metadata for cache busting
RUN echo "Build Date: ${BUILD_DATE:-$(date -u +'%Y-%m-%dT%H:%M:%SZ')}" > /app/.build-info && \
    echo "Git Commit: ${GIT_COMMIT:-unknown}" >> /app/.build-info && \
    echo "Cache Bust: ${CACHE_BUST}" >> /app/.build-info

# Verify critical source files exist before build
RUN test -f packages/api/src/memory/config.ts || (echo "ERROR: memory/config.ts not found in build context!" && exit 1)

RUN \
    # Verify lucide-react is available before building
    echo "Verifying lucide-react installation..." && \
    (npm list lucide-react || npm install --no-save lucide-react@^0.394.0) && \
    # Build all packages explicitly first (in dependency order)
    echo "Building data-schemas..." && \
    npm run build:data-schemas && \
    test -f packages/data-schemas/dist/index.cjs || (echo "ERROR: data-schemas build failed!" && exit 1) && \
    echo "Building data-provider..." && \
    npm run build:data-provider && \
    test -f packages/data-provider/dist/index.es.js || (echo "ERROR: data-provider build failed!" && exit 1) && \
    echo "Building api package..." && \
    npm run build:api && \
    test -f packages/api/dist/index.js || (echo "ERROR: api package build failed!" && exit 1) && \
    # Ensure lucide-react is available in node_modules before building client-package
    echo "Ensuring lucide-react is available for packages/client build..." && \
    (test -d node_modules/lucide-react || npm install --no-save lucide-react@^0.394.0) && \
    echo "Building client-package..." && \
    npm run build:client-package && \
    # React client build
    echo "Building React client..." && \
    NODE_OPTIONS="--max-old-space-size=2048" npm run build:client && \
    # Verify critical packages are built
    test -f packages/data-schemas/dist/index.cjs || (echo "ERROR: data-schemas missing after build!" && exit 1) && \
    test -f packages/data-provider/dist/index.es.js || (echo "ERROR: data-provider missing after build!" && exit 1) && \
    test -f packages/api/dist/index.js || (echo "ERROR: api package missing after build!" && exit 1) && \
    # Ensure workspace packages are properly linked (reinstall to fix any broken symlinks)
    npm install --no-save --legacy-peer-deps && \
    # Verify workspace packages are accessible via symlinks with detailed error output
    echo "Verifying symlinks..." && \
    (test -f node_modules/@librechat/data-schemas/dist/index.cjs || (echo "ERROR: data-schemas not accessible via symlink!" && echo "Checking symlink:" && ls -la node_modules/@librechat/data-schemas 2>/dev/null || echo "Symlink does not exist" && echo "Checking source:" && ls -la packages/data-schemas/dist/ 2>/dev/null || echo "Source dist does not exist" && exit 1)) && \
    (test -f node_modules/@librechat/api/dist/index.js || (echo "ERROR: api package not accessible via symlink!" && echo "Checking symlink:" && ls -la node_modules/@librechat/api 2>/dev/null || echo "Symlink does not exist" && echo "Checking source:" && ls -la packages/api/dist/ 2>/dev/null || echo "Source dist does not exist" && exit 1)) && \
    echo "All packages built and verified successfully!" && \
    npm cache clean --force

# Node API setup
# Railway provides PORT env var automatically, default to 3080 for local builds
ENV PORT=3080
EXPOSE ${PORT}
ENV HOST=0.0.0.0
CMD ["npm", "run", "backend"]

# Optional: for client with nginx routing
# FROM nginx:stable-alpine AS nginx-client
# WORKDIR /usr/share/nginx/html
# COPY --from=node /app/client/dist /usr/share/nginx/html
# COPY client/nginx.conf /etc/nginx/conf.d/default.conf
# ENTRYPOINT ["nginx", "-g", "daemon off;"]
