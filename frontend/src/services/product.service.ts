import { Pageable, PageableParams } from "@/types/pageable.interface";
import api from "./api";
import { Importer } from "@/types/importer.enum";
import { Stock } from "@/types/stock.enum";
import { Operator } from "@/types/operator.enum";
import { ProductsWithStock } from "@/types/products.interface";
import { TransferenceConfirmation } from "@/types/transaction.interface";

interface ProductEntry {
  code: string;
  container: string;
  quantity: number;
  importer: Importer;
  operator: string;
  observation?: string;
  description?: string;
  ean?: string;
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

  async createRegister(body: {
    code: string;
    ean?: string;
    importer: string;
    description?: string;
  }) {
    const response = await api.post("/products/create", body);
    return response.data;
  }

  async createExit(productExit: {
    codeOrEan: string;
    quantity: number;
    from: string;
    observation?: string;
    operator: Operator | string;
    client: string;
  }) {
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
          ? pageableParams.stock != Stock.LOJA
            ? item.entries.reduce((previous: any, current: any) => {
                if (typeof previous == "number")
                  return previous + current.quantityReceived;
                return previous.quantityReceived + current.quantityReceived;
              }, 0)
            : item.entries.reduce((previous: any, current: any) => {
                if (typeof previous == "number")
                  return previous + current.exitAmount;
                return previous.exitAmount + current.exitAmount;
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
        ? item.galpaoQuantity +
          item.lojaQuantity +
          item.galpaoQuantityReserve +
          item.lojaQuantityReserve
        : pageableParams.stock == Stock.GALPAO
        ? item.galpaoQuantity + item.galpaoQuantityReserve
        : item.lojaQuantity + item.lojaQuantityReserve;

      let giro =
        pageableParams.stock != Stock.LOJA
          ? ((entradaSum - saldo) / entradaSum) * 100
          : 0;

      if (!isFinite(giro)) giro = 0;

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
        lojaLocation: item.lojaLocation,
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

  async createDevolution(body: {
    codeOrEan: string;
    quantity: number;
    client: string;
    operator: string;
    stock: Stock | string;
    observation?: string;
  }) {
    const response = await api.post(`/products/devolution`, body);
    return response.data;
  }

  async getArchivedProducts(
    query: { importer?: Importer | string; code?: string } & PageableParams
  ): Promise<Pageable<any>> {
    const { data } = await api.get("/products/archive", {
      params: query
    });

    return {
      page: data.page,
      data: data.data,
      total: data.total
    };
  }

  async archiveProduct(id: number) {
    const { data } = await api.patch("/products/archive/" + id);
    return data;
  }

  async getProductsinfo(stock?: Stock) {
    const { data } = await api.get("/products/info", {
      params: {
        stock
      }
    });

    return data;
  }
}

export const productService = new ProductService();
