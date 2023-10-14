import { Injectable } from '@nestjs/common';
import {
  Container,
  Product,
  Stock,
  Transaction,
  TransactionType,
} from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

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
}

@Injectable()
export class TransactionsService implements TransactionsServiceInterface {
  constructor(private prismaService: PrismaService) {}

  async createExit(data: ExitParams) {
    if(!data.product) throw new Error('Missing product');
    if(!data.fromStock) throw new Error('Missing fromStock');
    if(!data.exitAmount) throw new Error('Missing exitAmount');


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
}
