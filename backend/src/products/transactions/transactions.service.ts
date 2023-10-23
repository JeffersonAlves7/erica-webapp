import { Injectable } from '@nestjs/common';
import { Stock } from 'src/types/stock.enum';
import { TransactionType } from 'src/types/transaction-type.enum';
import { Container, Product, Transaction } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { Pageable, PageableParams } from 'src/types/pageable.interface';
import {
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
  operator: string;
  client: string;
}

interface LojaTransferParams {
  product: Product;
  entryAmount: number;
  operator: string;
  observation?: string;
  location?: string;
}

interface ConfirmTransferenceParams {
  id: number;
  entryAmount: number;
  location?: string;
}

interface DevolutionParams {
  product: Product;
  entryAmount: number;
  client: string;
  operator: string;
  stock: Stock;
  observation?: string;
}

interface TransactionsServiceInterface {
  createExit(data: ExitParams): Promise<Transaction>;
  createEntry(data: EntryGalpaoParams): Promise<Transaction>;
  createTransferences(data: LojaTransferParams): Promise<any>;
  confirmTransference(data: ConfirmTransferenceParams): Promise<Transaction>;

  deleteEntry(id: number): Promise<Transaction>;
  deleteExit(id: number): Promise<Transaction>;

  getAllTransferencesByPage(
    pageableParams: TransferenceFilterParams,
  ): Promise<Pageable<any>>;
  getAll(
    pageableParams: PageableParams & TransactionFilterParams,
  ): Promise<Pageable<Transaction>>;
}

@Injectable()
export class TransactionsService implements TransactionsServiceInterface {
  constructor(private prismaService: PrismaService) {}

  private async updateProductQuantities(
    productId: number,
    entryAmount: number,
    location?: string,
  ) {
    const updateParams: any = {
      lojaQuantity: {
        increment: entryAmount,
      },
      galpaoQuantity: {
        decrement: entryAmount,
      },
    };

    if (location) {
      updateParams.lojaLocation = location;
    }

    await this.prismaService.product.update({
      where: {
        id: productId,
      },
      data: updateParams,
    });
  }

  async getAll(
    pageableParams: TransactionFilterParams,
  ): Promise<Pageable<Transaction>> {
    const { limit, page, code, orderBy, stock, type } = pageableParams;
    const where = {
      type,
      product: {
        code: {
          contains: code,
        },
      },
      fromStock: stock,
      OR: [
        {
          confirmed: true,
        },
        {
          type: TransactionType.RESERVE,
        },
      ],
    };

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

  /**** RESERVES ****/
  async deleteReserve(id: number) {
    const transactionFound = await this.prismaService.transaction.findUnique({
      where: {
        id,
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

    if (product.galpaoQuantity < data.entryAmount)
      throw new ProductInsuficientStockError();

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
    await this.createTransferenceTransaction({
      product: transaction.product,
      confirmed: true,
      exitAmount: entryAmount,
      partnerId: transaction.id,
      entryExpected: transaction.entryExpected,
      observation: transaction.observation,
      operator: transaction.operator,
      location: data.location,
    });

    await this.updateProductQuantities(
      transaction.productId,
      entryAmount,
      data.location,
    );

    await this.prismaService.transaction.update({
      where: {
        id,
      },
      data: {
        confirmed: true,
        entryAmount,
        location: data.location,
      },
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

  async deleteTransference(id: number) {
    if (!id) throw new TransactionIdNotFoundError();

    const transference = await this.prismaService.transaction.findUnique({
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

    return this.prismaService.$transaction(async (prisma) => {
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
    });
  }

  // **** ENTRIES ****/
  async deleteEntry(id: number) {
    if (!id) throw new TransactionIdNotFoundError();

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

    await this.prismaService.product.update({
      where: {
        id: deleted.productId,
      },
      data: {
        [stock == Stock.GALPAO ? 'galpaoQuantity' : 'lojaQuantity']: {
          decrement: deleted.entryAmount,
        },
      },
    });

    await this.prismaService.productsOnContainer.deleteMany({
      where: {
        productId: deleted.productId,
        containerId: deleted.containerId,
      },
    });

    return deleted;
  }

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
  async deleteExit(id: number): Promise<Transaction> {
    if (!id) throw new TransactionIdNotFoundError();

    const deleted = await this.prismaService.transaction.delete({
      where: {
        id,
      },
      include: {
        product: true,
      },
    });

    if (!deleted) throw new TransactionNotFoundError();

    const stock = deleted.fromStock;

    await this.prismaService.product.update({
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
