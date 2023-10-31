import { Stock } from "@/types/stock.enum";
import { TransactionTypePT } from "@/types/transaction-type.enum";
import api from "./api";
import { Pageable } from "@/types/pageable.interface";

class TransactionService {
  async getAll(params: {
    page: number;
    limit: number;
    type?: TransactionTypePT | string;
    orderBy?: "desc" | "asc";
    code?: string;
    stock?: Stock | string;
    day?: Date
  }): Promise<Pageable<any>> {
    const response = await api.get("/transactions", { params });

    return {
      data: response.data.data,
      page: response.data.page,
      total: response.data.total
    };
  }

  async delete(id: number) {
    const response = await api.delete(`/transactions/${id}`);
    return response.data;
  }
}

export const transactionService = new TransactionService();
