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

    // Ensure MCPServersRegistry is initialized with mongoose before MCP init
    try {
      const { MCPServersRegistry } = require('@librechat/api');
      const mongoose = require('mongoose');
      const allowedDomains = (appConfig.actions && appConfig.actions.allowedDomains) || [];
      MCPServersRegistry.createInstance(mongoose, allowedDomains);
      logger.info('MCPServersRegistry created successfully');
    } catch (regErr) {
      // If already created, that's fine
      if (!regErr.message.includes('already')) {
        logger.warn('MCPServersRegistry pre-init: ' + regErr.message);
      }
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
