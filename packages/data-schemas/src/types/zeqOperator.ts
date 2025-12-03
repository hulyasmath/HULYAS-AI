import type { ObjectId } from './index';

export interface IZeqOperator {
  _id?: ObjectId;
  name: string;
  category?: string;
  equation: string;
  variables?: Record<string, string>;
  description?: string;
  tags?: string[];
  createdBy?: ObjectId;
  updatedBy?: ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}




