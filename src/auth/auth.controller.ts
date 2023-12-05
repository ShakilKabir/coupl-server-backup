//auth.controller.ts

import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/sign-up.dto';
import { SignUpResponseDto } from './dto/sign-up-response.dto';
import { SignInDto } from './dto/sign-in.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  async signUp(@Body() signUpDto: SignUpDto): Promise<SignUpResponseDto> {
 
      return this.authService.signUp(signUpDto);
  }

  @Post('signin')
  async signIn(@Body() signInDto: SignInDto): Promise<SignUpResponseDto> {
    return this.authService.signIn(signInDto);
  }

  @Get('check-email')
  async checkEmailAvailability(
    @Query('email') email: string,
  ): Promise<{ available: boolean }> {
    return this.authService.checkEmailAvailability(email);
  }

  //using mail
  @Post('send-otp')
  async sendOTP(@Body('email_address') email: string) {
    return this.authService.sendOTP(email);
  }

  @Post('verify-otp')
  async verifyOTP(@Body() verifyOtpDto: VerifyOtpDto) {
    return this.authService.verifyOTP(verifyOtpDto);
  }


  //using twilio
  // @Post('send-otp')
  // async sendOtp(@Body() data: { phone: string }): Promise<{ msg: string }> {
  //   let prefix = '+1';
  //   let phone = prefix.concat(data.phone);
  //   return await this.authService.sendOTP(phone);
  // }

  // @Post('verify-otp')
  // async verifyOtp(
  //   @Body() data: { phone: string; otp: string },
  // ): Promise<{ msg: string }> {
  //   let prefix = '+1';
  //   let phone = prefix.concat(data.phone);
  //   return await this.authService.verifyOTP(phone, data.otp);
  // }
}
