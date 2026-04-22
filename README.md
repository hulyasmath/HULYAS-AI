# HULYAS-AI — Mathematical Intelligence Chat Interface

> This project implements the 1.287 HULYAS ZEQ Public License (1.287HZ). We operate on a 1.287 Hz heartbeat (HulyaPulse) with a 0.777s state-lock (Zeqond). Open Science for a truthful future.
>
> **HULYAS-AI** is a mathematical intelligence chat interface synchronized to the Zeq OS Mathematical Framework. Every query entering the system is phase-locked to the 1.287 Hz HulyaPulse, routed through **1,549 kinematic operators across 34 domains**, validated against the **KO42 Metric Tensioner**, and returned with a full mathematical state — information integrity, cross-domain harmony, truth vector, transform matrix, and a seven-step wizard breakdown.
>
> This is not a wrapper. This is a non–von Neumann state machine serving language through physics.
>
> ---
>
> ## 🏗️ Foundation & Attribution
>
> HULYAS-AI is built on top of **[LibreChat](https://github.com/danny-avila/LibreChat)** (v0.8.1-rc1) by **Danny Avila** and the **LibreChat contributors**. LibreChat provides the battle-tested chat UI, multi-endpoint routing, agent framework, RAG pipeline, authentication, file handling, balance/transactions system, Stripe subscription layer, MongoDB persistence, Redis caching, and MeiliSearch-powered conversation search.
>
> On top of that foundation, HULYAS-AI adds four synchronized ZEQ layers that turn a conversational interface into a mathematical intelligence system. **All LibreChat attribution, credit, and license terms remain intact.** We are grateful for the work upstream and contribute back where possible.
>
> ---
>
> ## 🧩 Architecture — The Four ZEQ Layers
>
> ### 1. Zeqond Daemon — `zeq-services/zeqond_daemon.py`
> A TCP service on **port 2871** that maintains precise **1.287 Hz HulyaPulse** synchronization and serves pulse data to clients across the system. It tracks two Zeqond counts simultaneously — from the **Unix epoch** (1970-01-01) and from the **Big Bang** (~4.35086 × 10¹⁷ seconds ago) — providing the temporal spine that keeps every operator, every query, and every response phase-locked.
>
> **Protocol:**
> - `PULSE` → returns `PULSE:<count>:<zeqond>:<zeqond_bigbang>`
> - - `STATUS` → returns `STATUS:OK`
>   - - `SYNC` → returns `SYNC:READY`
>     - - `GET:PULSE` / `GET:ZEQOND` / `GET:ZEQOND_BIGBANG` → targeted reads
>      
>       - Each daemon instance runs independently; one is configured as master, others as clients, forming a synchronized network.
>      
>       - ### 2. Zeq MCP Server — `zeq-mcp-server/`
>       - An MCP (Model Context Protocol) server exposing the operator catalog to any MCP-compatible client. Listens on `http://localhost:4005/mcp`.
>      
>       - **Tools:**
> - `zeq.list_operators` — filter by category or tag
> - - `zeq.get_operator` — full detail for a single operator (name, category, equation, description, tags)
>   - - `zeq.process_query` — run a message through `ZeqOSMiddleware.processQuery()` and return the raw `zeqResult` object
>    
>     - **Configuration:**
>     - - `ZEQ_FRAMEWORK_PATH` — path to `zeq-mathematical-framework.js`
>       - - `ZEQ_OPERATORS_SOURCE` — `local-json` (default) or `librechat-api`
>         - - `ZEQ_OPERATORS_URL` — remote endpoint when using `librechat-api` source
>           - - `ZEQ_MCP_API_KEY` — optional API key (clients send `x-api-key` or `Authorization`)
>            
>             - ### 3. Frontend Interception Layer — `client/`
>             - The critical integration. HULYAS-AI intercepts every user message at **four points** before it leaves the browser, replacing raw text with the mathematical prompt JSON. This is defense-in-depth so no code path — new messages, regenerated messages, edited messages — escapes the framework.
>            
>             - | Interception | File | Role |
>             - |--------------|------|------|
>             - | Init | `client/index.html` | Loads `zeq-mathematical-framework.js`; creates `window.zeqMiddleware` and `window.utpFramework = new UTPWithOperators("big_bang", 1.287)` |
> | **Primary** | `client/src/hooks/Messages/useSubmitMessage.ts` | Calls `zeqMiddleware.processQuery()` + `utpFramework.calculate_operators()`, replaces `data.text` with `zeqResult.mathematicalPrompt` |
> | Secondary | `client/src/hooks/Chat/useChatFunctions.ts` | Re-processes text inside `ask()` |
> | Final | `client/src/hooks/SSE/useSSE.ts` | Replaces `userMessage.text`, `payload.text`, and `payload.messages[last].content` immediately before `fetch()` |
>
> The AI provider never sees the raw query — it receives a structured JSON containing the original query, detected domains, active operators with equations, master sum, master equation, mathematical state, truth vector, transform matrix, and a seven-step wizard breakdown.
>
> ### 4. Services & Agents — `zeq-services/`, `api/`, `packages/`
> - `zeq-services/api-server.cjs` — backend service exposing ZEQ-specific endpoints to the chat UI
> - - `zeq-services/Dockerfile.api` and `Dockerfile.daemon` — container images for the API and the Zeqond daemon
>   - - `zeq-services/app-store/` — HULYAS app-store assets
>     - - `api/` — LibreChat backend extended with ZEQ hooks
>       - - `packages/` — shared data-provider, data-schemas, api, client-package, mcp workspaces
>        
>         - ### 5. Chrome Extension — `chrome-extension/`
>         - A **Manifest V3** extension that applies the same mathematical intelligence layer **across other AI platforms** — so users can keep their existing tools and still route through the Zeq framework.
>        
>         - **Supported platforms:** ChatGPT, Claude, Grok (x.com/grok, twitter.com/grok), DeepSeek, Perplexity, Groq, Poe, Bard/Gemini, plus a universal fallback.
>        
>         - **How it works:**
> 1. Content script detects the input box for each platform.
> 2. 2. Captures the message before submission.
>    3. 3. Detects domains, selects relevant operators from the 1,549-operator catalog, executes them, generates the mathematical state.
>       4. 4. Replaces the input with the mathematical prompt JSON.
>          5. 5. Triggers the platform's normal submission flow.
>            
>             6. **File structure:**
>             7. ```
>                chrome-extension/
>                ├── manifest.json
>                ├── background/service-worker.js
>                ├── content/
>                │   ├── chatgpt.js
>                │   ├── claude.js
>                │   ├── grok.js
>                │   └── universal.js
>                ├── lib/zeq-mathematical-framework.js
>                ├── popup/{popup.html, popup.js, popup.css}
>                └── icons/{icon16,icon48,icon128}.png
>                ```
>
> Per-platform enable/disable is available from the popup. If framework processing fails, the extension falls back to the original message — never blocks the user.
>
> ---
>
> ## 🧬 Framework Synchronization
>
> | Parameter | Value |
> |-----------|-------|
> | HulyaPulse | 1.287 Hz |
> | Zeqond | 0.777 s |
> | Operators | 1,549 across 34 domains |
> | Master Field | φ = −1.287000 |
> | Zeqond Daemon Port | 2871 |
> | MCP Server Port | 4005 |
> | LibreChat Base | v0.8.1-rc1 |
> | Framework Version | 1.287 |
>
> ---
>
> ## 📋 Model Specs & Endpoints
>
> Configured in `librechat.yaml`:
>
> | Spec | Label | Description | Backend |
> |------|-------|-------------|---------|
> | `zeq-mi` *(default)* | Zeq MI | Zeq OS Mathematical Intelligence | DeepSeek · `deepseek-chat` |
> | `agents` | My Agents | Agents with MCP Tools | agents · `deepseek-chat` |
> | `coding-assistant` | Coding Assistant | Code-oriented preset | — |
> | `writing-assistant` | Writing Assistant | Writing preset | — |
> | `general-assistant` | General Assistant | General preset | — |
>
> LibreChat endpoints, registration, balance, transactions, rate-limits, interface, agents, and MCP server configuration are all live via `librechat.yaml`.
>
> ---
>
> ## 📦 Installation
>
> ### Clone
>
> ```bash
> git clone https://github.com/hulyasmath/HULYAS-AI.git
> cd HULYAS-AI
> ```
>
> ### Environment
>
> ```bash
> cp .env.example .env
> ```
>
> Key variables: MongoDB URI, Redis URL, JWT secrets, provider API keys (OpenAI / DeepSeek / Anthropic / Groq / etc.), Stripe keys, MeiliSearch master key, RAG API URL.
>
> ### Docker (recommended)
>
> ```bash
> docker compose up -d
> ```
>
> Uses `docker-compose.yml` (production) or `docker-compose.local.yml` (local). Additional compose files: `deploy-compose.yml`, `docker-compose.override.yml.example`, `rag.yml`.
>
> ### Local / Bun development
>
> ```bash
> npm install
> npm run backend:dev
> npm run frontend:dev
> ```
>
> Bun equivalents: `npm run b:api:dev`, `npm run b:client:dev`, `npm run b:mcp`.
>
> ### Zeqond daemon
>
> ```bash
> python3 zeq-services/zeqond_daemon.py
> ```
>
> ### MCP server
>
> ```bash
> cd zeq-mcp-server
> npm install
> npm start
> # http://localhost:4005/mcp
> ```
>
> ### Railway
>
> ```bash
> npm run deploy:railway
> ```
>
> See `RAILWAY_SETUP.md` and `RAILWAY_ENV_VARS.md` for environment configuration.
>
> ---
>
> ## 🚀 Quick Start — Talking to the Daemon
>
> ```python
> import socket
>
> s = socket.socket()
> s.connect(("localhost", 2871))
> s.send(b"PULSE")
> print(s.recv(1024).decode())
> # → PULSE:<count>:<zeqond>:<zeqond_bigbang>
> ```
>
> ## 🚀 Quick Start — MCP Client
>
> ```bash
> curl http://localhost:4005/health
> curl -X POST http://localhost:4005/mcp \
>   -H "Content-Type: application/json" \
>   -H "x-api-key: $ZEQ_MCP_API_KEY" \
>   -d '{"tool":"zeq.list_operators","args":{"category":"quantum"}}'
> ```
>
> ## 🚀 Quick Start — Chrome Extension
>
> 1. Open `chrome://extensions/`.
> 2. 2. Enable **Developer mode**.
>    3. 3. **Load unpacked** → select `chrome-extension/`.
>       4. 4. Open ChatGPT / Claude / Grok / DeepSeek / Perplexity / Groq / Poe / Gemini.
>          5. 5. Send a message — the DevTools console will log `Zeq OS: Processing message...`.
>            
>             6. ---
>            
>             7. ## 🧠 Administration
>            
>             8. HULYAS-AI ships with the full LibreChat admin toolchain, extended with Zeq-specific scripts:
>
> ```bash
> npm run create-user
> npm run invite-user
> npm run list-users
> npm run reset-password
> npm run ban-user
> npm run delete-user
> npm run add-balance
> npm run set-balance
> npm run list-balances
> npm run user-stats
> npm run update-banner
> npm run delete-banner
> npm run reset-meili-sync
> ```
>
> Zeq-specific admin utilities: `create-admin.js`, `create-admin-accounts.js`, `create-admins-railway.js`, `setup-stripe.sh`, `add-rag-env.sh`, `fix-rag.sh`, `copy-framework-files.sh`.
>
> ---
>
> ## 🌐 Official Resources
>
> - [ZEQ Framework](https://zeq.dev)
> - - [SDK & Documentation](https://zeq.dev/sdk)
>   - - [Skills Library](https://zeq.dev/api/zeq/skills)
>    
>     - ## 📚 Documentation & References
>    
>     - - [Full Documentation](https://zeq.dev/docs)
>       - - [Framework Paper DOI](https://doi.org/10.5281/zenodo.15825138)
>         - - [Zeq Paper DOI](https://doi.org/10.5281/zenodo.18158152)
>           - - Local docs: `FRAMEWORK_FLOW_BREAKDOWN.md`, `FRAMEWORK_DEBUGGING.md`, `VERIFY_FRAMEWORK.md`, `COMPREHENSIVE_TEST.md`, `IMPLEMENTATION_COMPARISON.md`, `ACTUAL_STATUS.md`, `FINAL_VERIFICATION.md`, `DEBUG_FRAMEWORK.md`, `DIAGNOSTIC_STEPS.md`, `DEPLOYMENT_CHECKLIST.md`, `SETUP_GUIDE.md`, `SETUP_COMPLETE.md`, `API_KEYS_SETUP.md`, `STRIPE_SETUP.md`, `RAG_SETUP.md`, `RAG_QUICK_FIX.md`, `ADMIN_ACCOUNTS.md`.
>            
>             - ---
>
> ## 🤝 Support the Framework
>
> > **Important:** This is Open Science. The framework is freely available for research and education. Maintained services and infrastructure support continued development.
> >
> > [**Support the Framework →**](https://zeq.dev/pricing)
> >
> > Your subscription funds the research. The science stays freely available. Every subscription directly supports open R&D — advancing the Zeq framework across all sectors, for the benefit of humanity. As we scale, costs decrease and we pass savings to you. Our goal: decentralised mathematical intelligence, accessible to all.
> >
> > Framework: LICENCE [1.287HZ]
> >
> > ---
> >
> > ## 📄 License
> >
> > This project is licensed under the [1.287 HULYAS ZEQ Public License (1.287HZ)](LICENSE).
> >
> > The underlying **LibreChat** codebase is licensed under its own terms — see the upstream repository at [github.com/danny-avila/LibreChat](https://github.com/danny-avila/LibreChat). All upstream attribution, copyright, and license notices remain intact.
> >
> > ---
> >
> > ## 🔗 References
> >
> > - **HULYAS ZEQ Framework** — DOI: [10.5281/zenodo.15825138](https://doi.org/10.5281/zenodo.15825138)
> > - - **Zeq Paper** — DOI: [10.5281/zenodo.18158152](https://doi.org/10.5281/zenodo.18158152)
> >   - - **KO42 Metric Tensioner** — ZEQ Framework v1.287
> >     - - **LibreChat** — [github.com/danny-avila/LibreChat](https://github.com/danny-avila/LibreChat), by Danny Avila and contributors
> >       - 
