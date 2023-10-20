import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { TransactionType } from 'src/types/transaction-type.enum';

@Injectable()
export class ReportsService {
  constructor(private prismaService: PrismaService) {}

  exitReports(day: Date) {
    return this.prismaService.transaction.findMany({
      where: {
        updatedAt: day,
      },
      select: {
        type: true,
        product: {
          select: {
            code: true,
            description: true,
            ean: true,
            importer: true,
          },
        },
      },
    });
  }
}
