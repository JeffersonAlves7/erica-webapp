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

        let product = await this.prismaService.product.findFirst({
          where: {
            code,
          },
          select: {
            id: true,
            code: true,
            ean: true,
          },
        });

        if (!product) {
          if (ean) {
            let productByEan = await this.prismaService.product.findFirst({
              where: {
                ean,
              },
            });

            if (productByEan)
              throw new HttpException(
                `Ja existe um produto com o ean ${ean}, produto de código ${productByEan.code}`,
                HttpStatus.BAD_REQUEST,
              );
          }

          product = await prisma.product.create({
            data: {
              code,
              importer,
              ean,
              description,
            },
            select: {
              id: true,
              code: true,
              ean: true,
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
            `Produto ${product.code} já está no container ${lote}, linha ${index}`,
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

        // CRIANDO UMA ENTRADA JA QUE ELE JA ESTA EM ESTOQUE
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
      where.confirmed = status === 'true';
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
      },
    });

    return {
      page,
      data: containers,
      total,
    };
  }

  async getEmbarquesInfo({
    stock,
    importer,
    code,
    active,
    status,
  }: {
    stock?: Stock;
    importer?: Importer;
    code?: string;
    active?: 'true' | 'false';
    status?: 'true' | 'false';
  }) {
    const where = {
      active: '',
      code: '',
      importer: '',
      stock: '',
      status: '',
    };

    if (importer) where.importer = `p.importer = '${importer}'`;
    if (code) where.code = `p.code LIKE '${code}'`;

    if (active === 'true' || active == undefined) {
      where.active =
        stock == Stock.GALPAO
          ? `(p.galpao_quantity + p.galpao_quantity_reserve) <> 0`
          : stock == Stock.LOJA
          ? `(p.loja_quantity + p.loja_quantity_reserve) <> 0`
          : `(p.galpao_quantity + p.galpao_quantity_reserve + p.loja_quantity_reserve + p.loja_quantity) <> 0`;
    }

    if (status !== undefined) {
      // Em Estoque = True
      // A Caminho = False
      where.status = `poc.confirmed = ${status == 'true' ? 1 : 0}`;
    }

    const whereString = Object.values(where)
      .filter((v) => !!v)
      .join(' AND ');

    let totalQuantityQuery;
    let productsQuantityQuery;

    productsQuantityQuery = await this.prismaService.$queryRawUnsafe(`
      SELECT COUNT(*) as total
      FROM products_on_container AS poc
      INNER JOIN products AS p ON poc.product_id = p.id
      ${!!whereString ? 'WHERE ' + whereString : ''}
    `);

    totalQuantityQuery = await this.prismaService.$queryRawUnsafe(`
      SELECT SUM(quantity_expected) as total
      FROM products_on_container AS poc
      INNER JOIN products AS p ON poc.product_id = p.id
      ${!!whereString ? 'WHERE ' + whereString : ''}
    `);

    const productsQuantity = Number(productsQuantityQuery[0].total);
    const boxQuantity = Number(totalQuantityQuery[0].total);

    return {
      productsQuantity,
      boxQuantity,
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
