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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ReservesService } from './reserves.service';
import {
  ConfirmReserveDto,
  CreateReserveDto,
  GetReservesDto,
} from './reserves.validators';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('reserves')
export class ReservesController {
  constructor(private reservesService: ReservesService) {}

  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('/confirm')
  confirmReserve(@Body() body: ConfirmReserveDto) {
    return this.reservesService.confirmReserve(body);
  }

  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post()
  createReserve(@Body() body: CreateReserveDto) {
    return this.reservesService.createReserve(body);
  }

  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post('/sheet')
  @UseInterceptors(FileInterceptor('file'))
  createReserveBySheet(@UploadedFile() file: any) {
    return this.reservesService.createReservesByFile(file);
  }

  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get()
  getAllReserves(@Query() query: GetReservesDto) {
    return this.reservesService.getReservesByPage(query);
  }

  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  deleteReserve(@Param('id') id: string) {
    return this.reservesService.deleteReserve(parseInt(id));
  }
}
