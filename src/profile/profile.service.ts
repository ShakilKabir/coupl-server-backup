//profile.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { User, UserDocument } from 'src/auth/schema/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { BankAccountService } from 'src/bank-account/bank-account.service';
import { TransactionLimit, TransactionLimitDocument } from 'src/transaction/schema/transaction-limit.schema';

@Injectable()
export class ProfileService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private bankAccountService: BankAccountService,
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

    const transactionLimit = await this.transactionLimitModel.findOne({ accountId: objectId });

    return {
      user,
      partner,
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
