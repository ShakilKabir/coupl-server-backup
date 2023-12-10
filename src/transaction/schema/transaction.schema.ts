//transaction.schema.ts

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
  date: Date;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  accountId: string;

  @Prop()
  category: string;

  @Prop({ required: true })
  flow: TransactionFlow;
}

enum TransactionFlow {
  IN = 'INCOMING',
  OUT = 'OUTGOING',
}
export const TransactionSchema = SchemaFactory.createForClass(Transaction);
