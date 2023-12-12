//verify-invitation.dto.ts

import { IsNotEmpty, IsEmail, IsString } from 'class-validator';

export class VerifyInvitationDto {
  @IsNotEmpty()
  @IsString()
  readonly invitationToken: string;

  @IsNotEmpty()
  @IsEmail()
  readonly partnerEmail: string;
}
