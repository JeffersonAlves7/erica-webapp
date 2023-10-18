import { HttpException, HttpStatus } from '@nestjs/common';

export class StockNotFoundError extends HttpException {
  constructor() {
    super('Estoque não encontrado', HttpStatus.BAD_REQUEST);
  }
}
