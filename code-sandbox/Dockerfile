# Code Sandbox MCP Server for LibreChat
# Provides secure Python/JavaScript code execution via MCP SSE
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    nodejs \
    npm \
    git \
    && rm -rf /var/lib/apt/lists/*

# Install code-sandbox-mcp and dependencies
RUN pip install --no-cache-dir \
    git+https://github.com/philschmid/code-sandbox-mcp.git \
    uvicorn

# Create non-root user for sandbox execution
RUN useradd -m -s /bin/bash sandbox && \
    mkdir -p /tmp/sandbox && \
    chown sandbox:sandbox /tmp/sandbox

# Create the server wrapper with Railway-compatible security
RUN cat > /app/server.py << 'PYEOF'
"""
Code Sandbox MCP Server with Railway-compatible security settings
Listens on PORT env var (Railway sets this) or defaults to 8001
"""
import os
from code_sandbox_mcp.server import mcp
from mcp.server.transport_security import TransportSecuritySettings

port = int(os.environ.get("PORT", "8001"))

# Allow Railway internal network hosts and Docker hosts
mcp.settings.transport_security = TransportSecuritySettings(
    enable_dns_rebinding_protection=False,
    allowed_hosts=[
        "127.0.0.1:*",
        "localhost:*",
        "[::1]:*",
        "0.0.0.0:*",
        "code-sandbox:*",
        "code_sandbox:*",
        "*.railway.internal:*",
        "host.docker.internal:*",
    ],
    allowed_origins=[
        "http://127.0.0.1:*",
        "http://localhost:*",
        "http://0.0.0.0:*",
        "http://code-sandbox:*",
        "http://code_sandbox:*",
        "http://*.railway.internal:*",
        "http://host.docker.internal:*",
    ]
)

PYEOF

RUN chown sandbox:sandbox /app/server.py

EXPOSE 8001

USER sandbox

# Run MCP server via fastmcp CLI on port 8001
# The server.py sets security settings; fastmcp CLI handles transport
CMD ["sh", "-c", "fastmcp run /app/server.py:mcp -t sse --host 0.0.0.0 --port ${PORT:-8001}"]
