const mongoose = require('mongoose');
const { Schema } = mongoose;

const mcpApiKeySchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    apiKey: { type: String, required: true, unique: true, index: true },
    prefix: { type: String, required: true },
    lastUsedAt: { type: Date, default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

const MCPApiKey = mongoose.models.MCPApiKey || mongoose.model('MCPApiKey', mcpApiKeySchema);

module.exports = MCPApiKey;
