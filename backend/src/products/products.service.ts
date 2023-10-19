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
import {
  ProductAlreadyInContainerError,
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
      if (productFound.importer === importer) throw new ProductNotFoundError();
      else if (productFound.importer !== importer)
        throw new HttpException(
          `Produto já existe em outro importador`,
          HttpStatus.BAD_REQUEST,
        );
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

  async getAllProductsAndStockByPage(
    pageableParams: PageableParams & ProductWithLastEntryParams,
  ): Promise<Pageable<Product>> {
    let { limit, page, code, importer, stock } = pageableParams;
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
    }

    if (pageableParams.stock) {
      try {
        stock = getStockId(stock);
      } catch {
        stock = undefined;
      }
    }

    const where = {
      importer: importer,
      code: code ?? undefined,
    };

    const products = await this.prismaService.product.findMany({
      skip: (page - 1) * limit,
      take: limit,
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
    let { codeOrEan, container, operator, quantity, observation } =
      productEntry;

    if (!container) throw new ProductContainerIsRequiredError();
    if (!codeOrEan) throw new ProductCodeOrEanIsRequiredError();
    if (!quantity) throw new ProductQuantityIsRequiredError();
    if (!productEntry.importer) throw new ProductImporterIsRequiredError();

    const importer = getImporterId(productEntry.importer);
    const product = await this.getProductByCodeOrEan(codeOrEan);

    if (!product || product.importer !== importer)
      throw new ProductNotFoundError();

    const containerCreatedOrFinded =
      await this.containerService.findOrCreateContainer(container);

    const productsOnContainerFound =
      await this.containerService.getProductOnContainer(
        product,
        containerCreatedOrFinded,
      );

    if (productsOnContainerFound)
      throw new ProductAlreadyInContainerError(container);

    const productsOnContainer =
      this.containerService.addProductToContainerOnEntry(
        product,
        containerCreatedOrFinded,
        quantity,
        observation,
      );

    await this.prismaService.product.update({
      where: {
        id: product.id,
      },
      data: {
        galpaoQuantity: {
          increment: quantity,
        },
      },
    });

    await this.transactionsService.createGalpaoEntry({
      product,
      container: containerCreatedOrFinded,
      entryAmount: quantity,
      observation: observation,
      operator: operator,
    });

    return productsOnContainer;
  }

  async exitProduct(productExit: ProductExit): Promise<Transaction> {
    if (!productExit.codeOrEan) throw new ProductCodeOrEanIsRequiredError();
    if (!productExit.from) throw new ProductStockIsRequiredError('origem');
    if (!productExit.quantity) throw new ProductQuantityIsRequiredError();

    const product = await this.getProductByCodeOrEan(productExit.codeOrEan);

    if (!product) throw new ProductNotFoundError();

    try {
      var stockId = getStockId(productExit.from);
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
    let { limit, page } = pageableParams;
    const pageLimit = 100;
    if (!limit) limit = 10;
    if (!page) page = 1;
    if (limit > 100) throw new PageMaxLimitError(pageLimit);

    const transactions =
      await this.transactionsService.getAllTransferencesByPage({
        limit,
        page,
      });

    return transactions;
  }

  async getAllEntriesByPage(
    pageableParams: PageableParams & EntriesFilterParams,
  ): Promise<Pageable<any>> {
    let { page, limit, search, importer, orderBy } = pageableParams;

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

    return transactionToDelete;
  }

  async getAllTransactionsByPage(
    pageableParams: TransactionFilterParams,
  ): Promise<Pageable<Transaction>> {
    const transactions = await this.transactionsService.getAll(pageableParams);
    return transactions;
  }
}
