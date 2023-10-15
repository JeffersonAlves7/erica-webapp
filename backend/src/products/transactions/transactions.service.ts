import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  Container,
  Product,
  Stock,
  Transaction,
  TransactionType,
} from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  Pageable,
  PageableParams,
} from 'src/types/pageable/pageable.interface';
import { TransactionFilterParams } from '../types/transaction.interface';

interface EntryParams {
  product: Product;
  container: Container;
  entryAmount: number;
  toStock: Stock;
  observation?: string;
}

interface ExitParams {
  product: Product;
  fromStock: Stock;
  exitAmount: number;
  observation?: string;
}

interface TransactionsServiceInterface {
  createExit(data: ExitParams): Promise<Transaction>;
  createEntry(data: EntryParams): Promise<Transaction>;
  deleteEntry(id: number): Promise<Transaction>;
  deleteExit(id: number): Promise<Transaction>;
  getAllTransactionsByPage(
    pageableParams: PageableParams & TransactionFilterParams,
  ): Promise<Pageable<Transaction>>;
}

@Injectable()
export class TransactionsService implements TransactionsServiceInterface {
  constructor(private prismaService: PrismaService) {}

  async createExit(data: ExitParams) {
    if (!data.product) throw new Error('Missing product');
    if (!data.fromStock) throw new Error('Missing fromStock');
    if (!data.exitAmount) throw new Error('Missing exitAmount');

    return this.prismaService.transaction.create({
      data: {
        product: {
          connect: {
            id: data.product.id,
          },
        },
        fromStock: data.fromStock,
        exitAmount: data.exitAmount,
        type: TransactionType.EXIT,
        observation: data.observation,
      },
    });
  }

  async createEntry(data: EntryParams) {
    if (!data.product) throw new Error('Missing product');
    if (!data.container) throw new Error('Missing container');
    if (!data.entryAmount) throw new Error('Missing entryAmount');
    if (!data.toStock) throw new Error('Missing toStock');

    return this.prismaService.transaction.create({
      data: {
        product: {
          connect: {
            id: data.product.id,
          },
        },
        container: {
          connect: {
            id: data.container.id,
          },
        },
        toStock: data.toStock,
        entryAmount: data.entryAmount,
        type: TransactionType.ENTRY,
        observation: data.observation,
      },
    });
  }

  async deleteEntry(id: number) {
    if (!id)
      throw new HttpException(
        'Missing transaction id.',
        HttpStatus.BAD_REQUEST,
      );

    const deleted = await this.prismaService.transaction.delete({
      where: {
        id,
      },
    });

    if (!deleted)
      throw new HttpException('Transaction not found.', HttpStatus.BAD_REQUEST);

    const stock = deleted.toStock;

    this.prismaService.product.update({
      where: {
        id: deleted.productId,
      },
      data: {
        [stock == Stock.GALPAO ? 'galpaoQuantity' : 'lojaQuantity']: {
          decrement: deleted.entryAmount,
        },
      },
    });

    this.prismaService.productsOnContainer.deleteMany({
      where: {
        productId: deleted.productId,
        containerId: deleted.containerId,
      },
    });

    return deleted;
  }

  async deleteExit(id: number): Promise<Transaction> {
    if (!id)
      throw new HttpException(
        'Missing transaction id.',
        HttpStatus.BAD_REQUEST,
      );

    const deleted = await this.prismaService.transaction.delete({
      where: {
        id,
      },
    });

    if (!deleted)
      throw new HttpException('Transaction not found.', HttpStatus.BAD_REQUEST);

    const stock = deleted.fromStock;

    this.prismaService.product.update({
      where: {
        id: deleted.productId,
      },
      data: {
        [stock == Stock.GALPAO ? 'galpaoQuantity' : 'lojaQuantity']: {
          increment: deleted.exitAmount,
        },
      },
    });

    return deleted;
  }

  async getAllTransactionsByPage(
    pageableParams: PageableParams & TransactionFilterParams,
  ): Promise<Pageable<Transaction>> {
    const transactions = await this.prismaService.transaction.findMany({
      skip: (pageableParams.page - 1) * pageableParams.limit,
      take: pageableParams.limit,
      where: {
        type: pageableParams.type,
      },
      include: {
        product: true,
      },
      orderBy: {
        createdAt: pageableParams.orderBy === 'asc' ? 'asc' : 'desc',
      },
    });

    const total = await this.prismaService.transaction.count({
      where: {
        type: pageableParams.type,
      },
    });

    return {
      page: pageableParams.page,
      total,
      data: transactions,
    };
  }
}
