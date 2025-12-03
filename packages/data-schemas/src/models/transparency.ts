import type { Model } from 'mongoose';
import type { ITransparency } from '../schema/transparency';
import transparencySchema from '../schema/transparency';

export function createTransparencyModel(mongoose: typeof import('mongoose')): Model<ITransparency> {
  if (mongoose.models.Transparency) {
    return mongoose.models.Transparency as Model<ITransparency>;
  }

  return mongoose.model<ITransparency>('Transparency', transparencySchema);
}




