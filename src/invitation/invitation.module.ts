//invitation.module.ts

import { Module } from '@nestjs/common';
import { InvitationController } from './invitation.controller';
import { InvitationService } from './invitation.service';
import { AuthModule } from 'src/auth/auth.module';
import { BankAccountService } from 'src/bank-account/bank-account.service';
import { HttpModule } from '@nestjs/axios';
import { BankAccountModule } from 'src/bank-account/bank-account.module';

@Module({
    imports: [
        AuthModule, HttpModule, BankAccountModule
    ],
    controllers: [InvitationController],
    providers: [InvitationService, BankAccountService],
})
export class InvitationModule {}
