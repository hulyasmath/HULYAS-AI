import { Schema } from 'mongoose';
import { z } from 'zod';

export const mcpApiKeySchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    apiKey: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    prefix: {
      type: String,
      required: true,
    },
    lastUsedAt: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

// Zod schema for validation
export const MCPApiKeySchema = z.object({
  userId: z.string(),
  apiKey: z.string(),
  prefix: z.string(),
  lastUsedAt: z.string().datetime().optional().nullable(),
  isActive: z.boolean().optional().default(true),
});
