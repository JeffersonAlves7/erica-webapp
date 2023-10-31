import { Controller, Delete, Get, HttpCode, HttpStatus, Param, Query, UseGuards } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('transactions')
export class TransactionsController {
  constructor(private transactionService: TransactionsService) {}


  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  deleteTransaction(@Param('id') id: string) {
    return this.transactionService.delete(parseInt(id));
  }

  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get()
  getAllTransactions(@Query() query: Record<string, any>) {
    const { page, limit, type, orderBy, code, stock, day } = query;

    return this.transactionService.getAll({
      page: Number(page),
      limit: Number(limit),
      type,
      orderBy,
      code,
      stock,
      day
    });
  }
}
