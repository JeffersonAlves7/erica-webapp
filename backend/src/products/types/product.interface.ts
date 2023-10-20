import { Importer } from 'src/types/importer.enum';
import { PageableParams } from 'src/types/pageable.interface';
import { Stock } from 'src/types/stock.enum';

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

export interface ProductWithLastEntryParams extends PageableParams {
  importer?: Importer;
  code?: string;
  stock?: Stock;
}

export interface ProductExit {
  codeOrEan: string;
  quantity: number;
  from: Stock;
  observation?: string;
  operator?: string;
  client: string;
}

export interface ProductTransference {
  codeOrEan: string;
  quantity: number;
  operator: string;
  observation?: string;
  location?: string;
}

export interface ProductDevolution {
  codeOrEan: string;
  quantity: number;
  client: string;
  operator: string;
  stock: Stock;
  observation?: string;
}
