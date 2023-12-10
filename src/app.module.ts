//app.module.ts

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { DatabaseService } from './services/database.service';
import { AuthModule } from './auth/auth.module';
import { InvitationModule } from './invitation/invitation.module';
// import { OnfidoService } from './onfido/onfido.service';
// import { OnfidoModule } from './onfido/onfido.module';
import { AlpacaModule } from './alpaca/alpaca.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.DB_URI),
    AuthModule,
    InvitationModule,
    AlpacaModule,
    // OnfidoModule,
  ],
  controllers: [AppController],
  providers: [AppService, DatabaseService],
  // providers: [AppService, DatabaseService, OnfidoService],
})
export class AppModule {}
