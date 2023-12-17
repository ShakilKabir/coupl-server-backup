//profile.controller.ts

import {
  Controller,
  Get,
  Request,
  UseGuards,
  Patch,
  Body,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from 'src/auth/schema/user.schema';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('profile')
export class ProfileController {
  constructor(private profileService: ProfileService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async getProfile(@Request() req): Promise<User> {
    const userId = req.user.userId;
    return await this.profileService.getProfile(userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('home')
  async getHomeDetails(@Request() req): Promise<{
    user: User;
    partner: User;
    balance: number;
    monthlyLimit: number;
    currentMonthSpent: number;
  }> {
    const userId = req.user.userId;
    return await this.profileService.getHomeDetails(userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('filtered-home')
  async getFilteredHomeDetails(@Request() req): Promise<{
    userFirstName: string;
    partnerFirstName: string;
    balance: number;
    monthlyLimit: number;
    currentMonthSpent: number;
  }> {
    const userId = req.user.userId;
    return await this.profileService.getFilteredHomeDetails(userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('email')
  async getEmail(@Request() req): Promise<{ email: string }> {
    const userId = req.user.userId;
    const  user  = await this.profileService.getProfile(userId);
    return { email: user.email_address };
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch()
  async updateProfile(
    @Request() req,
    @Body() updateProfileDto: UpdateProfileDto,
  ): Promise<User> {
    const userId = req.user.userId;
    return this.profileService.updateProfile(userId, updateProfileDto);
  }
}
