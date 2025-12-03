#!/bin/bash
# Quick fix script for RAG system

echo "🔧 Fixing RAG System Configuration..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Creating it..."
    touch .env
fi

# Check if OPENAI_API_KEY is already set
if grep -q "^OPENAI_API_KEY=" .env 2>/dev/null; then
    echo "✅ OPENAI_API_KEY already exists in .env"
    echo "Current value: $(grep "^OPENAI_API_KEY=" .env | cut -d'=' -f2 | cut -c1-10)..."
else
    echo "⚠️  OPENAI_API_KEY not found in .env"
    echo ""
    echo "Please add your OpenAI API key to .env file:"
    echo "  OPENAI_API_KEY=sk-your-key-here"
    echo ""
    read -p "Do you want to add it now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "Enter your OpenAI API key: " api_key
        echo "OPENAI_API_KEY=$api_key" >> .env
        echo "✅ Added OPENAI_API_KEY to .env"
    else
        echo "Please add OPENAI_API_KEY to .env manually and run: docker compose restart rag_api"
        exit 1
    fi
fi

# Check for RAG configuration
if ! grep -q "^RAG_PORT=" .env 2>/dev/null; then
    echo "RAG_PORT=8000" >> .env
    echo "✅ Added RAG_PORT=8000"
fi

if ! grep -q "^RAG_API_URL=" .env 2>/dev/null; then
    echo "RAG_API_URL=http://rag_api:8000" >> .env
    echo "✅ Added RAG_API_URL=http://rag_api:8000"
fi

if ! grep -q "^EMBEDDINGS_PROVIDER=" .env 2>/dev/null; then
    echo "EMBEDDINGS_PROVIDER=openai" >> .env
    echo "✅ Added EMBEDDINGS_PROVIDER=openai"
fi

if ! grep -q "^EMBEDDINGS_MODEL=" .env 2>/dev/null; then
    echo "EMBEDDINGS_MODEL=text-embedding-3-small" >> .env
    echo "✅ Added EMBEDDINGS_MODEL=text-embedding-3-small"
fi

echo ""
echo "🔄 Restarting RAG API container..."
docker compose restart rag_api

echo ""
echo "⏳ Waiting for RAG API to start..."
sleep 5

# Check status
if docker compose ps rag_api | grep -q "Up"; then
    echo "✅ RAG API is running!"
    echo ""
    echo "📋 RAG System Status:"
    docker compose ps rag_api vectordb
else
    echo "❌ RAG API failed to start. Check logs:"
    echo "   docker compose logs rag_api --tail 20"
fi




