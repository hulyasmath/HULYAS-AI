# API Keys Setup for DeepSeek and Groq

## ✅ Configuration Complete

I've configured both endpoints in `librechat.yaml`:

### 1. **Groq** (with Llama 3.1 8B)
- Endpoint name: `groq`
- Base URL: `https://api.groq.com/openai/v1/`
- Models configured:
  - `llama-3.1-8b-instruct` (primary)
  - Other Groq models available

### 2. **DeepSeek**
- Endpoint name: `DeepSeek`
- Base URL: `https://api.deepseek.com/v1`
- Models configured:
  - `deepseek-chat`
  - `deepseek-coder`

## 🔑 Add Your API Keys

### Step 1: Get Your API Keys

1. **Groq API Key**:
   - Sign up at: https://console.groq.com/
   - Navigate to API Keys section
   - Create a new API key

2. **DeepSeek API Key**:
   - Sign up at: https://platform.deepseek.com/
   - Navigate to API Keys section
   - Create a new API key

### Step 2: Add Keys to .env File

Edit the `.env` file and replace the placeholders:

```bash
# Groq API Key (for Llama 3.1 8B and other models)
GROQ_API_KEY=your-actual-groq-api-key-here

# DeepSeek API Key
DEEPSEEK_API_KEY=your-actual-deepseek-api-key-here
```

### Step 3: Restart the API

After adding your API keys, restart the LibreChat API:

```bash
cd /Users/monomaly/Desktop/LibreChat-main
docker compose restart api
```

### Step 4: Verify in LibreChat

1. Open http://localhost:3080
2. Start a new conversation
3. Click on the model selector
4. You should see:
   - **Groq** endpoint with `llama-3.1-8b-instruct` model
   - **DeepSeek** endpoint with `deepseek-chat` and `deepseek-coder` models

## 📝 Configuration Details

The endpoints are configured in `librechat.yaml`:

```yaml
endpoints:
  custom:
    # Groq Configuration with Llama 3.1 8B
    - name: 'groq'
      apiKey: '${GROQ_API_KEY}'
      baseURL: 'https://api.groq.com/openai/v1/'
      models:
        default:
          - 'llama-3.1-8b-instruct'
      titleConvo: true
      titleModel: 'llama-3.1-8b-instruct'
      modelDisplayLabel: 'Groq'
    
    # DeepSeek Configuration
    - name: 'DeepSeek'
      apiKey: '${DEEPSEEK_API_KEY}'
      baseURL: 'https://api.deepseek.com/v1'
      models:
        default:
          - 'deepseek-chat'
          - 'deepseek-coder'
      titleConvo: true
      titleModel: 'deepseek-chat'
      modelDisplayLabel: 'DeepSeek'
```

## 🚀 Testing

Once you've added your API keys and restarted:

1. Go to http://localhost:3080
2. Start a new chat
3. Select **Groq** → **llama-3.1-8b-instruct** or **DeepSeek** → **deepseek-chat**
4. Send a test message to verify it's working

## ⚠️ Troubleshooting

If the endpoints don't appear:

1. **Check API keys are correct**: Make sure there are no extra spaces in your `.env` file
2. **Check logs**: `docker compose logs api | grep -i error`
3. **Verify configuration**: The `librechat.yaml` file should be mounted in the container
4. **Restart**: Make sure you restarted the API after adding keys

## 📚 Resources

- **Groq Documentation**: https://console.groq.com/docs
- **DeepSeek Documentation**: https://platform.deepseek.com/api-docs
- **LibreChat Docs**: https://docs.librechat.ai

