import { ButtonSelector } from "@/components/buttonSelector";
import { PaginationSelector } from "@/components/paginationSelector";
import { handleError401 } from "@/services/api";
import { productService } from "@/services/product.service";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogOverlay,
  Box,
  Button,
  CloseButton,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useDisclosure
} from "@chakra-ui/react";
import { format } from "date-fns";
import { useEffect, useRef, useState } from "react";
import { BsSearch } from "react-icons/bs";
import { Link } from "react-router-dom";

type Estoque = "Geral" | "Galpão" | "Loja";

enum EstoqueEnum {
  geral = "Geral",
  galpao = "Galpão",
  loja = "Loja"
}

interface ProductsWithStock {
  id: number;
  sku: string;
  quantidadeEntrada: number;
  saldo: number;
  container: string;
  importadora: string;
  dataDeEntrada: Date | null;
  diasEmEstoque: number;
}

export function Stocks() {
  const productsLimit = 10;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [estoque, setEstoque] = useState<Estoque>("Geral");
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [items, setItems] = useState<ProductsWithStock[]>([]);
  const [itemIdToDelete, setItemIdToDelete] = useState<
    ProductsWithStock["id"] | null
  >(null);
  const importadoraInput = useRef<HTMLInputElement>(null);
  const codigoInput = useRef<HTMLInputElement>(null);
  const cancelRef = useRef(null);

  const estoques = Object.entries(EstoqueEnum).map(
    (item) => item[1]
  ) as Estoque[];

  useEffect(() => {
    productService
      .getAllProductsStock({
        page,
        limit: productsLimit,
        stock: estoque == "Geral" ? undefined : estoque
      })
      .then((data) => {
        const items = data.data.map((item: any) => {
          const entriesLength =  item.entries.length;

          const entradaSum =
            entriesLength > 0
              ? item.entries.reduce((previous: any, current: any) => {
                  if (typeof previous == "number")
                    return previous + current.quantityReceived;
                  return previous.quantityReceived + current.quantityReceived;
                }, 0)
              : 0;

          const containerNames =
            estoque != "Loja"
              ? item.entries.map((entry: any) => entry.containerId).join(", ")
              : "";

          const lastDate = item.entries.length > 0 ? new Date(
            item.entries[item.entries.length - 1].createdAt
          ) : null;

          const diasEmEstoque =
            lastDate != null
              ? Math.floor(
                  (new Date().getTime() - lastDate.getTime()) /
                    (1000 * 3600 * 24)
                )
              : 0;

          const saldo =
            estoque == "Geral"
              ? item.galpaoQuantity + item.lojaQuantity
              : estoque == "Galpão"
              ? item.galpaoQuantity
              : item.lojaQuantity;

          return {
            id: item.id,
            sku: item.code,
            quantidadeEntrada: entradaSum,
            saldo,
            container: containerNames,
            importadora: item.importer,
            diasEmEstoque,
            dataDeEntrada: lastDate
          };
        });

        setItems(items);
        setTotalItems(data.total);
      })
      .catch((error) => {
        handleError401(error);
      });
  }, [estoque, page]);

  function handleChangeEstoque(index: number) {
    const estoqueFromButton = estoques[index];
    if (estoqueFromButton == estoque) return;
    setEstoque(estoqueFromButton);
  }

  function handleSearchPedidos() {
    const importadoraValue = importadoraInput.current?.value;
    const codigoValue = codigoInput.current?.value;

    if (!importadoraValue && !codigoValue) return;

    console.log({ importadoraValue, codigoValue });
  }

  function handleDeleteItem() {
    setItems((items) => items.filter((item) => item.id !== itemIdToDelete));
    onClose();
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

          {/* Seletor de estoques */}
          <Stack direction={"row"} gap={4}>
            <ButtonSelector onClick={handleChangeEstoque} titles={estoques} />
          </Stack>

          {/* Filtros */}
          <Stack direction={"row"} gap={4} align={"center"}>
            <FormControl w={150}>
              <FormLabel>
                <p className="text-xs">Filtrar por Importadora</p>
              </FormLabel>
              <Input
                placeholder="Ex.: ATTUS"
                ref={importadoraInput}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearchPedidos();
                }}
              />
            </FormControl>
            <FormControl w={150}>
              <FormLabel>
                <p className="text-xs">Filtrar por Código</p>
              </FormLabel>
              <Input
                placeholder={"Ex.: BT0001"}
                ref={codigoInput}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearchPedidos();
                }}
              />
            </FormControl>
            <Button
              _hover={{ opacity: 0.7 }}
              backgroundColor={"erica.green"}
              marginTop={6}
              onClick={handleSearchPedidos}
            >
              <BsSearch />
            </Button>
          </Stack>

          {/* Tabela de Produtos */}
          <Box overflow={"auto"}>
            <Table>
              <Thead>
                <Tr>
                  <Th>Código</Th>
                  <Th>Entrada</Th>
                  <Th>Saldo Atual</Th>
                  {estoque !== "Loja" && <Th>Container</Th>}
                  <Th>Importadora</Th>
                  <Th>Data de Entrada</Th>
                  <Th>Dias em Estoque</Th>
                  <Th>Apagar</Th>
                </Tr>
              </Thead>
              <Tbody>
                {items.map((item) => (
                  <Tr key={"item-" + item.sku}>
                    <Td>
                      <Link
                        to={`/produtos/${item.sku}`}
                        className=" underline text-blue-500"
                      >
                        {item.sku}
                      </Link>
                    </Td>
                    <Td>{item.quantidadeEntrada}</Td>
                    <Td>{item.saldo}</Td>
                    {estoque !== "Loja" && <Td>{item.container}</Td>}
                    <Td>{item.importadora}</Td>
                    <Td>{item.dataDeEntrada ? format(item.dataDeEntrada, "dd/MM/yyyy") : ''}</Td>
                    <Td>{item.diasEmEstoque} dia(s)</Td>
                    <Td>
                      <CloseButton
                        onClick={() => {
                          setItemIdToDelete(item.id);
                          onOpen();
                        }}
                        backgroundColor={"red.400"}
                        _hover={{ opacity: 0.7 }}
                      />
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
          <PaginationSelector
            page={page}
            increasePage={() => {
              const pageLimmit = Math.ceil(totalItems / productsLimit);
              if (page <= pageLimmit) setPage(page + 1);
            }}
            decreasePage={() => {
              if (page > 1) setPage(page - 1);
            }}
            pageQuantity={Math.ceil(totalItems / productsLimit)}
          />

          {/* Modal para confirmar deletar produto */}
          <AlertDialog
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
          </AlertDialog>
        </Stack>
        {/* Resumo da quantidade */}
        <Box justifySelf={"flex-end"}>
          <span>
            {items.length} Produto(s) | Total de {qntDeCaixas} caixas.
          </span>
        </Box>
      </Stack>
    </>
  );
}
