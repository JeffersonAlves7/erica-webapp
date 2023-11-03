import {
  Box,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  TableContainer,
  Tbody,
  Td,
  Tfoot,
  Th,
  Thead,
  Tr
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { ExcelDownloadButton } from "../../components/buttons/excelButtons";
import { reportsService } from "@/services/reports.service";
import { PaginationSelector } from "../../components/selectors/paginationSelector";
import { handleError401 } from "@/services/api";
import {
  TransactionType,
  TransactionTypePT
} from "@/types/transaction-type.enum";
import { CustomTable } from "@/components/customTable";
import { excelService } from "@/services/excel.service";

interface ExitReport {
  code: string;
  type: string;
  quantity: number;
  client: string;
  operator: string;
  origin: string;
  observation: string;
}

export function ReportExit() {
  const [reports, setReports] = useState<ExitReport[]>([]);
  const [page, setPage] = useState(1);
  const [pageQuantity, setPageQuantity] = useState(0);
  const [day, setDay] = useState<Date>(new Date());
  const [exitInfo, setExitInfo] = useState<{
    devolutionAmount: number;
    exitAmount: number;
    productsAmount: number;
  }>({
    devolutionAmount: 0,
    exitAmount: 0,
    productsAmount: 0
  });

  const limitPerPage = 50;
  const lastPage = Math.ceil(pageQuantity / limitPerPage);

  const transformData = (data: any[]): ExitReport[] =>
    data.map<ExitReport>(
      ({
        client,
        product,
        exitAmount: quantityExit,
        entryAmount: quantityEntry,
        operator,
        fromStock,
        toStock,
        observation,
        type
      }) => ({
        client,
        code: product.code,
        observation,
        type: TransactionTypePT[type as keyof typeof TransactionTypePT],
        quantity: type == TransactionType.EXIT ? quantityExit : quantityEntry,
        operator,
        origin: type == TransactionType.EXIT ? fromStock : toStock
      })
    );

  async function searchInitialData(withPage: boolean = false) {
    const exitData = await reportsService.getExitReports({
      day: day,
      limit: limitPerPage,
      page
    });

    setReports(transformData(exitData.data));
    setPageQuantity(exitData.total);

    if (!withPage) {
      const exitInfo = await reportsService.getExitReportsinfo(day);
      setExitInfo(exitInfo);
    }
  }

  useEffect(() => {
    searchInitialData().catch((e) => handleError401(e));
  }, [day]);

  useEffect(() => {
    searchInitialData(true).catch((e) => handleError401(e));
  }, [page]);

  async function handleDownload() {
    const rows: any[][] = [];

    const headers = [
      ...document.querySelectorAll("#saidas-diarias thead th")
    ].map((th) => th.textContent || "");

    for (let page = 1; page <= lastPage; page++) {
      const { data } = await reportsService.getExitReports({
        day: day,
        limit: limitPerPage,
        page
      });

      transformData(data).forEach((d) => {
        rows.push([
          d.code,
          d.quantity,
          d.type,
          d.client,
          d.operator,
          d.origin,
          d.observation
        ]);
      });
    }

    excelService.downloadDataAsSheet("Relatório de saídas diárias", headers, rows);
  }

  async function handleChangePage(page: number) {
    setPage(page);
  }

  return (
    <Stack w={"full"} maxW={"container.xl"}>
      <Flex justify={"space-between"} align={"end"} w={"full"}>
        <Flex align={"end"} gap={5}>
          <Box width={"200px"}>
            <FormControl>
              <FormLabel>Dia</FormLabel>
              <Input
                onChange={(e) => {
                  const date = e.currentTarget.valueAsDate;
                  setDay(date || new Date());
                }}
                value={day.toISOString().slice(0, 10)}
                type="date"
                max={new Date().toISOString().slice(0, 10)}
              />
            </FormControl>
          </Box>
          <Heading size={"lg"}>Relatório de saídas diárias</Heading>
        </Flex>

        <ExcelDownloadButton onDownload={handleDownload} />
      </Flex>

      <TableContainer>
        <CustomTable id="saidas-diarias">
          <Thead>
            <Tr>
              <Th roundedTopLeft={"xl"} backgroundColor={"erica.green"}>
                Código
              </Th>
              <Th backgroundColor={"erica.green"}>Quantidade</Th>
              <Th backgroundColor={"erica.green"}>Operação</Th>
              <Th backgroundColor={"erica.green"}>Cliente</Th>
              <Th backgroundColor={"erica.green"}>Operador</Th>
              <Th backgroundColor={"erica.green"}>Origem</Th>
              <Th roundedTopRight={"xl"} backgroundColor={"erica.green"}>
                Observações
              </Th>
            </Tr>
          </Thead>

          <Tbody>
            {reports.map((row, index) => (
              <Tr key={`exit-by-day-${row.code}-${index}`}>
                <Td>{row.code}</Td>
                <Td>{row.quantity}</Td>
                <Td>{row.type}</Td>
                <Td>{row.client}</Td>
                <Td>{row.operator}</Td>
                <Td>{row.origin}</Td>
                <Td>{row.observation}</Td>
              </Tr>
            ))}
          </Tbody>

          <Tfoot>
            <Tr>
              <Td roundedBottomLeft={"xl"} backgroundColor={"erica.green"}>
                Total de {exitInfo.productsAmount} Produtos
              </Td>
              <Td backgroundColor={"erica.green"}>
                Total de {exitInfo.exitAmount + exitInfo.devolutionAmount}{" "}
                Movimentações
              </Td>
              <Td backgroundColor={"erica.green"}>
                Total de {exitInfo.exitAmount} Saídas
              </Td>
              <Td roundedBottomRight={"xl"} backgroundColor={"erica.green"}>
                Total de {exitInfo.devolutionAmount} Devoluções
              </Td>
            </Tr>
          </Tfoot>
        </CustomTable>
      </TableContainer>

      <PaginationSelector
        page={page}
        pageQuantity={lastPage}
        decreasePage={() => {
          if (page > 1) handleChangePage(page - 1);
        }}
        increasePage={() => {
          if (page < lastPage) handleChangePage(page + 1);
        }}
      />
    </Stack>
  );
}
