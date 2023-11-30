// invite-partner.dto.ts

import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class InvitePartnerDto {
  @IsNotEmpty()
  @IsString()
  readonly token: string;

  @IsNotEmpty()
  @IsEmail()
  readonly partnerEmail: string;
}
