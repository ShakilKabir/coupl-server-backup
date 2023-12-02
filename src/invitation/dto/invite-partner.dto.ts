// invite-partner.dto.ts

import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class InvitePartnerDto {

  @IsNotEmpty()
  @IsEmail()
  readonly partnerEmail: string;
}
