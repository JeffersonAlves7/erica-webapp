import { Pageable, PageableParams } from "@/types/pageable.interface";
import api from "./api";
import { Stock } from "@/types/stock.enum";
import { Reserve } from "@/types/reserves.interface";

interface GetReservesParams extends PageableParams {
  search?: string;
  stock?: Stock;
}

interface CreateReserve {
  codeOrEan: string;
  quantity: number;
  stock: Stock | string;
  observation?: string;
  client: string;
  operator: string;
}

class ReservesService {
  async getReserves(params: GetReservesParams): Promise<Pageable<Reserve>> {
    const { limit, page } = params;
    console.log("Aqui")
    const response = await api.get("/products/reserves", {
      params: {
        page,
        limit
      }
    });

    const reserves = response.data.data.map((reserve: any) => {
      const {
        id,
        operator,
        createdAt: date,
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
      total: response.data.total
    };
  }

  async createReserve(body: CreateReserve): Promise<any> {
    const response = await api.post("/products/reserve", body);

    return response.data;
  }
}

export const reservesService = new ReservesService();
