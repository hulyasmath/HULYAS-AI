const fs = require('fs').promises;
const path = require('path');

const projectRoot = path.resolve(__dirname, '..', '..', '..', '..');
const envPath = path.resolve(projectRoot, '.env');

/**
 * Update or add an environment variable in the .env file
 * @param {string} envVar - The environment variable name
 * @param {string} value - The value to set
 * @returns {Promise<void>}
 */
async function updateEnvVariable(envVar, value) {
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
      return `${envVar}=${value}`;
    }
    return line;
  });

  if (!found) {
    // Add new env var
    if (envContent && !envContent.endsWith('\n') && envContent.length > 0) {
      updatedLines.push('');
    }
    updatedLines.push(`${envVar}=${value}`);
  }

  await fs.writeFile(envPath, updatedLines.join('\n'), 'utf8');
}

module.exports = {
  updateEnvVariable,
  envPath,
};


