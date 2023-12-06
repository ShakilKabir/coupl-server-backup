import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Transaction, TransactionDocument } from './schema/transaction.schema';
import {
  BankAccount,
  BankAccountDocument,
} from 'src/bank-account/schema/bank-account.schema';
import { createBasicAuth } from '../utils/basic-auth-provider';

@Injectable()
export class TransactionService {

  constructor(
    @InjectModel(Transaction.name)
    private transactionModel: Model<TransactionDocument>,
    private httpService: HttpService,
    @InjectModel(BankAccount.name)
    private bankAccountModel: Model<BankAccountDocument>,
  ) {}

  async createBookTransfer(
    amount: string,
    toAccountId: string,
    userId: string,
    type: string,
    category: string,
  ): Promise<TransactionDocument> {

    try {

      const userBankAccount = await this.bankAccountModel
        .findOne({ userId: new Types.ObjectId(userId) })
        .exec();

      if (!userBankAccount) {
        throw new Error('Bank account not found for user');
      }

      const fromAccountId = userBankAccount.bank_account_id;

      const response = await this.httpService
        .post(
          `${process.env.TREASURY_PRIME_API}/book`,
          {
            amount,
            from_account_id: fromAccountId,
            to_account_id: toAccountId,
          },
          { headers: { ...createBasicAuth() } },
        )
        .toPromise();

      const transaction = new this.transactionModel({
        fromAccountId,
        toAccountId,
        amount,
        type,
        category,
        date: new Date(response.data.created_at),
        userId,
      });

      return transaction.save();
    } catch (error) {
      throw error;
    }
  }
}
