const fs = require('fs').promises;
const path = require('path');
const yaml = require('js-yaml');
const { logger } = require('@librechat/data-schemas');
const { updateEnvVariable } = require('~/server/utils/updateEnvFile');

const projectRoot = path.resolve(__dirname, '..', '..', '..', '..');
const configPath = process.env.CONFIG_PATH || path.resolve(projectRoot, 'librechat.yaml');
const envPath = path.resolve(projectRoot, '.env');

/**
 * Get current API key configuration for custom endpoints
 */
const getApiKeys = async (req, res) => {
  try {
    // Read librechat.yaml
    const configContent = await fs.readFile(configPath, 'utf8');
    const config = yaml.load(configContent);

    // Read .env to get actual API key values (masked)
    let envContent = '';
    try {
      envContent = await fs.readFile(envPath, 'utf8');
    } catch (error) {
      // .env file doesn't exist
    }

    const envVars = {};
    envContent.split('\n').forEach((line) => {
      const match = line.match(/^([A-Z_]+)=(.+)$/);
      if (match) {
        envVars[match[1]] = match[2].trim();
      }
    });

    // Extract API keys from custom endpoints
    const apiKeys = [];
    if (config.endpoints?.custom) {
      config.endpoints.custom.forEach((endpoint) => {
        if (endpoint.apiKey && endpoint.apiKey.startsWith('${') && endpoint.apiKey.endsWith('}')) {
          const envVar = endpoint.apiKey.slice(2, -1);
          const actualKey = envVars[envVar];
          const configured = !!actualKey && actualKey.length > 0;
          
          // Mask the key for display (show first 4 and last 4 chars)
          let maskedKey = null;
          if (actualKey && actualKey.length >= 8) {
            maskedKey = actualKey.substring(0, 4) + '••••••••' + actualKey.substring(actualKey.length - 4);
          } else if (actualKey) {
            maskedKey = '••••••••';
          }

          apiKeys.push({
            id: endpoint.name,
            endpointName: endpoint.name,
            llmName: endpoint.modelDisplayLabel || endpoint.name,
            baseURL: endpoint.baseURL,
            envVar,
            maskedKey,
            configured,
            models: endpoint.models?.default || [],
          });
        }
      });
    }

    // Sort by LLM name for better organization
    apiKeys.sort((a, b) => a.llmName.localeCompare(b.llmName));

    res.status(200).json(apiKeys);
  } catch (error) {
    logger.error('[getApiKeys] Error:', error);
    res.status(500).json({ message: 'Error fetching API keys', error: error.message });
  }
};

/**
 * Update API key for a custom endpoint
 */
const updateApiKey = async (req, res) => {
  try {
    const { endpointName, apiKey } = req.body;

    if (!endpointName || !apiKey) {
      return res.status(400).json({ message: 'Endpoint name and API key are required' });
    }

    // Read current config
    const configContent = await fs.readFile(configPath, 'utf8');
    const config = yaml.load(configContent);

    // Find the endpoint
    if (!config.endpoints?.custom) {
      return res.status(404).json({ message: 'No custom endpoints found' });
    }

    const endpoint = config.endpoints.custom.find((e) => e.name === endpointName);
    if (!endpoint) {
      return res.status(404).json({ message: `Endpoint ${endpointName} not found` });
    }

    // Extract environment variable name
    let envVar = null;
    if (endpoint.apiKey && endpoint.apiKey.startsWith('${') && endpoint.apiKey.endsWith('}')) {
      envVar = endpoint.apiKey.slice(2, -1);
    } else {
      // Create new env var name if it doesn't exist
      envVar = `${endpointName.toUpperCase().replace(/-/g, '_')}_API_KEY`;
      endpoint.apiKey = `\${${envVar}}`;
    }

    // Update .env file using the utility function
    await updateEnvVariable(envVar, apiKey);

    // Write updated config (in case we created a new env var reference)
    const updatedConfigContent = yaml.dump(config, {
      indent: 2,
      lineWidth: -1,
      noRefs: true,
    });
    await fs.writeFile(configPath, updatedConfigContent, 'utf8');

    logger.info(`[updateApiKey] Updated API key for endpoint ${endpointName}`);

    res.status(200).json({
      message: 'API key updated successfully',
      endpointName,
      envVar,
      note: 'Please restart the API server for changes to take effect',
    });
  } catch (error) {
    logger.error('[updateApiKey] Error:', error);
    res.status(500).json({ message: 'Error updating API key', error: error.message });
  }
};

module.exports = {
  adminApiKeyController: {
    getApiKeys,
    updateApiKey,
  },
};

