import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Stock } from 'src/types/stock.enum';
import { TransactionType } from 'src/types/transaction-type.enum';
import {
  Container,
  Prisma,
  PrismaClient,
  Product,
  Transaction,
} from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { Pageable } from 'src/types/pageable.interface';
import {
  ConfirmTransferenceParams,
  EntryGalpaoParams,
  ExitParams,
  LojaTransferParams,
  TransactionFilterParams,
  TransferenceFilterParams,
} from '../types/transaction.interface';
import {
  ProductInsuficientStockError,
  ProductNotFoundError,
} from 'src/error/products.errors';
import { StockNotFoundError } from 'src/error/stock.errors';
import {
  TransactionClientNotFoundError,
  TransactionIdNotFoundError,
  TransactionsExitAmountNotFoundError,
  TransferenceEntryAmountNotFoundError,
  TransactionNotFoundError,
  TransactionAlreadyConfirmedError,
} from 'src/error/transaction.errors';
import { ContainerNotFoundError } from 'src/error/container.errors';
import { DefaultArgs } from '@prisma/client/runtime/library';

type LocalPrisma = Omit<
  PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;

@Injectable()
export class TransactionsService {
  constructor(private prismaService: PrismaService) {}

  async getAll(
    params: TransactionFilterParams,
  ): Promise<Pageable<Transaction>> {
    let { limit, page, code, orderBy, stock, type, confirmed, day} = params;
    if (!page) page = 1;
    if (!limit || limit > 100) limit = 100;

    let where: any = {};

    if (type) {
      where.type = type;
    }

    if (TransactionType.TRANSFERENCE && confirmed) {
      where.confirmed = confirmed;
    }

    if (code) {
      where.product = {
        OR: [
          {
            code: {
              contains: code,
            },
          },
          {
            ean: {
              contains: code,
            },
          },
        ],
      };
    }

    if (stock) {
      if (type == TransactionType.TRANSFERENCE && stock) {
        where.OR = [
          {
            fromStock: stock,
          },
          {
            toStock: stock,
          },
        ];
      } else {
        where.AND = [
          {
            OR: [
              {
                fromStock: stock,
              },
              {
                toStock: stock,
              },
            ],
          },
          {
            OR: [
              {
                confirmed: true,
              },
              {
                type: TransactionType.RESERVE,
              },
            ],
          },
        ];
      }
    }

    if (day) {
      const nextDate = new Date(day);
      nextDate.setDate(nextDate.getDate() + 1);
      where.createdAt = {
        gte: new Date(day),
        lte: nextDate,
      };
    }

    const transactions = await this.prismaService.transaction.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where,
      include: {
        product: true,
      },
      orderBy: {
        createdAt: orderBy === 'asc' ? 'asc' : 'desc',
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

  async delete(id: number): Promise<Transaction> {
    if (!id)
      throw new HttpException(`Id não encontrado`, HttpStatus.BAD_REQUEST);

    const transactionToDelete = await this.prismaService.transaction.findUnique(
      {
        where: {
          id,
        },
      },
    );

    if (!transactionToDelete) throw new TransactionNotFoundError();

    await this.prismaService.$transaction(async (prisma) => {
      const { type } = transactionToDelete;
      if (type === TransactionType.ENTRY) await this.deleteEntry(id, prisma);
      else if (type === TransactionType.EXIT) await this.deleteExit(id, prisma);
      else if (type === TransactionType.TRANSFERENCE)
        await this.deleteTransference(id, prisma);
      else if (type == TransactionType.RESERVE)
        await this.deleteReserve(id, prisma);
      else throw new TransactionNotFoundError();
    });

    return transactionToDelete;
  }

  private async deleteEntry(id: number, prisma: LocalPrisma) {
    const deleted = await this.prismaService.transaction.delete({
      where: {
        id,
      },
      include: {
        product: true,
      },
    });

    if (!deleted) throw new TransactionNotFoundError();

    const stock = deleted.toStock;

    await prisma.product.update({
      where: {
        id: deleted.productId,
      },
      data: {
        [stock == Stock.GALPAO ? 'galpaoQuantity' : 'lojaQuantity']: {
          decrement: deleted.entryAmount,
        },
      },
    });

    await prisma.productsOnContainer.deleteMany({
      where: {
        productId: deleted.productId,
        containerId: deleted.containerId,
      },
    });

    return deleted;
  }

  private async deleteTransference(id: number, prisma: LocalPrisma) {
    const transference = await prisma.transaction.findUnique({
      where: {
        id,
      },
      include: {
        product: true,
      },
    });

    if (!transference) throw new TransactionNotFoundError();

    const { confirmed, entryAmount, productId, partnerId, exitAmount } =
      transference;

    const deletions = await prisma.transaction.deleteMany({
      where: {
        OR: transference.partnerId
          ? [
              {
                id,
              },
              {
                id: partnerId,
              },
            ]
          : [
              {
                id,
              },
              {
                partnerId: id,
              },
            ],
      },
    });

    if (!deletions || deletions.count === 0)
      throw new TransactionNotFoundError();

    if (confirmed) {
      await prisma.product.update({
        where: {
          id: productId,
        },
        data: {
          galpaoQuantity: {
            increment: entryAmount || exitAmount,
          },
          lojaQuantity: {
            decrement: entryAmount || exitAmount,
          },
        },
      });
    }

    return deletions;
  }

  private async deleteExit(
    id: number,
    prisma: LocalPrisma,
  ): Promise<Transaction> {
    const deleted = await prisma.transaction.delete({
      where: {
        id,
      },
      include: {
        product: true,
      },
    });

    if (!deleted) throw new TransactionNotFoundError();

    const stock = deleted.fromStock;

    await prisma.product.update({
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

  private async deleteReserve(id: number, prisma: LocalPrisma) {
    const transactionFound = await prisma.transaction.delete({
      where: {
        id,
      },
    });

    if (!transactionFound) throw new TransactionNotFoundError();

    const { productId, fromStock, entryAmount } = transactionFound;

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

    return transactionFound;
  }

  // ***** TRANSFERENCES *****/
  private createTransferenceTransaction(data: {
    confirmed?: boolean;
    product: Product;
    entryExpected?: number;
    entryAmount?: number;
    exitAmount?: number;
    observation?: string;
    operator?: string;
    location?: string;
    partnerId?: number;
  }): Promise<any> {
    return this.prismaService.transaction.create({
      data: {
        product: {
          connect: {
            id: data.product.id,
          },
        },
        fromStock: Stock.GALPAO,
        toStock: Stock.LOJA,
        entryAmount: data.entryAmount,
        entryExpected: data.entryExpected,
        exitAmount: data.exitAmount,
        type: TransactionType.TRANSFERENCE,
        observation: data.observation,
        operator: data.operator,
        location: data.location,
        confirmed: data.confirmed,
        partnerId: data.partnerId,
      },
    });
  }

  async createTransferences(data: LojaTransferParams): Promise<any> {
    const product = data.product;

    if (!product) throw new ProductNotFoundError();

    return this.createTransferenceTransaction({
      entryExpected: data.entryAmount,
      product,
      operator: data.operator,
      observation: data.observation,
      location: data.location,
    });
  }

  async confirmTransference(data: ConfirmTransferenceParams) {
    const { id, entryAmount } = data;

    if (!id) throw new TransactionIdNotFoundError();

    const transaction = await this.prismaService.transaction.findUnique({
      where: {
        id,
      },
      include: {
        product: true,
      },
    });

    if (!transaction) throw new TransactionNotFoundError();

    if (transaction.confirmed) throw new TransactionAlreadyConfirmedError();

    if (transaction.product.galpaoQuantity < entryAmount)
      throw new ProductInsuficientStockError();

    // create the transference of galpao
    const { observation, location, operator } = transaction;

    await this.prismaService.$transaction(async (prisma) => {
      await prisma.transaction.create({
        data: {
          product: {
            connect: {
              id: transaction.product.id,
            },
          },
          fromStock: Stock.GALPAO,
          toStock: Stock.LOJA,
          entryExpected: entryAmount,
          entryAmount: entryAmount,
          type: TransactionType.TRANSFERENCE,
          observation,
          operator,
          location,
          confirmed: true,
          partnerId: transaction.id,
        },
      });

      const updateParams: any = {
        lojaQuantity: {
          increment: entryAmount,
        },
        galpaoQuantity: {
          decrement: entryAmount,
        },
      };

      if (data.location) {
        updateParams.lojaLocation = data.location;
      }

      await prisma.product.update({
        where: {
          id: transaction.productId,
        },
        data: updateParams,
      });

      await prisma.transaction.update({
        where: {
          id,
        },
        data: {
          confirmed: true,
          exitAmount: entryAmount,
          location: data.location,
        },
      });
    });

    return transaction;
  }

  async getAllTransferencesByPage(
    pageableParams: TransferenceFilterParams,
  ): Promise<Pageable<any>> {
    const { limit, code, page, confirmed, orderBy } = pageableParams;

    const where = {
      type: TransactionType.TRANSFERENCE,
      confirmed: confirmed,
      product: {
        code: {
          contains: code,
        },
      },
    };

    const transactions = await this.prismaService.transaction.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where,
      select: {
        id: true,
        entryAmount: true,
        entryExpected: true,
        type: true,
        confirmed: true,
        location: true,
        product: {
          select: {
            id: true,
            code: true,
          },
        },
        productId: true,
        createdAt: true,
      },
      orderBy: {
        updatedAt: orderBy === 'asc' ? 'asc' : 'desc',
      },
    });

    const total = await this.prismaService.transaction.count({ where });

    return {
      page: page,
      total,
      data: transactions,
    };
  }

  // **** ENTRIES ****/
  async createEntry(data: EntryGalpaoParams) {
    if (!data.product) throw new ProductNotFoundError();
    if (!data.container) throw new ContainerNotFoundError();
    if (!data.entryAmount) throw new TransferenceEntryAmountNotFoundError();

    return this.createEntryTransaction(data);
  }

  private createEntryTransaction(data: {
    product: Product;
    container: Container;
    entryAmount: number;
    observation?: string;
    operator?: string;
  }): Promise<any> {
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
        confirmed: true,
      },
    });
  }

  // **** EXIT ****/

  async createExit(data: ExitParams) {
    if (!data.product) throw new ProductNotFoundError();
    if (!data.fromStock) throw new StockNotFoundError();
    if (!data.exitAmount) throw new TransactionsExitAmountNotFoundError();
    if (!data.client) throw new TransactionClientNotFoundError();

    return this.createExitTransaction(data);
  }

  private createExitTransaction(data: {
    product: Product;
    fromStock: Stock;
    exitAmount: number;
    observation?: string;
    operator: string;
    client: string;
  }) {
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
        operator: data.operator,
        client: data.client,
        confirmed: true,
      },
    });
  }

  // **** DEVOLUTION ****/
  async createDevolution(data: {
    product: Product;
    entryAmount: number;
    observation?: string;
    client: string;
    toStock: Stock;
    operator: string;
  }): Promise<any> {
    return this.prismaService.transaction.create({
      data: {
        product: {
          connect: {
            id: data.product.id,
          },
        },
        toStock: data.toStock,
        entryAmount: data.entryAmount,
        type: TransactionType.DEVOLUTION,
        observation: data.observation,
        operator: data.operator,
        client: data.client,
        confirmed: true,
      },
    });
  }
}
