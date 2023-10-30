import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ConfirmEmbarquesDto, EmbarquesService, GetEmbarquesDto } from './embarques.service';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('embarques')
export class EmbarquesController {
  constructor(private embarquesService: EmbarquesService) {}

  @UseGuards(AuthGuard)
  @Post('sheet')
  @UseInterceptors(FileInterceptor('file'))
  uploadExcelFile(@UploadedFile() file: any) {
    return this.embarquesService.uploadExcelFile(file);
  }

  @UseGuards(AuthGuard)
  @Get()
  getEmbarques(@Query() getEmbarqueDto: GetEmbarquesDto) {
    return this.embarquesService.getEmbarques(getEmbarqueDto);
  }

  @UseGuards(AuthGuard)
  @Post('/conferences')
  changeToConference(@Body() body: Record<string, any>) {
    if (!body.ids || body.ids.some((id: any) => typeof id !== 'number'))
      throw new HttpException(`IDs inválidos`, HttpStatus.BAD_REQUEST);

    return this.embarquesService.toConference(body.ids);
  }

  @UseGuards(AuthGuard)
  @Get('/conferences')
  getConferences() {
    return this.embarquesService.getConferences();
  }

  @UseGuards(AuthGuard)
  @Post('/conferences/confirm')
  confirmConference(@Body() body: ConfirmEmbarquesDto) {
    return this.embarquesService.confirmConferenec(body);
  }
}
