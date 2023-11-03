import {
  Box,
  Flex,
  Heading,
  Stack,
  Table,
  TableContainer,
  Tbody,
  Td,
  Thead,
  Tr
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { ExcelDownloadButton } from "../../components/buttons/excelButtons";
import { reportsService } from "@/services/reports.service";
import { PaginationSelector } from "../../components/selectors/paginationSelector";
import { handleError401 } from "@/services/api";

interface StockMinimumReport {
  code: string;
  entryAmount: number;
  currentAmount: number;
  alertQuantity: number;
}

export function ReportStockMinimum() {
  const [reports, setReports] = useState<StockMinimumReport[]>([]);
  const [page, setPage] = useState(1);
  const [totalReports, setTotalReports] = useState(0);

  const reportLimit = 50;
  const totalPages = Math.ceil(totalReports / reportLimit);

  const transformData = (data: any[]): StockMinimumReport[] =>
    data.map<StockMinimumReport>(
      ({
        product_code,
        galpao_quantity,
        loja_quantity,
        container_quantity_received
      }) => ({
        alertQuantity: container_quantity_received * 0.5,
        code: product_code,
        entryAmount: container_quantity_received,
        currentAmount: galpao_quantity + loja_quantity
      })
    );

  const percentageLocalStorage = localStorage.getItem("alerta-porcentagem");
  const percentage = percentageLocalStorage ? Number(percentageLocalStorage) : 50;

  useEffect(() => {
    reportsService
      .getStockMinimumReports({
        limit: reportLimit,
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

  function handleDownloadExit() {
    // download logic
  }

  function handleChangePage(newPage: number) {
    if (!(newPage >= 1 && newPage <= totalPages)) return;
    setPage(newPage);
  }

  return (
    <Stack w={"full"} maxW={"container.xl"}>
      <Flex justify={"space-between"} align={"center"} w={"full"}>
        <Heading size={"lg"}>
          Relatório de Sku's com o Estoque mínimo atingido
        </Heading>
        <ExcelDownloadButton onDownload={handleDownloadExit} />
      </Flex>
      
      <p>Porcentagem para alerta: {percentage}%</p>

      <TableContainer>
        <Table>
          <Thead>
            <Tr>
              <Td roundedTopLeft={"xl"} backgroundColor={"erica.green"}>
                Código
              </Td>
              <Td backgroundColor={"erica.green"}>Quantidade de Entrada</Td>
              <Td backgroundColor={"erica.green"}>Saldo atual</Td>
              <Td roundedTopRight={"xl"} backgroundColor={"erica.green"}>
                Quantidade de alerta
              </Td>
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
        </Table>
      </TableContainer>

      <PaginationSelector
        page={page}
        pageQuantity={totalPages}
        decreasePage={() => handleChangePage(page - 1)}
        increasePage={() => handleChangePage(page + 1)}
      />
    </Stack>
  );
}
