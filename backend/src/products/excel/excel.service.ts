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

    const products = data.slice(2).map((row: any, rowIndex) => {
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

    const products = data.slice(2).map((row: any, rowIndex) => {
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
}
