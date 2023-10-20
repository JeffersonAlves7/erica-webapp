import { HttpException, HttpStatus } from "@nestjs/common";

export class ReportsInvalidDateError extends HttpException {
  constructor() {
    super('Data inválida', HttpStatus.BAD_REQUEST);
  }
}

export class ReportsDateIsRequiredError extends HttpException {
  constructor() {
    super('Data é obrigatória', HttpStatus.BAD_REQUEST);
  }
}