const mongoose = require('mongoose');
const { createModels } = require('@librechat/data-schemas');
const { MCPApiKey } = createModels(mongoose);

module.exports = MCPApiKey;
