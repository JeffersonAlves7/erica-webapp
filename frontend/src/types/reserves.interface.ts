import { Stock } from "./stock.enum";

export interface Reserve {
  id: number;
  quantity: number;
  code: string;
  stock: Stock;
  client: string;
  date: Date;
  operator: string;
  observation: string;
}

export interface ReserveSummary {
  products: number;
  galpao: number;
  loja: number;
}
