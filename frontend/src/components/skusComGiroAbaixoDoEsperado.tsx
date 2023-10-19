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

interface ProdutorPorGiro {
  sku: string;
  estoque: string;
  giroAtual: number;
  giroEsperado: number;
}

const exemploProdutoPorGiro: ProdutorPorGiro = {
  sku: "AZ-F001",
  estoque: "Galpão",
  giroAtual: 10,
  giroEsperado: 20
};

export function SkusComGiroAbaixoDoEsperado() {
  const [produtos, setProdutos] = useState<ProdutorPorGiro[]>([]);

  useEffect(() => {
    setProdutos([exemploProdutoPorGiro]);
  }, []);

  return (
    <Card minW={"550px"} flex={1}>
      <CardHeader>
        <Heading size={"md"}>
          Skus com giro abaixo do esperado no último mês
        </Heading>
      </CardHeader>
      <CardBody>
        <Table>
          <Thead>
            <Tr>
              <Th>Código</Th>
              <Th>Estoque</Th>
              <Th>Giro Atual</Th>
              <Th>Giro Esperado</Th>
            </Tr>
          </Thead>
          <Tbody>
            {produtos.map((produto) => (
              <Tr>
                <Td>{produto.sku}</Td>
                <Td>{produto.estoque}</Td>
                <Td>{produto.giroAtual}</Td>
                <Td>{produto.giroEsperado}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </CardBody>
    </Card>
  );
}
