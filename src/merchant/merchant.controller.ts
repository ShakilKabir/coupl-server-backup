//merchant.controller.ts

import { Controller, Get, UseGuards } from '@nestjs/common';
import { MerchantService } from './merchant.service';
import { Merchant } from './schema/merchant.schema';
import { AuthGuard } from '@nestjs/passport';

@Controller('merchants')
export class MerchantController {
  constructor(private readonly merchantService: MerchantService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async getMerchants(): Promise<Merchant[]> {
    return this.merchantService.getOrSeedMerchants();
  }
}
