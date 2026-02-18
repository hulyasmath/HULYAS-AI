# Code Sandbox MCP Server for LibreChat
# Provides secure Python/JavaScript code execution
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    nodejs \
    npm \
    && rm -rf /var/lib/apt/lists/*

# Install code-sandbox-mcp and dependencies
RUN pip install --no-cache-dir \
    git+https://github.com/philschmid/code-sandbox-mcp.git \
    uvicorn

# Create non-root user for sandbox execution
RUN useradd -m -s /bin/bash sandbox && \
    mkdir -p /tmp/sandbox && \
    chown sandbox:sandbox /tmp/sandbox

# Create the server wrapper with Docker-compatible security
RUN cat > /app/server.py << 'EOF'
"""
Code Sandbox MCP Server with Docker-compatible security settings
"""
from code_sandbox_mcp.server import mcp
from mcp.server.transport_security import TransportSecuritySettings

# Allow only expected Docker network hosts
mcp.settings.transport_security = TransportSecuritySettings(
    enable_dns_rebinding_protection=True,
    allowed_hosts=[
        "127.0.0.1:*",
        "localhost:*",
        "[::1]:*",
        "code-sandbox:*",
        "code_sandbox:*",
    ],
    allowed_origins=[
        "http://127.0.0.1:*",
        "http://localhost:*",
        "http://code-sandbox:*",
        "http://code_sandbox:*",
    ]
)

if __name__ == "__main__":
    mcp.run(transport='sse')
EOF

RUN chown sandbox:sandbox /app/server.py

EXPOSE 8001

USER sandbox

# Run the MCP server in SSE mode
CMD ["python", "/app/server.py"]
