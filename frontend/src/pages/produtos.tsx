import { ButtonSelector } from "@/components/buttonSelector";
import { handleError401 } from "@/services/api";
import { productService } from "@/services/product.service";
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
import { useEffect, useRef, useState } from "react";

interface Product {
  id: number;
  containerNumber: string;
  importadora: string;
  codigo: string;
  descricao: string;
}

export function Produtos() {
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState<Product[]>([]);
  const [importer, setImporter] = useState("Geral");

  const searchRef = useRef<HTMLInputElement>(null);
  const importers = ["Geral", "Attus Bloom", "Attus", "Alpha Ynfinity"];

  useEffect(() => {
    productService
      .getEntries({
        page: page,
        limit: 10
      })
      .then((response) => {
        const products = response.data.map((product) => {
          return {
            id: product.id,
            containerNumber: product.containerId,
            importadora: product.product.importer,
            codigo: product.product.code,
            descricao: product.product.description
          };
        });

        setProducts(products);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  useEffect(() => {
    productService
      .getEntries({
        page: page,
        limit: 10,
        importer: importer === "Geral" ? undefined : importer
      })
      .then((response) => {
        const products = response.data.map((product) => {
          return {
            id: product.id,
            containerNumber: product.containerId,
            importadora: product.product.importer,
            codigo: product.product.code,
            descricao: product.product.description
          };
        });

        setProducts(products);
      })
      .catch((error) => {
        handleError401(error);
        console.log(error);
      });
  }, [importer]);

  function handleSearch() {
    productService
      .getEntries({
        page: page,
        limit: 10,
        search: searchRef.current?.value
      })
      .then((response) => {
        const products = response.data.map((product) => {
          return {
            id: product.id,
            containerNumber: product.containerId,
            importadora: product.product.importer,
            codigo: product.product.code,
            descricao: product.product.description
          };
        });

        setProducts(products);
      })
      .catch((error) => {
        handleError401(error);
        console.log(error);
      });
  }

  return (
    <Box>
      <Heading mb={6}>Lista de produtos</Heading>
      <Input
        mb={6}
        placeholder="Buscar por Número do container, código ou descrição"
        ref={searchRef}
        onKeyUp={(e) => {
          if (e.key === "Backspace" && !searchRef.current?.value)
            handleSearch();
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSearch();
        }}
      />
      <Box mb={6}>
        <ButtonSelector
          keyPrefix="lista-produtos"
          titles={importers}
          onClick={(index) => setImporter(importers[index])}
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
