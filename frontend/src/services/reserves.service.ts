import { Pageable, PageableParams } from "@/types/pageable.interface";
import api from "./api";
import { Stock } from "@/types/stock.enum";
import { Reserve } from "@/types/reserves.interface";

interface GetReservesParams extends PageableParams {
  search?: string;
  stock?: Stock;
}

interface CreateReserveBody {
  codeOrEan: string;
  quantity: number;
  stock: Stock | string;
  observation?: string;
  client: string;
  date: Date | number;
  operator: string;
}

class ReservesService {
  async getReserves(
    params: GetReservesParams
  ): Promise<Pageable<Reserve> & { summary: any }> {
    const response = await api.get("/reserves", {
      params
    });

    const reserves = response.data.data.map((reserve: any) => {
      const {
        id,
        operator,
        exitDate: date,
        fromStock: stock,
        entryAmount: quantity,
        client,
        observation,
        product: { code }
      } = reserve;

      return {
        id,
        quantity,
        code,
        stock,
        client,
        date,
        operator,
        observation
      };
    });

    return {
      data: reserves,
      page: response.data.page,
      total: response.data.total,
      summary: response.data.summary
    };
  }

  async createReserve(body: CreateReserveBody): Promise<any> {
    const response = await api.post("/reserves", body);

    return response.data;
  }

  async confirmReserve(ids: number[]) {
    const response = await api.post(`/reserves/confirm`, {
      ids
    });
    return response.data;
  }
}

export const reservesService = new ReservesService();
