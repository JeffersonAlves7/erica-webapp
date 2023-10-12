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
import { ProductsService } from './products.service';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post('create')
  createProduct(@Body() productCreation: Record<string, any>) {
    return this.productsService.createProduct({
      code: productCreation.code,
      description: productCreation.description,
      ean: productCreation.ean,
    });
  }

  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get()
  getAllProducts(@Query() query: Record<string, any>) {
    return this.productsService.getAllProductsByPage({
      page: Number(query.page),
      limit: Number(query.limit),
    });
  }

  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post('entry')
  entryProduct(@Body() productEntry: Record<string, any>) {
    return this.productsService.entryProduct({
      codeOrEan: productEntry.codeOrEan,
      container: productEntry.container,
      importer: productEntry.importer,
      operator: productEntry.operator,
      observation: productEntry.observation,
      quantity: productEntry.quantity,
    });
  }

  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('entries')
  getAllEntries(@Query() query: Record<string, any>) {
    const { page, limit, importer, search, orderBy } = query;

    return this.productsService.getAllEntriesByPage({
      page: Number(query.page),
      limit: Number(query.limit),
      importer,
      search,
      orderBy
    });
  }

  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('transactions')
  getAllTransactions(@Query() query: Record<string, any>) {
    const { page, limit, type, orderBy } = query;

    return this.productsService.getAllTransactionsByPage({
      page: Number(page),
      limit: Number(limit),
      type,
      orderBy
    });
  }
}
