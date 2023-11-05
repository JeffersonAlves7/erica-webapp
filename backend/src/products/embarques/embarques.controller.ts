import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ConfirmEmbarquesDto,
  EmbarquesService,
  GetEmbarquesDto,
} from './embarques.service';
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
  @Get('/conferences/:id')
  getConferences(@Param('id') id: string) {
    return this.embarquesService.getConferences(id);
  }

  @UseGuards(AuthGuard)
  @Post('/conferences/confirm')
  confirmConference(@Body() body: ConfirmEmbarquesDto) {
    return this.embarquesService.confirmConference(body);
  }
}
