import { Stock, TransactionType } from "@prisma/client";

export interface TransactionFilterParams {
  type?: TransactionType;
  orderBy?: string; // createdAt_ASC or createdAt_DESC
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
