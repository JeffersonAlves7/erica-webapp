import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsInvalidDateError } from 'src/error/reports.errors';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('reports')
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @UseGuards(AuthGuard)
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

  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('exit/info')
  exitReportsInfo(@Query() query: { day?: string }) {
    let { day }: any = query;

    if (day) {
      day = new Date(day);
      if (isNaN(day.getTime())) throw new ReportsInvalidDateError();
    } else {
      day = new Date();
    }

    return this.reportsService.exitReportsInfo(day);
  }

  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('stock-minimum')
  stockMinimumReports(
    @Query() query: { page?: string; limit?: string; percentage?: string },
  ) {
    let { page, limit, percentage } = query as any;

    page = page ? parseInt(page) : 1;
    limit = limit ? parseInt(limit) : 1;
    percentage = percentage ? Number(percentage) / 100 : 0.5;
    if (limit > 100) limit = 100;

    return this.reportsService.stockMinimumReports({ page, limit, percentage });
  }

  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('sales-of-period')
  salesOfPeriod(@Body() body: Record<string, number>) {
    return this.reportsService.salesOfPeriod({
      month: body.month,
      year: body.year,
    });
  }

  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('month-entry-report')
  monthEntryReport() {
    return this.reportsService.monthlyEntryReport();
  }

  // @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('movimentations-stock-report')
  movimentationsStock(@Body() body: Record<string, number>): Promise<any[]> {
    return this.reportsService.movimentationsStock({
      month: body.month,
      year: body.year,
    });
  }
}
