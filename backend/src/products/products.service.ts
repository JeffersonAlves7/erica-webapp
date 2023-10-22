import { Injectable } from '@nestjs/common';
import { Product, ProductsOnContainer, Transaction } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { Pageable, PageableParams } from 'src/types/pageable.interface';
import {
  EntriesFilterParams,
  ProductCreation,
  ProductDevolution,
  ProductEntry,
  ProductExit,
  ProductTransference,
  ProductWithLastEntryParams,
} from './types/product.interface';
import { TransactionsService } from './transactions/transactions.service';
import { ContainerService } from './container/container.service';
import { getImporterId } from './utils/importer.utils';
import { getStockId } from './utils/stock.utils';
import {
  TransactionFilterParams,
  TransferenceFilterParams,
} from './types/transaction.interface';
import {
  ProductAlreadyExistsInOtherImporterError,
  ProductAlreadyExistsWithOtherCodeError,
  ProductAlreadyInContainerError,
  ProductClientIsRequiredError,
  ProductCodeOrEanIsRequiredError,
  ProductContainerIsRequiredError,
  ProductImporterIsRequiredError,
  ProductNotFoundError,
  ProductOperatorIsRequiredError,
  ProductQuantityIsRequiredError,
  ProductQuantityIsnotEnoughError,
  ProductStockIsRequiredError,
  ProductTransactionIdNotFoundError,
} from 'src/error/products.errors';
import { PageMaxLimitError } from 'src/error/page.errors';
import { StockNotFoundError } from 'src/error/stock.errors';
import { TransactionNotFoundError } from 'src/error/transaction.errors';
import { TransactionType } from 'src/types/transaction-type.enum';
import { Stock } from 'src/types/stock.enum';
import {
  ConfirmReserveParams,
  CreateReserveParmas,
  GetReservesParams,
} from './types/reserves.interface';

interface ProductServiceInterface {
  createProduct(productCreation: ProductCreation): Promise<Product>;
  getAllProductsAndStockByPage(
    pageableParams: ProductWithLastEntryParams,
  ): Promise<Pageable<Product>>;
  getAllProductsByPage(
    pageableParams: PageableParams,
  ): Promise<Pageable<Product>>;

  entryProduct(productEntry: ProductEntry): Promise<ProductsOnContainer>;
  exitProduct(productExit: ProductExit): Promise<Transaction>;
  transferProduct(
    productTransference: ProductTransference,
  ): Promise<Transaction>;
  confirmTransference(data: {
    id: number;
    entryAmount: number;
    location?: string;
  }): Promise<Transaction>;

  getAllEntriesByPage(
    pageableParams: PageableParams & EntriesFilterParams,
  ): Promise<Pageable<ProductsOnContainer>>;
  getAllTransferencesByPage(
    pageableParams: TransferenceFilterParams,
  ): Promise<Pageable<any>>;

  deleteTransaction(id: number): Promise<Transaction>;
  getAllTransactionsByPage(
    pageableParams: TransactionFilterParams,
  ): Promise<Pageable<Transaction>>;
}

@Injectable()
export class ProductsService implements ProductServiceInterface {
  constructor(
    private prismaService: PrismaService,
    private transactionsService: TransactionsService,
    private containerService: ContainerService,
  ) {}

  private getProductByCodeOrEan(codeOrEan: string): Promise<Product> {
    return this.prismaService.product.findFirst({
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
  }

  private getProductSales(
    id: Product['id'],
    filter: { date?: Date; stock?: Stock },
  ): Promise<Transaction[]> {
    return this.prismaService.transaction.findMany({
      where: {
        productId: id,
        type: TransactionType.EXIT,
        fromStock: filter.stock ?? undefined,
        client: {
          not: 'Loja',
        },
        createdAt: {
          gte: filter.date ?? new Date(0),
        },
      },
    });
  }

  async createProduct(productCreation: ProductCreation): Promise<Product> {
    const importer = getImporterId(productCreation.importer);

    const productFound = await this.prismaService.product.findFirst({
      where: {
        OR: [
          {
            code: productCreation.code,
          },
          {
            ean: productCreation.ean,
          },
        ],
      },
    });

    if (productFound) {
      if (productFound.code !== productCreation.code)
        throw new ProductAlreadyExistsWithOtherCodeError();
      if (productFound.importer !== importer)
        throw new ProductAlreadyExistsInOtherImporterError();
      throw new ProductNotFoundError();
    }

    const product = await this.prismaService.product.create({
      data: {
        code: productCreation.code,
        ean: productCreation.ean,
        description: productCreation.description,
        importer,
      },
    });

    return product;
  }

  async deleteProduct(id: number): Promise<Product> {
    return this.prismaService.$transaction(async (prisma) => {
      await prisma.transaction.deleteMany({
        where: {
          productId: id,
        },
      });

      await prisma.productsOnContainer.deleteMany({
        where: {
          productId: id,
        },
      });

      const product = await prisma.product.delete({
        where: {
          id,
        },
      });

      return product;
    });
  }

  async getAllProductsAndStockByPage(
    pageableParams: ProductWithLastEntryParams,
  ): Promise<Pageable<Product>> {
    const { code } = pageableParams;
    let { limit, page, importer, stock } = pageableParams;

    const maxLimit = 100;

    if (!limit) limit = 10;
    if (!page) page = 1;
    if (limit > maxLimit) throw new PageMaxLimitError(maxLimit);

    if (importer) {
      try {
        importer = getImporterId(importer);
      } catch {
        importer = undefined;
      }
    } else {
      importer = undefined;
    }

    if (pageableParams.stock) {
      try {
        stock = getStockId(stock);
      } catch {
        stock = undefined;
      }
    } else {
      stock = undefined;
    }

    const where: any = {
      importer: importer,
    };

    if (code) {
      where.code = {
        contains: code ?? '',
      };
    }

    const products = await this.prismaService.product.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where,
      orderBy: {
        updatedAt: 'desc',
      },
    });

    const total = await this.prismaService.product.count({
      where,
    });

    const productsToSend = [];
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const entriesToSend = [];

      if (!stock || stock === Stock.GALPAO) {
        for (let j = 0; ; j++) {
          const productsOnContainer =
            await this.prismaService.productsOnContainer.findMany({
              skip: j * 10,
              take: 10,
              where: {
                productId: product.id,
              },
              orderBy: {
                createdAt: 'desc',
              },
            });

          if (productsOnContainer.length === 0) break;

          let quantity = 0;

          for (let k = 0; k < productsOnContainer.length; k++) {
            const productOnContainer = productsOnContainer[k];
            quantity += productOnContainer.quantityReceived;
            entriesToSend.push(productOnContainer);

            if (!stock) {
              if (quantity >= product.lojaQuantity + product.galpaoQuantity)
                break;
            } else if (stock === Stock.GALPAO) {
              if (quantity >= product.galpaoQuantity) break;
            }
          }
        }
      } else {
        for (let j = 0; ; j++) {
          const transferences = await this.prismaService.transaction.findMany({
            skip: j * 10,
            take: 10,
            where: {
              productId: product.id,
              type: TransactionType.TRANSFERENCE,
            },
            orderBy: {
              createdAt: 'desc',
            },
          });

          if (transferences.length === 0) break;

          let quantity = 0;

          for (let k = 0; k < transferences.length; k++) {
            const transference = transferences[k];
            quantity += transference.entryAmount;
            entriesToSend.push({
              ...transference,
              quantityReceived: transference.entryAmount,
            });

            if (quantity >= product.lojaQuantity) break;
          }
        }
      }

      const salesData = await this.getProductSales(product.id, {
        date: entriesToSend[0]?.createdAt ?? new Date(),
        stock: stock ?? undefined,
      });

      const sales = salesData.reduce((acc: any, curr) => {
        if (typeof acc === 'number') return acc + curr.exitAmount;
        else {
          return acc.exitAmount + curr.exitAmount;
        }
      }, 0);

      productsToSend.push({
        ...product,
        entries: entriesToSend,
        sales,
      });
    }

    return {
      page: page,
      total,
      data: productsToSend,
    };
  }

  async getAllProductsByPage(
    pageableParams: PageableParams,
  ): Promise<Pageable<Product>> {
    let { page, limit } = pageableParams;

    const maxLimit = 100;

    if (!limit) limit = 10;
    if (!page) page = 1;
    if (limit > maxLimit) throw new PageMaxLimitError(maxLimit);

    const products = await this.prismaService.product.findMany({
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await this.prismaService.product.count();

    return {
      page,
      total,
      data: products,
    };
  }

  async entryProduct(productEntry: ProductEntry): Promise<ProductsOnContainer> {
    const { codeOrEan, container, operator, quantity, observation } =
      productEntry;

    if (!container) throw new ProductContainerIsRequiredError();
    if (!codeOrEan) throw new ProductCodeOrEanIsRequiredError();
    if (!quantity) throw new ProductQuantityIsRequiredError();
    if (!productEntry.importer) throw new ProductImporterIsRequiredError();

    const importer = getImporterId(productEntry.importer);
    const product = await this.getProductByCodeOrEan(codeOrEan);

    if (!product || product.importer !== importer)
      throw new ProductNotFoundError();

    const productsContainer =
      await this.containerService.findOrCreateContainer(container);

    const productsOnContainerFound =
      await this.containerService.getProductOnContainer(
        product,
        productsContainer,
      );
    if (productsOnContainerFound)
      throw new ProductAlreadyInContainerError(container);

    const productsOnContainer = await this.prismaService.$transaction(
      async (prisma) => {
        const productsOnContainer = await prisma.productsOnContainer.create({
          data: {
            quantityExpected: quantity,
            quantityReceived: quantity,
            product: {
              connect: {
                id: product.id,
              },
            },
            container: {
              connect: {
                id: productsContainer.id,
              },
            },
            observation,
          },
          include: {
            product: true,
            container: true,
          },
        });

        await prisma.product.update({
          where: {
            id: product.id,
          },
          data: {
            galpaoQuantity: {
              increment: quantity,
            },
          },
        });

        await prisma.transaction.create({
          data: {
            product: {
              connect: {
                id: product.id,
              },
            },
            container: {
              connect: {
                id: productsContainer.id,
              },
            },
            operator: operator,
            toStock: Stock.GALPAO,
            entryAmount: quantity,
            type: TransactionType.ENTRY,
            observation: observation,
            confirmed: true,
          },
        });

        return productsOnContainer;
      },
    );

    return productsOnContainer;
  }

  async exitProduct(productExit: ProductExit): Promise<Transaction> {
    if (!productExit.codeOrEan) throw new ProductCodeOrEanIsRequiredError();
    if (!productExit.from) throw new ProductStockIsRequiredError('origem');
    if (!productExit.quantity) throw new ProductQuantityIsRequiredError();

    const product = await this.getProductByCodeOrEan(productExit.codeOrEan);

    if (!product) throw new ProductNotFoundError();

    let stockId: any;
    try {
      stockId = getStockId(productExit.from);
    } catch {
      stockId = undefined;
    }

    if (stockId !== Stock.LOJA && stockId !== Stock.GALPAO)
      throw new StockNotFoundError();
    if (
      (stockId === Stock.LOJA && product.lojaQuantity < productExit.quantity) ||
      (stockId === Stock.GALPAO &&
        product.galpaoQuantity < productExit.quantity)
    )
      throw new ProductQuantityIsnotEnoughError();

    const transaction = await this.transactionsService.createExit({
      product,
      fromStock: stockId,
      exitAmount: productExit.quantity,
      observation: productExit.observation,
      operator: productExit.operator,
      client: productExit.client,
    });

    await this.prismaService.product.update({
      where: {
        id: product.id,
      },
      data: {
        [stockId == Stock.GALPAO ? 'galpaoQuantity' : 'lojaQuantity']: {
          decrement: productExit.quantity,
        },
      },
    });

    return transaction;
  }

  async devolutionProduct(
    productDevolution: ProductDevolution,
  ): Promise<Transaction> {
    if (!productDevolution.codeOrEan)
      throw new ProductCodeOrEanIsRequiredError();
    if (!productDevolution.client) throw new ProductClientIsRequiredError();
    if (!productDevolution.quantity) throw new ProductQuantityIsRequiredError();
    if (!productDevolution.operator) throw new ProductOperatorIsRequiredError();
    if (!productDevolution.stock)
      throw new ProductStockIsRequiredError('origem');

    const product = await this.getProductByCodeOrEan(
      productDevolution.codeOrEan,
    );

    if (!product) throw new ProductNotFoundError();

    let stockId: Stock;
    try {
      stockId = getStockId(productDevolution.stock);
    } catch {
      stockId = undefined;
    }

    if (stockId !== Stock.LOJA && stockId !== Stock.GALPAO)
      throw new StockNotFoundError();

    const transaction = await this.transactionsService.createDevolution({
      product,
      toStock: stockId,
      entryAmount: productDevolution.quantity,
      observation: productDevolution.observation,
      operator: productDevolution.operator,
      client: productDevolution.client,
    });

    await this.prismaService.product.update({
      where: {
        id: product.id,
      },
      data: {
        [stockId == Stock.GALPAO ? 'galpaoQuantity' : 'lojaQuantity']: {
          increment: productDevolution.quantity,
        },
      },
    });

    return transaction;
  }

  async transferProduct(
    productTransference: ProductTransference,
  ): Promise<Transaction> {
    const { quantity, operator, codeOrEan, location, observation } =
      productTransference;

    if (!quantity) throw new ProductQuantityIsRequiredError();
    if (!codeOrEan) throw new ProductCodeOrEanIsRequiredError();
    if (!operator) throw new ProductOperatorIsRequiredError();

    const product = await this.getProductByCodeOrEan(codeOrEan);

    if (!product) throw new ProductNotFoundError();

    const transference = await this.transactionsService.createTransferences({
      product,
      entryAmount: quantity,
      observation,
      operator,
      location,
    });

    return transference;
  }

  async confirmTransference(data: {
    id: number;
    entryAmount: number;
    location?: string;
  }): Promise<Transaction> {
    const { id, entryAmount, location } = data;

    if (!id) throw new ProductTransactionIdNotFoundError();
    if (!entryAmount)
      throw new ProductQuantityIsRequiredError('Quantidade de entrada');

    const transference = await this.transactionsService.confirmTransference({
      id,
      entryAmount: entryAmount,
      location,
    });

    return transference;
  }

  async getAllTransferencesByPage(
    pageableParams: TransferenceFilterParams,
  ): Promise<Pageable<any>> {
    const { confirmed, code, orderBy } = pageableParams;
    let { limit, page } = pageableParams;

    const pageLimit = 100;
    if (!limit) limit = 10;
    if (!page) page = 1;
    if (limit > 100) throw new PageMaxLimitError(pageLimit);

    const transactions =
      await this.transactionsService.getAllTransferencesByPage({
        limit,
        page,
        confirmed,
        code,
        orderBy,
      });

    return transactions;
  }

  async getAllEntriesByPage(
    pageableParams: PageableParams & EntriesFilterParams,
  ): Promise<Pageable<any>> {
    const { search, importer, orderBy } = pageableParams;
    let { page, limit } = pageableParams;

    const pageLimit = 100;
    if (!limit) limit = 10;
    if (!page) page = 1;

    if (limit > pageLimit) throw new PageMaxLimitError(pageLimit);

    const where = search
      ? {
          AND: [
            {
              OR: [
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
                {
                  product: {
                    description: {
                      contains: search,
                    },
                  },
                },
                {
                  container: {
                    id: {
                      contains: search,
                    },
                  },
                },
              ],
            },
            {
              product: {
                importer: importer ? getImporterId(importer) : undefined,
              },
            },
          ],
        }
      : {
          product: {
            importer: importer ? getImporterId(importer) : undefined,
          },
        };

    const productsOnContainer =
      await this.prismaService.productsOnContainer.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where,
        orderBy: {
          createdAt: orderBy === 'asc' ? 'asc' : 'desc',
        },
        include: {
          product: true,
          container: true,
        },
      });

    const total = await this.prismaService.productsOnContainer.count({
      where,
    });

    return {
      page,
      total: total,
      data: productsOnContainer,
    };
  }

  async deleteTransaction(id: number): Promise<Transaction> {
    if (!id) throw new ProductTransactionIdNotFoundError();

    const transactionToDelete = await this.prismaService.transaction.findUnique(
      {
        where: {
          id,
        },
      },
    );

    if (!transactionToDelete) throw new TransactionNotFoundError();

    const { type } = transactionToDelete;
    if (type === TransactionType.ENTRY)
      await this.transactionsService.deleteEntry(id);
    else if (type === TransactionType.EXIT)
      await this.transactionsService.deleteExit(id);
    else if (type === TransactionType.TRANSFERENCE)
      await this.transactionsService.deleteTransference(id);
    else if (type == TransactionType.RESERVE)
      await this.transactionsService.deleteReserve(id);
    else throw new TransactionNotFoundError();

    return transactionToDelete;
  }

  async getAllTransactionsByPage(
    pageableParams: TransactionFilterParams,
  ): Promise<Pageable<Transaction>> {
    const transactions = await this.transactionsService.getAll(pageableParams);
    return transactions;
  }

  async createReserve(params: CreateReserveParmas) {
    const { codeOrEan, client, observation, operator, quantity } = params;

    let stock = params.stock;

    if (!codeOrEan) throw new ProductCodeOrEanIsRequiredError();
    if (!client) throw new ProductClientIsRequiredError();
    if (!quantity) throw new ProductQuantityIsRequiredError('Quantidade');
    if (!operator) throw new ProductOperatorIsRequiredError();
    if (!stock) throw new ProductStockIsRequiredError('saída');

    try {
      stock = getStockId(stock);
    } catch {
      throw new StockNotFoundError();
    }

    const product = await this.getProductByCodeOrEan(codeOrEan);

    if (!product) throw new ProductNotFoundError();

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
        },
        include: {
          product: true,
        },
      });

      return transaction;
    });
  }

  async getReservesByPage(params: GetReservesParams): Promise<Pageable<any>> {
    const { search } = params;
    let { confirmed, stock, limit, page } = params;

    const maxLimit = 100;

    if (!limit) limit = 10;
    if (!page) page = 1;
    if (limit > maxLimit) throw new PageMaxLimitError(maxLimit);

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
        updatedAt: 'desc',
      },
    });

    const total = await this.prismaService.transaction.count({
      where,
    });

    return {
      page,
      total,
      data: reserves,
    };
  }

  async confirmReserve(id: number) {
    if (!id) throw new ProductTransactionIdNotFoundError();
    if (isNaN(id)) throw new ProductTransactionIdNotFoundError();

    const transaction = await this.prismaService.transaction.findUnique({
      where: {
        id,
      },
    });

    if (!transaction) throw new TransactionNotFoundError();

    if (transaction.type !== TransactionType.RESERVE)
      throw new TransactionNotFoundError();

    const product = await this.prismaService.product.findUnique({
      where: {
        id: transaction.productId,
      },
    });

    if (!product) throw new ProductNotFoundError();

    const { entryAmount, fromStock } = transaction;

    return this.prismaService.$transaction(async (prisma) => {
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
    });
  }
}
