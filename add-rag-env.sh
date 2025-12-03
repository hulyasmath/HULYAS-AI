#!/bin/bash
# Add RAG environment variables to .env

ENV_FILE=".env"

# Check if .env exists, create if not
if [ ! -f "$ENV_FILE" ]; then
    touch "$ENV_FILE"
fi

# Add RAG configuration if not present
if ! grep -q "^RAG_PORT=" "$ENV_FILE" 2>/dev/null; then
    echo "RAG_PORT=8000" >> "$ENV_FILE"
    echo "Added RAG_PORT=8000"
fi

if ! grep -q "^RAG_API_URL=" "$ENV_FILE" 2>/dev/null; then
    echo "RAG_API_URL=http://rag_api:8000" >> "$ENV_FILE"
    echo "Added RAG_API_URL=http://rag_api:8000"
fi

if ! grep -q "^EMBEDDINGS_PROVIDER=" "$ENV_FILE" 2>/dev/null; then
    echo "EMBEDDINGS_PROVIDER=openai" >> "$ENV_FILE"
    echo "Added EMBEDDINGS_PROVIDER=openai"
fi

if ! grep -q "^EMBEDDINGS_MODEL=" "$ENV_FILE" 2>/dev/null; then
    echo "EMBEDDINGS_MODEL=text-embedding-3-small" >> "$ENV_FILE"
    echo "Added EMBEDDINGS_MODEL=text-embedding-3-small"
fi

echo ""
echo "⚠️  IMPORTANT: You need to add your OPENAI_API_KEY to .env"
echo "   Add this line to .env:"
echo "   OPENAI_API_KEY=sk-your-actual-key-here"
echo ""
echo "After adding the key, run: docker compose restart rag_api"
