//profile.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { User, UserDocument } from 'src/auth/schema/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { BankAccountService } from 'src/bank-account/bank-account.service';
import {
  TransactionLimit,
  TransactionLimitDocument,
} from 'src/transaction/schema/transaction-limit.schema';
import {
  BankAccount,
  BankAccountDocument,
} from 'src/bank-account/schema/bank-account.schema';

@Injectable()
export class ProfileService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private bankAccountService: BankAccountService,
    @InjectModel(BankAccount.name)
    private bankAccountModel: Model<BankAccountDocument>,
    @InjectModel(TransactionLimit.name)
    private transactionLimitModel: Model<TransactionLimitDocument>,
  ) {}

  async getProfile(userId: string): Promise<UserDocument> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    return user;
  }

  async getHomeDetails(userId: string): Promise<{
    user: UserDocument;
    partner: UserDocument;
    balance: number;
    monthlyLimit: number;
    currentMonthSpent: number;
  }> {
    const user = await this.getProfile(userId);
    const objectId = new Types.ObjectId(userId);
    const partner = await this.userModel.findById(user.partnerId).exec();
    const balanceData =
      await this.bankAccountService.getAccountBalance(objectId);
    const userBankAccount = await this.bankAccountModel.findOne({
      userId: user._id,
    });

    const transactionLimit = await this.transactionLimitModel.findOne({
      accountId: userBankAccount.bank_account_id,
    });

    return {
      user,
      partner,
      balance: balanceData.balance,
      monthlyLimit: transactionLimit ? transactionLimit.monthlyLimit : 0,
      currentMonthSpent: transactionLimit
        ? transactionLimit.currentMonthSpent
        : 0,
    };
  }

  async getFilteredHomeDetails(userId: string): Promise<{
    userFirstName: string;
    userLastName: string;
    partnerFirstName: string;
    balance: number;
    monthlyLimit: number;
    currentMonthSpent: number;
  }> {
    try {
      const user = await this.getProfile(userId);
      const { first_name: userFirstName, last_name: userLastName } = user;
      let partnerFirstName = '';
      let balanceData = { balance: 0 };
      let transactionLimit = { monthlyLimit: 0, currentMonthSpent: 0 };
  
      if (user.partnerId) {
        const partner = await this.userModel.findById(user.partnerId).exec();
        if (partner) {
          partnerFirstName = partner.first_name;
        }
        const userBankAccount = await this.bankAccountModel.findOne({ userId: user._id });
        if (userBankAccount) {
          balanceData = await this.bankAccountService.getAccountBalance(user._id);
          transactionLimit = await this.transactionLimitModel.findOne({
            accountId: userBankAccount.bank_account_id,
          }) || transactionLimit;
        }
      }
  
      return {
        userFirstName,
        userLastName,
        partnerFirstName,
        balance: balanceData.balance,
        monthlyLimit: transactionLimit.monthlyLimit,
        currentMonthSpent: transactionLimit.currentMonthSpent,
      };
    } catch (error) {
      console.error('Error in getFilteredHomeDetails:', error);
      throw error;
    }
  }
  

  async updateProfile(
    userId: string,
    updateProfileDto: UpdateProfileDto,
  ): Promise<User> {
    await this.userModel.findByIdAndUpdate(userId, updateProfileDto).exec();
    const user = await this.getProfile(userId);
    return user;
  }

  getOffers(): any[] {
    return [
      {
        name: 'Pizza Hut',
        image_link: 'https://ibb.co/10qGyS6',
        offer: 'Buy 3 Get 1 Free',
        coupon_id: this.generateRandomCouponId(),
      },
      {
        name: 'Best Buy',
        image_link: 'https://ibb.co/26D7QD9',
        offer: 'Get 3% discount',
        coupon_id: this.generateRandomCouponId(),
      },
      {
        name: 'Samsung',
        image_link: 'https://ibb.co/kBwnKjy',
        offer: 'Get 2% discount',
        coupon_id: this.generateRandomCouponId(),
      },
      {
        name: 'Walmart',
        image_link: 'https://ibb.co/qgFtQpD',
        offer: 'Get 2% cashback',
        coupon_id: this.generateRandomCouponId(),
      },
    ];
  }

  private generateRandomCouponId(length: number = 10): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(
        Math.floor(Math.random() * characters.length),
      );
    }
    return result;
  }
}
