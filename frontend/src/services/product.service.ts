import { Pageable, PageableParams } from "@/types/pageable.interface";
import api from "./api";
import { Importer } from "@/types/importer.enum";
import { Stock } from "@/types/stock.enum";

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

interface ProductWithStock extends Pageable<any> {}

interface GetTransferencesQueryParams extends PageableParams {
  confirmed: boolean;
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

interface ExitProductParams {
  codeOrEan: string;
  quantity: number;
  operator: string;
  from: string;
  observation?: string;
}

class ProductService {
  async getProducts(pageableParams: PageableParams): Promise<Pageable<any>> {
    const response = await api.get("/products", {
      params: pageableParams
    });

    if (response.status === 401) {
      throw new Error("Unauthorized");
    }

    return response.data as Pageable<any>;
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

  async confirmTransferences(
    params: ConfirmTransferenceParams
  ) {
    return api.patch(`/products/transferences`, params);
  }

  async createEntry(productEntry: ProductEntry): Promise<EntryResponse> {
    const response = await api.post("/products/entry", productEntry);
    return response.data as EntryResponse;
  }

  async getAllProductsStock(
    pageableParams: ProductsWithStockFilterParams
  ): Promise<ProductWithStock> {
    const response = await api.get(`/products/stock`, {
      params: pageableParams
    });
    return response.data;
  }

  async getAllTransferences(
    pageableParams: GetTransferencesQueryParams
  ): Promise<Pageable<any>> {
    const response = await api.get(`/products/transferences`, {
      params: pageableParams
    });
    return response.data;
  }
}

export const productService = new ProductService();
