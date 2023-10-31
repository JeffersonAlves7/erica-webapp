import { Stock } from 'src/types/stock.enum';

export function getStockId(stock: string): Stock {
  switch (stock.toLowerCase().trim().replace(/\s/g, '')) {
    case 'galpao':
      return Stock.GALPAO;
    case 'galpão':
      return Stock.GALPAO;
    case 'loja':
      return Stock.LOJA;
  }
  throw new Error('Estoque não encontrado');
}

export function getStockIdOrUndefined(stock?: string): Stock | undefined {
  if(!stock) return undefined;

  switch (stock.toLowerCase().trim().replace(/\s/g, '')) {
    case 'galpao':
      return Stock.GALPAO;
    case 'galpão':
      return Stock.GALPAO;
    case 'loja':
      return Stock.LOJA;
  }
  return undefined;
}
