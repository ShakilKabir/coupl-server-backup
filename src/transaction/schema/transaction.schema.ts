import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TransactionDocument = Transaction & Document;

@Schema()
export class Transaction {
  @Prop({ required: true })
  fromAccountId: string;

  @Prop({ required: true })
  toAccountId: string;

  @Prop({ required: true })
  amount: string;

  @Prop({ required: true })
  type: string;

  @Prop({ required: true })
  date: Date;

  @Prop({ required: true })
  userId: string;

  @Prop()
  category: string;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
