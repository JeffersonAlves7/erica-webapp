import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { TransactionsService } from './transactions/transactions.service';

@Module({
  imports: [PrismaModule],
  providers: [ProductsService, TransactionsService],
  controllers: [ProductsController]
})
export class ProductsModule {}
