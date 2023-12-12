//invitation.controller.ts

import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { InvitationService } from './invitation.service';
import { InvitePartnerDto } from './dto/invite-partner.dto';
import { VerifyInvitationDto } from './dto/verify-invitation.dto';
import { AuthGuard } from '@nestjs/passport';
import { PairUpDto } from './dto/pair-up.dto';


@Controller('invitation')
export class InvitationController {
  constructor(private invitationService: InvitationService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('invite-partner')
  invitePartner(@Request() req, @Body() body: InvitePartnerDto): Promise<{ message: string }> {
    const userId = req.user.userId;
    return this.invitationService.sendPartnerInvitation(
      userId,
      body.partnerEmail,
    );
  }

  @Post('verify-invitation')
  async verifyInvitation(@Body() verifyInvitationDto: VerifyInvitationDto) {
    return this.invitationService.verifyInvitation(verifyInvitationDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('pair-up')
  async pairUp(@Request() req, @Body() body: PairUpDto): Promise<{ message: string }> {
    const secondaryId = req.user.userId;
    return this.invitationService.pairUp(body.primaryId, secondaryId);
  }
}
