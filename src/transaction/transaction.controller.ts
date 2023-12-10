//transaction.controller.ts

import { Body, Controller, Post, Req, UseGuards, Get, Query, Patch, Param } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { AuthGuard } from '@nestjs/passport';
import { Transaction } from './schema/transaction.schema';
import { QueryDto } from './dto/query.dto';
import { SetTransactionLimitDto, UpdateTransactionLimitApprovalDto } from './dto/transaction-limit.dto';
import { TransactionLimit } from './schema/transaction-limit.schema';

@Controller('transactions')
export class TransactionController {
  constructor(private transactionService: TransactionService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('book')
  async createBookTransfer(@Req() req, @Body() body: any) {
    const userId = req.user.userId;

    const { amount, to_account_id, type, category, flow } = body;
    return this.transactionService.createBookTransfer(
      amount,
      to_account_id,
      userId,
      type,
      category,
      flow,
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
  async setTransactionLimit(@Req() req, @Body() setTransactionLimitDto: SetTransactionLimitDto): Promise<TransactionLimit> {
    const userId = req.user.userId;
    return this.transactionService.setTransactionLimit(userId, setTransactionLimitDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('update-limit-approval/:partnerId')
  async updateTransactionLimitApproval(
    @Req() req,
    @Param('partnerId') partnerId: string,
    @Body() updateTransactionLimitApprovalDto: UpdateTransactionLimitApprovalDto,
  ): Promise<TransactionLimit> {
    const userId = req.user.userId;
    return this.transactionService.updateTransactionLimitApproval(userId, partnerId, updateTransactionLimitApprovalDto);
  }

}
