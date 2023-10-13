import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  Container,
  Importer,
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
  TransactionFilterParams,
} from './types/product.interface';
import { EanUtils } from 'src/utils/ean-utils';

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
  constructor(private prismaService: PrismaService) {}

  private getImporterId(importer: string): Importer {
    switch (importer.toLowerCase().trim().replace(/\s/g, '')) {
      case 'attus':
        return Importer.ATTUS;
      case 'attusbloom':
        return Importer.ATTUS_BLOOM;
      case 'attus_bloom':
        return Importer.ATTUS_BLOOM;
      case 'alphaynfinity':
        return Importer.ALPHA_YNFINITY;
      case 'alpha_ynfinity':
        return Importer.ALPHA_YNFINITY;
    }
    throw new Error('Importer not found');
  }

  private getStockId(stock: string): Stock {
    switch (stock.toLowerCase().trim().replace(/\s/g, '')) {
      case 'galpao':
        return Stock.GALPAO;
      case 'galpão':
        return Stock.GALPAO;
      case 'loja':
        return Stock.LOJA;
    }
    throw new Error('Stock not found');
  }

  async createProduct(productCreation: ProductCreation): Promise<Product> {
    const importer = this.getImporterId(productCreation.importer);

    const productFound = await this.prismaService.product.findFirst({
      where: {
        OR: [
          {
            code: productCreation.code,
          },
          {
            ean: productCreation.ean,
          },
        ]
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
        importer
      },
    });

    return product;
  }

  async getAllProductsWithLastEntryByPage(pageableParams: PageableParams & ProductWithLastEntryParams): Promise<Pageable<Product>> {
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

    const importer = this.getImporterId(productEntry.importer);

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

    const container = await this.findOrCreateContainer(
      productEntry.container,
    );

    const productsOnContainerFound =
      await this.prismaService.productsOnContainer.findFirst({
        where: {
          containerId: container.id,
          productId: product.id,
        },
      });

    if (productsOnContainerFound)
      throw new HttpException(
        `Product already exists on container`,
        HttpStatus.BAD_REQUEST,
      );

    const productsOnContainer =
      await this.prismaService.productsOnContainer.create({
        data: {
          quantityExpected: productEntry.quantity,
          quantityReceived: productEntry.quantity,
          container: {
            connect: {
              id: container.id,
            },
          },
          product: {
            connect: {
              id: product.id,
            },
          },
          observation: productEntry.observation,
        },
        include: {
          product: true,
          container: true,
        },
      });

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

    await this.prismaService.transaction.create({
      data: {
        product: {
          connect: {
            id: product.id,
          },
        },
        container: {
          connect: {
            id: container.id,
          },
        },
        toStock: Stock.GALPAO,
        entryAmount: productEntry.quantity,
        type: TransactionType.ENTRY,
        observation: productEntry.observation,
      },
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
                    importer: importer
                      ? this.getImporterId(importer)
                      : undefined,
                  }
                },
              ],
            }
          : {
              product: {
                importer: importer ? this.getImporterId(importer) : undefined,
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
                  importer: importer ? this.getImporterId(importer) : undefined,
                },
              },
            ],
          }
        : {
            product: {
              importer: importer ? this.getImporterId(importer) : undefined,
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

    const stockId = this.getStockId(productExit.from);

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

    const transaction = await this.prismaService.transaction.create({
      data: {
        product: {
          connect: {
            id: product.id,
          },
        },
        fromStock: stockId,
        exitAmount: productExit.quantity,
        type: TransactionType.EXIT,
        observation: productExit.observation,
      },
    });

    return transaction;
  }
  
  async deleteTransaction(id: number): Promise<Transaction> {
    if (!id)
      throw new HttpException(
        `Transaction id is required`,
        HttpStatus.BAD_REQUEST,
      );

    const deleted = await this.prismaService.transaction.delete({
      where: {
        id,
      },
    });

    if (!deleted)
      throw new HttpException(`Transaction not found`, HttpStatus.BAD_REQUEST);

    const { fromStock, toStock, type, containerId } = deleted;

    if (type == TransactionType.ENTRY) {
      if (containerId) {
        await this.prismaService.productsOnContainer.deleteMany({
          where: {
            containerId,
            productId: deleted.productId,
          },
        });
      }

      await this.prismaService.product.update({
        where: {
          id: deleted.productId,
        },
        data: {
          [toStock === Stock.LOJA ? 'lojaQuantity' : 'galpaoQuantity']: {
            decrement: deleted.entryAmount,
          },
        },
      });
    } else if (type == TransactionType.EXIT) {
      await this.prismaService.product.update({
        where: {
          id: deleted.productId,
        },
        data: {
          [fromStock === Stock.LOJA ? 'lojaQuantity' : 'galpaoQuantity']: {
            increment: deleted.exitAmount,
          },
        },
      });
    }

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

  /**
   * Find or create a container
   * @param container The container id
   * @returns
   */
  private async findOrCreateContainer(
    container: string,
  ): Promise<Container> {
    return this.prismaService.container.upsert({
      where: {
        id: container,
      },
      create: {
        id: container,
      },
      update: {},
    });
  }
}
