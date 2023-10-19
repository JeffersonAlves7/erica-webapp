import { HttpException, HttpStatus } from "@nestjs/common";

export class PageMaxLimitError extends HttpException {
  constructor(limit: number) {
    super(`Maximum limit id ${limit}`, HttpStatus.BAD_REQUEST);
  }
}