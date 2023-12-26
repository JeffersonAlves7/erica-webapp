import { ExcelDownloadButton } from "@/components/buttons/excelButtons";
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
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
import { useRef } from "react";

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

export function RelatorioMovimentacoes() {
  const monthRef = useRef<HTMLSelectElement>(null);
  const yearRef = useRef<HTMLInputElement>(null);

  function selectPeriod() {}

  function handleDownload() {}

  return (
    <Stack w={"full"} maxW={"container.lg"}>
      <Flex justify={"space-between"} align={"start"} w={"full"}>
        <Flex align={"flex-end"} gap={6}>
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
        <ExcelDownloadButton onDownload={handleDownload} />
      </Flex>

      <Flex
        align={"center"}
        justify={"space-between"}
        gap={10}
        wrap={"wrap"}
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
              <Tr>
                <Td>Produto 1</Td>
                <Td>865</Td>
                <Td>10.67%</Td>
                <Td>A</Td>
                <Td>0</Td>
              </Tr>
            </Tbody>

            <Tfoot>
              <Tr>
                <Td roundedBottomLeft={"xl"} backgroundColor={"erica.green"}>
                  Total de 33 Produtos
                </Td>
                <Td backgroundColor={"erica.green"} roundedBottomRight={"xl"}>
                  8105 Caixas
                </Td>
              </Tr>
            </Tfoot>
          </Table>
        </TableContainer>

        <Stack gap={4} align={"center"} justify={"center"}>
          <Box p={2} rounded={"lg"} w={"full"} backgroundColor={"erica.green"}>
            {" "}
            Curva A | 80% 12 SKU's{" "}
          </Box>
          <Box p={2} rounded={"lg"} w={"full"} backgroundColor={"orange.400"}>
            {" "}
            Curva B | 15% 9 SKU's{" "}
          </Box>
          <Box p={2} rounded={"lg"} w={"full"} backgroundColor={"gray.400"}>
            {" "}
            Curva C | 5% 12 SKU's{" "}
          </Box>
        </Stack>
      </Flex>
    </Stack>
  );
}
