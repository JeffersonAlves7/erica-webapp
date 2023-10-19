import {
  Card,
  CardBody,
  CardHeader,
  Heading,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr
} from "@chakra-ui/react";
import { useEffect, useState } from "react";

interface ProdutoPorMovimentacao {
  sku: string;
  movimentacao: number;
}

const exemploProdutoPorMovimentacao: ProdutoPorMovimentacao = {
  sku: "AZ-B001",
  movimentacao: 15
};

export function SkusComMaiorMovimentacao() {
  const [produtos, setProdutos] = useState<ProdutoPorMovimentacao[]>([]);

  useEffect(() => {
    setProdutos([exemploProdutoPorMovimentacao]);
  }, []);

  return (
    <Card minW={"550px"} flex={1}>
      <CardHeader>
        <Heading size={"md"}>
          Skus com maior Movimentação nos últimos dias
        </Heading>
      </CardHeader>
      <CardBody>
        <Table>
          <Thead>
            <Tr>
              <Th>Código</Th>
              <Th>Movimentações</Th>
            </Tr>
          </Thead>
          <Tbody>
            {produtos.map((produto) => (
              <Tr>
                <Td>{produto.sku}</Td>
                <Td>{produto.movimentacao}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </CardBody>
    </Card>
  );
}
