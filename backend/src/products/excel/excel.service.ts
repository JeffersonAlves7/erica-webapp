import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import { Stock } from 'src/types/stock.enum';

@Injectable()
export class ExcelService {
  async readExcelFile(file: any): Promise<any[]> {
    try {
      const workbook = new ExcelJS.Workbook();
      const buffer = Buffer.from(file.buffer);
      const loaded = await workbook.xlsx.load(buffer);

      const data = loaded.worksheets[0]
        .getSheetValues()
        .map((row: any) => row.slice(1));

      return data;
    } catch {
      throw new HttpException(
        'Não foi possível ler o arquivo, tente novamente',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async readEntryProductExcelFile(file: any): Promise<
    {
      codeOrEan: string;
      observation?: string;
      quantity: number;
      operator: string;
      importer: string;
      container: string;
    }[]
  > {
    const data = await this.readExcelFile(file);

    const products = data.slice(2).map((row: any, index) => {
      const rowIndex = index + 2;

      const ean = row.at(0);
      const code = row.at(1);
      const quantity = row.at(2);
      const container = row.at(3);
      const importer = row.at(4);
      const operator = row.at(5);
      const observation = row.at(6);
      const codeOrEan = code ? code : ean;

      if (!quantity || typeof quantity !== 'number')
        throw new HttpException(
          `Quantidade não encontrada na linha ${rowIndex}`,
          HttpStatus.BAD_REQUEST,
        );

      if (!importer || typeof importer !== 'string')
        throw new HttpException(
          `Importadora não encontrado na linha ${rowIndex}`,
          HttpStatus.BAD_REQUEST,
        );

      if (!codeOrEan || typeof codeOrEan !== 'string')
        throw new HttpException(
          `Codigo ou ean não encontrado na linha ${rowIndex}`,
          HttpStatus.BAD_REQUEST,
        );

      if (!container || typeof container !== 'string')
        throw new HttpException(
          `Container não encontrado na linha ${rowIndex}`,
          HttpStatus.BAD_REQUEST,
        );

      if (!operator)
        throw new HttpException(
          `Operador não encontrado na linha ${rowIndex}`,
          HttpStatus.BAD_REQUEST,
        );

      return {
        codeOrEan,
        quantity,
        container,
        importer,
        operator,
        observation,
      };
    });

    return products;
  }

  async readExitProductExcelFile(file: any): Promise<
    {
      codeOrEan: string;
      quantity: number;
      operator: string;
      stock: Stock | string;
      client: string;
      observation?: string;
    }[]
  > {
    const data = await this.readExcelFile(file);

    const products = data.slice(2).map((row: any, index) => {
      const rowIndex = index + 2;
      const ean = row.at(0);
      const code = row.at(1);
      const quantity = row.at(2);
      const stock = row.at(3);
      const client = row.at(4);
      const operator = row.at(5);
      const observation = row.at(6);
      const codeOrEan = code ? code : ean;

      if (!quantity || typeof quantity !== 'number')
        throw new HttpException(
          `Quantidade não encontrada na linha ${rowIndex}`,
          HttpStatus.BAD_REQUEST,
        );

      if (!codeOrEan || typeof codeOrEan !== 'string')
        throw new HttpException(
          `Codigo ou ean não encontrado na linha ${rowIndex}`,
          HttpStatus.BAD_REQUEST,
        );

      if (!stock || typeof stock !== 'string')
        throw new HttpException(
          `Estoque de origem não encontrado na linha ${rowIndex}`,
          HttpStatus.BAD_REQUEST,
        );

      if (!operator || typeof operator !== 'string')
        throw new HttpException(
          `Operador não encontrado na linha ${rowIndex}`,
          HttpStatus.BAD_REQUEST,
        );

      if (!client || typeof client !== 'string')
        throw new HttpException(
          `Client não encontrado na linha ${rowIndex}`,
          HttpStatus.BAD_REQUEST,
        );

      return {
        codeOrEan,
        quantity,
        stock,
        client,
        operator,
        observation,
      };
    });

    return products;
  }

  async readTransferExcelFile(file: any): Promise<
    {
      codeOrEan: string;
      quantity: number;
      from: Stock | string;
      to: Stock | string;
      location: string;
      operator: string;
      observation: string;
    }[]
  > {
    const data = await this.readExcelFile(file);

    const products = data.slice(2).map((row: any, index) => {
      const rowIndex = index + 2;
      
      const ean = row.at(0);
      const code = row.at(1);
      const quantity = row.at(2);
      const from = row.at(3);
      const to = row.at(4);
      const location = row.at(5);
      const operator = row.at(6);
      const observation = row.at(7);

      const codeOrEan = code ? code : ean;

      if (!quantity || typeof quantity !== 'number')
        throw new HttpException(
          `Quantidade não encontrada na linha ${rowIndex}`,
          HttpStatus.BAD_REQUEST,
        );

      if (!codeOrEan || typeof codeOrEan !== 'string')
        throw new HttpException(
          `Codigo ou ean não encontrado na linha ${rowIndex}`,
          HttpStatus.BAD_REQUEST,
        );

      if (!from || typeof from !== 'string')
        throw new HttpException(
          `Estoque de origem não encontrado na linha ${rowIndex}`,
          HttpStatus.BAD_REQUEST,
        );

      if (
        from.toUpperCase() !== Stock.LOJA &&
        from.toUpperCase() !== Stock.GALPAO
      )
        throw new HttpException(
          `Estoque de origem inválido [${from}] na linha ${rowIndex}`,
          HttpStatus.BAD_REQUEST,
        );

      if (!to || typeof to !== 'string')
        throw new HttpException(
          `Estoque de destino não encontrado na linha ${rowIndex}`,
          HttpStatus.BAD_REQUEST,
        );

      if (to.toUpperCase() !== Stock.LOJA && to.toUpperCase() !== Stock.GALPAO)
        throw new HttpException(
          `Estoque de destino inválido [${to}] na linha ${rowIndex}`,
          HttpStatus.BAD_REQUEST,
        );

      if (!operator || typeof operator !== 'string')
        throw new HttpException(
          `Operador não encontrado na linha ${rowIndex}`,
          HttpStatus.BAD_REQUEST,
        );

      if (!to || typeof to !== 'string')
        throw new HttpException(
          `Estoque de Destino não encontrado na linha ${rowIndex}`,
          HttpStatus.BAD_REQUEST,
        );

      return {
        codeOrEan,
        quantity,
        from,
        to,
        operator,
        observation,
        location,
      };
    });

    return products;
  }

  async readDevolutionsExcelFile(file: any): Promise<
    {
      codeOrEan: string;
      quantity: number;
      client: string;
      stock: Stock | string;
      operator: string;
      observation: string;
    }[]
  > {
    const data = await this.readExcelFile(file);

    const products = data.slice(2).map((row: any, index) => {
      const rowIndex = index + 2;

      const ean = row.at(0);
      const code = row.at(1);
      const quantity = row.at(2);
      const client = row.at(3);
      const stock = row.at(4);
      const operator = row.at(5);
      const observation = row.at(6);

      const codeOrEan = code ? code : ean;

      if (!client || typeof client !== 'string')
        throw new HttpException(
          `Cliente não encontrado na linha ${rowIndex}`,
          HttpStatus.BAD_REQUEST,
        );

      if (!quantity || typeof quantity !== 'number')
        throw new HttpException(
          `Quantidade não encontrada na linha ${rowIndex}`,
          HttpStatus.BAD_REQUEST,
        );

      if (!codeOrEan || typeof codeOrEan !== 'string')
        throw new HttpException(
          `Codigo ou ean não encontrado na linha ${rowIndex}`,
          HttpStatus.BAD_REQUEST,
        );

      if (!stock || typeof stock !== 'string')
        throw new HttpException(
          `Estoque de destino não encontrado na linha ${rowIndex}`,
          HttpStatus.BAD_REQUEST,
        );

      if (
        stock.toUpperCase() !== Stock.LOJA &&
        stock.toUpperCase() !== Stock.GALPAO
      )
        throw new HttpException(
          `Estoque de destino inválido [${stock}] na linha ${rowIndex}`,
          HttpStatus.BAD_REQUEST,
        );

      if (!operator || typeof operator !== 'string')
        throw new HttpException(
          `Operador não encontrado na linha ${rowIndex}`,
          HttpStatus.BAD_REQUEST,
        );

      if (!stock || typeof stock !== 'string')
        throw new HttpException(
          `Estoque de Destino não encontrado na linha ${rowIndex}`,
          HttpStatus.BAD_REQUEST,
        );

      return {
        codeOrEan,
        quantity,
        stock,
        operator,
        client,
        observation,
      };
    });
    return products;
  }

  async readReservesFile(file: any): Promise<
    {
      codeOrEan: string;
      quantity: number;
      client: string;
      stock: Stock | string;
      operator: string;
      dataDeSaida: Date;
      observation: string;
    }[]
  > {
    const data = await this.readExcelFile(file);

    const products = [];

    data.slice(2).forEach((row: any, index) => {
      if (row.length == 0) return;

      const rowIndex = index + 2;
      const ean = row.at(0);
      const code = row.at(1);
      const quantity = row.at(2);
      const stock = row.at(3);
      const client = row.at(4);
      const operator = row.at(5);
      const dataDeSaida = new Date(row.at(6));
      const observation = row.at(7);
      const codeOrEan = code ? code : ean;

      if (!client || typeof client !== 'string')
        throw new HttpException(
          `Cliente não encontrado na linha ${rowIndex}`,
          HttpStatus.BAD_REQUEST,
        );

      if (!quantity || typeof quantity !== 'number')
        throw new HttpException(
          `Quantidade não encontrada na linha ${rowIndex}`,
          HttpStatus.BAD_REQUEST,
        );

      if (!codeOrEan || typeof codeOrEan !== 'string')
        throw new HttpException(
          `Codigo ou ean não encontrado na linha ${rowIndex}`,
          HttpStatus.BAD_REQUEST,
        );

      if (
        !dataDeSaida ||
        (!(dataDeSaida instanceof Date) && typeof dataDeSaida !== 'string')
      )
        throw new HttpException(
          `Data de saída não encontrada na linha ${rowIndex}`,
          HttpStatus.BAD_REQUEST,
        );

      if (!stock || typeof stock !== 'string')
        throw new HttpException(
          `Estoque de destino não encontrado na linha ${rowIndex}`,
          HttpStatus.BAD_REQUEST,
        );

      if (
        stock.toUpperCase() !== Stock.LOJA &&
        stock.toUpperCase() !== Stock.GALPAO
      )
        throw new HttpException(
          `Estoque de destino inválido [${stock}] na linha ${rowIndex}`,
          HttpStatus.BAD_REQUEST,
        );

      if (!operator || typeof operator !== 'string')
        throw new HttpException(
          `Operador não encontrado na linha ${rowIndex}`,
          HttpStatus.BAD_REQUEST,
        );

      if (!stock || typeof stock !== 'string')
        throw new HttpException(
          `Estoque de Destino não encontrado na linha ${rowIndex}`,
          HttpStatus.BAD_REQUEST,
        );

      if (isNaN(dataDeSaida.valueOf()))
        throw new HttpException(
          `Data de saída inválida na linha ${rowIndex}`,
          HttpStatus.BAD_REQUEST,
        );

      const correctDate = new Date(
        `${dataDeSaida.getFullYear()}/${dataDeSaida.getMonth() + 1}/${
          dataDeSaida.getDate() + 1
        }`,
      );

      products.push({
        codeOrEan,
        quantity,
        stock,
        operator,
        client,
        dataDeSaida: correctDate,
        observation,
      });
    });

    return products;
  }
}
