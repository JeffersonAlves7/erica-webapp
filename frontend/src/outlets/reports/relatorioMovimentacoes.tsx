import { ExcelDownloadButton } from "@/components/buttons/excelButtons";
import { InputWithSearch } from "@/components/inputs/inputWithSearch";
import {
  Box,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Stack,
  Table,
  TableContainer,
  Tbody,
  Td,
  Tfoot,
  Thead,
  Tr
} from "@chakra-ui/react";

export function RelatorioMovimentacoes() {
  function handleDownload() {}

  return (
    <Stack w={"full"} maxW={"container.lg"}>
      <Flex justify={"space-between"} align={"start"} w={"full"}>
        <Flex gap={5} align={"start"}>
          <FormControl w={"max-content"}>
            <FormLabel>Data</FormLabel>
            <InputWithSearch onSearch={() => {}} type="date" maxW={200} />
          </FormControl>
          <Heading size={"lg"}>Relatório de Movimentações</Heading>
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
