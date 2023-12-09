//transaction.controller.ts

import { Body, Controller, Post, Req, UseGuards, Get, Query } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { AuthGuard } from '@nestjs/passport';
import { Transaction } from './schema/transaction.schema';
import { QueryDto } from './dto/query.dto';

@Controller('transactions')
export class TransactionController {
  constructor(private transactionService: TransactionService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('book')
  async createBookTransfer(@Req() req, @Body() body: any) {
    const userId = req.user.userId;

    const { amount, to_account_id, type, category } = body;
    return this.transactionService.createBookTransfer(
      amount,
      to_account_id,
      userId,
      type,
      category,
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
}
