import { Stock } from '@prisma/client';

export function getStockId(stock: string): Stock {
  switch (stock.toLowerCase().trim().replace(/\s/g, '')) {
    case 'galpao':
      return Stock.GALPAO;
    case 'galpão':
      return Stock.GALPAO;
    case 'loja':
      return Stock.LOJA;
  }
  throw new Error('Stock not found');
}
