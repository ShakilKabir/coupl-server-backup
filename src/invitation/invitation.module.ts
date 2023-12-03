//invitation.module.ts

import { Module } from '@nestjs/common';
import { InvitationController } from './invitation.controller';
import { InvitationService } from './invitation.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
    imports: [
        AuthModule,
    ],
    controllers: [InvitationController],
    providers: [InvitationService],
})
export class InvitationModule {}
