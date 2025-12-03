import type { Document, Types } from 'mongoose';

export interface IPlan extends Document {
  name: string; // e.g. 'free', 'pro', 'enterprise'
  displayName: string; // e.g. 'Free Plan', 'Pro Plan', 'Enterprise Plan'
  monthlyTokenLimit: number | null; // null = unlimited
  dailyRequestLimit: number | null; // null = unlimited
  allowedEndpoints: string[]; // e.g. ['DeepSeek', 'OpenRouter']
  allowedModels?: Record<string, string[]> | null; // Optional: endpoint -> models mapping
  hardLimit: boolean; // true = block when over limit, false = warn only
  stripeProductId?: string | null;
  stripePriceId?: string | null;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreatePlanRequest {
  name: string;
  displayName: string;
  monthlyTokenLimit?: number | null;
  dailyRequestLimit?: number | null;
  allowedEndpoints: string[];
  allowedModels?: Record<string, string[]> | null;
  hardLimit?: boolean;
  stripeProductId?: string | null;
  stripePriceId?: string | null;
  isActive?: boolean;
}

export interface UpdatePlanRequest {
  displayName?: string;
  monthlyTokenLimit?: number | null;
  dailyRequestLimit?: number | null;
  allowedEndpoints?: string[];
  allowedModels?: Record<string, string[]> | null;
  hardLimit?: boolean;
  stripeProductId?: string | null;
  stripePriceId?: string | null;
  isActive?: boolean;
}

