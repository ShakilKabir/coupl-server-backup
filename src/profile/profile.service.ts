//profile.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { User, UserDocument } from 'src/auth/schema/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { BankAccountService } from 'src/bank-account/bank-account.service';

@Injectable()
export class ProfileService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>,private bankAccountService: BankAccountService) {}

  async getProfile(userId: string): Promise<{user: UserDocument, partner: UserDocument, balance: number}> {
    const user = await this.userModel.findById(userId).exec();

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const objectId = new Types.ObjectId(userId);
    const partner = await this.userModel.findById(user.partnerId).exec();
    const balanceData = await this.bankAccountService.getAccountBalance(objectId);

    return { user, partner, balance: balanceData.balance };
  }

  async updateProfile(
    userId: string,
    updateProfileDto: UpdateProfileDto,
  ): Promise<User> {
    await this.userModel.findByIdAndUpdate(userId, updateProfileDto).exec();
    const {user} = await this.getProfile(userId);
    return user;
  }
}
