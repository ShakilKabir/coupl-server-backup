import { Controller, Post, Body } from '@nestjs/common';
import { InvitationService } from './invitation.service';
import { InvitePartnerDto } from './dto/invite-partner.dto';

@Controller('invitation')
export class InvitationController {
  constructor(private invitationService: InvitationService) {}

  @Post('invite-partner')
  invitePartner(@Body() body: InvitePartnerDto): Promise<{ message: string }> {
    return this.invitationService.sendPartnerInvitation(
      body.token,
      body.partnerEmail,
    );
  }
}
