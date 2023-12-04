import { BankAccountService } from './../bank-account/bank-account.service';
// invitation.service.ts
import { Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as nodemailer from 'nodemailer';
import { VerifyInvitationDto } from './dto/verify-invitation.dto';
import { PairUpDto } from './dto/pair-up.dto';
import { User, UserDocument } from 'src/auth/schema/user.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';


@Injectable()
export class InvitationService {
  private mailerTransport;
  private invitationStore: Record<
    string,
    { token: string; status: string; inviterId: string }
  > = {};

  constructor(private jwtService: JwtService,@InjectModel(User.name) private userModel: Model<UserDocument>,private bankAccountService: BankAccountService) {
    this.mailerTransport = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
      secure: true,
      port: 465,
    });
  }

  async sendPartnerInvitation(
    userId: string,
    partnerEmail: string,
  ): Promise<{ message: string }> {
    const invitationToken = this.generateInvitationToken(userId);
    const invitationLink = `https://your-app-url.com/signup?invitationToken=${invitationToken}`;

    const mailOptions = {
      from: 'your-email@example.com',
      to: partnerEmail,
      subject: 'Invitation to join Duo App',
      html: `<p>You have been invited to join Duo App. Please sign up using the following link: <a href="${invitationLink}">${invitationLink}</a></p>`,
    };

    this.invitationStore[partnerEmail] = {
      token: invitationToken,
      status: 'pending',
      inviterId: userId,
    };

    await this.mailerTransport.sendMail(mailOptions);

    return { message: 'Invitation sent successfully' };
  }

  checkInvitationToken(invitationToken: string): { inviterId: string } {
    for (const email in this.invitationStore) {
      if (this.invitationStore[email].token === invitationToken) {
        return { inviterId: this.invitationStore[email].inviterId };``
      }
    }
    throw new NotFoundException('Invalid invitation token');
  }

  private generateInvitationToken(userId: string): string {
    const payload = { userId };
    return this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '7d',
    });
  }

  async verifyInvitation(verifyInvitationDto: VerifyInvitationDto): Promise<{ inviterId: string }> {
    const { invitationToken, partnerEmail } = verifyInvitationDto;
    console.log(this.invitationStore)

    const invitation = this.invitationStore[partnerEmail];
    if (!invitation || invitation.token !== invitationToken) {
      console.log('invitation token from param', invitationToken)
      console.log('invitation token from store', invitation.token)
      throw new NotFoundException('Invalid invitation token or email');
    }

    return { inviterId: invitation.inviterId };
  }

  async pairUp(primaryId: string, secondaryId: string): Promise<{ message: string }> {
    const session = await this.userModel.db.startSession();
    session.startTransaction();

    try {
      let [primaryUser, secondaryUser] = await this.retrieveUsers(primaryId, secondaryId, session);
      const [primaryPersonApplication, secondaryPersonApplication] = await this.createPersonApplications(primaryUser, secondaryUser);
      await this.updateUserRecords(primaryUser, secondaryUser, primaryPersonApplication, secondaryPersonApplication, session);
      [primaryUser, secondaryUser] = await this.retrieveUsers(primaryId, secondaryId, session);
      await this.openBankAccount(primaryUser, secondaryUser);

      await session.commitTransaction();
      return { message: 'Users successfully paired and bank account opened' };
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException('Failed to pair users', error.message);
    } finally {
      session.endSession();
    }
  }

  private async retrieveUsers(primaryId: string, secondaryId: string, session): Promise<[UserDocument, UserDocument]> {
    let primaryUser = await this.userModel.findById(primaryId).session(session);
    let secondaryUser = await this.userModel.findById(secondaryId).session(session);

    if (!primaryUser || !secondaryUser) {
      throw new NotFoundException('One or both users not found');
    }

    return [primaryUser, secondaryUser];
  }

  private async createPersonApplications(primaryUser: UserDocument, secondaryUser: UserDocument): Promise<[any, any]> {
    try {
      const primaryPersonApplication = await this.bankAccountService.createPersonApplication(primaryUser);
      const secondaryPersonApplication = await this.bankAccountService.createPersonApplication(secondaryUser);

      return [primaryPersonApplication, secondaryPersonApplication];
    } catch (error) {
      throw new InternalServerErrorException('Error creating person applications', error.message);
    }
  }

  private async updateUserRecords(primaryUser: UserDocument, secondaryUser: UserDocument, primaryPersonApplication: any, secondaryPersonApplication: any, session): Promise<void> {
    await this.userModel.findByIdAndUpdate(primaryUser._id, {
      partnerId: secondaryUser._id,
      person_application_id: primaryPersonApplication.id
    }, { session });

    await this.userModel.findByIdAndUpdate(secondaryUser._id, {
      partnerId: primaryUser._id,
      isPrimary: false,
      person_application_id: secondaryPersonApplication.id
    }, { session });
  }

  private async openBankAccount(primaryUser: UserDocument, secondaryUser: UserDocument): Promise<void> {
    try {
      await this.bankAccountService.openBankAccount(primaryUser, secondaryUser);
    } catch (error) {
      throw new InternalServerErrorException('Error opening bank account', error.message);
    }
  }
}
