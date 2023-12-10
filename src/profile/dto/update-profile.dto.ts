//update-profile.dto.ts

import { IsString, IsOptional, IsEmail, IsPhoneNumber } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  readonly first_name?: string;

  @IsOptional()
  @IsString()
  readonly last_name?: string;

  @IsOptional()
  @IsEmail()
  readonly email_address?: string;

  @IsOptional()
  @IsPhoneNumber()
  readonly phone_number?: string;
}
