//bank-account.module.ts

import { Module } from '@nestjs/common';
import { BankAccountController } from './bank-account.controller';
import { BankAccountService } from './bank-account.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [BankAccountController],
  providers: [BankAccountService]
})

export class BankAccountModule {}
