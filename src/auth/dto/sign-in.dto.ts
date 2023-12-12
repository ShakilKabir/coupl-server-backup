//sign-in.dto.ts

import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class SignInDto {
  @IsNotEmpty()
  @IsString()
  readonly email_address: string;

  @IsNotEmpty()
  @Matches(/^\d{6}$/, { message: 'PIN must be 6 digits' })
  readonly pin: string;
}
