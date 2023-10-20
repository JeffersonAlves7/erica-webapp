import {PageableParams } from 'src/types/pageable.interface';
import { Stock } from 'src/types/stock.enum';

export interface CreateReserveParmas {
  client: string;
  codeOrEan: string;
  quantity: number;
  operator: string;
  observation: string;
  stock: Stock;
}

export interface ConfirmReserveParams {}

export interface GetReservesParams extends PageableParams {
  confirmed?: boolean;
  search?: string;
  stock: Stock | undefined;
}
