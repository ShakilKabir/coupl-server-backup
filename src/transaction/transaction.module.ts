//transaction.module.ts

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { Transaction, TransactionSchema } from './schema/transaction.schema';
import { HttpModule } from '@nestjs/axios';
import { BankAccountModule } from 'src/bank-account/bank-account.module';
import { BankAccount, BankAccountSchema } from 'src/bank-account/schema/bank-account.schema';
import { TransactionLimit, TransactionLimitSchema } from './schema/transaction-limit.schema';
import { User, UserSchema } from 'src/auth/schema/user.schema';
import { ProfileModule } from 'src/profile/profile.module';
import { ProfileService } from 'src/profile/profile.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Transaction.name, schema: TransactionSchema }]),
    MongooseModule.forFeature([{ name: TransactionLimit.name, schema: TransactionLimitSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    HttpModule,
    MongooseModule.forFeature([
      { name: BankAccount.name, schema: BankAccountSchema },
    ]),
  ],
  providers: [TransactionService, ProfileService],
  controllers: [TransactionController],
})
export class TransactionModule {}
