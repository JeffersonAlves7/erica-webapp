import { Importer } from "./importer.enum";

export interface ProductsWithStock {
  id: number;
  sku: string;
  quantidadeEntrada: number;
  saldo: number;
  container: string;
  importadora: string;
  dataDeEntrada: Date | null;
  diasEmEstoque: number;
  giro: number;
  observacao?: string;
  lojaLocation?: string;
  firstEntryId?: string | number
}

export interface ProductTransaction {
  id: number;
  code: string;
  entryAmount: number;
  exitAmount: number;
  type: string;
  from: string;
  to: string;
  client: string;
  operator: string;
  createdAt: Date;
  observation?: string;
  product?: any;
}

export interface Product {
  id: number;
  code: string;
  ean: string;
  description: string;
  createdAt: Date;
  importer: Importer;
  updatedAt: Date;
  chineseDescription: string;
}