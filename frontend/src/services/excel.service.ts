import api from "./api";
import * as ExcelJS from "exceljs";

class ExcelService {
  async uploadProductsEntries(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post("/products/entry/sheet", formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });

    return response.data;
  }

  async uploadProductsExit(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post("/products/exit/sheet", formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });

    return response.data;
  }

  async uploadProductTransfer(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post("/products/transference/sheet", formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });

    return response.data;
  }

  async uploadProductDevolution(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post("/products/devolution/sheet", formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });

    return response.data;
  }

  async uploadProductReserve(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post("/reserves/sheet", formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });

    return response.data;
  }

  async uploadProductEmbarques(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post("/embarques/sheet", formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });

    return response.data;
  }

  async downloadDataAsSheet(tableName: string, header: string[], rows: any[][]) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(tableName);

    worksheet.columns = header.map((h) => ({
      header: h,
      key: h
    }));

    rows.forEach(row => {
      worksheet.addRow(row);
    })

    const buffer = await workbook.xlsx.writeBuffer();

    const blob = new Blob([buffer], { type: "application/vnd.ms-excel" });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = tableName + ".xlsx";
    link.click();

    window.URL.revokeObjectURL(url);
    link.remove();
  }
}

export const excelService = new ExcelService();
