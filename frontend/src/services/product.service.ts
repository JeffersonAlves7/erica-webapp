import { Pageable, PageableParams } from "@/types/pageable.interface";
import api from "./api";
import { Importer } from "@/types/importer.enum";

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
  updatedAt: Date;
}

interface Container {
  id: string;
  importer: Importer;
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
  importer?: Importer | string
  search?: string // code, ean, description or container
  orderBy?: string // createdAt_ASC or createdAt_DESC
}

class ProductService {
  async getProducts(pageableParams: PageableParams): Promise<Pageable<any>> {
    const response = await api.get("/products", {
      params: pageableParams
    });

    if(response.status === 401) {
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

  async createEntry(productEntry: ProductEntry): Promise<EntryResponse> {
    const response = await api.post("/products/entry", productEntry);
    return response.data as EntryResponse;
  }
}

export const productService = new ProductService();
