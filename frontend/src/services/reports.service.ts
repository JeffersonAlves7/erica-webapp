import { Pageable } from "@/types/pageable.interface";
import api from "./api";

class ReportsService {
  async getExitReports({
    page,
    day,
    limit
  }: {
    page: number;
    limit: number;
    day: Date;
  }): Promise<Pageable<any>> {
    const response = await api.get("/reports/exit", {
      params: {
        day: day.toISOString().slice(0, 10),
        limit,
        page
      }
    });

    return response.data;
  }

  async getStockMinimumReports({
    limit,
    page
  }: {
    page: number;
    limit: number;
  }): Promise<Pageable<any>> {
    const response = await api.get("/reports/stock-minimum", {
      params: {
        limit,
        page
      }
    });

    return response.data;
  }
}

export const reportsService = new ReportsService();
