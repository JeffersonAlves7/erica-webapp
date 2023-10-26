import { Controller, Get, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsInvalidDateError } from 'src/error/reports.errors';

@Controller('reports')
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @HttpCode(HttpStatus.OK)
  @Get('exit')
  exitReports(@Query() query: { day?: string; page?: string; limit?: string }) {
    let { day, limit, page }: any = query;

    if (day) {
      day = new Date(day);
      if (isNaN(day.getTime())) throw new ReportsInvalidDateError();
    } else {
      day = new Date();
    }

    if (!limit) limit = 10;
    else if (limit > 100) limit = 100;

    if (!page) page = 1;

    return this.reportsService.exitReports({
      day,
      limit: !limit ? 10 : parseInt(limit),
      page: !page ? 10 : parseInt(page),
    });
  }

  @HttpCode(HttpStatus.OK)
  @Get('stock-minimum')
  stockMinimumReports(@Query() query: { page?: string; limit?: string }) {
    let { page, limit } = query as any;
    page = page ? parseInt(page) : 1;
    limit = limit ? parseInt(limit) : 1;
    if (limit > 100) limit = 100;

    return this.reportsService.stockMinimumReports({ page, limit });
  }
}
