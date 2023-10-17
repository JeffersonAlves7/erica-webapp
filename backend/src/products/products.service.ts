import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  Product,
  ProductsOnContainer,
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
  EntriesFilterParams,
  ProductCreation,
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

interface ProductServiceInterface {
  createProduct(productCreation: ProductCreation): Promise<Product>;
  getAllProductsAndStockByPage(
    pageableParams: PageableParams & ProductWithLastEntryParams,
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
      if (productFound.importer === importer)
        throw new HttpException(
          `Product already exists with this importer`,
          HttpStatus.BAD_REQUEST,
        );
      else if (productFound.importer !== importer)
        throw new HttpException(
          `Product already exists with another importer`,
          HttpStatus.BAD_REQUEST,
        );
      throw new HttpException(`Product already exists`, HttpStatus.BAD_REQUEST);
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

  async getAllProductsAndStockByPage(
    pageableParams: PageableParams & ProductWithLastEntryParams,
  ): Promise<Pageable<Product>> {
    if (!pageableParams.limit) pageableParams.limit = 10;
    if (!pageableParams.page) pageableParams.page = 1;
    if (pageableParams.limit > 100)
      throw new HttpException(
        `Maximum limit is ${100}`,
        HttpStatus.BAD_REQUEST,
      );

    if (pageableParams.importer) {
      try {
        var importer = getImporterId(pageableParams.importer);
      } catch {
        importer = undefined;
      }
    }
    if (pageableParams.stock) {
      try {
        var stock = getStockId(pageableParams.stock);
      } catch {
        stock = undefined;
      }
    }

    const where = {
      importer: importer,
      code: pageableParams.code ?? undefined,
    };

    const products = await this.prismaService.product.findMany({
      skip: (pageableParams.page - 1) * pageableParams.limit,
      take: pageableParams.limit,
      where,
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
      page: pageableParams.page,
      total,
      data: productsToSend,
    };
  }

  async getAllProductsByPage(
    pageableParams: PageableParams,
  ): Promise<Pageable<Product>> {
    let { page, limit } = pageableParams;

    if (limit > 100) {
      throw new HttpException(
        `Maximum limit is ${100}`,
        HttpStatus.BAD_REQUEST,
      );
    }

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
    if (!productEntry.container) {
      throw new HttpException(`Container is required`, HttpStatus.BAD_REQUEST);
    }

    if (!productEntry.codeOrEan) {
      throw new HttpException(
        `Code or EAN is required`,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!productEntry.quantity) {
      throw new HttpException(`Quantity is required`, HttpStatus.BAD_REQUEST);
    }

    if (!productEntry.importer) {
      throw new HttpException(`Importer is required`, HttpStatus.BAD_REQUEST);
    }

    const importer = getImporterId(productEntry.importer);

    const product = await this.prismaService.product.findFirst({
      where: {
        OR: [
          {
            code: productEntry.codeOrEan,
          },
          {
            ean: productEntry.codeOrEan,
          },
        ],
        importer,
      },
      include: {
        productsOnContainer: true,
      },
    });

    if (!product)
      throw new HttpException(`Product not found`, HttpStatus.BAD_REQUEST);

    const container = await this.containerService.findOrCreateContainer(
      productEntry.container,
    );

    const productsOnContainerFound =
      await this.containerService.getProductOnContainer(product, container);

    if (productsOnContainerFound)
      throw new HttpException(
        `Product already exists on container`,
        HttpStatus.BAD_REQUEST,
      );

    const productsOnContainer =
      this.containerService.addProductToContainerOnEntry(
        product,
        container,
        productEntry.quantity,
        productEntry.observation,
      );

    await this.prismaService.product.update({
      where: {
        id: product.id,
      },
      data: {
        galpaoQuantity: {
          increment: productEntry.quantity,
        },
      },
    });

    await this.transactionsService.createGalpaoEntry({
      product,
      container,
      entryAmount: productEntry.quantity,
      observation: productEntry.observation,
      operator: productEntry.operator,
    });

    return productsOnContainer;
  }

  async exitProduct(productExit: ProductExit): Promise<Transaction> {
    if (!productExit.codeOrEan)
      throw new HttpException(
        `Code or EAN is required`,
        HttpStatus.BAD_REQUEST,
      );

    if (!productExit.from)
      throw new HttpException(`From is required`, HttpStatus.BAD_REQUEST);

    if (!productExit.quantity)
      throw new HttpException(`Quantity is required`, HttpStatus.BAD_REQUEST);

    const product = await this.getProductByCodeOrEan(productExit.codeOrEan);

    if (!product)
      throw new HttpException(`Product not found`, HttpStatus.BAD_REQUEST);

    const stockId = getStockId(productExit.from);

    if (stockId !== Stock.LOJA && stockId !== Stock.GALPAO)
      throw new HttpException(`Stock not found`, HttpStatus.BAD_REQUEST);
    if (stockId === Stock.LOJA && product.lojaQuantity < productExit.quantity) {
      throw new HttpException(`Quantity not available`, HttpStatus.BAD_REQUEST);
    } else if (
      stockId === Stock.GALPAO &&
      product.galpaoQuantity < productExit.quantity
    ) {
      throw new HttpException(`Quantity not available`, HttpStatus.BAD_REQUEST);
    }

    const transaction = await this.transactionsService.createExit({
      product,
      fromStock: stockId,
      exitAmount: productExit.quantity,
      observation: productExit.observation,
      operator: productExit.operator,
      client: productExit.client,
    });

    if (stockId === Stock.LOJA) {
      await this.prismaService.product.update({
        where: {
          id: product.id,
        },
        data: {
          lojaQuantity: {
            decrement: productExit.quantity,
          },
        },
      });
    } else if (stockId === Stock.GALPAO) {
      await this.prismaService.product.update({
        where: {
          id: product.id,
        },
        data: {
          galpaoQuantity: {
            decrement: productExit.quantity,
          },
        },
      });
    }

    return transaction;
  }

  async transferProduct(
    productTransference: ProductTransference,
  ): Promise<Transaction> {
    if (!productTransference.quantity)
      throw new HttpException(`Quantity is required`, HttpStatus.BAD_REQUEST);

    if (!productTransference.codeOrEan)
      throw new HttpException(`Code is required`, HttpStatus.BAD_REQUEST);

    if (!productTransference.operator)
      throw new HttpException(`Operator is required`, HttpStatus.BAD_REQUEST);

    const product = await this.getProductByCodeOrEan(
      productTransference.codeOrEan,
    );

    if (!product)
      throw new HttpException(`Product not found`, HttpStatus.BAD_REQUEST);

    const transference = await this.transactionsService.createLojaTransference({
      product,
      entryAmount: productTransference.quantity,
      observation: productTransference.observation,
      operator: productTransference.operator,
      location: productTransference.location,
    });

    return transference;
  }

  async confirmTransference(data: {
    id: number;
    entryAmount: number;
    location?: string;
  }): Promise<Transaction> {
    const { id, entryAmount, location } = data;

    if (!id)
      throw new HttpException(
        `Transaction id is required`,
        HttpStatus.BAD_REQUEST,
      );

    if (!entryAmount)
      throw new HttpException(
        `Entry amount is required`,
        HttpStatus.BAD_REQUEST,
      );

    const transference = await this.transactionsService.confirmTransference({
      id,
      entryAmount,
      location,
    });

    return transference;
  }

  async getAllTransferencesByPage(
    pageableParams: TransferenceFilterParams,
  ): Promise<Pageable<any>> {
    if (!pageableParams.limit) pageableParams.limit = 10;
    if (!pageableParams.page) pageableParams.page = 1;

    if (pageableParams.limit > 100)
      throw new HttpException(
        `Maximum limit is ${100}`,
        HttpStatus.BAD_REQUEST,
      );

    const transactions =
      await this.transactionsService.getAllTransferencesByPage(pageableParams);

    return transactions;
  }

  async getAllEntriesByPage(
    pageableParams: PageableParams & EntriesFilterParams,
  ): Promise<Pageable<any>> {
    let { page, limit, search, importer, orderBy } = pageableParams;

    if (!limit) limit = 10;
    if (!page) page = 1;

    if (limit > 100) {
      throw new HttpException(
        `Maximum limit is ${100}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const productsOnContainer =
      await this.prismaService.productsOnContainer.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: search
          ? {
              AND: [
                {
                  OR: [
                    {
                      product: {
                        code: search,
                      },
                    },
                    {
                      product: {
                        ean: search,
                      },
                    },
                    {
                      product: {
                        description: search,
                      },
                    },
                    {
                      container: {
                        id: search,
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
            },
        orderBy: {
          createdAt: orderBy === 'asc' ? 'asc' : 'desc',
        },
        include: {
          product: true,
          container: true,
        },
      });

    const total = await this.prismaService.productsOnContainer.count({
      where: search
        ? {
            AND: [
              {
                OR: [
                  {
                    product: {
                      code: search,
                    },
                  },
                  {
                    product: {
                      ean: search,
                    },
                  },
                  {
                    product: {
                      description: search,
                    },
                  },
                  {
                    container: {
                      id: search,
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
          },
    });

    return {
      page,
      total: total,
      data: productsOnContainer,
    };
  }

  async deleteTransaction(id: number): Promise<Transaction> {
    if (!id)
      throw new HttpException(
        `Transaction id is required`,
        HttpStatus.BAD_REQUEST,
      );

    const transactionToDelete = await this.prismaService.transaction.findUnique(
      {
        where: {
          id,
        },
      },
    );

    if (!transactionToDelete)
      throw new HttpException(`Transaction not found`, HttpStatus.BAD_REQUEST);

    if (transactionToDelete.type === TransactionType.ENTRY) {
      await this.transactionsService.deleteEntry(transactionToDelete.id);
    } else if (transactionToDelete.type === TransactionType.EXIT) {
      await this.transactionsService.deleteExit(transactionToDelete.id);
    }

    return transactionToDelete;
  }

  async getAllTransactionsByPage(
    pageableParams: TransactionFilterParams,
  ): Promise<Pageable<Transaction>> {
    const transactions = await this.transactionsService.getAll(pageableParams);
    return transactions;
  }
}
