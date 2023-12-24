import { ButtonSelector } from "@/components/selectors/buttonSelector";
import { handleError401 } from "@/services/api";
import { ProductWithEntries, productService } from "@/services/productService";
import {
  Box,
  Heading,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr
} from "@chakra-ui/react";
import { InputWithSearch } from "@/components/inputs/inputWithSearch";
import { useEffect, useState } from "react";
import { StockButtonSelector } from "@/components/selectors/stockSelector";
import { Stock } from "@/types/stock.enum";

export function Produtos() {
  const [page, setPage] = useState<number>(1);
  const [pageLimit, setPageLimit] = useState<number>(0);
  const [products, setProducts] = useState<ProductWithEntries[]>([]);
  const [search, setSearch] = useState<string>("");
  const [importer, setImporter] = useState<Stock | string>("");

  const importers = ["Geral", "Attus Bloom", "Attus", "Alpha Ynfinity"];
  const limitPerPage = 100;
  const pageQuantity = Math.ceil(pageLimit / limitPerPage);

  useEffect(() => {
    productService
      .getProductsWithEntries({
        page,
        limit: limitPerPage,
        importer,
        orderBy: "desc",
        search
      })
      .then((res) => {
        setProducts(res.data);
        setPageLimit(res.total);
        setPage(page);
      })
      .catch((e) => {
        handleError401(e);
      });
  }, []);

  function handleSearch() {}

  return (
    <Box>
      <Heading mb={6}>Lista de produtos</Heading>
      <InputWithSearch
        mb={6}
        onSearch={handleSearch}
        onChange={(e) => {
          setSearch(e.target.value);
        }}
      />

      <Box mb={6}>
        <ButtonSelector
          keyPrefix="lista-produtos"
          titles={importers}
          onClick={(i) => {
            setImporter(importers[i]);
          }}
        />
      </Box>

      <Box className="max-h-[55vh]" overflow={"auto"}>
        <Table>
          <Thead>
            <Tr>
              <Th>Importadora</Th>
              <Th>Código</Th>
              <Th>Descrição</Th>
              <Th>Descrição em Chinês</Th>
              {/* <Th>Número do container</Th> */}
            </Tr>
          </Thead>

          <Tbody>
            {products.map((product, index) => (
              <Tr key={"product-" + index}>
                <Td>{product.importer}</Td>
                <Td>{product.code}</Td>
                <Td>
                  <Box overflow={"auto"} maxH={"70px"}>
                    {product.description}
                  </Box>
                </Td>
                <Td>
                  <Box overflow={"auto"} maxH={"70px"}>
                    {product.chineseDescription}
                  </Box>
                </Td>
                {/* <Td>{product.}</Td> */}
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
      {/* 
      <PaginationSelector
        page={page}
        decreasePage={() => {
          if (page > 1) dispatch({ type: "set_page", payload: page - 1 });
        }}
        increasePage={() => {
          dispatch({ type: "set_page", payload: page + 1 });
        }}
        pageQuantity={state.productsQuantity}
      /> */}
    </Box>
  );
}
