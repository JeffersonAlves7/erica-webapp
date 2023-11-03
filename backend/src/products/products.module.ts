import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { TransactionsService } from './transactions/transactions.service';
import { ContainerService } from './container/container.service';
import { ReportsService } from './reports/reports.service';
import { ReportsController } from './reports/reports.controller';
import { ReservesController } from './reserves/reserves.controller';
import { ReservesService } from './reserves/reserves.service';
import { ExcelService } from './excel/excel.service';
import { EmbarquesController } from './embarques/embarques.controller';
import { EmbarquesService } from './embarques/embarques.service';
import { TransactionsController } from './transactions/transactions.controller';

@Module({
  imports: [PrismaModule],
  providers: [
    ProductsService,
    TransactionsService,
    ContainerService,
    ReportsService,
    ReservesService,
    ExcelService,
    EmbarquesService,
  ],
  controllers: [
    ProductsController,
    ReportsController,
    ReservesController,
    EmbarquesController,
    TransactionsController,
  ],
})
export class ProductsModule {}
