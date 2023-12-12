//sign-up.dto.ts

import {
  IsNotEmpty,
  IsString,
  IsEmail,
  IsPhoneNumber,
  IsDateString,
  IsObject,
  Length,
  Matches,
} from 'class-validator';
import { IsOlderThan } from '../../utils/date-of-birth-validator';

class AddressDto {
  @IsNotEmpty()
  @IsString()
  street_line_1: string;

  @IsNotEmpty()
  @IsString()
  street_line_2?: string;

  @IsNotEmpty()
  @IsString()
  city: string;

  @IsNotEmpty()
  @IsString()
  @Length(3)
  state: string;

  @IsNotEmpty()
  @IsString()
  postal_code: string;
}

export class SignUpDto {
  @IsNotEmpty()
  @IsString()
  readonly first_name: string;

  @IsNotEmpty()
  @IsString()
  readonly last_name: string;

  @IsNotEmpty()
  @IsEmail()
  readonly email_address: string;

  @IsNotEmpty()
  @Matches(/^\d{10}$/, { message: 'Non-US phone numbers not allowed' })
  readonly phone_number: string;

  @IsNotEmpty()
  @IsDateString()
  @IsOlderThan({
    message: 'Invalid date of birth: must be less than 130 years of age',
  })
  readonly date_of_birth: string;

  @IsNotEmpty()
  @IsString()
  @Length(2, 2, { message: 'Invalid ISO 3166-1 alpha-2 country code length' })
  readonly citizenship: string;

  @IsNotEmpty()
  @Matches(/^\d{6}$/, { message: 'PIN must be 6 digits' })
  readonly pin: string;

  @IsNotEmpty()
  @IsObject()
  readonly physical_address: AddressDto;
}
