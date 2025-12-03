# Zeq OS MCP Server

This is a small MCP-style server that exposes the **Zeq OS Mathematical Framework** and
its operator catalog so that any MCP-compatible AI client can use them.

## Tools

- `zeq.list_operators`  
  Returns a list of operators (name, category, equation, description, tags), optional
  filters by `category` or `tag`.

- `zeq.get_operator`  
  Returns full details for a single operator by `name`.

- `zeq.process_query`  
  Runs a text message through the Zeq OS framework and returns the raw `zeqResult`
  object produced by `ZeqOSMiddleware.processQuery()`.

## Local development

1. Install dependencies:

```bash
cd zeq-mcp-server
npm install
```

2. Make sure the Zeq OS framework file exists (default path when running from the
LibreChat repo root):

- `../client/public/zeq-mathematical-framework.js`

If your file lives somewhere else, set:

```bash
export ZEQ_FRAMEWORK_PATH=/absolute/path/to/zeq-mathematical-framework.js
```

3. Start the server:

```bash
npm start
```

By default it listens on:

- `http://localhost:4005/mcp`

Health check:

- `GET http://localhost:4005/health`

## Operator source

By default, operators are loaded from `zeq-operators.json` in this folder:

```bash
ZEQ_OPERATORS_SOURCE=local-json   # (default)
```

If you later expose a public operator API from LibreChat, you can switch to:

```bash
export ZEQ_OPERATORS_SOURCE=librechat-api
export ZEQ_OPERATORS_URL=https://your-host/api/zeq/operators/public/list
```

## Optional API key

To require a key for all MCP calls:

```bash
export ZEQ_MCP_API_KEY=your-secret
```

Clients must then send `x-api-key: your-secret` or include the secret in the
`Authorization` header.




