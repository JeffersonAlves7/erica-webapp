import { CloseButton } from "@/components/buttons/closeButton";
import { SearchButton } from "@/components/buttons/searchButton";
import { CodeInputForStock } from "@/components/inputs/codeInput";
import { ImporterInputForStock } from "@/components/inputs/importerInput";
import { PercentageInput } from "@/components/inputs/percentageInput";
import { PaginationSelector } from "@/components/selectors/paginationSelector";
import { StockButtonSelector } from "@/components/selectors/stockSelector";
import { handleError401 } from "@/services/api";
import { productService } from "@/services/product.service";
import { Importer } from "@/types/importer.enum";
import { ProductsWithStock } from "@/types/products.interface";
import { Stock } from "@/types/stock.enum";
import {
  Box,
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
  const [items, setItems] = useState<ProductsWithStock[]>([]);
  const [importer, setImporter] = useState<Importer | undefined>(undefined);
  const [stock, setStock] = useState<Stock | undefined>(undefined);
  const [code, setCode] = useState<string | undefined>(undefined);
  const [alertaPorcentagem, setAlertaPorcentagem] = useState(50);

  const productsLimit = 10;
  const codigoRef = useRef<HTMLInputElement>(null);
  const pageLimmit = Math.ceil(totalItems / productsLimit);

  useEffect(() => {
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
        setTotalItems(data.total);
        setPage(1);
      })
      .catch((error) => {
        handleError401(error);
      });
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
        setTotalItems(data.total);
        setPage(1);
      })
      .catch((error) => {
        handleError401(error);
      });
  }

  function handleSearchPedidos() {
    const codigo = codigoRef.current?.value;
    if (!codigo) return;
    setCode(codigo);
  }

  function handleChangeStock(stock: string) {
    if (stock === "Geral") {
      setStock(undefined);
    } else if (stock === "Galpão") {
      setStock(Stock.GALPAO);
    } else if (stock === "Loja") {
      setStock(Stock.LOJA);
    }
  }

  const qntDeCaixas = items.reduce<number | ProductsWithStock>(
    (previous, current) => {
      if (typeof previous !== "number") {
        return previous.saldo + current.saldo;
      } else {
        return previous + current.saldo;
      }
    },
    0
  ) as number;

  return (
    <>
      <Stack h={"full"} justify={"space-between"}>
        <Stack gap={10} h={"95%"}>
          <Heading>Estoques</Heading>

          <StockButtonSelector onClick={handleChangeStock} />

          <Stack direction={"row"} gap={4} align={"center"}>
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
          </Stack>

          <Box overflow={"auto"}>
            <Table>
              <StockTableHead stock={stock} />
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
        </Stack>

        <Box justifySelf={"flex-end"}>
          <span>
            {items.length} Produto(s) | Total de {qntDeCaixas} caixas.
          </span>
        </Box>
        {/* <AlertDialog
            isOpen={isOpen}
            onClose={onClose}
            leastDestructiveRef={cancelRef}
          >
            <AlertDialogOverlay>
              <AlertDialogContent>
                <AlertDialogBody>
                  <p className="text-2xl font-semibold">
                    Você realmente deseja excluir esse item? Atenção! Essa ação
                    não pode ser desfeita
                  </p>
                </AlertDialogBody>
                <AlertDialogFooter>
                  <Button colorScheme="red" ref={cancelRef} onClick={onClose}>
                    Cancelar
                  </Button>
                  <Button
                    colorScheme="green"
                    backgroundColor={"erica.green"}
                    onClick={handleDeleteItem}
                    ml={3}
                  >
                    Confirmar
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialogOverlay>
          </AlertDialog> */}
      </Stack>
    </>
  );
}

function StockTableHead(props: { stock: Stock | undefined }) {
  return (
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
        {props.stock != Stock.LOJA && (
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
        {!props.stock && <Th>Giro</Th>}
        {!props.stock && (
          <Th>
            Quantidade
            <br /> para alerta
          </Th>
        )}
        <Th>Observação</Th>
        <Th>Apagar</Th>
      </Tr>
    </Thead>
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
  const quantidadeParaAlerta =
    item.quantidadeEntrada * (alertaPorcentagem / 100);

  let saldoColor = !stock
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
        <Link to={item.sku} className=" underline text-blue-500">
          {item.sku}
        </Link>
      </Td>
      <Td>{item.quantidadeEntrada}</Td>
      <Td backgroundColor={saldoColor}>{item.saldo} </Td>
      {stock != Stock.LOJA && <Td>{item.container}</Td>}
      <Td>{item.importadora}</Td>
      <Td>{date}</Td>
      <Td>{item.diasEmEstoque} dia(s)</Td>
      {!stock && <Td>{item.giro}%</Td>}
      {!stock && <Td>{quantidadeParaAlerta}</Td>}
      <Td>{item.observacao}</Td>
      <Td>
        <CloseButton
          onClick={() => {
            // setItemIdToDelete(item.id);
            // onOpen();
          }}
        />
      </Td>
    </Tr>
  );
}
