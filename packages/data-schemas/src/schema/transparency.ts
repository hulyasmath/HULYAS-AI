import { Schema } from 'mongoose';

export interface ITransparencyLogEntry {
  id: string;
  timestamp: string;
  messageType: 'user' | 'ai';
  messageId?: string;
  userQuery?: string;
  aiResponse?: string;
  platform: string;
  url?: string;
  mathematicalPrompt?: string;
  pulseCycle?: number;
  phase?: number;
  activeOperators?: string[];
  domains?: string[];
  mathematicalState?: unknown;
  truthVector?: unknown;
  informationIntegrity?: number;
  crossDomainHarmony?: number;
  auditTrail?: unknown[];
  [key: string]: unknown;
}

export interface ITransparency {
  conversationId: string;
  user: string;
  entries: ITransparencyLogEntry[];
  createdAt?: Date;
  updatedAt?: Date;
}

const transparencyLogEntrySchema = new Schema<ITransparencyLogEntry>(
  {
    id: {
      type: String,
      required: true,
    },
    timestamp: {
      type: String,
      required: true,
    },
    messageType: {
      type: String,
      enum: ['user', 'ai'],
      required: true,
    },
    messageId: {
      type: String,
    },
    userQuery: {
      type: String,
    },
    aiResponse: {
      type: String,
    },
    platform: {
      type: String,
      required: true,
      default: 'librechat',
    },
    url: {
      type: String,
    },
    mathematicalPrompt: {
      type: String,
    },
    pulseCycle: {
      type: Number,
    },
    phase: {
      type: Number,
    },
    activeOperators: {
      type: [String],
      default: [],
    },
    domains: {
      type: [String],
      default: [],
    },
    mathematicalState: {
      type: Schema.Types.Mixed,
    },
    truthVector: {
      type: Schema.Types.Mixed,
    },
    informationIntegrity: {
      type: Number,
    },
    crossDomainHarmony: {
      type: Number,
    },
    auditTrail: {
      type: [Schema.Types.Mixed],
      default: [],
    },
  },
  { _id: false },
);

const transparencySchema = new Schema<ITransparency>(
  {
    conversationId: {
      type: String,
      required: true,
      index: true,
    },
    user: {
      type: String,
      required: true,
      index: true,
    },
    entries: {
      type: [transparencyLogEntrySchema],
      default: [],
    },
  },
  { timestamps: true },
);

transparencySchema.index({ conversationId: 1, user: 1 });
transparencySchema.index({ 'entries.timestamp': 1 });

export default transparencySchema;




