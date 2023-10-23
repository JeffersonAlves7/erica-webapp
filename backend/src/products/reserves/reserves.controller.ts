import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ReservesService } from './reserves.service';
import {
  ConfirmReserveDto,
  CreateReserveDto,
  GetReservesDto,
} from './reserves.validators';

@Controller('reserves')
export class ReservesController {
  constructor(private reservesService: ReservesService) {}

  @HttpCode(HttpStatus.OK)
  @Post('/confirm')
  confirmReserve(@Body() body: ConfirmReserveDto) {
    return this.reservesService.confirmReserve(body);
  }

  @HttpCode(HttpStatus.OK)
  @Post()
  createReserve(@Body() body: CreateReserveDto) {
    return this.reservesService.createReserve(body);
  }

  @HttpCode(HttpStatus.OK)
  @Get()
  getAllReserves(@Query() query: GetReservesDto) {
    return this.reservesService.getReservesByPage(query);
  }

  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  deleteReserve(@Param('id') id: string) {
    return this.reservesService.deleteReserve(parseInt(id));
  }
}
