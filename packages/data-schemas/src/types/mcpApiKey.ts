import type { ObjectId } from 'mongoose';

export interface IMCPApiKey {
  _id: ObjectId;
  userId: ObjectId;
  apiKey: string;
  prefix: string;
  lastUsedAt?: Date | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
