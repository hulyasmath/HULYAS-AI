const mongoose = require('mongoose');
const { Schema } = mongoose;
const { createModels } = require('@librechat/data-schemas');
const models = createModels(mongoose);

// ZeqOperator model (not yet in data-schemas dist)
const zeqOperatorSchema = new Schema(
  {
    name: { type: String, required: true, unique: true, index: true, trim: true },
    category: { type: String, index: true, trim: true },
    equation: { type: String, required: true, trim: true },
    variables: { type: Map, of: String },
    description: { type: String, trim: true },
    tags: { type: [String], default: [], index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
);
const ZeqOperator = mongoose.models.ZeqOperator || mongoose.model('ZeqOperator', zeqOperatorSchema);

// Plan model (not yet in data-schemas dist)
const planSchema = new Schema(
  {
    name: { type: String, required: true, unique: true, index: true, lowercase: true },
    displayName: { type: String, required: true },
    monthlyTokenLimit: { type: Number, default: null },
    dailyRequestLimit: { type: Number, default: null },
    allowedEndpoints: { type: [String], required: true, default: [] },
    allowedModels: { type: Schema.Types.Mixed, default: null },
    hardLimit: { type: Boolean, default: true },
    stripeProductId: { type: String, default: null },
    stripePriceId: { type: String, default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);
const Plan = mongoose.models.Plan || mongoose.model('Plan', planSchema);

// ZeqAuditTrail model (not yet in data-schemas dist)
const zeqAuditTrailSchema = new Schema(
  {
    user: { type: String, required: true, index: true },
    conversationId: { type: String, required: true, index: true },
    messageId: { type: String, index: true },
    query: { type: String },
    domains: { type: [String], default: [] },
    operatorExecutions: [
      {
        operator: { type: String },
        executionTimeMs: { type: Number },
        success: { type: Boolean, default: true },
        result: { type: Schema.Types.Mixed },
      },
    ],
    operatorCount: { type: Number, default: 0 },
    successfulOperators: { type: Number, default: 0 },
    failedOperators: { type: Number, default: 0 },
    totalProcessingTimeMs: { type: Number, default: 0 },
    truthVector: { type: Schema.Types.Mixed },
    masterSum: { type: Number },
    phase: { type: Number },
    pulseCycle: { type: Number },
    informationIntegrity: { type: Number },
    crossDomainHarmony: { type: Number },
    verification: { type: Schema.Types.Mixed },
  },
  { timestamps: true },
);
zeqAuditTrailSchema.index({ conversationId: 1, user: 1 });
zeqAuditTrailSchema.index({ messageId: 1, user: 1 });
const ZeqAuditTrail =
  mongoose.models.ZeqAuditTrail || mongoose.model('ZeqAuditTrail', zeqAuditTrailSchema);

// Transparency model (not yet in data-schemas dist)
const transparencyEntrySchema = new Schema(
  {
    messageId: { type: String },
    messageType: { type: String, enum: ['user', 'ai'] },
    userQuery: { type: String },
    aiResponse: { type: String },
    timestamp: { type: Date, default: Date.now },
    platform: { type: String },
    url: { type: String },
    toolName: { type: String },
    mcpToolResult: { type: Schema.Types.Mixed },
    mcpToolData: { type: Schema.Types.Mixed },
    mathematicalPrompt: { type: String },
    activeOperators: { type: [String], default: [] },
    domains: { type: [String], default: [] },
    phase: { type: Number },
    pulseCycle: { type: Number },
    informationIntegrity: { type: Number },
    crossDomainHarmony: { type: Number },
    masterSum: { type: Number },
    masterEquation: { type: String },
    operatorCount: { type: Number },
    totalOperators: { type: Number },
    processingTimeMs: { type: Number },
    mathematicalState: { type: Schema.Types.Mixed },
    truthVector: { type: Schema.Types.Mixed },
    verification: { type: Schema.Types.Mixed },
    auditTrail: { type: [Schema.Types.Mixed], default: [] },
  },
  { _id: true },
);

const transparencySchema = new Schema(
  {
    conversationId: { type: String, required: true, index: true },
    user: { type: String, required: true, index: true },
    entries: [transparencyEntrySchema],
  },
  { timestamps: true },
);
transparencySchema.index({ conversationId: 1, user: 1 }, { unique: true });
const Transparency =
  mongoose.models.Transparency || mongoose.model('Transparency', transparencySchema);

// MCPApiKey model (not yet in data-schemas dist)
const mcpApiKeySchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    keyHash: { type: String, required: true, unique: true },
    keyPrefix: { type: String, required: true },
    name: { type: String, required: true },
    permissions: { type: [String], default: ['read'] },
    isActive: { type: Boolean, default: true },
    lastUsedAt: { type: Date },
    expiresAt: { type: Date },
  },
  { timestamps: true },
);
const MCPApiKey = mongoose.models.MCPApiKey || mongoose.model('MCPApiKey', mcpApiKeySchema);

module.exports = { ...models, ZeqOperator, Plan, ZeqAuditTrail, Transparency, MCPApiKey };
