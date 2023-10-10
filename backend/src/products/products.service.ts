import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  Container,
  Importer,
  Product,
  ProductsOnContainer,
  Stock,
} from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  Pageable,
  PageableParams,
} from 'src/types/pageable/pageable.interface';
import { ProductCreation } from './types/product-creation.interface';
import { ProductEntry } from './types/product-entry.interface';
import { EanUtils } from 'src/utils/ean-utils';

interface ProductServiceInterface {
  createProduct(productCreation: ProductCreation): Promise<Product>;
  getAllProductsByPage(
    pageableParams: PageableParams,
  ): Promise<Pageable<Product>>;
  entryProduct(productEntry: ProductEntry): Promise<ProductsOnContainer>;
  getAllEntriesByPage(
    pageableParams: PageableParams,
  ): Promise<Pageable<ProductsOnContainer>>;
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

  async createProduct(productCreation: ProductCreation): Promise<Product> {
    const productFound = await this.prismaService.product.findFirst({
      where: {
        importer: this.getImporterId(productCreation.importer),
        code: productCreation.code,
      },
    });

    if (productFound)
      throw new HttpException(`Product already exists`, HttpStatus.BAD_REQUEST);

    const product = await this.prismaService.product.create({
      data: {
        code: productCreation.code,
        ean: productCreation.ean,
        description: productCreation.description,
        importer: this.getImporterId(productCreation.importer),
      },
    });

    return product;
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

    const product = await this.prismaService.product.findFirst({
      where: EanUtils.isEan(productEntry.codeOrEan)
        ? {
            ean: productEntry.codeOrEan,
            importer: this.getImporterId(productEntry.importer),
          }
        : {
            code: productEntry.codeOrEan,
            importer: this.getImporterId(productEntry.importer),
          },
      include: {
        productsOnContainer: true,
      },
    });

    if (!product)
      throw new HttpException(`Product not found`, HttpStatus.BAD_REQUEST);

    const container = await this.findOrCreateContainer(productEntry.container);

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
        },
      });

    await this.prismaService.productsOnStock.create({
      data: {
        quantity: productEntry.quantity,
        product: {
          connect: {
            id: product.id,
          },
        },
        stock: Stock.GALPAO,
      },
    });

    return productsOnContainer;
  }

  async getAllEntriesByPage(
    pageableParams: PageableParams,
  ): Promise<Pageable<any>> {
    let { page, limit } = pageableParams;

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
        include: {
          product: true,
        },
      });

    return {
      page,
      total: productsOnContainer.length,
      data: productsOnContainer,
    };
  }

  /**
   * Find or create a container
   * @param container The container id
   * @returns
   */
  private async findOrCreateContainer(container: string): Promise<Container> {
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
