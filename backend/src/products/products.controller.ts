import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
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
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductEntry } from './types/product.interface';

@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @UseGuards(AuthGuard)
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadExcelFile(@UploadedFile() file: any) {
    return this.productsService.uploadExcelFile(file);
  }

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
  @HttpCode(HttpStatus.CREATED)
  @Put(':id')
  updateProduct(@Param('id') id: string, @Body() body: Record<string, any>) {
    return this.productsService.update({
      id,
      ...body,
    });
  }

  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('info')
  getProductsInfo(@Query() query: Record<string, string>) {
    return this.productsService.getProductsInfo(query);
  }

  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('info/:id')
  getProduct(@Param('id') id: string) {
    return this.productsService.getProductById(id);
  }

  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('search/:search')
  searchProduct(@Param('search') search: string) {
    return this.productsService.searchProduct(search);
  }

  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @Patch('archive/:id')
  archiveProduct(@Param('id') id: string) {
    const idInt = parseInt(id);

    if (!idInt || !isFinite(idInt))
      throw new HttpException(`Id inválido`, HttpStatus.BAD_REQUEST);

    return this.productsService.toggleArchiveProduct(idInt);
  }

  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @Get('archive')
  getArchivedProducts(@Query() query: Record<string, any>) {
    return this.productsService.getArchivedProducts({
      limit: parseInt(query.limit),
      page: parseInt(query.page),
      importer: query.importer,
      code: query.code,
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
  @HttpCode(HttpStatus.CREATED)
  @Put('stock/:id')
  updateStock(@Param('id') id: string, @Body() body: Record<string, any>) {
    return this.productsService.updateStock({
      id,
      ...body,
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
  entryProduct(@Body() productEntry: ProductEntry) {
    return this.productsService.entryProduct(productEntry);
  }

  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post('entry/sheet')
  @UseInterceptors(FileInterceptor('file'))
  entryProductBySheet(@UploadedFile() file: any) {
    return this.productsService.entryProductByExcelFile(file);
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
  @Post('exit/sheet')
  @UseInterceptors(FileInterceptor('file'))
  exitProductBySheet(@UploadedFile() file: any) {
    return this.productsService.exitProductByExcelFile(file);
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
  @Post('devolution/sheet')
  @UseInterceptors(FileInterceptor('file'))
  devolutionProductBySheet(@UploadedFile() file: any) {
    return this.productsService.devolutionProductByExcelFile(file);
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
  @HttpCode(HttpStatus.CREATED)
  @Post('transference/sheet')
  @UseInterceptors(FileInterceptor('file'))
  productTransferenceBySheet(@UploadedFile() file: any) {
    return this.productsService.transferProductByExcelFile(file);
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
}
