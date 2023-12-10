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
import {
  TransactionLimit,
  TransactionLimitDocument,
} from './schema/transaction-limit.schema';
import {
  RespondToTransactionLimitDto,
  SetTransactionLimitDto,
} from './dto/transaction-limit.dto';
import { User, UserDocument } from 'src/auth/schema/user.schema';

@Injectable()
export class TransactionService {
  constructor(
    @InjectModel(Transaction.name)
    private transactionModel: Model<TransactionDocument>,
    private httpService: HttpService,
    @InjectModel(BankAccount.name)
    private bankAccountModel: Model<BankAccountDocument>,
    @InjectModel(TransactionLimit.name)
    private transactionLimitModel: Model<TransactionLimitDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async createBookTransfer(
    amount: number,
    toAccountId: string,
    userId: string,
    category: string,
    flow: string,
  ): Promise<TransactionDocument> {
    try {
      await this.validateTransactionLimit(userId, amount);

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
        category,
        flow,
        accountId: userBankAccount.bank_account_id,
        date: new Date(response.data.created_at),
        userId,
      });

      return transaction.save();
    } catch (error) {
      throw error;
    }
  }

  async getTransactionHistory(userId: string): Promise<Transaction[]> {
    const userBankAccount = await this.bankAccountModel
      .findOne({ userId: new Types.ObjectId(userId) })
      .exec();

    if (!userBankAccount) {
      throw new NotFoundException('Bank account not found');
    }

    return this.transactionModel
      .find({ accountId: userBankAccount.bank_account_id })
      .exec();
  }

  async getFilteredTransactionHistory(
    userId: string,
    query: QueryDto,
  ): Promise<Transaction[]> {
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

  async setTransactionLimit(
    userId: string,
    setTransactionLimitDto: SetTransactionLimitDto,
  ): Promise<TransactionLimitDocument> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const isPrimaryUser = user.isPrimary;

    const userBankAccount = await this.bankAccountModel.findOne({
      userId: user._id,
    });
    if (!userBankAccount) {
      throw new NotFoundException('Bank account not found for user');
    }

    const limit = new this.transactionLimitModel({
      accountId: userBankAccount.bank_account_id,
      monthlyLimit: setTransactionLimitDto.monthlyLimit,
      isApprovedByPrimary: isPrimaryUser,
      isApprovedBySecondary: !isPrimaryUser,
    });

    return limit.save();
  }

  async respondToTransactionLimit(
    userId: string,
    responseDto: RespondToTransactionLimitDto,
  ): Promise<TransactionLimitDocument> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const isPrimaryUser = user.isPrimary;

    const userBankAccount = await this.bankAccountModel.findOne({
      userId: user._id,
    });
    if (!userBankAccount) {
      throw new NotFoundException('Bank account not found for user');
    }

    const limit = await this.transactionLimitModel.findOne({
      accountId: userBankAccount.bank_account_id,
    });
    if (!limit) {
      throw new NotFoundException('Transaction limit not set');
    }

    if (responseDto.accept) {
      if (isPrimaryUser) {
        limit.isApprovedByPrimary = true;
      } else {
        limit.isApprovedBySecondary = true;
      }
    } else {
      limit.monthlyLimit = responseDto.newLimit;
      limit.isApprovedByPrimary = isPrimaryUser;
      limit.isApprovedBySecondary = !isPrimaryUser;
    }

    return limit.save();
  }

  private async validateTransactionLimit(
    userId: string,
    amount: number,
  ): Promise<void> {
    const userBankAccount = await this.bankAccountModel.findOne({
      userId: new Types.ObjectId(userId),
    });
    if (!userBankAccount) {
      throw new NotFoundException('Bank account not found for user');
    }

    const transactionLimit = await this.transactionLimitModel.findOne({
      accountId: userBankAccount._id,
    });

    if (
      transactionLimit &&
      transactionLimit.isApprovedByPrimary &&
      transactionLimit.isApprovedBySecondary
    ) {
      if (
        transactionLimit.monthlyLimit <
        transactionLimit.currentMonthSpent + amount
      ) {
        throw new Error('Monthly spending limit exceeded');
      }
      transactionLimit.currentMonthSpent += amount;
      await transactionLimit.save();
    }
  }
}
