import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Product } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  Pageable,
  PageableParams,
} from 'src/types/pageable/pageable.interface';
import { ProductCreation } from './types/product-creation.interface';

interface ProductServiceInterface {
  createProduct(productCreation: ProductCreation): Promise<Product>;
  getAllProductsByPage(
    pageableParams: PageableParams,
  ): Promise<Pageable<Product>>;
}

@Injectable()
export class ProductsService implements ProductServiceInterface {
  constructor(private prismaService: PrismaService) {}

  async createProduct(productCreation: ProductCreation): Promise<Product> {
    const product = await this.prismaService.product.create({
      data: {
        code: productCreation.code,
        ean: productCreation.ean,
        description: productCreation.description,
        importer: {
          connectOrCreate: {
            where: {
              id: productCreation.importer,
            },
            create: {
              id: productCreation.importer,
            },
          },
        },
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
}
