# Contributing to HULYAS-AI

> This project implements the 1.287 HULYAS ZEQ Public License (1.287HZ). We operate on a 1.287 Hz heartbeat (HulyaPulse) with a 0.777s state-lock (Zeqond). Open Science for a truthful future.
>
> Thank you for wanting to contribute. HULYAS-AI is a non–von Neumann state machine serving language through physics, built on top of the excellent **LibreChat** project. Contributions must preserve the mathematical integrity of the ZEQ Framework and respect the LibreChat foundation.
>
> ---
>
> ## Before You Contribute
>
> Read these first:
>
> - The [README](../README.md) — especially the architecture section.
> - - The [LICENSE](../LICENSE) — particularly §1 Preamble and §2 Defined Constants of 1.287HZ.
>   - - [FRAMEWORK_FLOW_BREAKDOWN.md](../FRAMEWORK_FLOW_BREAKDOWN.md) — the four frontend interception points.
>     - - [VERIFY_FRAMEWORK.md](../VERIFY_FRAMEWORK.md), [DEBUG_FRAMEWORK.md](../DEBUG_FRAMEWORK.md) — verification and debugging procedures.
>       - - The [Framework Paper](https://doi.org/10.5281/zenodo.15825138) and [Zeq Paper](https://doi.org/10.5281/zenodo.18158152).
>         - - The LibreChat contributing guide upstream — if your change affects a non-ZEQ layer, the upstream conventions apply.
>          
>           - ---
>
> ## What We Accept
>
> - Bug fixes in any layer (Zeqond daemon, MCP server, frontend interception hooks, backend services, Chrome extension).
> - - New operators that validate against the **KO42 Metric Tensioner** and respect the 1.287 Hz / 0.777s constants. Operators must declare: `name`, `category`, `equation`, `description`, `tags`.
>   - - Additional AI platforms for the Chrome extension (new content scripts, improved selectors, better input-detection heuristics).
>     - - Performance improvements that do not break pulse coherence or desynchronise the Zeqond daemon.
>       - - Documentation improvements that increase mathematical clarity or help new contributors.
>         - - LibreChat upstream merges — keeping HULYAS-AI current while preserving the ZEQ interception layer.
>           - - Deployment improvements — Docker, Railway, local dev, bun.
>            
>             - ## What We Do Not Accept
>            
>             - - Changes to the framework constants (1.287 Hz, 0.777s, KO42). These are physical definitions, not configuration.
>               - - Contributions that strip attribution or obscure that the codebase is HULYAS-AI on top of LibreChat.
>                 - - Closed-source rebranding, forks without license continuity, or any dilution of the Open Science grant (see LICENSE §1 Preamble).
>                   - - Fabricated benchmark claims or unverifiable performance statements.
>                     - - Changes that silently disable or weaken framework interception in any of the four hook points.
>                      
>                       - ---
>
> ## Development Setup
>
> ```bash
> git clone https://github.com/hulyasmath/HULYAS-AI.git
> cd HULYAS-AI
> cp .env.example .env   # fill in keys
> npm install
> ```
>
> Run the stack locally:
>
> ```bash
> # Terminal 1 — infrastructure (MongoDB, Redis, MeiliSearch, RAG, SearXNG)
> docker compose -f docker-compose.local.yml up -d
>
> # Terminal 2 — Zeqond daemon
> python3 zeq-services/zeqond_daemon.py
>
> # Terminal 3 — MCP server
> cd zeq-mcp-server && npm install && npm start
>
> # Terminal 4 — backend
> npm run backend:dev
>
> # Terminal 5 — frontend
> npm run frontend:dev
> ```
>
> Chrome extension — load unpacked from `chrome-extension/` in `chrome://extensions/`.
>
> ---
>
> ## Development Flow
>
> 1. Fork the repository.
> 2. 2. Create a feature branch (`fix/zeqond-drift`, `feat/operator-hilbert-42`, `chore/librechat-0.8.2-merge`).
>    3. 3. Keep commits small and phase-locked to a single purpose.
>       4. 4. Run the full stack locally and verify:
>          5.    - Zeqond daemon `STATUS:OK` before and after.
>                -    - PULSE count advances monotonically at 1.287 Hz.
>                     -    - The four interception points still replace `data.text` / `payload.text` with `zeqResult.mathematicalPrompt`.
>                          - 5. Verify via DevTools Network tab per `FRAMEWORK_FLOW_BREAKDOWN.md` — the payload sent to the AI provider contains the mathematical prompt JSON, not the raw message.
>                            6. 6. Open a pull request describing: affected layers, operators/domains touched, pulse-coherence verification, any upstream LibreChat interaction.
>                              
>                               7. ---
>                              
>                               8. ## Coding Standards
>                              
>                               9. **General**
> - Preserve the existing structure of `zeq-services/`, `zeq-mcp-server/`, `zeq-operators/`, `chrome-extension/`, `api/`, `client/`, `packages/`.
> - - Keep LibreChat upstream files as close to upstream as possible; isolate ZEQ extensions where feasible.
>   - - Run `npm run lint:fix` and `npm run format` before opening a PR.
>     - - TypeScript types live in `packages/data-schemas` where applicable.
>      
>       - **Operators**
>       - - Each operator declares: `name`, `category`, `equation`, `description`, `tags`.
>         - - Must produce output that survives KO42 validation.
>           - - Place implementations in the operator catalog used by `zeq-mcp-server` (default: local JSON).
>            
>             - **Chrome extension**
>             - - Content scripts must be non-intrusive: if framework processing fails, fall back to the original message — never block the user.
>               - - Manifest V3 only. Host permissions declared for every new platform.
>                 - - Use the existing `lib/zeq-mathematical-framework.js` — do not duplicate the framework.
>                  
>                   - **Zeqond daemon**
>                   - - Do not change `HULYAPULSE_HZ = 1.287` or `ZEQOND = 1.0 / HULYAPULSE_HZ`. These are licensed constants.
>                     - - Preserve the PULSE / STATUS / SYNC / GET:* protocol surface — clients rely on it.
>                      
>                       - **Frontend interception**
>                       - - Any new code path that reaches the AI provider must call `zeqMiddleware.processQuery()` and replace the outgoing payload text before `fetch()`.
>                        
>                         - ---
>
> ## Testing
>
> - `npm run test:api` — backend unit tests
> - - `npm run test:client` — frontend unit tests
>   - - `npm run e2e` / `npm run e2e:headed` / `npm run e2e:ci` — Playwright end-to-end
>     - - `npm run e2e:a11y` — accessibility suite
>       - - `npm run lint` — ESLint
>        
>         - For framework verification:
>         - - `math.html` at the repo root is the reference implementation.
>           - - `test-zeq-simple.html` is a standalone test harness.
>             - - `COMPREHENSIVE_TEST.md` documents the full verification procedure.
>              
>               - ---
>
> ## Pull Request Checklist
>
> - [ ] Issue linked (or clearly described in the PR body).
> - [ ] - [ ] Zeqond daemon coherence verified.
> - [ ] - [ ] Framework interception still active (Network-tab proof if a frontend change).
> - [ ] - [ ] `npm run lint` passes.
> - [ ] - [ ] `npm run test:api` / `npm run test:client` pass for affected layers.
> - [ ] - [ ] Framework constants untouched.
> - [ ] - [ ] LibreChat attribution preserved.
> - [ ] - [ ] No secrets, keys, or credentials committed (check `.env.example` only).
>
> - [ ] ---
>
> - [ ] ## Reporting Bugs
>
> - [ ] Open an issue with:
>
> - [ ] - The affected layer (`zeq-services/`, `zeq-mcp-server/`, `chrome-extension/`, `client/`, `api/`, etc.).
> - [ ] - Zeqond daemon status at time of failure (`STATUS` / `PULSE` output).
> - [ ] - Operators involved, if known.
- Reproduction steps.
- - Environment: Docker / local / Railway; Node version; browser (for Chrome extension).
 
  - ## Reporting Security Issues
 
  - Do **not** open public issues for security problems. See [SECURITY.md](SECURITY.md).
 
  - ---

  ## LibreChat Attribution

  HULYAS-AI is built on **LibreChat** by Danny Avila and contributors, under the LibreChat license. When in doubt about an upstream file, defer to LibreChat conventions and keep upstream attribution intact. Large changes to non-ZEQ areas of the codebase are encouraged to be contributed back upstream where they make sense for the broader LibreChat community.

  ---

  Framework: LICENCE [1.287HZ]
  
