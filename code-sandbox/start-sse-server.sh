#!/bin/bash
# Start Code Sandbox MCP as SSE server for LibreChat
# This runs on the host and is accessible to Docker containers via host.docker.internal

export PATH="/Users/monomaly/Library/Python/3.13/bin:$PATH"

echo "========================================"
echo "Code Sandbox MCP SSE Server"
echo "========================================"
echo "Port: 8001"
echo "Docker URL: http://host.docker.internal:8001/sse"
echo "Local URL: http://localhost:8001/sse"
echo "========================================"
echo ""

# Create wrapper script with Docker-compatible security settings
cat > /tmp/code_sandbox_server.py << 'EOF'
"""
Code Sandbox MCP Server with relaxed security for Docker access
"""
from code_sandbox_mcp.server import mcp
from mcp.server.transport_security import TransportSecuritySettings

# Allow Docker internal hosts
mcp.settings.transport_security = TransportSecuritySettings(
    enable_dns_rebinding_protection=True,
    allowed_hosts=[
        "127.0.0.1:*",
        "localhost:*",
        "[::1]:*",
        "host.docker.internal:*",
        "0.0.0.0:*",
    ],
    allowed_origins=[
        "http://127.0.0.1:*",
        "http://localhost:*",
        "http://host.docker.internal:*",
        "http://0.0.0.0:*",
    ]
)
EOF

echo "Starting server..."

# Use fastmcp CLI to run in SSE mode
/Users/monomaly/Library/Python/3.13/bin/fastmcp run /tmp/code_sandbox_server.py:mcp -t sse --host 0.0.0.0 --port 8001
