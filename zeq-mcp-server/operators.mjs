import fs from 'fs';
import path from 'path';
import url from 'url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

const DEFAULT_OPERATORS_PATH = path.join(__dirname, 'zeq-operators.json');

/**
 * Load operators either from a local JSON file or, in the future, from
 * a remote API such as LibreChat's /api/zeq/operators/public/list.
 */
export async function loadOperators() {
  const source = process.env.ZEQ_OPERATORS_SOURCE || 'local-json';

  if (source === 'local-json') {
    const raw = await fs.promises.readFile(DEFAULT_OPERATORS_PATH, 'utf8');
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) {
      throw new Error('zeq-operators.json must contain an array');
    }
    return data;
  }

  if (source === 'librechat-api') {
    const endpoint =
      process.env.ZEQ_OPERATORS_URL || 'http://localhost:3080/api/zeq/operators/public/list';
    const res = await fetch(endpoint);
    if (!res.ok) {
      throw new Error(`Failed to load operators from ${endpoint}: ${res.status}`);
    }
    const data = await res.json();
    if (!Array.isArray(data)) {
      throw new Error('Operator API response must be an array');
    }
    return data;
  }

  throw new Error(`Unknown ZEQ_OPERATORS_SOURCE: ${source}`);
}

export async function findOperatorByName(name) {
  const operators = await loadOperators();
  const op = operators.find(
    (o) => typeof o.name === 'string' && o.name.toLowerCase() === name.toLowerCase(),
  );
  if (!op) {
    throw new Error(`Unknown Zeq operator: ${name}`);
  }
  return op;
}




