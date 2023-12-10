//transaction.service.ts

import { HttpService } from '@nestjs/axios';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Transaction, TransactionDocument } from './schema/transaction.schema';
import {
  BankAccount,
  BankAccountDocument,
} from 'src/bank-account/schema/bank-account.schema';
import { createBasicAuth } from '../utils/basic-auth-provider';
import { QueryDto } from './dto/query.dto';
import { TransactionLimit, TransactionLimitDocument } from './schema/transaction-limit.schema';
import { SetTransactionLimitDto, UpdateTransactionLimitApprovalDto } from './dto/transaction-limit.dto';

@Injectable()
export class TransactionService {

  constructor(
    @InjectModel(Transaction.name)
    private transactionModel: Model<TransactionDocument>,
    private httpService: HttpService,
    @InjectModel(BankAccount.name)
    private bankAccountModel: Model<BankAccountDocument>,
    @InjectModel(TransactionLimit.name) private transactionLimitModel: Model<TransactionLimitDocument>,
  ) {}

  async createBookTransfer(
    amount: number,
    toAccountId: string,
    userId: string,
    type: string,
    category: string,
    flow: string,
  ): Promise<TransactionDocument> {

    try {

      const transactionLimit = await this.transactionLimitModel.findOne({ userId });
      if (transactionLimit) {
        if (transactionLimit.monthlyLimit < transactionLimit.currentMonthSpent + amount) {
          throw new Error('Monthly spending limit exceeded');
        }
        transactionLimit.currentMonthSpent += amount;
        await transactionLimit.save();
      }

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
        flow,
        date: new Date(response.data.created_at),
        userId,
      });

      return transaction.save();
    } catch (error) {
      throw error;
    }
  }

  async getTransactionHistory(userId: string): Promise<Transaction[]> {
    return this.transactionModel.find({ userId }).exec();
  }

  async getFilteredTransactionHistory(userId: string, query: QueryDto): Promise<Transaction[]> {
    const { startDate, endDate, type } = query;
  
    let filters: any = { userId };
  
    if (startDate && endDate) {
      filters.date = {
        $gte: startDate ? new Date(startDate) : undefined,
        $lte: endDate ? new Date(endDate) : undefined,
      };
    }
  
    if (type) {
      filters.type = type;
    }
  
    return this.transactionModel.find(filters).exec();
  }

  async setTransactionLimit(userId: string, setTransactionLimitDto: SetTransactionLimitDto): Promise<TransactionLimitDocument> {
    const limit = new this.transactionLimitModel({
      userId,
      monthlyLimit: setTransactionLimitDto.monthlyLimit,
      isApprovedBySelf: true, // Auto-approve for self
      isApprovedByPartner: false,
    });
    return limit.save();
  }

  async updateTransactionLimitApproval(userId: string, partnerId: string, updateTransactionLimitApprovalDto: UpdateTransactionLimitApprovalDto): Promise<TransactionLimitDocument> {
    const limit = await this.transactionLimitModel.findOne({ userId });
    if (!limit) {
      throw new NotFoundException('Transaction limit not set');
    }
    if (userId === partnerId) {
      limit.isApprovedBySelf = updateTransactionLimitApprovalDto.isApproved;
    } else {
      limit.isApprovedByPartner = updateTransactionLimitApprovalDto.isApproved;
    }
    return limit.save();
  }
}
