import { Importer } from "@prisma/client";

export interface ProductEntry {
  codeOrEan: string;
  quantity: number;
  container: string;
  importer: string;
  operator: string;
  observation?: string;
}

export interface ProductCreation {
  code: string,
  ean?: string,
  description?: string,
  importer: string,
}

export interface EntriesFilterParams {
  importer?: Importer
  search?: string // code, ean, description or container
  orderBy?: string // createdAt_ASC or createdAt_DESC
}
