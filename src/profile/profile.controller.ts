//profile.controller.ts

import { Controller, Get,  Request, UseGuards } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from 'src/auth/schema/user.schema';

@Controller('profile')
export class ProfileController {
  constructor(private profileService: ProfileService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async getProfile(@Request() req): Promise<User> {
    const userId = req.user.userId;
    console.log(req.user);
    console.log(req.user.id);
    return await this.profileService.getProfile(userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('email')
  async getEmail(@Request() req): Promise<{email: string}> {
    const userId = req.user.userId;
    const user = await this.profileService.getProfile(userId);
    return { email: user.email_address };
  }
}
