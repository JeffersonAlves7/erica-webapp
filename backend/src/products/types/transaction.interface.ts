import { Stock, TransactionType } from "@prisma/client";
import { PageableParams } from "src/types/pageable/pageable.interface";

export interface TransactionFilterParams {
  type?: TransactionType;
  orderBy?: string; // createdAt_ASC or createdAt_DESC
}

export interface TransferenceFilterParams extends PageableParams{
  orderBy?: string; // createdAt_ASC or createdAt_DESC
  confirmed?: boolean;
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
