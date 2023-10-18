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