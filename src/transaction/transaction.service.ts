//transaction.service.ts

import { HttpService } from '@nestjs/axios';
import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
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
import { TransactionSummaryDto } from './dto/transaction-summary.dto';
import { ProfileService } from 'src/profile/profile.service';

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
    private profileService: ProfileService,
  ) {}

  async createBookTransfer(
    amount: string,
    category: string,
    flow: string,
    userId: string,
    type: string,
    sender: any,
    receiver: any,
    header: string,
  ): Promise<TransactionDocument> {
    try {
      await this.validateTransactionLimit(userId, amount, flow);

      const userBankAccount = await this.bankAccountModel
        .findOne({ userId: new Types.ObjectId(userId) })
        .exec();

      if (!userBankAccount) {
        throw new Error('Bank account not found for user');
      }

      let fromAccountId, toAccountId;

      if (flow === 'IN') {
        toAccountId = userBankAccount.bank_account_id;
        fromAccountId = 'acct_11jqakz3r7exb1';
      } else if (flow === 'OUT') {
        fromAccountId = userBankAccount.bank_account_id;
        toAccountId = 'acct_11jqakz3r7exb1';
      } else {
        throw new Error('Invalid transaction flow');
      }

      if (type) {
        let profile = await this.userModel
          .findOne({ email_address: header })
          .exec();
        if (!profile) {
          throw new HttpException('Profile not found', HttpStatus.NOT_FOUND);
        }
        const { user, partner } = await this.profileService.getHomeDetails(
          profile._id,
        );
        const userBankAccount = await this.bankAccountModel
          .findOne({ userId: user._id })
          .exec();
        toAccountId = userBankAccount.bank_account_id;
        header = user.first_name + ' & ' + partner.first_name;
      }

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
        sender,
        receiver,
        header,
        accountId: userBankAccount.bank_account_id,
        date: new Date(response.data.created_at),
        userId,
      });

      return transaction.save();
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        console.error('Error', error.message);
        if (error.response) {
          console.error(error.response.data);
          console.error(error.response.status);
          console.error(error.response.headers);
        } else if (error.request) {
          console.error(error.request);
        }
        throw new HttpException(
          'Failed to create book transfer',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  async getTransactionHistory(userId: string): Promise<Transaction[]> {
    const userBankAccount = await this.bankAccountModel
      .findOne({ userId: new Types.ObjectId(userId) })
      .exec();

    if (!userBankAccount) {
      throw new NotFoundException('Bank account not found');
    }

    const aggregation = [
      {
        $match: {
          accountId: userBankAccount.bank_account_id,
        },
      },
      {
        $addFields: {
          convertedUserId: { $toObjectId: '$userId' },
        },
      },
      {
        $lookup: {
          from: 'users', // replace with your User collection name if different
          localField: 'convertedUserId',
          foreignField: '_id',
          as: 'userDetails',
        },
      },
      {
        $unwind: '$userDetails',
      },
      {
        $project: {
          // include all transaction fields you need
          fromAccountId: 1,
          toAccountId: 1,
          amount: 1,
          date: 1,
          userId: 1,
          accountId: 1,
          category: 1,
          flow: 1,
          header: 1,
          type: 1,
          sender: 1,
          receiver: 1,
          // Add the first_name from the User document
          userFirstName: '$userDetails.first_name',
        },
      },
    ];

    return await this.transactionModel.aggregate(aggregation).exec();
  }

  async getFilteredTransactionHistory(
    userId: string,
    query: QueryDto,
  ): Promise<Transaction[]> {
    const { startDate, endDate, category } = query;

    let filters: any = { userId };

    if (startDate && endDate) {
      filters.date = {
        $gte: startDate ? new Date(startDate) : undefined,
        $lte: endDate ? new Date(endDate) : undefined,
      };
    }

    if (category) {
      filters.category = category;
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

    const userBankAccount = await this.bankAccountModel.findOne({
      userId: user._id,
    });
    if (!userBankAccount) {
      throw new NotFoundException('Bank account not found for user');
    }

    const existingLimitProposal = await this.transactionLimitModel.findOne({
      accountId: userBankAccount.bank_account_id,
    });

    if (existingLimitProposal) {
      // Check if there's an existing proposal and if it's already approved
      if (existingLimitProposal.isApprovedByPrimary && existingLimitProposal.isApprovedBySecondary) {
        // If both users have approved, allow updating the limit
        existingLimitProposal.monthlyLimit = setTransactionLimitDto.monthlyLimit;
        return existingLimitProposal.save();
      } else {
        throw new HttpException(
          'A transaction limit proposal is already pending approval by your partner',
          HttpStatus.FORBIDDEN,
        );
      }
    }

    // If no conflicting proposal, set the new limit
    const limit = new this.transactionLimitModel({
      accountId: userBankAccount.bank_account_id,
      monthlyLimit: setTransactionLimitDto.monthlyLimit,
      isApprovedByPrimary: user.isPrimary,
      isApprovedBySecondary: !user.isPrimary,
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
    amount: string,
    flow: string,
  ): Promise<void> {
    if (flow === 'OUT') {
      const userBankAccount = await this.bankAccountModel.findOne({
        userId: new Types.ObjectId(userId),
      });

      if (!userBankAccount) {
        throw new HttpException(
          'Bank account not found for user',
          HttpStatus.NOT_FOUND,
        );
      }

      const transactionLimit = await this.transactionLimitModel.findOne({
        accountId: userBankAccount.bank_account_id,
      });

      if (!transactionLimit) {
        return;
      }

      const numericAmount = parseFloat(amount);
      if (isNaN(numericAmount)) {
        throw new HttpException(
          'Invalid amount format',
          HttpStatus.BAD_REQUEST,
        );
      }

      if (
        transactionLimit.monthlyLimit === 0 ||
        transactionLimit.monthlyLimit >= transactionLimit.currentMonthSpent + numericAmount
      ) {
        transactionLimit.currentMonthSpent += numericAmount;
        await transactionLimit.save();
      } else {
        throw new HttpException(
          'Monthly spending limit exceeded',
          HttpStatus.FORBIDDEN,
        );
      }
    }
  }

  async calculateOutflows(userId: string): Promise<TransactionSummaryDto> {
    const user = await this.userModel.findById(userId);
    const account = await this.bankAccountModel.findOne({ userId: user._id });

    if (!account) {
      throw new NotFoundException('Bank account not found');
    }

    const partnerId = user.partnerId || user._id;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const transactions = await this.transactionModel.find({
      accountId: account.bank_account_id,
      flow: 'OUT',
      date: { $gte: thirtyDaysAgo },
    });

    let totalOutflow = 0;
    let primaryUserOutflow = 0;
    let secondaryUserOutflow = 0;

    transactions.forEach((transaction) => {
      totalOutflow += parseFloat(transaction.amount);
      if (transaction.userId === userId) {
        primaryUserOutflow += parseFloat(transaction.amount);
      } else if (transaction.userId === partnerId.toString()) {
        secondaryUserOutflow += parseFloat(transaction.amount);
      }
    });

    return {
      totalOutflow,
      primaryUserOutflow,
      secondaryUserOutflow,
    };
  }

  async getMonthWiseOutflow(
    userId: string,
  ): Promise<{ month: string; outflow: number }[]> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const account = await this.bankAccountModel.findOne({ userId: user._id });
    if (!account) {
      throw new NotFoundException('Bank account not found');
    }

    const fourMonthsAgo = new Date();
    fourMonthsAgo.setMonth(fourMonthsAgo.getMonth() - 4);

    const aggregation: any[] = [
      {
        $match: {
          accountId: account.bank_account_id,
          date: { $gte: fourMonthsAgo },
          flow: 'OUT',
        },
      },
      {
        $group: {
          _id: { $month: '$date' },
          totalOutflow: { $sum: { $toDouble: '$amount' } },
        },
      },
      { $sort: { _id: 1 } },
    ];

    let results = await this.transactionModel.aggregate(aggregation).exec();
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const currentMonth = new Date().getMonth();
    results = months
      .map((month, index) => {
        if (index > currentMonth - 4 && index <= currentMonth) {
          const found = results.find(
            (result) => this.getMonthName(result._id) === month,
          );
          return {
            month: month,
            outflow: found ? found.totalOutflow : 0,
          };
        }
      })
      .filter(Boolean);

    return results;
  }

  async getQuarterWiseOutflow(
    userId: string,
  ): Promise<{ quarter: string; outflow: number }[]> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const account = await this.bankAccountModel.findOne({ userId: user._id });
    if (!account) {
      throw new NotFoundException('Bank account not found');
    }

    const currentYear = new Date().getFullYear();

    const aggregation: any[] = [
      {
        $match: {
          accountId: account.bank_account_id,
          date: { $gte: new Date(`${currentYear}-01-01`) },
          flow: 'OUT',
        },
      },
      {
        $group: {
          _id: {
            $cond: [
              { $lte: [{ $month: '$date' }, 3] },
              'Jan-Mar',
              {
                $cond: [
                  { $lte: [{ $month: '$date' }, 6] },
                  'Apr-Jun',
                  {
                    $cond: [
                      { $lte: [{ $month: '$date' }, 9] },
                      'Jul-Sep',
                      'Oct-Dec',
                    ],
                  },
                ],
              },
            ],
          },
          totalOutflow: { $sum: { $toDouble: '$amount' } },
        },
      },
      { $sort: { _id: 1 } },
    ];

    let results = await this.transactionModel.aggregate(aggregation).exec();

    const quarters = ['Jan-Mar', 'Apr-Jun', 'Jul-Sep', 'Oct-Dec'];
    results = quarters.map((quarter) => {
      const found = results.find((result) => result._id === quarter);
      return {
        quarter: quarter,
        outflow: found ? found.totalOutflow : 0,
      };
    });

    return results;
  }

  async getCategoryWiseOutflowLast30Days(
    userId: string,
  ): Promise<{ category: string; outflow: number }[]> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const account = await this.bankAccountModel.findOne({ userId: user._id });
    if (!account) {
      throw new NotFoundException('Bank account not found');
    }

    const aggregation: any[] = [
      {
        $match: {
          accountId: account.bank_account_id,
          date: { $gte: thirtyDaysAgo },
          flow: 'OUT',
        },
      },
      {
        $group: {
          _id: '$category',
          totalOutflow: { $sum: { $toDouble: '$amount' } },
        },
      },
      { $sort: { _id: 1 } },
    ];

    const results = await this.transactionModel.aggregate(aggregation).exec();
    return results.map((result) => ({
      category: result._id,
      outflow: result.totalOutflow,
    }));
  }

  async getCombinedOutflows(
    userId: string,
  ): Promise<{ monthWise: any[]; quarterWise: any[] }> {
    const monthWise = await this.getMonthWiseOutflow(userId);
    const quarterWise = await this.getQuarterWiseOutflow(userId);
    return { monthWise, quarterWise };
  }

  private getMonthName(monthIndex: number): string {
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    return months[monthIndex - 1];
  }
}
