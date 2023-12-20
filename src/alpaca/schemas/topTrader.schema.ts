import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

@Schema()
export class TopTraders {
  // "ticker": "AOGOW",
  //         "price": "0.016",
  //         "change_amount": "0.0079",
  //         "change_percentage": "97.5309%",
  //         "volume": "100",
  //         "logo": {}
  @Prop()
  topGainersWithLogo: {
    ticker: string;
    change_amount: string;
    change_percentage: string;
    volume: string;
    price: string;
    logo: { name: string; logo: string };
  }[];

  @Prop()
  activelyTradedWithLogo: {
    ticker: string;
    change_amount: string;
    change_percentage: string;
    volume: string;
    price: string;
    logo: { name: string; logo: string };
  }[];
}

export const TopTradersSchema = SchemaFactory.createForClass(TopTraders);
