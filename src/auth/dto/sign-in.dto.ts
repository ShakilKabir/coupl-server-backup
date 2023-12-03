//sign-in.dto.ts

import { IsNotEmpty, IsString } from 'class-validator';

export class SignInDto {
  @IsNotEmpty()
  @IsString()
  readonly email_address: string;

  @IsNotEmpty()
  @IsString()
  readonly password: string;
}
