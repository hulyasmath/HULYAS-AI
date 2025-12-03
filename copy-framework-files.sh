#!/bin/bash
# Copy framework JS files from public to dist so they're served correctly
cp /app/client/public/zeq-mathematical-framework.js /app/client/dist/ 2>/dev/null || true
cp /app/client/public/pdf-manager.js /app/client/dist/ 2>/dev/null || true
cp /app/client/public/transparency-manager.js /app/client/dist/ 2>/dev/null || true
echo "Framework files copied to dist"

