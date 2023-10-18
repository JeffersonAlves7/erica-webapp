import { HttpException, HttpStatus } from '@nestjs/common';


export class ProductInvalidProductsError extends HttpException {
  constructor() {
    super('Produtos inválidos', HttpStatus.BAD_REQUEST);
  }
}

export class ProductNotFoundError extends HttpException {
  constructor() {
    super('Produto não encontrado', HttpStatus.BAD_REQUEST);
  }
}

export class ProductInsuficientStockError extends HttpException {
  constructor() {
    super('Estoque insuficiente', HttpStatus.BAD_REQUEST);
  }
}