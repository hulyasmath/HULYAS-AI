const fs = require('fs').promises;
const path = require('path');

const projectRoot = path.resolve(__dirname, '..', '..', '..', '..');
const envPath = path.resolve(projectRoot, '.env');

// Allowlist of env vars that can be updated via admin API
const ALLOWED_ENV_VARS = new Set([
  'OPENAI_API_KEY', 'OPENAI_REVERSE_PROXY',
  'AZURE_API_KEY', 'AZURE_OPENAI_BASEURL',
  'ANTHROPIC_API_KEY',
  'GOOGLE_KEY', 'GOOGLE_REVERSE_PROXY',
  'DEEPSEEK_API_KEY',
  'GROQ_API_KEY',
  'OPENROUTER_API_KEY',
  'SEARXNG_INSTANCE_URL', 'SEARXNG_API_KEY',
  'MEILI_HOST', 'MEILI_MASTER_KEY',
  'RAG_API_URL',
  'STRIPE_SECRET_KEY', 'STRIPE_PUBLISHABLE_KEY', 'STRIPE_WEBHOOK_SECRET',
]);

/**
 * Update or add an environment variable in the .env file
 * @param {string} envVar - The environment variable name
 * @param {string} value - The value to set
 * @returns {Promise<void>}
 */
async function updateEnvVariable(envVar, value) {
  // Validate env var name format and allowlist
  if (!/^[A-Z][A-Z0-9_]*$/.test(envVar)) {
    throw new Error('Invalid environment variable name');
  }
  if (!ALLOWED_ENV_VARS.has(envVar)) {
    throw new Error(`Environment variable ${envVar} is not in the allowed list`);
  }
  // Prevent newline injection
  const safeValue = String(value).replace(/[\r\n]/g, '');
  let envContent = '';
  try {
    envContent = await fs.readFile(envPath, 'utf8');
  } catch (error) {
    // .env file doesn't exist, create it
    envContent = '';
  }

  const envLines = envContent.split('\n');
  let found = false;
  const updatedLines = envLines.map((line) => {
    // Match lines that start with the env var name (with optional whitespace)
    const trimmedLine = line.trim();
    if (trimmedLine.startsWith(`${envVar}=`)) {
      found = true;
      return `${envVar}=${safeValue}`;
    }
    return line;
  });

  if (!found) {
    // Add new env var
    if (envContent && !envContent.endsWith('\n') && envContent.length > 0) {
      updatedLines.push('');
    }
    updatedLines.push(`${envVar}=${safeValue}`);
  }

  await fs.writeFile(envPath, updatedLines.join('\n'), 'utf8');
}

module.exports = {
  updateEnvVariable,
  envPath,
};

