import { ArchiveButton } from "@/components/buttons/archiveButton";
import { SearchButton } from "@/components/buttons/searchButton";
import { EricaLink } from "@/components/ericaLink";
import { CodeInputForStock } from "@/components/inputs/codeInput";
import { ImporterInputForStock } from "@/components/inputs/importerInput";
import { PercentageInput } from "@/components/inputs/percentageInput";
import { PaginationSelector } from "@/components/selectors/paginationSelector";
import { StockButtonSelector } from "@/components/selectors/stockSelector";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { handleError401 } from "@/services/api";
import { productService } from "@/services/product.service";
import { Importer } from "@/types/importer.enum";
import { ProductsWithStock } from "@/types/products.interface";
import { Stock } from "@/types/stock.enum";
import {
  Box,
  Flex,
  Heading,
  Stack,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr
} from "@chakra-ui/react";
import { format } from "date-fns";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

export function Stocks() {
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [qntDeCaixas, setQntDeCaixas] = useState(0);
  const [items, setItems] = useState<ProductsWithStock[]>([]);
  const [importer, setImporter] = useState<Importer | undefined>(undefined);
  const [stock, setStock] = useState<Stock | undefined>(undefined);
  const [code, setCode] = useState<string | undefined>(undefined);
  const [alertaPorcentagem, setAlertaPorcentagem] = useLocalStorage(
    "alerta-porcentagem",
    50
  );

  const productsLimit = 100;
  const codigoRef = useRef<HTMLInputElement>(null);
  const pageLimmit = Math.ceil(totalItems / productsLimit);

  function search() {
    productService
      .getAllProductsStock({
        page,
        limit: productsLimit,
        stock,
        importer,
        code
      })
      .then((data) => {
        setItems(data.data);
        setPage(1);
        return productService.getProductsinfo(stock);
      })
      .then((data) => {
        setQntDeCaixas(data.boxQuantity);
        setTotalItems(data.productsQuantity);
      })
      .catch((error) => {
        handleError401(error);
      });
  }

  useEffect(() => {
    search()
  }, [importer, code, stock]);

  function handleChangePage(page: number) {
    setPage(page);

    productService
      .getAllProductsStock({
        page,
        limit: productsLimit,
        stock,
        importer,
        code
      })
      .then((data) => {
        setItems(data.data);
      })
      .catch((error) => {
        handleError401(error);
      });
  }

  function handleSearchPedidos() {
    const codigo = codigoRef.current?.value;
    setCode(codigo);
    search()
  }

  function handleChangeStock(stock: string) {
    setStock(
      stock === "Geral"
        ? undefined
        : stock === "Galpão"
          ? Stock.GALPAO
          : Stock.LOJA
    );
  }

  return (
    <>
      <Stack gap={10} overflowY={"auto"}>
        <Heading>Estoques</Heading>

        <Flex gap={6}>
          <StockButtonSelector onClick={handleChangeStock} />

          <EricaLink to="./arquivados">
            <ArchiveButton />
          </EricaLink>
        </Flex>

        <Flex gap={4} align={"center"}>
          <ImporterInputForStock onChange={setImporter} />
          <CodeInputForStock onSearch={handleSearchPedidos} ref={codigoRef} />
          {!stock && (
            <Box w={150}>
              <PercentageInput
                label="Porcentagem para Alerta"
                value={alertaPorcentagem}
                onChange={(value) => {
                  setAlertaPorcentagem(value);
                }}
              />
            </Box>
          )}
          <SearchButton onSearch={handleSearchPedidos} />
        </Flex>

        <Box overflow={"auto"} minH={200}>
          <Table>
            <Thead>
              <Tr>
                <Th>Código</Th>
                <Th>
                  Quantidade <br /> de entrada
                </Th>
                <Th>
                  Saldo <br />
                  Atual
                </Th>
                {stock != Stock.LOJA && (
                  <Th>
                    Container <br /> de Origem
                  </Th>
                )}
                <Th>Importadora</Th>
                <Th>
                  Data <br />
                  de Entrada
                </Th>
                <Th>
                  Dias <br />
                  em Estoque
                </Th>
                {!stock && (
                  <>
                    <Th>Giro</Th>
                    <Th>
                      Quantidade
                      <br /> para alerta
                    </Th>
                  </>
                )}
                {stock == Stock.LOJA && <Th>Localização</Th>}
                <Th>Observação</Th>
              </Tr>
            </Thead>

            <Tbody>
              {items.map((item) => (
                <StockItem
                  key={item.sku}
                  item={item}
                  alertaPorcentagem={alertaPorcentagem}
                  stock={stock}
                />
              ))}
            </Tbody>
          </Table>
        </Box>

        <Flex justifySelf={"flex-end"} justify={"space-between"}>
          <span>
            {totalItems} Produto(s) | Total de {qntDeCaixas} caixas.
          </span>

          <PaginationSelector
            page={page}
            increasePage={() => {
              if (page <= pageLimmit) handleChangePage(page + 1);
            }}
            decreasePage={() => {
              if (page > 1) handleChangePage(page - 1);
            }}
            pageQuantity={pageLimmit}
          />
        </Flex>
      </Stack>
    </>
  );
}

function StockItem({
  item,
  alertaPorcentagem,
  stock
}: {
  item: ProductsWithStock;
  alertaPorcentagem: number;
  stock: Stock | undefined;
}) {
  const quantidadeParaAlerta = Math.floor(
    item.quantidadeEntrada * (alertaPorcentagem / 100)
  );

  const saldoColor = !stock
    ? item.saldo > quantidadeParaAlerta
      ? "erica.green"
      : item.saldo < quantidadeParaAlerta
        ? "red.500"
        : "yellow.500"
    : "";

  const date = item.dataDeEntrada
    ? format(item.dataDeEntrada, "dd/MM/yyyy")
    : "";

  return (
    <Tr>
      <Td>
        <Link
          to={`${item.sku}/${item.id}`}
          className=" underline text-blue-500"
        >
          {item.sku}
        </Link>
      </Td>
      <Td>{item.quantidadeEntrada}</Td>
      <Td backgroundColor={saldoColor}>{item.saldo} </Td>
      {stock != Stock.LOJA && <Td>{item.container}</Td>}
      <Td>{item.importadora}</Td>
      <Td>{date}</Td>
      <Td>{item.diasEmEstoque} dia(s)</Td>
      {!stock && (
        <>
          <Td>{Number(item.giro).toFixed(1)}%</Td>
          <Td>{quantidadeParaAlerta}</Td>
        </>
      )}
      {stock == Stock.LOJA && <Td>{item.lojaLocation}</Td>}
      <Td>{item.observacao}</Td>
    </Tr>
  );
}
