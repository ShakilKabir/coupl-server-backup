// dto/verify-otp.dto.ts

import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyOtpDto {
  @IsNotEmpty()
  @IsString()
  readonly email_address: string;

  @IsNotEmpty()
  @IsString()
  readonly otp: string;
}
