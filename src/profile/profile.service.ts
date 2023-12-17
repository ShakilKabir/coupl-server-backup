//profile.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { User, UserDocument } from 'src/auth/schema/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { BankAccountService } from 'src/bank-account/bank-account.service';
import { TransactionLimit, TransactionLimitDocument } from 'src/transaction/schema/transaction-limit.schema';
import { BankAccount, BankAccountDocument } from 'src/bank-account/schema/bank-account.schema';

@Injectable()
export class ProfileService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private bankAccountService: BankAccountService,
    @InjectModel(BankAccount.name)
    private bankAccountModel: Model<BankAccountDocument>,
    @InjectModel(TransactionLimit.name) private transactionLimitModel: Model<TransactionLimitDocument>,
  ) {}

  async getProfile(userId: string): Promise<UserDocument> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    return user;
  }

  async getHomeDetails(
    userId: string,
  ): Promise<{
    user: UserDocument;
    partner: UserDocument;
    balance: number;
    monthlyLimit: number;
    currentMonthSpent: number;
  }> {
    const user = await this.getProfile(userId);
    const objectId = new Types.ObjectId(userId);
    const partner = await this.userModel.findById(user.partnerId).exec();
    const balanceData = await this.bankAccountService.getAccountBalance(objectId);
    const userBankAccount = await this.bankAccountModel.findOne({
      userId: user._id,
    });

    const transactionLimit = await this.transactionLimitModel.findOne({ accountId: userBankAccount.bank_account_id });

    return {
      user,
      partner,
      balance: balanceData.balance,
      monthlyLimit: transactionLimit ? transactionLimit.monthlyLimit : 0,
      currentMonthSpent: transactionLimit ? transactionLimit.currentMonthSpent : 0,
    };
  }

  async getFilteredHomeDetails(
    userId: string,
  ): Promise<{
    userFirstName: string;
    partnerFirstName: string;
    balance: number;
    monthlyLimit: number;
    currentMonthSpent: number;
  }> {
    const user = await this.getProfile(userId);
    const {first_name : userFirstName} = user;
    const objectId = new Types.ObjectId(userId);
    const {first_name : partnerFirstName} = await this.userModel.findById(user.partnerId).exec();
    const balanceData = await this.bankAccountService.getAccountBalance(objectId);
    const userBankAccount = await this.bankAccountModel.findOne({
      userId: user._id,
    });

    const transactionLimit = await this.transactionLimitModel.findOne({ accountId: userBankAccount.bank_account_id });

    return {
      userFirstName,
      partnerFirstName,
      balance: balanceData.balance,
      monthlyLimit: transactionLimit ? transactionLimit.monthlyLimit : 0,
      currentMonthSpent: transactionLimit ? transactionLimit.currentMonthSpent : 0,
    };
  }

  async updateProfile(
    userId: string,
    updateProfileDto: UpdateProfileDto,
  ): Promise<User> {
    await this.userModel.findByIdAndUpdate(userId, updateProfileDto).exec();
    const user  = await this.getProfile(userId);
    return user;
  }
}
