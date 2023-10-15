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
  ProductWithLastEntryParams,
} from './types/product.interface';
import { EanUtils } from 'src/utils/ean-utils';
import { TransactionsService } from './transactions/transactions.service';
import { ContainerService } from './container/container.service';
import { getImporterId } from './utils/importer.utils';
import { getStockId } from './utils/stock.utils';
import { TransactionFilterParams } from './types/transaction.interface';

interface ProductServiceInterface {
  createProduct(productCreation: ProductCreation): Promise<Product>;
  getAllProductsWithLastEntryByPage(
    pageableParams: PageableParams & ProductWithLastEntryParams,
  ): Promise<Pageable<Product>>;
  getAllProductsByPage(
    pageableParams: PageableParams,
  ): Promise<Pageable<Product>>;

  entryProduct(productEntry: ProductEntry): Promise<ProductsOnContainer>;
  getAllEntriesByPage(
    pageableParams: PageableParams & EntriesFilterParams,
  ): Promise<Pageable<ProductsOnContainer>>;

  exitProduct(productExit: ProductExit): Promise<Transaction>;

  deleteTransaction(id: number): Promise<Transaction>;
  getAllTransactionsByPage(
    pageableParams: PageableParams & TransactionFilterParams,
  ): Promise<Pageable<Transaction>>;
}

@Injectable()
export class ProductsService implements ProductServiceInterface {
  constructor(
    private prismaService: PrismaService,
    private transactionsService: TransactionsService,
    private containerService: ContainerService,
  ) {}

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

  async getAllProductsWithLastEntryByPage(
    pageableParams: PageableParams & ProductWithLastEntryParams,
  ): Promise<Pageable<Product>> {
    const products = await this.prismaService.product.findMany({
      skip: (pageableParams.page - 1) * pageableParams.limit,
      take: pageableParams.limit,
      include: {
        productsOnContainer: {
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            container: true,
          },
          take: 1,
        },
      },
    });

    const total = await this.prismaService.product.count();

    return {
      page: pageableParams.page,
      total,
      data: products,
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

    if (!productEntry.operator) {
      throw new HttpException(`Operator is required`, HttpStatus.BAD_REQUEST);
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
      this.containerService.getProductOnContainer(product, container);

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

    await this.transactionsService.createEntry({
      product,
      container,
      entryAmount: productEntry.quantity,
      toStock: Stock.GALPAO,
      observation: productEntry.observation,
    });

    return productsOnContainer;
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

    const product = await this.prismaService.product.findFirst({
      where: EanUtils.isEan(productExit.codeOrEan)
        ? {
            ean: productExit.codeOrEan,
          }
        : {
            code: productExit.codeOrEan,
          },
    });

    if (!product)
      throw new HttpException(`Product not found`, HttpStatus.BAD_REQUEST);

    const stockId = getStockId(productExit.from);

    if (stockId === Stock.LOJA) {
      if (product.lojaQuantity < productExit.quantity)
        throw new HttpException(
          `Quantity not available`,
          HttpStatus.BAD_REQUEST,
        );
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
      if (product.galpaoQuantity < productExit.quantity)
        throw new HttpException(
          `Quantity not available`,
          HttpStatus.BAD_REQUEST,
        );
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
    } else {
      throw new HttpException(`Stock not found`, HttpStatus.BAD_REQUEST);
    }

    const transaction = await this.transactionsService.createExit({
      product,
      fromStock: stockId,
      exitAmount: productExit.quantity,
      observation: productExit.observation,
    });

    return transaction;
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
    pageableParams: PageableParams & TransactionFilterParams,
  ): Promise<Pageable<Transaction>> {
    const transactions = await this.transactionsService.getAllTransactionsByPage(
      pageableParams,
    );

    return transactions;
  }
}
