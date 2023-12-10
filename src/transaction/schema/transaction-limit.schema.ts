//transaction-limit.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TransactionLimitDocument = TransactionLimit & Document;

@Schema()
export class TransactionLimit {
  @Prop({ type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ required: true })
  monthlyLimit: number;

  @Prop({ default: false })
  isApprovedBySelf: boolean;

  @Prop({ default: false })
  isApprovedByPartner: boolean;

  @Prop({ required: true })
  currentMonthSpent: number;
}

export const TransactionLimitSchema = SchemaFactory.createForClass(TransactionLimit);
