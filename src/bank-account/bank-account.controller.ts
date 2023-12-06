// bank-account.controller.ts

import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { BankAccountService } from './bank-account.service';

@Controller('bank-account')
export class BankAccountController {
  constructor(private bankAccountService: BankAccountService) {}

  @Post('/webhook')
  @HttpCode(200)
  async handleWebhook(@Body() body: any): Promise<string> {
 
    if (body.event === 'account.update') {
      await this.bankAccountService.processAccountUpdate(body);
    }

    return 'Webhook received';
  }
}
