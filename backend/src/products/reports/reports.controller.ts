import { Controller, Get, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsInvalidDateError } from 'src/error/reports.errors';

@Controller('reports')
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @HttpCode(HttpStatus.OK)
  @Get('exit')
  exitReports(@Query() query: Record<string, any>) {
    let { day } = query;
    if (day) {
      day = new Date(day);
      if (isNaN(day.getTime())) throw new ReportsInvalidDateError();
    } else {
      day = new Date();
    }

    return this.reportsService.exitReports(day);
  }

  @HttpCode(HttpStatus.OK)
  @Get('stock-minimum')
  stockMinimumReports() {
    return this.reportsService.stockMinimumReports();
  }
}
