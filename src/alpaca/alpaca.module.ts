// alpaca.module.ts
import { Module } from '@nestjs/common';
import { AlpacaController } from './alpaca.controller';
import { AlpacaService } from './alpaca.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  PortfolioValue,
  PortfolioValueSchema,
} from './schemas/portfolioValue.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PortfolioValue.name, schema: PortfolioValueSchema },
    ]),
  ],
  controllers: [AlpacaController],
  providers: [AlpacaService],
})
export class AlpacaModule {}
