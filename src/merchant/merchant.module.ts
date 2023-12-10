// merchants.module.ts

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Merchant, MerchantSchema } from './schema/merchant.schema';
import { MerchantService } from './merchant.service';
import { MerchantController } from './merchant.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Merchant.name, schema: MerchantSchema }]),
  ],
  providers: [MerchantService],
  exports: [MerchantService],
  controllers: [MerchantController],
})
export class MerchantModule {}
