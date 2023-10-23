import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { AuthGuard } from 'src/auth/auth.guard';
import {
  TransactionNoTranserencesToConfirmError,
  TransactionMaxTransferencePerRequestError,
  TransactionTransferencesMustBeAnArrayError,
} from 'src/error/transaction.errors';
import { ProductInvalidProductsError } from 'src/error/products.errors';
import { PageMaxLimitError } from 'src/error/page.errors';

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
  @Delete(':id')
  deleteProduct(@Param('id') id: string) {
    return this.productsService.deleteProduct(parseInt(id));
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
      client: productExit.client,
      observation: productExit.observation,
      quantity: productExit.quantity,
      operator: productExit.operator,
    });
  }

  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post('devolution')
  devolutionProduct(@Body() productDevolution: Record<string, any>) {
    return this.productsService.devolutionProduct({
      client: productDevolution.client,
      codeOrEan: productDevolution.codeOrEan,
      operator: productDevolution.operator,
      quantity: productDevolution.quantity,
      stock: productDevolution.stock,
      observation: productDevolution.observation,
    });
  }

  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post('transference')
  productTransference(@Body() productTransference: Record<string, any>) {
    return this.productsService.transferProduct({
      codeOrEan: productTransference.codeOrEan,
      operator: productTransference.operator,
      observation: productTransference.observation,
      quantity: productTransference.quantity,
      location: productTransference.location,
    });
  }

  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Patch('transferences')
  async confirmTransferences(@Body() body: Record<string, any>) {
    const { transferences } = body;

    if (!transferences) throw new TransactionNoTranserencesToConfirmError();

    if (!Array.isArray(transferences))
      throw new TransactionTransferencesMustBeAnArrayError();

    const length = transferences.length;
    if (length === 0) throw new TransactionNoTranserencesToConfirmError();

    if (length > 100) throw new TransactionMaxTransferencePerRequestError();

    if (
      transferences.some(
        (transference) => !transference.id || !transference.entryAmount,
      )
    )
      throw new ProductInvalidProductsError();

    for (const product of transferences) {
      await this.productsService.confirmTransference({
        id: parseInt(product.id),
        entryAmount: parseInt(product.entryAmount),
        location: product.location,
      });
    }
  }

  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('transferences')
  getAllTransferences(@Query() query: Record<string, any>) {
    const { orderBy, code } = query;
    let { confirmed, page, limit } = query;

    const maxLimit = 100;
    confirmed = confirmed === 'true' ? true : false;

    if (!page) page = 1;
    if (!limit) limit = 10;
    if (limit > maxLimit) throw new PageMaxLimitError(maxLimit);

    return this.productsService.getAllTransferencesByPage({
      limit: Number(limit),
      page: Number(page),
      confirmed: confirmed,
      orderBy: orderBy,
      code: code,
    });
  }

  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @Delete('transaction/:id')
  deleteTransaction(@Param('id') id: string) {
    return this.productsService.deleteTransaction(parseInt(id));
  }

  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('transactions')
  getAllTransactions(@Query() query: Record<string, any>) {
    const { page, limit, type, orderBy, code, stock } = query;

    return this.productsService.getAllTransactionsByPage({
      page: Number(page),
      limit: Number(limit),
      type,
      orderBy,
      code,
      stock,
    });
  }
}
