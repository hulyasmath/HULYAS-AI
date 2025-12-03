# v0.8.1-rc1

# Base node image
FROM node:20-alpine AS node

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

COPY --chown=node:node package.json package-lock.json ./
COPY --chown=node:node api/package.json ./api/package.json
COPY --chown=node:node client/package.json ./client/package.json
COPY --chown=node:node packages/data-provider/package.json ./packages/data-provider/package.json
COPY --chown=node:node packages/data-schemas/package.json ./packages/data-schemas/package.json
COPY --chown=node:node packages/api/package.json ./packages/api/package.json

RUN \
    # Allow mounting of these files, which have no default
    touch .env ; \
    # Create directories for the volumes to inherit the correct permissions
    mkdir -p /app/client/public/images /app/api/logs /app/uploads ; \
    npm config set fetch-retry-maxtimeout 600000 ; \
    npm config set fetch-retries 5 ; \
    npm config set fetch-retry-mintimeout 15000 ; \
    npm ci --no-audit

COPY --chown=node:node . .

RUN \
    # Build all packages explicitly first
    echo "Building data-schemas..." && \
    npm run build:data-schemas && \
    test -f packages/data-schemas/dist/index.cjs || (echo "ERROR: data-schemas build failed!" && exit 1) && \
    echo "Building data-provider..." && \
    npm run build:data-provider && \
    echo "Building api package..." && \
    npm run build:api && \
    echo "Building client-package..." && \
    npm run build:client-package && \
    # React client build
    echo "Building React client..." && \
    NODE_OPTIONS="--max-old-space-size=2048" npm run build:client && \
    # Verify critical packages are built before pruning
    test -f packages/data-schemas/dist/index.cjs || (echo "ERROR: data-schemas missing after build!" && exit 1) && \
    test -f packages/data-provider/dist/index.es.js || (echo "ERROR: data-provider missing after build!" && exit 1) && \
    # Prune dev dependencies (but keep built dist folders)
    npm prune --production && \
    # Verify dist folders still exist after prune
    test -f packages/data-schemas/dist/index.cjs || (echo "ERROR: data-schemas dist removed by prune!" && exit 1) && \
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
