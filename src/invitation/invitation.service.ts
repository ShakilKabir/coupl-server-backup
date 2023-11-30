// invitation.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as nodemailer from 'nodemailer';

@Injectable()
export class InvitationService {
    private mailerTransport;

    constructor(private jwtService: JwtService) {
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

    async sendPartnerInvitation(token: string, partnerEmail: string): Promise<{ message: string }> {
        const userId = this.extractUserIdFromToken(token);
        const invitationToken = this.generateInvitationToken(userId);
        const invitationLink = `https://your-app-url.com/signup?invitationToken=${invitationToken}`;

        const mailOptions = {
            from: 'your-email@example.com',
            to: partnerEmail,
            subject: 'Invitation to join Duo App',
            html: `<p>You have been invited to join Duo App. Please sign up using the following link: <a href="${invitationLink}">${invitationLink}</a></p>`,
        };

        await this.mailerTransport.sendMail(mailOptions);

        return { message: 'Invitation sent successfully' };
    }

    private extractUserIdFromToken(token: string): string {
        try {
            const decoded = this.jwtService.verify(token, { secret: process.env.JWT_SECRET });
            return decoded.userId;
        } catch (error) {
            throw new UnauthorizedException('Invalid token');
        }
    }

    private generateInvitationToken(userId: string): string {
        const payload = { userId };
        return this.jwtService.sign(payload, {
            secret: process.env.JWT_SECRET,
            expiresIn: '7d',
        });
    }
    
}
