import {
  IsArray,
  IsBooleanString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { PageableParams } from 'src/types/pageable.validators';
import { Stock } from 'src/types/stock.enum';

export class CreateReserveDto {
  @IsNotEmpty({ message: 'Cliente não pode ser vazio' })
  client: string;

  @IsNotEmpty({ message: 'Código ou EAN não pode ser vazio' })
  codeOrEan: string;

  @IsNotEmpty({ message: 'Quantidade não pode ser vazia' })
  quantity: number;

  @IsNotEmpty({ message: 'Operador não pode ser vazio' })
  operator: string;

  observation: string;

  @IsNotEmpty({ message: 'Data não pode ser vazia' })
  date: Date;

  @IsNotEmpty()
  stock: Stock | string;
}

export class ConfirmReserveDto {
  @IsNotEmpty({ message: 'Reserva não pode ser vazia' })
  @IsArray({ message: 'Reserva deve ser um array' })
  ids: number[];
}

export class GetReservesDto extends PageableParams {
  @IsOptional()
  @IsBooleanString()
  confirmed?: boolean;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  stock: Stock | undefined;
}

export class GetReservesSummaryDto {
  @IsOptional()
  stock: Stock | undefined;
}
