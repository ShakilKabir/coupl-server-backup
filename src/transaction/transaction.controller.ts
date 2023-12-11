//transaction.controller.ts

import {
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
  Get,
  Query,
  Patch,
  Param,
} from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { AuthGuard } from '@nestjs/passport';
import { Transaction } from './schema/transaction.schema';
import { QueryDto } from './dto/query.dto';
import {
  RespondToTransactionLimitDto,
  SetTransactionLimitDto,
} from './dto/transaction-limit.dto';
import { TransactionLimit } from './schema/transaction-limit.schema';
import { TransactionSummaryDto } from './dto/transaction-summary.dto';

@Controller('transactions')
export class TransactionController {
  constructor(private transactionService: TransactionService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('book')
  async createBookTransfer(@Req() req, @Body() body: any) {
    const userId = req.user.userId;

    const { amount, category, flow } = body;
    return this.transactionService.createBookTransfer(
      amount,
      category,
      flow,
      userId,
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/history')
  async getTransactionHistory(@Req() req): Promise<Transaction[]> {
    const userId = req.user.userId;
    return this.transactionService.getTransactionHistory(userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/filtered-history')
  async getFilteredTransactionHistory(
    @Req() req,
    @Query() query: QueryDto,
  ): Promise<Transaction[]> {
    const userId = req.user.userId;
    return this.transactionService.getFilteredTransactionHistory(userId, query);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('set-limit')
  async setTransactionLimit(
    @Req() req,
    @Body() setTransactionLimitDto: SetTransactionLimitDto,
  ): Promise<TransactionLimit> {
    const userId = req.user.userId;
    return this.transactionService.setTransactionLimit(
      userId,
      setTransactionLimitDto,
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('respond-to-limit')
  async respondToTransactionLimit(
    @Req() req,
    @Body() responseDto: RespondToTransactionLimitDto,
  ): Promise<TransactionLimit> {
    const userId = req.user.userId;
    return this.transactionService.respondToTransactionLimit(
      userId,
      responseDto,
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/outflows')
  async getAccountOutflows(@Req() req): Promise<TransactionSummaryDto> {
    const { userId } = req.user;
    return this.transactionService.calculateOutflows(userId);
  }
}
