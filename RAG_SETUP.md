# RAG System Setup Guide

This guide will help you set up the RAG (Retrieval Augmented Generation) system for Zeq OS 1.287 Hz.

## Overview

The RAG system allows the AI to:
- Index PDF documents and other files
- Retrieve relevant context from indexed files
- Provide more accurate, context-aware responses based on your documents

## Prerequisites

1. **Docker and Docker Compose** - Already installed
2. **Embedding Provider API Key** - Choose one:
   - OpenAI API key (recommended)
   - Anthropic API key
   - Google API key
   - Azure OpenAI credentials

## Step 1: Add Required Environment Variables

Add the following variables to your `.env` file:

### Required Variables

```bash
# RAG API Configuration
RAG_PORT=8000
RAG_API_URL=http://rag_api:8000

# Embedding Provider (choose one)
EMBEDDINGS_PROVIDER=openai  # Options: openai, anthropic, google, azure_openai
EMBEDDINGS_MODEL=text-embedding-3-small  # Model for embeddings

# API Keys (add the one matching your EMBEDDINGS_PROVIDER)
OPENAI_API_KEY=sk-...  # Required if EMBEDDINGS_PROVIDER=openai
# OR
ANTHROPIC_API_KEY=sk-ant-...  # Required if EMBEDDINGS_PROVIDER=anthropic
# OR
GOOGLE_API_KEY=...  # Required if EMBEDDINGS_PROVIDER=google
# OR (for Azure OpenAI)
AZURE_OPENAI_API_KEY=...
AZURE_OPENAI_API_INSTANCE_NAME=...
AZURE_OPENAI_API_DEPLOYMENT_NAME=...
AZURE_OPENAI_API_VERSION=2024-02-15-preview
```

### Example .env Configuration

```bash
# RAG Settings
RAG_PORT=8000
RAG_API_URL=http://rag_api:8000
EMBEDDINGS_PROVIDER=openai
EMBEDDINGS_MODEL=text-embedding-3-small
OPENAI_API_KEY=sk-your-openai-api-key-here
```

## Step 2: Start RAG Services

The RAG system consists of two containers:
1. **vectordb** - PostgreSQL with pgvector extension (vector database)
2. **rag_api** - Python API for embedding and querying documents

Start the services:

```bash
# Start RAG services (if not already running)
docker compose up -d vectordb rag_api

# Check status
docker compose ps rag_api vectordb

# View logs
docker compose logs rag_api -f
```

## Step 3: Verify RAG API is Running

Check that the RAG API started successfully:

```bash
# Check container status
docker compose ps rag_api

# Should show "Up" status, not "Restarting"
```

If the container is restarting, check the logs:

```bash
docker compose logs rag_api --tail 50
```

Common issues:
- **Missing API key**: Add `OPENAI_API_KEY` (or other provider key) to `.env`
- **Wrong provider**: Ensure `EMBEDDINGS_PROVIDER` matches your API key
- **Database connection**: Ensure `vectordb` container is running

## Step 4: Configure Main API

The main API needs to know where the RAG API is. This is already configured in `docker-compose.yml`:

```yaml
environment:
  - RAG_API_URL=http://rag_api:${RAG_PORT:-8000}
```

Restart the main API container to pick up changes:

```bash
docker compose restart api
```

## Step 5: Test RAG System

### Upload a PDF

1. Open Zeq OS 1.287 Hz in your browser
2. Start a new conversation
3. Click the paperclip icon to attach a file
4. Upload a PDF document
5. The system will automatically:
   - Extract text from the PDF
   - Generate embeddings
   - Store in the vector database

### Query with Context

1. After uploading a PDF, ask a question about its content
2. The AI will:
   - Search the vector database for relevant sections
   - Include context in the prompt
   - Provide an answer based on the document

Example:
```
User: "What is the main topic of this document?"
AI: [Will search the PDF and provide context-aware answer]
```

## Troubleshooting

### RAG API Not Starting

**Error**: `openai.OpenAIError: The api_key client option must be set`

**Solution**: Add your embedding provider API key to `.env`:
```bash
OPENAI_API_KEY=sk-your-key-here
```

Then restart:
```bash
docker compose restart rag_api
```

### Vector Database Connection Issues

**Error**: Connection refused to vectordb

**Solution**: Ensure vectordb is running:
```bash
docker compose up -d vectordb
docker compose ps vectordb
```

### Files Not Being Indexed

**Check**:
1. Is `RAG_API_URL` set in the main API container?
2. Are file uploads working?
3. Check RAG API logs for embedding errors:
   ```bash
   docker compose logs rag_api -f
   ```

### No Context in Responses

**Possible causes**:
1. File wasn't successfully embedded (check logs)
2. Query doesn't match document content
3. RAG_USE_FULL_CONTEXT not enabled (optional)

## Advanced Configuration

### Use Full Document Context

To use the entire document instead of semantic search:

```bash
RAG_USE_FULL_CONTEXT=true
```

### Change Embedding Model

For different models:

```bash
# OpenAI
EMBEDDINGS_MODEL=text-embedding-3-large

# Anthropic
EMBEDDINGS_MODEL=claude-3-opus-20240229

# Google
EMBEDDINGS_MODEL=textembedding-gecko@003
```

## Architecture

```
┌─────────────┐
│   Browser   │
│  (Upload)   │
└──────┬──────┘
       │
       ▼
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│  Main API   │─────▶│   RAG API   │─────▶│  Vector DB   │
│             │      │ (Embeddings) │      │  (pgvector)  │
└─────────────┘      └─────────────┘      └─────────────┘
       │
       ▼
┌─────────────┐
│     AI      │
│  (Response) │
└─────────────┘
```

## Support

If you encounter issues:
1. Check container logs: `docker compose logs rag_api`
2. Verify environment variables are set correctly
3. Ensure all containers are running: `docker compose ps`




