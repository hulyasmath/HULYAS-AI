# RAG System - Quick Fix

## Current Status
- ✅ Vector DB (vectordb) - Running
- ✅ pgvector extension - Installed
- ❌ RAG API - Restarting (needs OPENAI_API_KEY)

## The Problem
The RAG API container keeps restarting because it's missing the `OPENAI_API_KEY` environment variable.

## The Fix (2 steps)

### Step 1: Add OPENAI_API_KEY to .env

Open your `.env` file and add:

```bash
OPENAI_API_KEY=sk-your-actual-openai-api-key-here
```

**Where to get your key:**
- Go to https://platform.openai.com/api-keys
- Create a new API key
- Copy it and paste into .env

### Step 2: Restart RAG API

```bash
docker compose restart rag_api
```

### Step 3: Verify it's working

```bash
# Check status (should show "Up" not "Restarting")
docker compose ps rag_api

# Check logs (should show no errors)
docker compose logs rag_api --tail 20
```

## What This Enables

Once the RAG API is running, you can:
1. Upload PDFs through the chat interface
2. The system will automatically index them
3. Ask questions about the PDFs - the AI will retrieve relevant sections
4. Get context-aware answers based on your documents

## Alternative: Use a Different Embedding Provider

If you don't have an OpenAI key, you can use:

**Anthropic:**
```bash
EMBEDDINGS_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-your-key
```

**Google:**
```bash
EMBEDDINGS_PROVIDER=google
GOOGLE_API_KEY=your-key
```

Then restart: `docker compose restart rag_api`




