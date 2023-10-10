import { ButtonSelector } from "@/components/buttonSelector";
import {
  Box,
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

interface Product {
  id: number;
  containerNumber: string;
  importadora: string;
  codigo: string;
  descricao: string;
}

const productsExample: Product[] = [{
  id: 1,
  containerNumber: "123456789",
  importadora: "Attus",
  codigo: "BT001",
  descricao: "Descrição"
}]



export function Produtos() {
  const [products, setProducts] = useState<Product[]>([]);
  const importers = ["Geral", "Attus Bloom", "Attus", "Alpha Ynfinity"]

  useEffect(() => {
    setProducts(productsExample);
  }, [])

  function handleChangeImporter(index: number){
    console.log(importers[index])
  }

  return (
    <Box>
      <Heading mb={6}>Lista de produtos</Heading>
      <Input
        mb={6}
        placeholder="Buscar por Número do container, código ou descrição"
      />
      <Box mb={6}>
        <ButtonSelector
          keyPrefix="lista-produtos"
          titles={importers}
          onClick={handleChangeImporter}
        />
      </Box>
      <Table>
        <Thead>
          <Tr>
            <Th>Número do container</Th>
            <Th>Importadora</Th>
            <Th>Código</Th>
            <Th>Descrição</Th>
          </Tr>
        </Thead>
        <Tbody>
          {products.map((product, index) => (
            <Tr key={"product-" + index}>
              <Td>{product.containerNumber}</Td>
              <Td>{product.importadora}</Td>
              <Td>{product.codigo}</Td>
              <Td>{product.descricao}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
}
