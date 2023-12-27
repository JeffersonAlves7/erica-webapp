import { ExcelDownloadButton } from "@/components/buttons/excelButtons";
import { handleError401 } from "@/services/api";
import { excelService } from "@/services/excelService";
import {
  InterfaceMovimentationsStockReport,
  reportsService
} from "@/services/reportsService";
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Select,
  Stack,
  Table,
  TableContainer,
  Tbody,
  Td,
  Tfoot,
  Thead,
  Tr
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";

const months = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro"
];

const currentDate = new Date();
const currentMonth = currentDate.getMonth() + 1;
const currentYear = currentDate.getFullYear();

export function RelatorioMovimentacoes() {
  const [data, setData] = useState<InterfaceMovimentationsStockReport[]>([]);

  const monthRef = useRef<HTMLSelectElement>(null);
  const yearRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    monthRef.current!.value = currentMonth.toString();

    const runFetch = async () => {
      try {
        const response = await reportsService.movimentationsStockReport(
          currentMonth,
          currentYear
        );
        setData(response);
      } catch (e) {
        handleError401(e);
      }
    };

    runFetch();
  }, []);

  function selectPeriod() {
    const runFetch = async () => {
      try {
        const response = await reportsService.movimentationsStockReport(
          Number(monthRef.current!.value),
          Number(yearRef.current!.value)
        );

        setData(response);
      } catch (e) {
        handleError401(e);
      }
    };

    runFetch();
  }

  function handleDownload() {
    const rows: any[][] = data.map((d) => [
      // @ts-ignore
      ...Object.keys(d).map((k) => d[k])
    ]);

    const headers = [
      "Código",
      "Quantidade",
      "Participação",
      "Curva",
      "Estoque"
    ];

    excelService.downloadDataAsSheet(
      "Relatório de movimentações",
      headers,
      rows
    );
  }

  return (
    <Stack w={"full"} maxW={"container.lg"}>
      <Flex justify={"space-between"} align={"center"} w={"full"}>
        <Heading>Relatório de Movimentações</Heading>
        <ExcelDownloadButton onDownload={handleDownload} />
      </Flex>

      <Flex align={"flex-end"} gap={6} mb={6}>
        <FormControl w={"max-content"}>
          <FormLabel>Mês</FormLabel>
          <Select placeholder="Selecione o mês" ref={monthRef}>
            {months.map((month, index) => (
              <option key={index} value={index + 1}>
                {month}
              </option>
            ))}
          </Select>
        </FormControl>

        <FormControl w={150}>
          <FormLabel>Ano</FormLabel>
          <Input
            type="number"
            defaultValue={new Date().getFullYear()}
            ref={yearRef}
          />
        </FormControl>

        <Button background="erica.green" onClick={selectPeriod}>
          Selecionar
        </Button>
      </Flex>

      <Flex
        align={"center"}
        justify={"space-between"}
        gap={10}
        wrap={"wrap-reverse"}
        w="full"
      >
        <TableContainer>
          <Table id="relatorio-movimentacoes" overflow={"auto"}>
            <Thead>
              <Tr>
                <Td roundedTopLeft={"xl"} backgroundColor={"erica.green"}>
                  Código
                </Td>
                <Td backgroundColor={"erica.green"}>Quantidade</Td>
                <Td backgroundColor={"erica.green"}>Participação</Td>
                <Td backgroundColor={"erica.green"}>Curva</Td>
                <Td roundedTopRight={"xl"} backgroundColor={"erica.green"}>
                  Estoque
                </Td>
              </Tr>
            </Thead>

            <Tbody>
              {data.map((v) => (
                <Tr>
                  <Td>{v.code}</Td>
                  <Td>{v.quantity}</Td>
                  <Td>{v.participation}</Td>
                  <Td>{v.curve}</Td>
                  <Td>{v.stock}</Td>
                </Tr>
              ))}
            </Tbody>

            <Tfoot>
              <Tr>
                <Td roundedBottomLeft={"xl"} backgroundColor={"erica.green"}>
                  Total de {data.length} Produtos
                </Td>
                <Td backgroundColor={"erica.green"} roundedBottomRight={"xl"}>
                  {data.reduce((pre, cur) => pre + cur.quantity, 0)} Caixas
                </Td>
              </Tr>
            </Tfoot>
          </Table>
        </TableContainer>

        <Stack gap={4} align={"center"} justify={"center"}>
          <Box p={2} rounded={"lg"} w={"full"} backgroundColor={"erica.green"}>
            Curva A | 80% {data.filter((d) => d.curve == "A").length} SKU's
          </Box>
          <Box p={2} rounded={"lg"} w={"full"} backgroundColor={"orange.400"}>
            Curva B | 15% {data.filter((d) => d.curve == "B").length} SKU's
          </Box>
          <Box p={2} rounded={"lg"} w={"full"} backgroundColor={"gray.400"}>
            Curva C | 5% {data.filter((d) => d.curve == "C").length} SKU's
          </Box>
        </Stack>
      </Flex>
    </Stack>
  );
}
