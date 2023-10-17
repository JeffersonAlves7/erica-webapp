import { Stock, TransactionType } from '@prisma/client';
import { PageableParams } from 'src/types/pageable/pageable.interface';

export interface TransactionFilterParams extends PageableParams {
  type?: TransactionType;
  orderBy?: string; // createdAt_ASC or createdAt_DESC
  code?: string;
  toStock?: Stock;
}

export interface TransferenceFilterParams extends PageableParams {
  orderBy?: string; // createdAt_ASC or createdAt_DESC
  confirmed?: boolean;
  code?: string;
  selectAll?: boolean;
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
