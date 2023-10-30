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
  status: any | undefined;
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

    console.log(embarquesData);
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

        await prisma.productsOnContainer.create({
          data: {
            quantityExpected: quantity,
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
            confirmed: false,
            embarqueAt: dataDeEmbarque,
          },
          include: {
            product: true,
            container: true,
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

    if (container) where.containerId = container;

    if (codeOrEan) {
      where.product = {
        OR: [
          {
            code: codeOrEan,
          },
          {
            ean: codeOrEan,
          },
        ],
      };
    }

    if (importer) where.product = { ...where.product, importer };

    const containers = await this.prismaService.productsOnContainer.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where: {
        ...where,
        confirmed: false,
        inConference: false,
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

  async getConferences() {
    return this.prismaService.productsOnContainer.findMany({
      where: {
        inConference: true,
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

  async toConference(ids: number[]) {
    const currentDate = new Date();

    return this.prismaService.productsOnContainer.updateMany({
      where: {
        id: {
          in: ids,
        },
      },
      data: {
        inConference: true,
        arrivalAt: currentDate,
      },
    });
  }

  async confirmConferenec({ embarques }: ConfirmEmbarquesDto) {
    console.log("Aqui");
    
    await this.prismaService.$transaction(async prisma => {
      for(let i = 0; i < embarques.length; i++){
        const { id, operator, quantity, observation} = embarques[i];

        const productOnContainer = await prisma.productsOnContainer.update({
          where: {
            id,
          },
          data: {
            observation,
            confirmed: true,
            inConference: false,
            quantityReceived: quantity,
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
    })
  }
}
