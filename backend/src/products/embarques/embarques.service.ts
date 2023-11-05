import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ExcelService } from '../excel/excel.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { Importer } from 'src/types/importer.enum';
import { PageableParamsEmpty } from 'src/types/pageable.validators';
import { Pageable } from 'src/types/pageable.interface';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { TransactionType } from 'src/types/transaction-type.enum';
import { Stock } from 'src/types/stock.enum';

export class GetEmbarquesDto extends PageableParamsEmpty {
  container: string | undefined;
  importer: Importer | undefined;
  codeOrEan: string | undefined;
  status: string;
}

class ConfirmEmbarque {
  @IsNotEmpty()
  @IsNumber()
  id: number;
  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  observation?: string;

  @IsNotEmpty()
  @IsString()
  operator: string;
}

export class ConfirmEmbarquesDto {
  @IsNotEmpty()
  embarques: ConfirmEmbarque[];
}

@Injectable()
export class EmbarquesService {
  constructor(
    private excelService: ExcelService,
    private prismaService: PrismaService,
  ) {}

  async uploadExcelFile(file: any) {
    const embarquesData = await this.excelService.readEmbarquesFile(file);
    let productCodes = embarquesData.map((embarque) => embarque.code);

    let productsWithCode = await this.prismaService.product.groupBy({
      by: ['code'],
      where: {
        code: {
          in: productCodes,
        },
      },
      _count: {
        code: true,
      },
      orderBy: {
        _count: {
          code: 'desc', // Ordene pela quantidade de aparições em ordem decrescente
        },
      },
    });

    const selectedProductCodes = productsWithCode.map(
      (product) => product.code,
    );

    productCodes = null;
    productsWithCode = null;

    await this.prismaService.$transaction(async (prisma) => {
      for (let index = 0; index < embarquesData.length; index++) {
        const row = embarquesData[index];

        const {
          code,
          dataDeEmbarque,
          description,
          importer,
          lote,
          quantity,
          status,
          ean,
        } = row;

        if (!selectedProductCodes.includes(code)) {
          var product = await prisma.product.create({
            data: {
              code,
              importer,
              ean,
              description,
            },
            select: {
              id: true,
              code: true,
            },
          });
        } else {
          var product = await prisma.product.findFirst({
            where: {
              code,
            },
            select: {
              id: true,
              code: true,
            },
          });
        }

        const productsContainer = await prisma.container.upsert({
          where: {
            id: lote,
          },
          update: {},
          create: {
            id: lote,
          },
        });

        const productsOnContainerFound =
          await prisma.productsOnContainer.findFirst({
            where: {
              productId: product.id,
              containerId: lote,
            },
          });

        if (productsOnContainerFound)
          throw new HttpException(
            `Produto ${product.code} já está no container ${lote}, linha ${row}`,
            HttpStatus.BAD_REQUEST,
          );

        const isEntry = status === 'Em Estoque';

        await prisma.productsOnContainer.create({
          data: {
            quantityExpected: quantity,
            quantityReceived: isEntry ? quantity : 0,
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
            confirmed: isEntry,
            embarqueAt: dataDeEmbarque,
          },
          include: {
            product: true,
            container: true,
          },
        });

        if (!isEntry) continue;

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
            operator: 'Erica',
            toStock: Stock.GALPAO,
            entryAmount: quantity,
            type: TransactionType.ENTRY,
            confirmed: true,
          },
        });
      }
    });

    return embarquesData;
  }

  async getEmbarques(getEmbarqueDto: GetEmbarquesDto): Promise<Pageable<any>> {
    let { codeOrEan, container, importer, limit, page, status } =
      getEmbarqueDto;
    limit = Number(limit);

    limit = typeof limit == 'number' ? limit : parseInt(limit);
    page = typeof page == 'number' ? page : parseInt(page);

    if (isNaN(limit) || !limit || limit > 100) limit = 100;
    if (isNaN(page) || !page) page = 1;

    const where: any = {};

    if (container)
      where.containerId = {
        contains: container,
      };

    if (codeOrEan) {
      where.product = {
        OR: [
          {
            code: {
              contains: codeOrEan,
            },
          },
          {
            ean: {
              contains: codeOrEan,
            },
          },
        ],
      };
    }

    if (importer) where.product = { ...where.product, importer };

    if (status) {
      where.confirmed = status === "true";
    }

    const containers = await this.prismaService.productsOnContainer.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where: {
        ...where,
      },
      select: {
        id: true,
        quantityExpected: true,
        embarqueAt: true,
        arrivalAt: true,
        confirmed: true,
        containerId: true,
        product: {
          select: {
            id: true,
            code: true,
            ean: true,
            importer: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const total = await this.prismaService.productsOnContainer.count({
      where: {
        ...where,
        confirmed: false,
      },
    });

    return {
      page,
      data: containers,
      total,
    };
  }

  async getConferences(containerId: string) {
    return this.prismaService.productsOnContainer.findMany({
      where: {
        containerId,
        confirmed: false,
      },
      select: {
        id: true,
        quantityExpected: true,
        embarqueAt: true,
        confirmed: true,
        containerId: true,
        product: {
          select: {
            id: true,
            code: true,
            ean: true,
            importer: true,
          },
        },
      },
    });
  }

  async confirmConference({ embarques }: ConfirmEmbarquesDto) {
    await this.prismaService.$transaction(async (prisma) => {
      for (let i = 0; i < embarques.length; i++) {
        const { id, operator, quantity, observation } = embarques[i];

        const productOnContainer = await prisma.productsOnContainer.update({
          where: {
            id,
          },
          data: {
            observation,
            confirmed: true,
            quantityReceived: quantity,
            arrivalAt: new Date(),
          },
          select: {
            id: true,
            productId: true,
            containerId: true,
          },
        });

        await prisma.product.update({
          where: {
            id: productOnContainer.productId,
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
                id: productOnContainer.productId,
              },
            },
            container: {
              connect: {
                id: productOnContainer.containerId,
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
  }
}
