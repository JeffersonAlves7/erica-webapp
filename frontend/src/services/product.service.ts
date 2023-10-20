import { Pageable, PageableParams } from "@/types/pageable.interface";
import api from "./api";
import { Importer } from "@/types/importer.enum";
import { Stock } from "@/types/stock.enum";
import { Operator } from "@/types/operator.enum";
import {
  ProductTransaction,
  ProductsWithStock
} from "@/types/products.interface";
import { TransferenceConfirmation } from "@/types/transaction.interface";

interface ProductEntry {
  codeOrEan: string;
  container: string;
  quantity: number;
  importer: Importer;
  operator: string;
  observation?: string;
}

interface Product {
  id: number;
  code: string;
  ean: string;
  description: string;
  createdAt: Date;
  importer: Importer;
  updatedAt: Date;
}

interface Container {
  id: string;
}

interface EntryResponse {
  id: number;
  containerId: string;
  productId: number;
  container: Container;
  quantityExpected: number;
  quantityReceived: number;
  observation: string;
  createdAt: Date;
  product: Product;
}

interface EntriesFilterParams {
  importer?: Importer | string;
  search?: string; // code, ean, description or container
  orderBy?: "desc" | "asc"; // createdAt_ASC or createdAt_DESC
}

interface ProductsWithStockFilterParams extends PageableParams {
  importer?: Importer | string;
  code?: string;
  stock?: Stock | string;
}

interface GetTransferencesQueryParams extends PageableParams {
  confirmed?: boolean;
  orderBy?: "desc" | "asc"; // createdAt_ASC or createdAt_DESC
}

interface GetTransactionsQueryParams extends PageableParams {
  orderBy?: "desc" | "asc"; // createdAt_ASC or createdAt_DESC
  code?: string | undefined;
  stock?: Stock | string | undefined;
}

interface CreateTransferenceParams {
  codeOrEan: string;
  quantity: number;
  operator: string;
  observation?: string;
  location?: string;
}

interface ConfirmTransferenceParams {
  transferences: { id: number; entryAmount: number; location?: string }[];
}

interface ProductExit {
  codeOrEan: string;
  quantity: number;
  from: string;
  observation?: string;
  operator: Operator | string;
  client: string;
}

interface ProductDevolution {
  codeOrEan: string;
  quantity: number;
  client: string;
  operator: string;
  stock: Stock | string;
  observation?: string;
}

class ProductService {
  async getProducts(pageableParams: PageableParams): Promise<Pageable<any>> {
    const response = await api.get("/products", {
      params: pageableParams
    });

    return response.data as Pageable<any>;
  }

  async deleteProduct(id: number) {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  }

  async getEntries(
    pageableParams: PageableParams & EntriesFilterParams
  ): Promise<Pageable<EntryResponse>> {
    const response = await api.get("/products/entries", {
      params: pageableParams
    });

    return response.data;
  }

  async getTransactions(
    pageableParams: GetTransactionsQueryParams
  ): Promise<Pageable<ProductTransaction>> {
    const response = await api.get("/products/transactions", {
      params: pageableParams
    });

    const items = response.data.data.map((transaction: any, index: number) => {
      return {
        id: transaction.id,
        code: transaction.product.code,
        entryAmount: transaction.entryAmount,
        exitAmount: transaction.exitAmount,
        type: transaction.type,
        from: transaction.fromStock,
        to: transaction.toStock,
        client: transaction.client,
        operator: transaction.operator,
        createdAt: transaction.createdAt,
        observation: transaction.observation,
        product: index == 0 ? transaction.product : undefined
      };
    });

    return {
      data: items,
      page: response.data.page,
      total: response.data.total
    };
  }

  async createTransference(data: CreateTransferenceParams) {
    const response = await api.post("/products/transference", data);
    return response.data;
  }

  async confirmTransferences(params: ConfirmTransferenceParams) {
    return api.patch(`/products/transferences`, params);
  }

  async createEntry(productEntry: ProductEntry): Promise<EntryResponse> {
    const response = await api.post("/products/entry", productEntry);
    return response.data as EntryResponse;
  }

  async createExit(productExit: ProductExit) {
    const response = await api.post("/products/exit", productExit);
    return response.data;
  }

  async getAllProductsStock(
    pageableParams: ProductsWithStockFilterParams
  ): Promise<Pageable<ProductsWithStock>> {
    const response = await api.get(`/products/stock`, {
      params: pageableParams
    });

    const data = response.data as Pageable<any>;

    const items = data.data.map((item: any) => {
      const entriesLength = item.entries.length;

      const entradaSum =
        entriesLength > 0
          ? item.entries.reduce((previous: any, current: any) => {
              if (typeof previous == "number")
                return previous + current.quantityReceived;
              return previous.quantityReceived + current.quantityReceived;
            }, 0)
          : 0;

      const containerNames =
        pageableParams.stock != Stock.LOJA
          ? item.entries.map((entry: any) => entry.containerId).join(", ")
          : "";

      const lastDate =
        item.entries.length > 0
          ? new Date(item.entries[item.entries.length - 1].createdAt)
          : null;

      const diasEmEstoque =
        lastDate != null
          ? Math.floor(
              (new Date().getTime() - lastDate.getTime()) / (1000 * 3600 * 24)
            )
          : 0;

      const saldo = !pageableParams.stock
        ? item.galpaoQuantity + item.lojaQuantity
        : pageableParams.stock == Stock.GALPAO
        ? item.galpaoQuantity
        : item.lojaQuantity;

      const giro =
        pageableParams.stock != Stock.LOJA
          ? diasEmEstoque > 0
            ? item.sales / diasEmEstoque
            : item.sales / 1
          : 0;

      const observacao = entriesLength > 0 ? item.entries[0].observation : "";

      return {
        id: item.id,
        sku: item.code,
        quantidadeEntrada: entradaSum,
        saldo,
        container: containerNames,
        importadora: item.importer,
        diasEmEstoque,
        dataDeEntrada: lastDate,
        giro,
        observacao
      };
    });

    return {
      page: data.page,
      data: items,
      total: data.total
    };
  }

  async getAllTransferences(
    pageableParams: GetTransferencesQueryParams
  ): Promise<Pageable<TransferenceConfirmation>> {
    const response = await api.get(`/products/transferences`, {
      params: pageableParams
    });

    const transferencias = response.data.data.map((transferencia: any) => {
      return {
        id: transferencia.id,
        sku: transferencia.product.code,
        quantidadeEsperada: transferencia.entryExpected,
        quantidadeVerificada: undefined,
        localizacao: transferencia.location
      };
    });

    return {
      data: transferencias,
      page: response.data.page,
      total: response.data.total
    };
  }

  async deleteTransaction(id: number) {
    const response = await api.delete(`/products/transaction/${id}`);
    return response.data;
  }

  async createDevolution(body: ProductDevolution){ 
    const response = await api.post(`/products/devolution`, body);
    return response.data;
  }
}

export const productService = new ProductService();
