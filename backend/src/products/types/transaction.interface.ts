import { Container, Product } from '@prisma/client';
import { PageableParams } from 'src/types/pageable.interface';
import { Stock } from 'src/types/stock.enum';
import { TransactionType } from 'src/types/transaction-type.enum';

export interface TransactionFilterParams extends PageableParams {
  confirmed?: boolean;
  type?: TransactionType;
  orderBy?: string; // createdAt_ASC or createdAt_DESC
  code?: string;
  stock?: Stock;
  day?: Date
}

export interface TransferenceFilterParams extends PageableParams {
  orderBy?: string; // createdAt_ASC or createdAt_DESC
  confirmed?: boolean;
  code?: string;
}

export interface TransactionCreation {
  productId: string; // code or ean
  fromSock?: Stock;
  toStock?: Stock;
  entryAmount?: number;
  outAmount?: number;
  type: TransactionType;
  observation?: string;
}

export interface EntryGalpaoParams {
  product: Product;
  container: Container;
  entryAmount: number;
  observation?: string;
  operator?: string;
}

export interface ExitParams {
  product: Product;
  fromStock: Stock;
  exitAmount: number;
  observation?: string;
  operator: string;
  client: string;
}

export interface LojaTransferParams {
  product: Product;
  entryAmount: number;
  operator: string;
  observation?: string;
  location?: string;
}

export interface ConfirmTransferenceParams {
  id: number;
  entryAmount: number;
  location?: string;
}
