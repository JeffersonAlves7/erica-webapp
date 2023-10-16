import {
  Body,
  Controller,
  Delete,
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
      importer: productCreation.importer,
    });
  }

  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('stock')
  getAllProductsAndStock(@Query() query: Record<string, any>) {
    return this.productsService.getAllProductsAndStockByPage({
      page: Number(query.page),
      limit: Number(query.limit),
      importer: query.importer,
      code: query.code,
      stock: query.stock,
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
      page: Number(page),
      limit: Number(limit),
      importer,
      search,
      orderBy,
    });
  }

  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post('exit')
  exitProduct(@Body() productExit: Record<string, any>) {
    return this.productsService.exitProduct({
      codeOrEan: productExit.codeOrEan,
      from: productExit.from,
      observation: productExit.observation,
      quantity: productExit.quantity,
      operator: productExit.operator,
    });
  }

  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post('transference')
  productTransference(@Body() productTransference: Record<string, any>) {
    return this.productsService.transferProduct({
      code: productTransference.code,
      operator: productTransference.operator,
      observation: productTransference.observation,
      quantity: productTransference.quantity, 
    })
  }

  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('transference/confirm')
  confirmTransference(@Query() query: Record<string, any>){

  }

  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @Delete('transaction')
  deleteTransaction(@Query() query: Record<string, any>) {
    const { id } = query;
    return this.productsService.deleteTransaction(parseInt(id));
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
      orderBy,
    });
  }
}
