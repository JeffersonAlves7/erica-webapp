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
import {
  TransactionFilterParams,
  TransferenceFilterParams,
} from '../types/transaction.interface';

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

interface TransactionsServiceInterface {
  createExit(data: ExitParams): Promise<Transaction>;
  createGalpaoEntry(data: EntryGalpaoParams): Promise<Transaction>;
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

  async createExit(data: ExitParams) {
    if (!data.product) throw new Error('Missing product');
    if (!data.fromStock) throw new Error('Missing fromStock');
    if (!data.exitAmount) throw new Error('Missing exitAmount');
    if (!data.client) throw new Error('Missing client');

    return this.createExitTransaction(data);
  }

  async createGalpaoEntry(data: EntryGalpaoParams) {
    if (!data.product) throw new Error('Missing product');
    if (!data.container) throw new Error('Missing container');
    if (!data.entryAmount) throw new Error('Missing entryAmount');

    return this.createEntryTransaction(data);
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

    if (!product)
      throw new HttpException('Product not found.', HttpStatus.BAD_REQUEST);

    if (product.galpaoQuantity < data.entryAmount)
      throw new HttpException('Not enough stock.', HttpStatus.BAD_REQUEST);

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

    if (!id)
      throw new HttpException(
        'Missing transaction id.',
        HttpStatus.BAD_REQUEST,
      );

    const transaction = await this.prismaService.transaction.findUnique({
      where: {
        id,
      },
      include: {
        product: true,
      },
    });

    if (!transaction)
      throw new HttpException('Transaction not found.', HttpStatus.BAD_REQUEST);

    if (transaction.confirmed)
      throw new HttpException(
        'Transaction already confirmed.',
        HttpStatus.BAD_REQUEST,
      );

    if (transaction.product.galpaoQuantity < entryAmount)
      throw new HttpException('Not enough stock.', HttpStatus.BAD_REQUEST);

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
    const { limit, code, page, confirmed, orderBy, selectAll } = pageableParams;

    const search: any = {
      skip: (page - 1) * limit,
      take: limit,
      where: {
        type: TransactionType.TRANSFERENCE,
        confirmed: confirmed,
        product: {
          code: {
            contains: code,
          },
        },
      },
      orderBy: {
        updatedAt: orderBy === 'asc' ? 'asc' : 'desc',
      },
    };

    if (!selectAll) {
      search.select = {
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
      };
    } else {
      search.include = {
        product: true,
      };
    }

    const transactions = await this.prismaService.transaction.findMany(search);

    const total = await this.prismaService.transaction.count({
      where: {
        type: TransactionType.TRANSFERENCE,
        confirmed: confirmed,
      },
    });

    return {
      page: page,
      total,
      data: transactions,
    };
  }

  async deleteTransference(id: number) {
    if (!id) {
      throw new HttpException(
        'Missing transaction id.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const transference = await this.prismaService.transaction.findUnique({
      where: {
        id,
      },
      include: {
        product: true,
      },
    });

    if (!transference)
      throw new HttpException('Transaction not found.', HttpStatus.BAD_REQUEST);

    const { confirmed, entryAmount, productId, partnerId, exitAmount } = transference;

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

      if (!deletions || deletions.count === 0) {
        throw new HttpException(
          'Transaction not found.',
          HttpStatus.BAD_REQUEST,
        );
      }

      if (confirmed){
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
      confirmed: true,
    };

    const transactions = await this.prismaService.transaction.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where,
      include: {
        product: true,
      },
      orderBy: {
        updatedAt: orderBy === 'asc' ? 'asc' : 'desc',
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
}
