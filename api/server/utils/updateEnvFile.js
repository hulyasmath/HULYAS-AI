const fs = require('fs').promises;
const path = require('path');
const { logger } = require('@librechat/data-schemas');

const projectRoot = path.resolve(__dirname, '..', '..', '..', '..');
const envPath = path.resolve(projectRoot, '.env');

// Check if running on Railway
const isRailway = !!process.env.RAILWAY_ENVIRONMENT || !!process.env.RAILWAY_PROJECT_ID;

/**
 * Update or add an environment variable in the .env file
 * @param {string} envVar - The environment variable name
 * @param {string} value - The value to set
 * @returns {Promise<void>}
 */
async function updateEnvVariable(envVar, value) {
  // On Railway, we can't write to .env file - provide helpful error
  if (isRailway) {
    const railwayUrl = process.env.RAILWAY_PROJECT_ID 
      ? `https://railway.app/project/${process.env.RAILWAY_PROJECT_ID}/variables`
      : 'Railway dashboard';
    const errorMessage = `Cannot update environment variables on Railway through the UI. Please update "${envVar}" through Railway dashboard: ${railwayUrl}. Steps: 1) Go to your Railway project → Variables tab, 2) Add/Update variable "${envVar}" with your API key, 3) Redeploy the service.`;
    logger.error(`[updateEnvVariable] ${errorMessage}`);
    throw new Error(errorMessage);
  }

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

  try {
    await fs.writeFile(envPath, updatedLines.join('\n'), 'utf8');
  } catch (error) {
    logger.error(`[updateEnvVariable] Failed to write .env file: ${error.message}`);
    throw new Error(`Failed to update .env file: ${error.message}. Please check file permissions.`);
  }
}

module.exports = {
  updateEnvVariable,
  envPath,
};


