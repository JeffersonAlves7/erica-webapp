import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { TransactionType } from 'src/types/transaction-type.enum';

@Injectable()
export class ReportsService {
  constructor(private prismaService: PrismaService) {}

  exitReports(day: Date) {
    return this.prismaService.transaction.findMany({
      where: {
        AND: [
          {
            updatedAt: {
              gte: day,
            },
          },
          {
            updatedAt: {
              lt: new Date(day.getTime() + 86400000),
            },
          },
        ],
        type: TransactionType.EXIT,
      },
      orderBy: {
        updatedAt: 'asc',
      },
    });
  }

  async stockMinimumReports() {
    const products = await this.prismaService.product.findMany({
      include: {
        productsOnContainer: true,
      },
    });
  
    const productsWithEntryValue = products.map((product) => {
      let entryValue = 0;
      let galpaoQuantity = product.galpaoQuantity;
      let lojaQuantity = product.lojaQuantity;
  
      for (const container of product.productsOnContainer) {
        if (galpaoQuantity <= 0 && lojaQuantity <= 0) {
          break;
        }
  
        entryValue += container.quantityReceived;
        galpaoQuantity -= container.quantityReceived;
  
        if (lojaQuantity > 0) {
          lojaQuantity -= container.quantityReceived;
        }
      }
  
      return { ...product, entryValue };
    });
  
    return productsWithEntryValue;
  }
}
