const { logger } = require('@librechat/data-schemas');
const { SystemRoles } = require('librechat-data-provider');
const { getAllUserKeys } = require('~/server/services/UserService');
const { User } = require('~/db/models');
const { updateEnvVariable } = require('~/server/utils/updateEnvFile');

/**
 * Mask sensitive API keys for display
 */
function maskApiKey(key) {
  if (!key || key.length < 8) {
    return '••••••••';
  }
  return key.substring(0, 4) + '••••••••' + key.substring(key.length - 4);
}

/**
 * GET /api/admin/settings/api-config
 * Get system API configuration (read-only, masked)
 */
const getApiConfig = async (req, res) => {
  try {
    const config = {
      // OpenAI
      openai: {
        configured: !!process.env.OPENAI_API_KEY,
        masked: process.env.OPENAI_API_KEY ? maskApiKey(process.env.OPENAI_API_KEY) : null,
        envVar: 'OPENAI_API_KEY',
        userProvided: process.env.OPENAI_API_KEY === 'user_provided',
        reverseProxy: process.env.OPENAI_REVERSE_PROXY || null,
        reverseProxyEnvVar: 'OPENAI_REVERSE_PROXY',
      },
      azureOpenAI: {
        configured: !!process.env.AZURE_API_KEY,
        masked: process.env.AZURE_API_KEY ? maskApiKey(process.env.AZURE_API_KEY) : null,
        envVar: 'AZURE_API_KEY',
        userProvided: process.env.AZURE_API_KEY === 'user_provided',
        baseURL: process.env.AZURE_OPENAI_BASEURL || null,
        baseURLEnvVar: 'AZURE_OPENAI_BASEURL',
      },
      anthropic: {
        configured: !!process.env.ANTHROPIC_API_KEY,
        masked: process.env.ANTHROPIC_API_KEY ? maskApiKey(process.env.ANTHROPIC_API_KEY) : null,
        envVar: 'ANTHROPIC_API_KEY',
        userProvided: process.env.ANTHROPIC_API_KEY === 'user_provided',
      },
      google: {
        configured: !!process.env.GOOGLE_KEY,
        masked: process.env.GOOGLE_KEY ? maskApiKey(process.env.GOOGLE_KEY) : null,
        envVar: 'GOOGLE_KEY',
        userProvided: process.env.GOOGLE_KEY === 'user_provided',
        reverseProxy: process.env.GOOGLE_REVERSE_PROXY || null,
        reverseProxyEnvVar: 'GOOGLE_REVERSE_PROXY',
      },
      deepseek: {
        configured: !!process.env.DEEPSEEK_API_KEY,
        masked: process.env.DEEPSEEK_API_KEY ? maskApiKey(process.env.DEEPSEEK_API_KEY) : null,
        envVar: 'DEEPSEEK_API_KEY',
      },
      groq: {
        configured: !!process.env.GROQ_API_KEY,
        masked: process.env.GROQ_API_KEY ? maskApiKey(process.env.GROQ_API_KEY) : null,
        envVar: 'GROQ_API_KEY',
      },
      openrouter: {
        configured: !!process.env.OPENROUTER_API_KEY,
        masked: process.env.OPENROUTER_API_KEY ? maskApiKey(process.env.OPENROUTER_API_KEY) : null,
        envVar: 'OPENROUTER_API_KEY',
      },
      searxng: {
        configured: !!process.env.SEARXNG_INSTANCE_URL,
        url: process.env.SEARXNG_INSTANCE_URL || null,
        urlEnvVar: 'SEARXNG_INSTANCE_URL',
        apiKey: process.env.SEARXNG_API_KEY ? maskApiKey(process.env.SEARXNG_API_KEY) : null,
        apiKeyEnvVar: 'SEARXNG_API_KEY',
      },
      meilisearch: {
        configured: !!process.env.MEILI_HOST,
        host: process.env.MEILI_HOST || null,
        hostEnvVar: 'MEILI_HOST',
        masterKey: process.env.MEILI_MASTER_KEY ? maskApiKey(process.env.MEILI_MASTER_KEY) : null,
        masterKeyEnvVar: 'MEILI_MASTER_KEY',
      },
      rag: {
        configured: !!process.env.RAG_API_URL,
        url: process.env.RAG_API_URL || null,
        urlEnvVar: 'RAG_API_URL',
      },
      stripe: {
        configured: !!process.env.STRIPE_SECRET_KEY,
        secretKey: process.env.STRIPE_SECRET_KEY ? maskApiKey(process.env.STRIPE_SECRET_KEY) : null,
        secretKeyEnvVar: 'STRIPE_SECRET_KEY',
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY ? maskApiKey(process.env.STRIPE_PUBLISHABLE_KEY) : null,
        publishableKeyEnvVar: 'STRIPE_PUBLISHABLE_KEY',
        webhookSecret: process.env.STRIPE_WEBHOOK_SECRET ? maskApiKey(process.env.STRIPE_WEBHOOK_SECRET) : null,
        webhookSecretEnvVar: 'STRIPE_WEBHOOK_SECRET',
        webhookUrl: `${process.env.DOMAIN_SERVER || 'http://localhost:3080'}/api/stripe/webhook`,
      },
    };

    res.status(200).json(config);
  } catch (error) {
    logger.error('[getApiConfig] Error:', error);
    res.status(500).json({ message: 'Error fetching API config', error: error.message });
  }
};

/**
 * GET /api/admin/settings/user-keys
 * Get all user API keys (admin only)
 */
const getUserKeys = async (req, res) => {
  try {
    const { userId, endpoint } = req.query;
    
    if (userId) {
      // Get keys for specific user
      const user = await User.findById(userId).select('email name username').lean();
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      const keys = await getAllUserKeys({ userId });
      res.status(200).json({ user, keys });
    } else {
      // Get all users with their key counts
      const users = await User.find({})
        .select('email name username role createdAt')
        .sort({ createdAt: -1 })
        .lean();
      
      const usersWithKeys = await Promise.all(
        users.map(async (user) => {
          const keys = await getAllUserKeys({ userId: user._id.toString() });
          return {
            ...user,
            keyCount: keys.length,
            keys: keys.map((k) => ({
              name: k.name,
              hasValue: !!k.value,
              expiresAt: k.expiresAt || null,
            })),
          };
        })
      );
      
      res.status(200).json(usersWithKeys);
    }
  } catch (error) {
    logger.error('[getUserKeys] Error:', error);
    res.status(500).json({ message: 'Error fetching user keys', error: error.message });
  }
};

/**
 * DELETE /api/admin/settings/user-keys/:userId/:keyName
 * Delete a specific user API key (admin only)
 */
const deleteUserKey = async (req, res) => {
  try {
    const { userId, keyName } = req.params;
    const { deleteUserKey: deleteKey } = require('~/server/services/UserService');
    
    await deleteKey({ userId, name: keyName });
    res.status(200).json({ message: 'API key deleted successfully' });
  } catch (error) {
    logger.error('[deleteUserKey] Error:', error);
    res.status(500).json({ message: 'Error deleting API key', error: error.message });
  }
};

/**
 * PUT /api/admin/settings/api-config
 * Update system API configuration (environment variables)
 */
const updateApiConfig = async (req, res) => {
  try {
    const { service, envVar, value } = req.body;

    if (!service || !envVar || value === undefined) {
      return res.status(400).json({ message: 'Service, envVar, and value are required' });
    }

    // Update the environment variable in .env file
    await updateEnvVariable(envVar, value);

    logger.info(`[updateApiConfig] Updated ${envVar} for service ${service}`);

    res.status(200).json({
      message: 'API configuration updated successfully',
      service,
      envVar,
      note: 'Please restart the API server for changes to take effect',
    });
  } catch (error) {
    logger.error('[updateApiConfig] Error:', error);
    res.status(500).json({ message: 'Error updating API config', error: error.message });
  }
};

module.exports = {
  adminSettingsController: {
    getApiConfig,
    updateApiConfig,
    getUserKeys,
    deleteUserKey,
  },
};

