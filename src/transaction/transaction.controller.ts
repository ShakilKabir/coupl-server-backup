import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('transactions')
export class TransactionController {
  constructor(private transactionService: TransactionService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('book')
  async createBookTransfer(@Req() req, @Body() body: any) {
    const userId = req.user.userId;

    const { amount, to_account_id, type, category } = body;
    return this.transactionService.createBookTransfer(amount, to_account_id, userId, type, category);
  }
}
