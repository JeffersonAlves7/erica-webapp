import { Pageable } from "@/types/pageable.interface";
import api from "./api";

export interface InterfaceSalesOfPeriod {
  date: Date;
  exitAmount: number;
  devolutionAmount: number;
  difference: number;
}

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

  async getExitReportsinfo(day: Date) {
    const response = await api.get("/reports/exit/info", {
      params: {
        day: day.toISOString().slice(0, 10)
      }
    });

    return response.data;
  }

  async getStockMinimumReports(params: {
    page: number;
    limit: number;
    percentage: number;
  }): Promise<Pageable<any>> {
    const response = await api.get("/reports/stock-minimum", { params });

    return response.data;
  }

  async salesOfPeriod(params: { month: number; year: number }) {
    const response = await api.post("/reports/sales-of-period", params);
    return response.data as InterfaceSalesOfPeriod[];
  }
}

export const reportsService = new ReportsService();
