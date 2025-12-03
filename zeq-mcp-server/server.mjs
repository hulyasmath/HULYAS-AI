import express from 'express';
import { loadOperators, findOperatorByName } from './operators.mjs';
import { processQueryWithFramework } from './zeq-node-bridge.mjs';

const app = express();
app.use(express.json());

const PORT = Number(process.env.ZEQ_MCP_PORT || 4005);
const LIBRECHAT_API_URL = process.env.LIBRECHAT_API_URL || 'http://localhost:3080';

/**
 * Validate API key against LibreChat API
 */
async function validateApiKey(apiKey) {
  try {
    const response = await fetch(`${LIBRECHAT_API_URL}/api/mcp/validate-key`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
      },
      body: JSON.stringify({ apiKey }),
    });

    if (!response.ok) {
      return { valid: false };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('[validateApiKey] Error:', error);
    return { valid: false };
  }
}

// API key authentication middleware
app.use(async (req, res, next) => {
  // Skip auth for health check
  if (req.path === '/health') {
    return next();
  }

  const apiKey = req.header('x-api-key') || req.header('authorization')?.replace('Bearer ', '');

  if (!apiKey) {
    return res.status(401).json({
      jsonrpc: '2.0',
      error: { code: -32001, message: 'Unauthorized: API key required' },
    });
  }

  const validation = await validateApiKey(apiKey);
  if (!validation.valid) {
    return res.status(401).json({
      jsonrpc: '2.0',
      error: { code: -32001, message: 'Unauthorized: invalid API key' },
    });
  }

  // Attach user info to request for logging
  req.userId = validation.userId;
  next();
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', server: 'zeq-os-mcp', port: PORT });
});

/**
 * Minimal JSON-RPC style MCP endpoint.
 * Expected request shape (compatible with MCP tools/call):
 * {
 *   "jsonrpc": "2.0",
 *   "id": "1",
 *   "method": "tools/call",
 *   "params": { "toolName": "zeq.list_operators", "arguments": { ... } }
 * }
 */
app.post('/mcp', async (req, res) => {
  const { id, method, params } = req.body || {};

  if (method !== 'tools/call') {
    return res.status(400).json({
      jsonrpc: '2.0',
      id,
      error: { code: -32601, message: 'Method not found' },
    });
  }

  const toolName = params?.toolName;
  const args = params?.arguments || {};

  try {
    let result;

    switch (toolName) {
      case 'zeq.list_operators': {
        const operators = await loadOperators();
        const { category, tag } = args;
        let filtered = operators;
        if (category) {
          filtered = filtered.filter(
            (o) => typeof o.category === 'string' && o.category === category,
          );
        }
        if (tag) {
          filtered = filtered.filter(
            (o) => Array.isArray(o.tags) && o.tags.includes(tag),
          );
        }
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        result = { content: filtered };
        break;
      }

      case 'zeq.get_operator': {
        if (!args.name) {
          throw new Error('Missing required argument: name');
        }
        const op = await findOperatorByName(args.name);
        result = { content: op };
        break;
      }

      case 'zeq.process_query': {
        if (!args.message) {
          throw new Error('Missing required argument: message');
        }
        const processed = await processQueryWithFramework(args.message);
        result = { content: processed };
        break;
      }

      default:
        return res.status(400).json({
          jsonrpc: '2.0',
          id,
          error: { code: -32601, message: `Unknown tool: ${toolName}` },
        });
    }

    res.json({
      jsonrpc: '2.0',
      id,
      result,
    });
  } catch (error) {
    console.error('[zeq-mcp] Error handling request', error);
    res.json({
      jsonrpc: '2.0',
      id,
      error: {
        code: -32000,
        message: error.message || 'Internal error',
      },
    });
  }
});

app.listen(PORT, () => {
  console.log(`Zeq OS MCP server listening on http://localhost:${PORT}/mcp`);
});


