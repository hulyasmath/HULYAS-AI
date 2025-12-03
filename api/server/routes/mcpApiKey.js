const express = require('express');
const { mcpApiKeyController } = require('~/server/controllers/MCPApiKeyController');
const { requireJwtAuth } = require('~/server/middleware');

const router = express.Router();

// All routes require JWT authentication
router.use(requireJwtAuth);

// Generate a new API key (replaces existing one)
router.post('/generate', mcpApiKeyController.generateApiKey);

// Get current API key (masked)
router.get('/', mcpApiKeyController.getApiKey);

// Revoke current API key
router.delete('/revoke', mcpApiKeyController.revokeApiKey);

module.exports = router;
