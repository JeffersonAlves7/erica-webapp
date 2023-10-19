import { PageableParams } from 'src/types/pageable.interface';
import { Stock } from 'src/types/stock.enum';
import { TransactionType } from 'src/types/transaction-type.enum';

export interface TransactionFilterParams extends PageableParams {
  type?: TransactionType;
  orderBy?: string; // createdAt_ASC or createdAt_DESC
  code?: string;
  stock?: Stock;
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
