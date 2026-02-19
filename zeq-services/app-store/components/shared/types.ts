export interface OperatorResult {
  operator: string;
  result: number | Record<string, number>;
  precision: number;
  executionTimeMs: number;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

export interface PrecisionData {
  computed: number;
  reference: number;
  errorPercent: number;
  withinThreshold: boolean;
  threshold: number;
}

export interface EntropyData {
  shannonEntropy: number;
  maxEntropy: number;
  normalizedEntropy: number;
  dataLength: number;
}

export interface KolmogorovData {
  originalSize: number;
  compressedSize: number;
  ratio: number;
  complexity: 'low' | 'medium' | 'high';
}

export interface AppPageProps {
  title: string;
  description?: string;
  domain: string;
  operators: string[];
}

export interface ReviewData {
  id: string;
  appId: string;
  userId: string;
  rating: number;
  reviewText: string;
  createdAt: number;
}

export interface VersionData {
  id: string;
  appId: string;
  version: string;
  sha256Hash: string;
  shannonEntropy: number;
  kolmogorovRatio: number;
  signature: string;
  changelog: string;
  createdAt: number;
}

export interface IntegrityData {
  checksum: string;
  entropyScore: number;
  kolmogorovScore: number;
  verifiedBy: string;
  verifiedAt: number;
  status: 'verified' | 'warning' | 'failed';
}

export const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || '';
export const PRECISION_THRESHOLD = 0.001; // 0.1%
