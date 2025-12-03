import zeqOperatorSchema from '~/schema/zeqOperator';
import type * as t from '~/types';

export function createZeqOperatorModel(mongoose: typeof import('mongoose')) {
  return (
    mongoose.models.ZeqOperator ||
    mongoose.model<t.IZeqOperator>('ZeqOperator', zeqOperatorSchema)
  );
}




