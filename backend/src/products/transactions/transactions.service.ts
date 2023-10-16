import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  $Enums,
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

interface EntryGalpaoParams {
  product: Product;
  container: Container;
  entryAmount: number;
  observation?: string;
  operator?: string;
}

interface ExitParams {
  product: Product;
  fromStock: Stock;
  exitAmount: number;
  observation?: string;
  operator?: string;
}

interface LojaTransferParams {
  product: Product;
  entryAmount: number;
  operator: string;
  observation?: string;
}

interface TransactionsServiceInterface {
  createExit(data: ExitParams): Promise<Transaction>;
  createGalpaoEntry(data: EntryGalpaoParams): Promise<Transaction>;
  createLojaTransfer(
    data: LojaTransferParams,
  ): Promise<{ galpao: Transaction; loja: Transaction }>;
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

  async createGalpaoEntry(data: EntryGalpaoParams) {
    if (!data.product) throw new Error('Missing product');
    if (!data.container) throw new Error('Missing container');
    if (!data.entryAmount) throw new Error('Missing entryAmount');

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
        operator: data.operator,
        toStock: Stock.GALPAO,
        entryAmount: data.entryAmount,
        type: TransactionType.ENTRY,
        observation: data.observation,
      },
    });
  }

  async createLojaTransfer(
    data: LojaTransferParams,
  ): Promise<{ loja: Transaction; galpao: Transaction }> {
    const product = data.product;

    if (!product)
      throw new HttpException('Product not found.', HttpStatus.BAD_REQUEST);

    if (product.galpaoQuantity < data.entryAmount)
      throw new HttpException('Not enough stock.', HttpStatus.BAD_REQUEST);

    const galpao = await this.prismaService.transaction.create({
      data: {
        product: {
          connect: {
            id: product.id,
          },
        },
        fromStock: Stock.GALPAO,
        toStock: Stock.LOJA,
        exitAmount: data.entryAmount,
        type: TransactionType.TRANSFERENCE,
        observation: data.observation,
        operator: data.operator,
      },
    });

    const loja = await this.prismaService.transaction.create({
      data: {
        product: {
          connect: {
            id: product.id,
          },
        },
        fromStock: Stock.GALPAO,
        toStock: Stock.LOJA,
        entryAmount: data.entryAmount,
        type: TransactionType.TRANSFERENCE,
        observation: data.observation,
        operator: data.operator,
      },
    });

    return {
      galpao,
      loja,
    };
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
