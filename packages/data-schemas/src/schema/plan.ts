import { Schema } from 'mongoose';
import type { IPlan } from '~/types';

const planSchema = new Schema<IPlan>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
    },
    displayName: {
      type: String,
      required: true,
    },
    monthlyTokenLimit: {
      type: Number,
      default: null, // null means unlimited
    },
    dailyRequestLimit: {
      type: Number,
      default: null, // null means unlimited
    },
    allowedEndpoints: {
      type: [String],
      required: true,
      default: [],
    },
    allowedModels: {
      type: Schema.Types.Mixed, // Can be object mapping endpoint to array of models, or null
      default: null,
    },
    hardLimit: {
      type: Boolean,
      default: true, // true = block when over limit, false = warn only
    },
    stripeProductId: {
      type: String,
      default: null,
    },
    stripePriceId: {
      type: String,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

export default planSchema;

