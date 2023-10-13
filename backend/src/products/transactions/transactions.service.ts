import { Injectable } from '@nestjs/common';
import {
  Container,
  Product,
  Stock,
  Transaction,
  TransactionType,
} from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { getStockId } from '../utils/stock.utils';

interface CreateParams {
  product: Product;
  container?: Container;
  exitAmount?: number;
  entryAmount?: number;
  fromStock?: Stock;
  toStock?: Stock;
  type: TransactionType;
  observation?: string;
}

interface TransactionsServiceInterface {
  create(data: CreateParams): Promise<Transaction>;
}

@Injectable()
export class TransactionsService implements TransactionsServiceInterface {
  constructor(private prismaService: PrismaService) {}

  async create(data: CreateParams) {
    if (!data.product) throw new Error('Missing product');
    if(!data.type) throw new Error('Missing type');

    if (data.type === TransactionType.ENTRY) {
      if (!data.toStock) throw new Error('Missing toStock');
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
          toStock: getStockId(data.toStock),
          entryAmount: data.entryAmount,
          type: TransactionType.ENTRY,
          observation: data.observation,
        },
      });
    } else if (data.type === TransactionType.EXIT) {
      if (!data.fromStock) throw new Error('Missing fromStock');
      if (!data.exitAmount) throw new Error('Missing exitAmount');

      return this.prismaService.transaction.create({
        data: {
          product: {
            connect: {
              id: data.product.id,
            },
          },
          fromStock: getStockId(data.fromStock),
          exitAmount: data.exitAmount,
          type: TransactionType.EXIT,
          observation: data.observation,
        },
      });
    } else {
      throw new Error('Invalid transaction type');
    }
  }
}
