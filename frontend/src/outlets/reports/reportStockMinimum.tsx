import {
  Flex,
  Heading,
  Stack,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { ExcelDownloadButton } from "../../components/buttons/excelButtons";
import { reportsService } from "@/services/reports.service";
import { PaginationSelector } from "../../components/selectors/paginationSelector";
import { handleError401 } from "@/services/api";
import { excelService } from "@/services/excel.service";
import { CustomTable } from "@/components/customTable";

interface StockMinimumReport {
  code: string;
  entryAmount: number;
  currentAmount: number;
  alertQuantity: number;
}

export function ReportStockMinimum() {
  const [reports, setReports] = useState<StockMinimumReport[]>([]);
  const [page, setPage] = useState(1);
  const [pageQuantity, setTotalReports] = useState(0);

  const limitPerPage = 50;
  const lastPage = Math.ceil(pageQuantity / limitPerPage);

  const percentageLocalStorage = localStorage.getItem("alerta-porcentagem");
  const percentage = percentageLocalStorage
    ? Number(percentageLocalStorage)
    : 50;

  const transformData = (data: any[]): StockMinimumReport[] =>
    data.map<StockMinimumReport>(
      ({
        product_code,
        galpao_quantity,
        loja_quantity,
        container_quantity_received
      }) => ({
        alertQuantity: container_quantity_received * (percentage / 100),
        code: product_code,
        entryAmount: container_quantity_received,
        currentAmount: galpao_quantity + loja_quantity
      })
    );

  useEffect(() => {
    reportsService
      .getStockMinimumReports({
        limit: limitPerPage,
        page,
        percentage
      })
      .then((response) => {
        setReports(transformData(response.data));
        setTotalReports(response.total);
      })
      .catch((error) => {
        handleError401(error);
      });
  }, []);

  async function handleDownload() {
    const rows: any[][] = [];

    const headers = [
      ...document.querySelectorAll("#relatorio-estoque-minimo thead th")
    ].map((th) => th.textContent || "");

    for (let page = 1; page <= lastPage; page++) {
      const { data } = await reportsService.getStockMinimumReports({
        limit: limitPerPage,
        page,
        percentage
      });

      transformData(data).forEach((d) => {
        rows.push([d.code, d.entryAmount, d.currentAmount, d.alertQuantity]);
      });
    }

    excelService.downloadDataAsSheet(
      "Relatório de Sku's com o Estoque mínimo atingido",
      headers,
      rows
    );
  }

  function handleChangePage(newPage: number) {
    if (!(newPage >= 1 && newPage <= lastPage)) return;
    setPage(newPage);
  }

  return (
    <Stack w={"full"} maxW={"container.xl"}>
      <Flex justify={"space-between"} align={"center"} w={"full"}>
        <Heading size={"lg"}>
          Relatório de Sku's com o Estoque mínimo atingido
        </Heading>
        <ExcelDownloadButton onDownload={handleDownload} />
      </Flex>

      <p>Porcentagem para alerta: {percentage}%</p>

      <TableContainer>
        <CustomTable id="relatorio-estoque-minimo">
          <Thead>
            <Tr>
              <Th roundedTopLeft={"xl"} backgroundColor={"erica.green"}>
                Código
              </Th>
              <Th backgroundColor={"erica.green"}>Quantidade de Entrada</Th>
              <Th backgroundColor={"erica.green"}>Saldo atual</Th>
              <Th roundedTopRight={"xl"} backgroundColor={"erica.green"}>
                Quantidade de alerta
              </Th>
            </Tr>
          </Thead>

          <Tbody>
            {reports.map((row, index) => {
              return (
                <Tr key={`stock-minimum-${row.code}-${index}`}>
                  <Td>{row.code}</Td>
                  <Td>{row.entryAmount}</Td>
                  <Td>{row.currentAmount}</Td>
                  <Td>{row.alertQuantity}</Td>
                </Tr>
              );
            })}
          </Tbody>
        </CustomTable>
      </TableContainer>

      <PaginationSelector
        page={page}
        pageQuantity={lastPage}
        decreasePage={() => handleChangePage(page - 1)}
        increasePage={() => handleChangePage(page + 1)}
      />
    </Stack>
  );
}
