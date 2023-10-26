import {
  Box,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  Table,
  TableContainer,
  Tbody,
  Td,
  Tfoot,
  Thead,
  Tr
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { ExcelDownloadButton } from "../../components/buttons/excelButtons";
import { reportsService } from "@/services/reports.service";
import { PaginationSelector } from "../../components/selectors/paginationSelector";
import { handleError401 } from "@/services/api";

interface ExitReport {
  code: string;
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

  const reportLimit = 50;
  const pageLimit = Math.ceil(pageQuantity / reportLimit);

  const transformData = (data: any[]): ExitReport[] =>
    data.map<ExitReport>(
      ({
        client,
        product,
        exitAmount: quantity,
        operator,
        fromStock,
        observation
      }) => ({
        client,
        code: product.code,
        observation,
        quantity,
        operator,
        origin: fromStock
      })
    );

  useEffect(() => {
    reportsService
      .getExitReports({
        day: day,
        limit: reportLimit,
        page
      })
      .then((response) => {
        setReports(transformData(response.data));
        setPageQuantity(response.total);
      })
      .catch((error) => {
        handleError401(error);
      });
  }, [day]);

  function handleDownloadExit() {}

  function handleChangePage(page: number) {
    setPage(page);
  }
  console.log()
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
              />
            </FormControl>
          </Box>
          <Heading size={"lg"}>Relatório de saídas diárias</Heading>
        </Flex>

        <ExcelDownloadButton onDownload={handleDownloadExit} />
      </Flex>

      <TableContainer>
        <Table>
          <Thead>
            <Tr>
              <Td roundedTopLeft={"xl"} backgroundColor={"erica.green"}>
                Código
              </Td>
              <Td backgroundColor={"erica.green"}>Quantidade</Td>
              <Td backgroundColor={"erica.green"}>Cliente</Td>
              <Td backgroundColor={"erica.green"}>Operador</Td>
              <Td backgroundColor={"erica.green"}>Origem</Td>
              <Td roundedTopRight={"xl"} backgroundColor={"erica.green"}>
                Observações
              </Td>
            </Tr>
          </Thead>

          <Tbody>
            {reports.map((row, index) => {
              return (
                <Tr key={`exit-by-day-${row.code}-${index}`}>
                  <Td>{row.code}</Td>
                  <Td>{row.quantity}</Td>
                  <Td>{row.client}</Td>
                  <Td>{row.operator}</Td>
                  <Td>{row.origin}</Td>
                  <Td>{row.observation}</Td>
                </Tr>
              );
            })}
          </Tbody>

          <Tfoot>
            <Tr>
              <Td roundedBottomLeft={"xl"} backgroundColor={"erica.green"}>
                Total de {[...new Set(reports.map((c) => c.code))].length}{" "}
                Produtos
              </Td>
              <Td roundedBottomRight={"xl"} backgroundColor={"erica.green"}>
                {reports.reduce((previous, current) => {
                  return previous + current.quantity;
                }, 0)}{" "}
                Caixas
              </Td>
            </Tr>
          </Tfoot>
        </Table>
      </TableContainer>

      <PaginationSelector
        page={page}
        pageQuantity={pageLimit}
        decreasePage={() => {
          if (page > 1) handleChangePage(page - 1);
        }}
        increasePage={() => {
          if (page < pageLimit) handleChangePage(page + 1);
        }}
      />
    </Stack>
  );
}
