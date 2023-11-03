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
        id: true,
        operator: true,
        createdAt: true,
        updatedAt: true,
        observation: true,
        fromStock: true,
        client: true,
        product: {
          select: {
            id: true,
            code: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'asc',
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
      where,
      select: {
        id: true,
        entryAmount: true,
        exitAmount: true,
        type: true,
        updatedAt: true,
      },
      orderBy: {
        updatedAt: 'asc',
      },
    });

    const devolutions = [];
    const exits = [];

    transactions.forEach((t) => {
      if (t.type == TransactionType.EXIT) exits.push(t);
      else devolutions.push(t);
    });

    return {
      devolutionAmount: devolutions.reduce(
        (previous: number, current: (typeof transactions)[0]) => {
          return previous + current.entryAmount;
        },
        0,
      ),
      exitAmount: exits.reduce(
        (previous: number, current: (typeof transactions)[0]) => {
          return previous + current.exitAmount;
        },
        0,
      ),
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
      p.loja_quantity,
      pc.quantity_received AS container_quantity_received
    FROM
      products p
      INNER JOIN LatestContainer lc ON p.id = lc.product_id
      INNER JOIN products_on_container pc ON lc.product_id = pc.product_id
    WHERE
      (p.galpao_quantity + p.loja_quantity) < (${percentage} * pc.quantity_received)
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
      (p.galpao_quantity + p.loja_quantity) < (${percentage} * pc.quantity_received)
    `;

    return {
      data: products,
      page,
      total: totalResult ? Number(totalResult.total) : 0,
    };
  }
}
