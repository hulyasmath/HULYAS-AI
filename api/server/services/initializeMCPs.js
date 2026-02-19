const { logger } = require('@librechat/data-schemas');
const { mergeAppTools, getAppConfig } = require('./Config');
const { createMCPManager } = require('~/config');

async function initializeMCPs() {
  try {
    const appConfig = await getAppConfig();
    const mcpServers = appConfig.mcpConfig;
    if (!mcpServers) {
      return;
    }

    // Set raw configs in MCPServersRegistry so the config endpoint can serve them
    try {
      const { mcpServersRegistry } = require('@librechat/api');
      if (mcpServersRegistry && typeof mcpServersRegistry.setRawConfigs === 'function') {
        mcpServersRegistry.setRawConfigs(mcpServers);
        logger.info('MCPServersRegistry raw configs set successfully');
      }
    } catch (regErr) {
      logger.warn('MCPServersRegistry init: ' + regErr.message);
    }

    const mcpManager = await createMCPManager(mcpServers);
    const mcpTools = (await mcpManager.getAppToolFunctions()) || {};
    await mergeAppTools(mcpTools);

    logger.info(
      'MCP servers initialized successfully. Added ' + Object.keys(mcpTools).length + ' MCP tools.',
    );
  } catch (error) {
    const errMsg = error ? (error.stack || error.message || String(error)) : 'undefined error';
    logger.error('MCP INIT ERROR: ' + errMsg);
  }
}

module.exports = initializeMCPs;
