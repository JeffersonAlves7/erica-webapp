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

  async downloadProducts() {
    const products = [
      {
        code: "123",
        ean: "1234567891234",
        description: "Produto 1"
      },
      {
        code: "456",
        ean: "1234567891235",
        description: "Produto 2"
      },
      {
        code: "789",
        ean: "1234567891236",
        description: "Produto 3"
      }
    ];

    const headers = ["Código", "EAN", "Descrição"];
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Produtos");

    worksheet.columns = headers.map((header) => ({ header, key: header }));

    products.forEach((product) => {
      worksheet.addRow(Object.values(product));
    });

    // return workbook.xlsx.writeBuffer();
    const buffer = await workbook.xlsx.writeBuffer();
    // download the file using the browser's download file function

    const blob = new Blob([buffer], { type: "application/vnd.ms-excel" });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "products.xlsx";
    link.click();

    window.URL.revokeObjectURL(url);
    link.remove();
  }
}

export const excelService = new ExcelService();
