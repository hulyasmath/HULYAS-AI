import type { Document } from 'mongoose';
import type { ITransparency, ITransparencyLogEntry } from '../schema/transparency';

// @ts-ignore
export interface ITransparencyDocument extends Document, ITransparency {}

export type { ITransparency, ITransparencyLogEntry };




