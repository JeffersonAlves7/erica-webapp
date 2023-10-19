import {
  Card,
  CardBody,
  CardHeader,
  Flex,
  Heading,
  Input,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr
} from "@chakra-ui/react";
import { useEffect, useState } from "react";

interface ProdutoPorSaida {
  sku: string;
  saidas: number;
  tipo: string;
  importadora: string;
}

const exampleProdutoPorSaida: ProdutoPorSaida = {
  sku: "AZ-F001",
  saidas: 15,
  tipo: "Cliente 1",
  importadora: "Attus Bloom"
};

export function SaidasPorData() {
  const [produtos, setProdutos] = useState<ProdutoPorSaida[]>([]);

  useEffect(() => {
    setProdutos([exampleProdutoPorSaida])
  }, [])

  return (
    <Card minW={"550px"} flex={1}>
      <CardHeader>
        <Flex align={"center"} gap={4}>
          <Heading size={"md"}>Saídas por data </Heading>
          <Input type="date" w={"30"} />
        </Flex>
      </CardHeader>
      <CardBody>
        <Table>
          <Thead>
            <Tr>
              <Th>Código</Th>
              <Th>Saídas</Th>
              <Th>Tipo</Th>
              <Th>Importadora</Th>
            </Tr>
          </Thead>
          <Tbody>
            {produtos.map((produto) => (
              <Tr>
                <Td>{produto.sku}</Td>
                <Td>{produto.saidas}</Td>
                <Td>{produto.tipo}</Td>
                <Td>{produto.importadora}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </CardBody>
    </Card>
  );
}
