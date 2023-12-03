// user.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

class Address {
  @Prop({ required: true })
  street_line_1: string;

  @Prop()
  street_line_2: string;

  @Prop({ required: true })
  city: string;

  @Prop({ required: true })
  state: string;

  @Prop({ required: true })
  postal_code: string;
}

@Schema()
export class User {
    @Prop({ required: true })
    first_name: string;

    @Prop({ required: true })
    last_name: string;

    @Prop({ required: true, unique: true })
    email_address: string;

    @Prop({ required: true })
    phone_number: string;

    @Prop({ required: true })
    date_of_birth: string;

    @Prop({ required: true })
    citizenship: string;

    @Prop({ required: true })
    pin: string;

    @Prop({ type: Address, _id: false, required: true })
    physical_address: Address;

    @Prop({ type: Types.ObjectId, ref: 'User', default: null })
    partnerId: Types.ObjectId | null;

    @Prop({ default: true })
    isPrimary: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
