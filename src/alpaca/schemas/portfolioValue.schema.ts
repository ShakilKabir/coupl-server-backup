import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

@Schema()
export class PortfolioValue {
  @Prop()
  traderAccId: string;

  @Prop()
  portfolioVals: { date: Date; value: number }[];
}

export const PortfolioValueSchema =
  SchemaFactory.createForClass(PortfolioValue);
