//profile.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { User, UserDocument } from 'src/auth/schema/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfileService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async getProfile(userId: string): Promise<{user:UserDocument, partner:UserDocument}> {
    const user = await this.userModel.findById(userId).exec();

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const partner = await this.userModel.findById(user.partnerId).exec();

    return {user, partner};
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
