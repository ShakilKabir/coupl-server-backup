// src/bank-account/schema/bank-account.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type BankAccountDocument = BankAccount & Document;

@Schema()
export class BankAccount {
  @Prop({ type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ default: null })
  person_application_id: string;
  
  @Prop({ default: null })
  bank_account_number: string;

  @Prop({ default: null })
  bank_account_id: string;
}

export const BankAccountSchema = SchemaFactory.createForClass(BankAccount);
