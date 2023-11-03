import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
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
import {
  getImporterId,
  getImporterIdOrUndefined,
} from './utils/importer.utils';
import { getStockId, getStockIdOrUndefined } from './utils/stock.utils';
import { TransferenceFilterParams } from './types/transaction.interface';
import {
  ProductAlreadyExistsInOtherImporterError,
  ProductAlreadyExistsWithOtherCodeError,
  ProductAlreadyInContainerError,
  ProductClientIsRequiredError,
  ProductCodeOrEanIsRequiredError,
  ProductNotFoundError,
  ProductOperatorIsRequiredError,
  ProductQuantityIsRequiredError,
  ProductQuantityIsnotEnoughError,
  ProductStockIsRequiredError,
  ProductTransactionIdNotFoundError,
} from 'src/error/products.errors';
import { PageMaxLimitError } from 'src/error/page.errors';
import { StockNotFoundError } from 'src/error/stock.errors';
import { TransactionType } from 'src/types/transaction-type.enum';
import { Stock } from 'src/types/stock.enum';
import { ExcelService } from './excel/excel.service';

@Injectable()
export class ProductsService {
  constructor(
    private prismaService: PrismaService,
    private transactionsService: TransactionsService,
    private containerService: ContainerService,
    private excelService: ExcelService,
  ) {}

  async uploadExcelFile(file: any) {
    const fileReaded = await this.excelService.readExcelFile(file);
    return fileReaded;
  }

  async toggleArchiveProduct(id: number) {
    const product = await this.prismaService.product.findUnique({
      where: {
        id,
      },
    });

    if (!product) throw new ProductNotFoundError();

    return this.prismaService.product.update({
      where: {
        id,
      },
      data: {
        isActive: !product.isActive,
      },
    });
  }

  async getArchivedProducts(
    query: PageableParams & { importer?: string },
  ): Promise<Pageable<any>> {
    if (!query.page) query.page = 1;
    if (!query.limit || query.limit > 100) query.limit = 100;

    const { page, limit, importer } = query;

    const products = await this.prismaService.product.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where: {
        isActive: false,
        importer: importer ? importer : undefined,
      },
      include: {
        transactions: {
          where: {
            type: TransactionType.ENTRY,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
    });

    const total = await this.prismaService.product.count({
      where: {
        isActive: false,
        importer: importer ? importer : undefined,
      },
    });

    return {
      page,
      data: products,
      total,
    };
  }

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

    if (!limit || limit > maxLimit) limit = 100;
    if (!page) page = 1;

    importer = getImporterIdOrUndefined(importer);
    stock = getStockIdOrUndefined(stock);

    const where: any = {
      importer: importer,
      isActive: true,
    };

    if (code) where.code = { contains: code ?? '' };

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
                confirmed: true,
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
              if (
                quantity >=
                product.lojaQuantity +
                  product.galpaoQuantity +
                  product.galpaoQuantityReserve +
                  product.lojaQuantityReserve
              )
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

            if (quantity >= product.lojaQuantity + product.lojaQuantityReserve)
              break;
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
    const {
      code,
      container,
      operator,
      quantity,
      observation,
      description,
      ean,
    } = productEntry;

    const importer = getImporterId(productEntry.importer);
    let product = await this.prismaService.product.findFirst({
      where: {
        OR: [
          {
            code,
          },
          {
            ean,
          },
        ],
      },
    });

    if (product && product.importer !== importer)
      throw new HttpException(
        `Produto encontrado com outra importadora: ${product.importer}`,
        HttpStatus.BAD_REQUEST,
      );
    else if (!product) {
      // create the product if if don't exists
      if (!description)
        throw new HttpException(
          `O campo *Descrição* é obrigatória para a criação de um produto`,
          HttpStatus.BAD_REQUEST,
        );

      product = await this.createProduct({
        code,
        importer,
        description,
        ean,
      });
    }

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

  async entryProductByExcelFile(file: any) {
    const entriesData = await this.excelService.readEntryProductExcelFile(file);

    await this.prismaService.$transaction(async (prisma) => {
      for (let index = 0; index < entriesData.length; index++) {
        let rowIndex = index + 2;
        const row = entriesData[index];
        const {
          codeOrEan,
          container,
          importer: importerName,
          operator,
          quantity,
          observation,
        } = row;

        const importer = getImporterId(importerName);
        const product = await this.getProductByCodeOrEan(codeOrEan);

        if (!product)
          throw new HttpException(
            `Produto não encontrado na linha ${rowIndex}`,
            HttpStatus.BAD_REQUEST,
          );

        if (product.importer !== importer)
          throw new HttpException(
            `Produto, com essa importadora, não encontrado na linha ${rowIndex}`,
            HttpStatus.BAD_REQUEST,
          );

        const productsContainer =
          await this.containerService.findOrCreateContainer(container);

        const productsOnContainerFound =
          await this.containerService.getProductOnContainer(
            product,
            productsContainer,
          );

        if (productsOnContainerFound)
          throw new HttpException(
            `Produto ${product.code} já está no container ${container}, linha ${row}`,
            HttpStatus.BAD_REQUEST,
          );

        await prisma.productsOnContainer.create({
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
      }
    });

    return entriesData;
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

  async exitProductByExcelFile(file: any) {
    const exitsData = await this.excelService.readExitProductExcelFile(file);

    await this.prismaService.$transaction(async (prisma) => {
      for (let index = 0; index < exitsData.length; index++) {
        const rowIndex = index + 2;
        const row = exitsData[index];

        const { codeOrEan, stock, operator, quantity, observation, client } =
          row;

        const product = await this.getProductByCodeOrEan(codeOrEan);

        let stockId: any;
        try {
          stockId = getStockId(stock);
        } catch {
          stockId = undefined;
        }

        if (!stockId)
          throw new HttpException(
            `Estoque não encontrado na linha ${rowIndex}`,
            HttpStatus.BAD_REQUEST,
          );

        if (
          (stockId === Stock.LOJA && product.lojaQuantity < quantity) ||
          (stockId === Stock.GALPAO && product.galpaoQuantity < quantity)
        )
          throw new HttpException(
            `Quantidade insuficiente na linha ${rowIndex}`,
            HttpStatus.BAD_REQUEST,
          );

        await prisma.transaction.create({
          data: {
            product: {
              connect: {
                id: product.id,
              },
            },
            fromStock: stockId,
            exitAmount: quantity,
            type: TransactionType.EXIT,
            observation: observation,
            operator: operator,
            client: client,
            confirmed: true,
          },
        });

        await prisma.product.update({
          where: {
            id: product.id,
          },
          data: {
            [stockId == Stock.GALPAO ? 'galpaoQuantity' : 'lojaQuantity']: {
              decrement: quantity,
            },
          },
        });
      }
    });

    return exitsData;
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

  async devolutionProductByExcelFile(file: any) {
    const devolutionData =
      await this.excelService.readDevolutionsExcelFile(file);

    await this.prismaService.$transaction(async (prisma) => {
      for (let i = 0; i < devolutionData.length; i++) {
        const { codeOrEan, client, observation, operator, quantity, stock } =
          devolutionData[i];

        const product = await this.getProductByCodeOrEan(codeOrEan);

        if (!product)
          throw new HttpException(
            `Produto não encontrado na linha ${i + 2}`,
            HttpStatus.BAD_REQUEST,
          );

        await prisma.transaction.create({
          data: {
            product: {
              connect: {
                id: product.id,
              },
            },
            toStock: stock,
            entryAmount: quantity,
            type: TransactionType.DEVOLUTION,
            observation: observation,
            operator: operator,
            client: client,
            confirmed: true,
          },
        });

        await prisma.product.update({
          where: {
            id: product.id,
          },
          data: {
            [stock == Stock.GALPAO ? 'galpaoQuantity' : 'lojaQuantity']: {
              increment: quantity,
            },
          },
        });
      }
    });

    return devolutionData;
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

  async transferProductByExcelFile(file: any) {
    const transferData = await this.excelService.readTransferExcelFile(file);

    await this.prismaService.$transaction(async (prisma) => {
      for (let index = 0; index < transferData.length; index++) {
        const rowIndex = index + 2;
        const row = transferData[index];

        const {
          codeOrEan,
          quantity,
          operator,
          location,
          observation,
          from,
          to,
        } = row;

        const product = await this.getProductByCodeOrEan(codeOrEan);

        if (!product)
          throw new HttpException(
            `Produto não encontrado na linha ${rowIndex}`,
            HttpStatus.BAD_REQUEST,
          );

        return this.prismaService.transaction.create({
          data: {
            product: {
              connect: {
                id: product.id,
              },
            },
            fromStock: from,
            toStock: to,
            entryExpected: quantity,
            type: TransactionType.TRANSFERENCE,
            observation: observation,
            operator: operator,
            location: location,
            confirmed: false,
          },
        });
      }
    });

    return transferData;
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
        where: {
          ...where,
          confirmed: true,
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
      where,
    });

    return {
      page,
      total: total,
      data: productsOnContainer,
    };
  }
}
