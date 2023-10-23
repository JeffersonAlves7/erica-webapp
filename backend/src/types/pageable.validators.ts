import { IsNotEmpty, IsString } from 'class-validator';

export class PageableParams {
  @IsNotEmpty({ message: `Página não pode ser vazia` })
  page: number | string;

  @IsNotEmpty()
  @IsString()
  limit: number | string;
}
