//profile.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { User, UserDocument } from 'src/auth/schema/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class ProfileService {
    constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

    async getProfile(userId: string): Promise<UserDocument> {
        const user = await this.userModel.findById(userId).exec();

        if (!user) {
            throw new NotFoundException(`User with ID ${userId} not found`);
        }

        return user;
    }
}

