import { Pageable } from "@/types/pageable.interface";
import api from "./api";
import { Importer } from "@/types/importer.enum";

export interface EmbarquesResponse {
  id: number;
  quantityExpected: number;
  embarqueAt: Date;
  confirmed: boolean;
  containerId: string;
  arrivalAt: Date;
  product: {
    id: number;
    code: string;
    ean: string;
    importer: string;
  };
}

class EmbarquesService {
  async getEmbarques(queryParams: {
    codeOrEan?: string;
    importer?: Importer | string;
    status?: any;
    container?: string;
    page: number;
    limit: number;
  }): Promise<Pageable<EmbarquesResponse>> {
    const { data } = await api.get("/embarques", {
      params: queryParams
    });

    return {
      page: data.page,
      data: data.data,
      total: data.total
    };
  }

  async getEmbarqueConferences(
    containerId: string
  ): Promise<EmbarquesResponse[]> {
    const { data } = await api.get("/embarques/conferences/" + containerId);
    return data;
  }

  async confirmEmbarqueConference(
    embarques: {
      id: number;
      quantity: number;
      observation?: string;
      operator: string;
    }[]
  ): Promise<EmbarquesResponse[]> {
    const { data } = await api.post("/embarques/conferences/confirm", {
      embarques
    });

    return data;
  }
}

export const embarquesService = new EmbarquesService();