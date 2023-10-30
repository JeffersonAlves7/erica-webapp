import { IsNotEmpty, IsString } from 'class-validator';

export class PageableParamsEmpty {
  page: number | string | undefined;
  limit: number | string | undefined;
}

export class PageableParams {
  @IsNotEmpty({ message: `Página não pode ser vazia` })
  page: number | string;

  @IsNotEmpty()
  @IsString()
  limit: number | string;
}
