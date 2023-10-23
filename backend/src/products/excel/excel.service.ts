import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';

@Injectable()
export class ExcelService {
  async readExcelFile(file: any) {
    const workbook = new ExcelJS.Workbook();
    const buffer = Buffer.from(file.buffer);
    const loaded = await workbook.xlsx.load(buffer);

    const data = loaded.worksheets[0]
      .getSheetValues()
      .map((row: any) => row.slice(1));

    return { data };
  }
}
