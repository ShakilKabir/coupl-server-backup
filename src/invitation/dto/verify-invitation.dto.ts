import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyInvitationDto {
  @IsNotEmpty()
  @IsString()
  readonly invitationToken: string;
}
