import { Module } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/auth/schema/user.schema';
import { BankAccountModule } from 'src/bank-account/bank-account.module';
import { HttpModule } from '@nestjs/axios';
import { BankAccountService } from 'src/bank-account/bank-account.service';
import { TransactionLimit, TransactionLimitSchema } from 'src/transaction/schema/transaction-limit.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    BankAccountModule,
    HttpModule,
    MongooseModule.forFeature([
      { name: TransactionLimit.name, schema: TransactionLimitSchema },
    ]),
  ],
  providers: [ProfileService, BankAccountService],
  controllers: [ProfileController],
  exports: [ProfileService],
})
export class ProfileModule {}
