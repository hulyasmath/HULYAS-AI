import { Schema } from 'mongoose';
import type * as t from '~/types';

const zeqOperatorSchema = new Schema<t.IZeqOperator>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    category: {
      type: String,
      required: false,
      index: true,
      trim: true,
    },
    equation: {
      type: String,
      required: true,
      trim: true,
    },
    variables: {
      type: Map,
      of: String,
      required: false,
    },
    description: {
      type: String,
      required: false,
      trim: true,
    },
    tags: {
      type: [String],
      required: false,
      default: [],
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
  },
  {
    timestamps: true,
  },
);

export default zeqOperatorSchema;



