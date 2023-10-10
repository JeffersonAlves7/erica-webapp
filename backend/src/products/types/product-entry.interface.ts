export interface ProductEntry {
  codeOrEan: string;
  quantity: number;
  container: string;
  importer: string;
  operator: string;
  observation?: string;
}
