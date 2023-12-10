// merchant.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MerchantDocument = Merchant & Document;

@Schema()
export class Merchant {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  accountId: string;

  @Prop({ required: true })
  accountNumber: string;

  @Prop({ required: true })
  category: string;

  @Prop()
  discounts: string;
}

export const MerchantSchema = SchemaFactory.createForClass(Merchant);
