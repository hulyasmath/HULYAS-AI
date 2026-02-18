const mongoose = require('mongoose');

/**
 * LLM Configuration Schema
 * Stores admin settings for which LLMs appear in the menu picker
 */
const llmConfigSchema = new mongoose.Schema(
  {
    // Endpoint identifier (e.g., 'HULYAS', 'groq', 'openAI')
    endpointId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    // Display name in the menu
    displayName: {
      type: String,
      required: true,
    },
    // Whether this endpoint is visible in the menu picker
    isEnabled: {
      type: Boolean,
      default: true,
    },
    // Order in the menu (lower = higher priority)
    order: {
      type: Number,
      default: 100,
    },
    // Icon URL or emoji
    icon: {
      type: String,
      default: '',
    },
    // Custom endpoint configuration (for user-added endpoints)
    isCustom: {
      type: Boolean,
      default: false,
    },
    // Custom endpoint details (only for isCustom: true)
    customConfig: {
      apiKey: { type: String, default: '' },
      apiKeyEnvVar: { type: String, default: '' }, // e.g., 'MY_CUSTOM_API_KEY'
      baseURL: { type: String, default: '' },
      models: [{ type: String }],
      defaultModel: { type: String, default: '' },
    },
    // Description for admin UI
    description: {
      type: String,
      default: '',
    },
    // Who created/modified this config
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Get all enabled endpoints
llmConfigSchema.statics.getEnabledEndpoints = async function () {
  return this.find({ isEnabled: true }).sort({ order: 1 }).lean();
};

// Get all endpoints for admin
llmConfigSchema.statics.getAllEndpoints = async function () {
  return this.find({}).sort({ order: 1 }).lean();
};

// Toggle endpoint visibility
llmConfigSchema.statics.toggleEndpoint = async function (endpointId, isEnabled, userId) {
  return this.findOneAndUpdate(
    { endpointId },
    { isEnabled, updatedBy: userId },
    { new: true, upsert: false }
  );
};

// Update endpoint order
llmConfigSchema.statics.updateOrder = async function (endpointId, order, userId) {
  return this.findOneAndUpdate(
    { endpointId },
    { order, updatedBy: userId },
    { new: true }
  );
};

// Seed default endpoints from librechat.yaml configuration
llmConfigSchema.statics.seedDefaults = async function (endpoints) {
  const bulkOps = endpoints.map((ep, index) => ({
    updateOne: {
      filter: { endpointId: ep.id },
      update: {
        $setOnInsert: {
          endpointId: ep.id,
          displayName: ep.displayName || ep.id,
          isEnabled: true,
          order: ep.order || (index + 1) * 10,
          icon: ep.icon || '',
          isCustom: ep.isCustom || false,
          description: ep.description || '',
        },
      },
      upsert: true,
    },
  }));

  if (bulkOps.length > 0) {
    await this.bulkWrite(bulkOps);
  }
};

const LLMConfig = mongoose.model('LLMConfig', llmConfigSchema);

module.exports = LLMConfig;
