import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Pageable, PageableParams } from 'src/types/pageable.interface';
import { TransactionType } from 'src/types/transaction-type.enum';

interface ExitReportsParams extends PageableParams {
  day: Date;
}

@Injectable()
export class ReportsService {
  constructor(private prismaService: PrismaService) {}

  async exitReports({
    day,
    limit,
    page,
  }: ExitReportsParams): Promise<Pageable<any>> {
    const where = {
      type: {
        in: [TransactionType.DEVOLUTION, TransactionType.EXIT],
      },
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
    };

    const transactions = await this.prismaService.transaction.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where,
      select: {
        exitAmount: true,
        entryAmount: true,
        id: true,
        operator: true,
        createdAt: true,
        updatedAt: true,
        observation: true,
        fromStock: true,
        toStock: true,
        type: true,
        client: true,
        product: {
          select: {
            id: true,
            code: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    const total = await this.prismaService.transaction.count({
      where,
    });

    return {
      page,
      total,
      data: transactions,
    };
  }

  async exitReportsInfo(day: Date) {
    const transactions = await this.prismaService.transaction.findMany({
      where: {
        type: {
          in: [TransactionType.DEVOLUTION, TransactionType.EXIT],
        },
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
      },
      select: {
        id: true,
        entryAmount: true,
        exitAmount: true,
        type: true,
        updatedAt: true,
        productId: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    let devolutionAmount = 0;
    let exitAmount = 0;
    let products = [];

    transactions.forEach((t) => {
      if (t.type == TransactionType.EXIT) exitAmount += t.exitAmount;
      else devolutionAmount += t.entryAmount;

      if (!products.includes(t.productId)) products.push(t.productId);
    });

    return {
      devolutionAmount,
      exitAmount,
      productsAmount: products.length,
    };
  }

  async stockMinimumReports({
    page,
    limit,
    percentage,
  }: { percentage: number } & PageableParams): Promise<Pageable<any>> {
    const offset = (page - 1) * limit;

    const products: any[] = await this.prismaService.$queryRaw`
    WITH LatestContainer AS (
      SELECT
        pc.product_id,
        MAX(pc.created_at) AS latest_container_date
      FROM
        products_on_container pc
      GROUP BY
        pc.product_id
    )

    SELECT
      p.id AS product_id,
      p.code AS product_code,
      p.galpao_quantity,
      p.galpao_quantity_reserve,
      p.loja_quantity,
      p.loja_quantity_reserve,
      pc.quantity_received AS container_quantity_received
    FROM
      products p
      INNER JOIN LatestContainer lc ON p.id = lc.product_id
      INNER JOIN products_on_container pc ON lc.product_id = pc.product_id
    WHERE
      (p.galpao_quantity + p.loja_quantity + p.galpao_quantity_reserve + p.loja_quantity_reserve) < (${percentage} * pc.quantity_received)
    LIMIT ${limit} OFFSET ${offset}
    `;

    const [totalResult]: any = await this.prismaService.$queryRaw`
     WITH LatestContainer AS (
      SELECT
        pc.product_id,
        MAX(pc.created_at) AS latest_container_date
      FROM
        products_on_container pc
      GROUP BY
        pc.product_id
    )

    SELECT
      COUNT(*) AS total
    FROM
      products p
      INNER JOIN LatestContainer lc ON p.id = lc.product_id
      INNER JOIN products_on_container pc ON lc.product_id = pc.product_id
    WHERE
      (p.galpao_quantity + p.loja_quantity + p.galpao_quantity_reserve + p.loja_quantity_reserve) < (${percentage} * pc.quantity_received)
    `;

    return {
      data: products,
      page,
      total: totalResult ? Number(totalResult.total) : 0,
    };
  }

  async salesOfPeriod({ month, year }: { month: number; year: number }) {
    const startDate = new Date(year, month - 1, 1); // month is 0-indexed in JavaScript
    const endDate = new Date(year, month, 0);

    const exitTransactions = await this.prismaService.transaction.findMany({
      where: {
        type: TransactionType.EXIT,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        id: true,
        exitAmount: true,
        createdAt: true,
      },
    });

    const devolutionTransactions =
      await this.prismaService.transaction.findMany({
        where: {
          type: TransactionType.DEVOLUTION,
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        select: {
          id: true,
          entryAmount: true,
          createdAt: true,
        },
      });

    const exitTransactionsByDay = this.groupTransactionsByDay(exitTransactions);
    const devolutionTransactionsByDay = this.groupTransactionsByDay(
      devolutionTransactions,
    );

    const result = [];

    for (let i = startDate.getDate(); i <= endDate.getDate(); i++) {
      const currentDate = new Date(year, month - 1, i);
      const exitAmount = this.sumAmount(
        // @ts-ignore
        exitTransactionsByDay[currentDate] || [],
      );
      const devolutionAmount = this.sumAmount(
        // @ts-ignore
        devolutionTransactionsByDay[currentDate] || [],
      );

      result.push({
        date: currentDate,
        exitAmount,
        devolutionAmount,
        difference: exitAmount - devolutionAmount,
      });
    }

    return result;
  }

  private groupTransactionsByDay(transactions: any[]) {
    return transactions.reduce((acc, transaction) => {
      const date = new Date(transaction.createdAt);
      const dayKey = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
      );

      // @ts-ignore
      if (!acc[dayKey]) {
        // @ts-ignore
        acc[dayKey] = [];
      }

      // @ts-ignore
      acc[dayKey].push(transaction);
      return acc;
    }, {});
  }

  private sumAmount(transactions: any[]) {
    return transactions.reduce(
      (total, transaction) =>
        total + (transaction.exitAmount || transaction.entryAmount || 0),
      0,
    );
  }
}
