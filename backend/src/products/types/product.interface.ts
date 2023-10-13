import { Importer, Stock, TransactionType } from '@prisma/client';

export interface ProductEntry {
  codeOrEan: string;
  quantity: number;
  container: string;
  importer: string;
  operator: string;
  observation?: string;
}

export interface ProductCreation {
  code: string;
  ean?: string;
  description?: string;
  importer: Importer;
}

export interface EntriesFilterParams {
  importer?: Importer;
  search?: string; // code, ean, description or container
  orderBy?: string; // createdAt_ASC or createdAt_DESC
}

export interface ProductWithLastEntryParams {
  importer?: Importer;
  code?: string;
  stock?: Stock;
}

export interface ProductExit {
  codeOrEan: string;
  quantity: number;
  from: Stock;
  observation?: string;
}

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
