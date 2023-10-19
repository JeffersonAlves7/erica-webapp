import { HttpException, HttpStatus } from '@nestjs/common';

export class ContainerNotFoundError extends HttpException {
  constructor() {
    super('Container não encontrado', HttpStatus.BAD_REQUEST);
  }
}
