import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { TransactionsService } from './transactions/transactions.service';
import { ContainerService } from './container/container.service';
import { ReportsService } from './reports/reports.service';
import { ReportsController } from './reports/reports.controller';
import { ExcelService } from './excel/excel.service';

@Module({
  imports: [PrismaModule],
  providers: [
    ProductsService,
    TransactionsService,
    ContainerService,
    ReportsService,
    ExcelService,
  ],
  controllers: [ProductsController, ReportsController],
})
export class ProductsModule {}
