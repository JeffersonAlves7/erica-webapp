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
  operator?: string
}

export interface ProductTransference {
  code: string;
  quantity: number;
  operator: string;
  observation?: string;
}