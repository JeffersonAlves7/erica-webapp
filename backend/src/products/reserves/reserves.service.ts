import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  ConfirmReserveDto,
  CreateReserveDto,
  GetReservesDto,
  GetReservesSummaryDto,
} from './reserves.validators';
import { Pageable } from 'src/types/pageable.interface';
import { PageMaxLimitError } from 'src/error/page.errors';
import { getStockId } from '../utils/stock.utils';
import { StockNotFoundError } from 'src/error/stock.errors';
import { TransactionType } from 'src/types/transaction-type.enum';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  ProductNotFoundError,
  ProductTransactionIdNotFoundError,
} from 'src/error/products.errors';
import { TransactionNotFoundError } from 'src/error/transaction.errors';
import { Stock } from 'src/types/stock.enum';

@Injectable()
export class ReservesService {
  constructor(private prismaService: PrismaService) {}

  async getReservesByPage(
    params: GetReservesDto,
  ): Promise<Pageable<any> & { summary: any }> {
    const { search } = params;
    let { confirmed, stock, limit, page } = params;
    limit = Number(limit);
    page = Number(page);

    if (!limit) limit = 10;
    if (!page) page = 1;
    if (limit > 100) throw new PageMaxLimitError(100);

    if (!confirmed) confirmed = false;

    if (stock) {
      try {
        stock = getStockId(stock);
      } catch {
        throw new StockNotFoundError();
      }
    }

    let where: any = {
      type: TransactionType.RESERVE,
      confirmed,
      fromStock: stock,
    };

    if (search) {
      where.OR = [
        {
          client: {
            contains: search,
          },
        },
        {
          product: {
            code: {
              contains: search,
            },
          },
        },
        {
          product: {
            ean: {
              contains: search,
            },
          },
        },
      ];
    }

    const reserves = await this.prismaService.transaction.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where,
      select: {
        id: true,
        entryAmount: true,
        operator: true,
        client: true,
        observation: true,
        fromStock: true,
        createdAt: true,
        updatedAt: true,
        exitDate: true,
        product: {
          select: {
            code: true,
            lojaQuantity: true,
            lojaQuantityReserve: true,
            galpaoQuantity: true,
            galpaoQuantityReserve: true,
          },
        },
      },
      orderBy: {
        exitDate: 'desc',
      },
    });

    const total = await this.prismaService.transaction.count({
      where,
    });

    return {
      page,
      total,
      data: reserves,
      summary: await this.getReservesSummary(params),
    };
  }

  async confirmReserve({ ids }: ConfirmReserveDto) {
    if (ids.some((ids) => isNaN(ids)))
      throw new ProductTransactionIdNotFoundError();

    return this.prismaService.$transaction(async (prisma) => {
      for (const id of ids) {
        const transactionFound =
          await this.prismaService.transaction.findUnique({
            where: {
              id,
            },
          });

        if (!transactionFound) throw new TransactionNotFoundError();

        if (transactionFound.type !== TransactionType.RESERVE)
          throw new TransactionNotFoundError();

        const product = await this.prismaService.product.findUnique({
          where: {
            id: transactionFound.productId,
          },
        });

        if (!product) throw new ProductNotFoundError();

        const { entryAmount, fromStock } = transactionFound;

        await prisma.product.update({
          where: {
            id: product.id,
          },
          data: {
            [fromStock === Stock.LOJA
              ? 'lojaQuantityReserve'
              : 'galpaoQuantityReserve']: {
              decrement: entryAmount,
            },
          },
        });

        const transaction = await prisma.transaction.update({
          where: {
            id,
          },
          data: {
            confirmed: true,
            exitDate: new Date(),
          },
        });

        await prisma.transaction.create({
          data: {
            product: {
              connect: {
                id: product.id,
              },
            },
            fromStock: fromStock,
            exitAmount: entryAmount,
            type: TransactionType.EXIT,
            observation: transaction.observation,
            operator: transaction.operator,
            client: transaction.client,
            confirmed: true,
          },
        });

        return transaction;
      }
    });
  }

  async createReserve(params: CreateReserveDto) {
    const { codeOrEan, client, observation, operator, quantity, date } = params;

    let stock = params.stock;

    try {
      stock = getStockId(stock);
    } catch {
      throw new StockNotFoundError();
    }

    const product = await this.prismaService.product.findFirst({
      where: {
        OR: [
          {
            code: codeOrEan,
          },
          {
            ean: codeOrEan,
          },
        ],
      },
    });

    if (!product) throw new ProductNotFoundError();
    if (stock === Stock.LOJA && product.lojaQuantity < quantity)
      throw new HttpException(
        'Quantidade insuficiente no estoque da loja',
        HttpStatus.BAD_REQUEST,
      );
    if (stock === Stock.GALPAO && product.galpaoQuantity < quantity)
      throw new HttpException(
        'Quantidade insuficiente no estoque do galpão',
        HttpStatus.BAD_REQUEST,
      );

    return await this.prismaService.$transaction(async (prisma) => {
      await prisma.product.update({
        data: {
          [stock === Stock.LOJA
            ? 'lojaQuantityReserve'
            : 'galpaoQuantityReserve']: {
            increment: quantity,
          },
          [stock === Stock.LOJA ? 'lojaQuantity' : 'galpaoQuantity']: {
            decrement: quantity,
          },
        },
        where: {
          id: product.id,
        },
      });

      const transaction = await prisma.transaction.create({
        data: {
          product: {
            connect: {
              id: product.id,
            },
          },
          type: TransactionType.RESERVE,
          client: client,
          operator: operator,
          confirmed: false,
          entryAmount: quantity,
          observation: observation,
          fromStock: stock,
          exitDate: date,
        },
        include: {
          product: true,
        },
      });

      return transaction;
    });
  }

  async deleteReserve(id: number) {
    const transactionFound = await this.prismaService.transaction.findUnique({
      where: {
        id,
        type: TransactionType.RESERVE,
      },
    });

    if (!transactionFound) throw new TransactionNotFoundError();

    const { productId, fromStock, entryAmount } = transactionFound;

    return this.prismaService.$transaction(async (prisma) => {
      await prisma.product.update({
        where: {
          id: productId,
        },
        data: {
          [fromStock == Stock.LOJA
            ? 'lojaQuantityReserve'
            : 'galpaoQuantityReserve']: {
            decrement: entryAmount,
          },
          [fromStock === Stock.LOJA ? 'lojaQuantity' : 'galpaoQuantity']: {
            increment: entryAmount,
          },
        },
      });

      const transaction = await prisma.transaction.delete({
        where: {
          id,
        },
      });

      return transaction;
    });
  }

  async getReservesSummary(body: GetReservesSummaryDto) {
    let stock = body.stock;

    if (stock) {
      try {
        stock = getStockId(stock);
      } catch {
        throw new StockNotFoundError();
      }
    } else {
      stock = undefined;
    }

    let where: any = {};

    if (stock === Stock.GALPAO) {
      where = {
        galpaoQuantityReserve: {
          gt: 0,
        },
      };
    } else if (stock === Stock.LOJA) {
      where = {
        lojaQuantityReserve: {
          gt: 0,
        },
      };
    } else {
      where = {
        OR: [
          {
            galpaoQuantityReserve: {
              gt: 0,
            },
          },
          {
            lojaQuantityReserve: {
              gt: 0,
            },
          },
        ],
      };
    }

    const summary = await this.prismaService.product.findMany({
      where,
      select: {
        galpaoQuantityReserve: true,
        lojaQuantityReserve: true,
        id: true,
      },
    });

    return {
      products: summary.length,
      galpaoQuantity: summary.reduce(
        (acc, curr) => acc + curr.galpaoQuantityReserve,
        0,
      ),
      lojaQuantity: summary.reduce(
        (acc, curr) => acc + curr.lojaQuantityReserve,
        0,
      ),
    };
  }
}
