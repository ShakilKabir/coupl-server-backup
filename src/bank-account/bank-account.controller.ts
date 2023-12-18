// bank-account.controller.ts

import {
  Controller,
  Post,
  Body,
  HttpCode,
  UseGuards,
  Get,
  Request,
} from '@nestjs/common';
import { BankAccountService } from './bank-account.service';
import { AuthGuard } from '@nestjs/passport';

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

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async getBankAccountDetails(@Request() req): Promise<any>{
    const userId = req.user.userId;
    return this.bankAccountService.getBankAccountDetails(userId);
  }


  @UseGuards(AuthGuard('jwt'))
  @Get('/balance')
  async getAccountBalance(@Request() req): Promise<{ balance: number }> {
    const userId = req.user.userId;
    return this.bankAccountService.getAccountBalance(userId);
  }
}
