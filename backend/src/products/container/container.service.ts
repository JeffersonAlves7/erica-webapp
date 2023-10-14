import { Injectable } from '@nestjs/common';
import { Container, Product, ProductsOnContainer } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ContainerService {
  constructor(private prismaService: PrismaService) {}

  async addProductToContainerOnEntry(
    prouct: Product,
    container: Container,
    quantity: number,
    observation?: string,
  ): Promise<ProductsOnContainer> {
    return this.prismaService.productsOnContainer.create({
      data: {
        quantityExpected: quantity,
        quantityReceived: quantity,
        product: {
          connect: {
            id: prouct.id,
          },
        },
        container: {
          connect: {
            id: container.id,
          },
        },
        observation
      },
      include: {
        product: true,
        container: true
      }
    });
  }

  async getProductOnContainer(product: Product, container: Container){
    return this.prismaService.productsOnContainer.findFirst({
      where: {
        productId: product.id,
        containerId: container.id
      },
    })

  }

  async findOrCreateContainer(container: string): Promise<Container> {
    return this.prismaService.container.upsert({
      where: {
        id: container,
      },
      update: {},
      create: {
        id: container,
      },
    });
  }
}
