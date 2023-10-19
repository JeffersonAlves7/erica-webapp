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

interface ProdutoPorEstoqueMinimo {
  sku: string;
  estoque: string;
  saldoAtual: number;
  saldoMinimo: number;
}

const exemploProdutoPorEstoqueMinimo: ProdutoPorEstoqueMinimo = {
  sku: "AZ-F001",
  estoque: "Galpão",
  saldoAtual: 10,
  saldoMinimo: 20
};

export function SkusComEstoqueMinimo() {
  const [produtos, setProdutos] = useState<ProdutoPorEstoqueMinimo[]>([]);

  useEffect(() => {
    setProdutos([exemploProdutoPorEstoqueMinimo])
  }, [])

  return (
    <Card minW={"550px"} flex={1}>
      <CardHeader>
        <Heading size={"md"}>Skus com estoque mínimo atingido</Heading>
      </CardHeader>
      <CardBody>
        <Table>
          <Thead>
            <Tr>
              <Th>Código</Th>
              <Th>Estoque</Th>
              <Th>Saldo Atual</Th>
              <Th>Saldo mínimo</Th>
            </Tr>
          </Thead>
          <Tbody>
            {produtos.map((produto) => (
              <Tr>
                <Td>{produto.sku}</Td>
                <Td>{produto.estoque}</Td>
                <Td>{produto.saldoAtual}</Td>
                <Td>{produto.saldoMinimo}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </CardBody>
    </Card>
  );
}
