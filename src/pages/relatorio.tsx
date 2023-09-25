import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Flex,
  Heading,
  Input,
  Stack,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr
} from "@chakra-ui/react";
import { useState } from "react";

interface ProdutoPorMovimentacao {
  sku: string;
  movimentacao: number;
}

const exemploProdutoPorMovimentacao: ProdutoPorMovimentacao = {
  sku: "AZ-B001",
  movimentacao: 15
};

function SkusComMaiorMovimentacao() {
  const [produtos, setProdutos] = useState<ProdutoPorMovimentacao[]>([
    exemploProdutoPorMovimentacao
  ]);

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

function SkusComEstoqueMinimo() {
  const [produtos, setProdutos] = useState<ProdutoPorEstoqueMinimo[]>([
    exemploProdutoPorEstoqueMinimo
  ]);

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

function SkusComGiroAbaixoDoEsperado() {
  const [produtos, setProdutos] = useState<ProdutorPorGiro[]>([
    exemploProdutoPorGiro
  ]);

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

function SaidasPorData() {
  const [produtos, setProdutos] = useState<ProdutoPorSaida[]>([
    exampleProdutoPorSaida
  ]);

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

export function Relatorio() {
  return (
    <Box>
      <Heading mb={10}>Relatórios e Alertas</Heading>
      <Stack gap={10} h={"full"} direction={"row"} flexWrap={"wrap"}>
        <SkusComMaiorMovimentacao />
        <SkusComEstoqueMinimo />
        <SkusComGiroAbaixoDoEsperado />
        <SaidasPorData />
      </Stack>
    </Box>
  );
}
