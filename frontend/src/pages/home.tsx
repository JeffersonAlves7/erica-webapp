import { ButtonSelector } from "@/components/buttonSelector";
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
import { useRef, useState } from "react";
import { BsSearch } from "react-icons/bs";

type Estoque = "Geral" | "Galpão" | "Loja";

enum EstoqueEnum {
  geral = "Geral",
  galpao = "Galpão",
  loja = "Loja"
}

const estoques = Object.entries(EstoqueEnum).map(
  (item) => item[1]
) as Estoque[];

interface ItemHome {
  id: number;
  sku: string;
  quantidadeEntrada: number;
  saldo: number;
  container: string;
  importadora: string;
  dataDeEntrada: Date;
  diasEmEstoque: number;
  estoque: Estoque;
}

const itemsExample: ItemHome[] = [
  {
    id: 1,
    sku: "BT001",
    container: "AY-0909",
    dataDeEntrada: new Date(),
    quantidadeEntrada: 100,
    diasEmEstoque: 2,
    saldo: 10,
    importadora: "Y888",
    estoque: "Galpão"
  },
  {
    id: 2,
    sku: "BT0201",
    container: "AY-0909",
    dataDeEntrada: new Date(),
    quantidadeEntrada: 100,
    diasEmEstoque: 2,
    saldo: 10,
    importadora: "Y888",
    estoque: "Loja"
  },
  // add more products
  {
    id: 3,
    sku: 'BT42002',
    container: 'AY-0919',
    dataDeEntrada: new Date(),
    diasEmEstoque: 2,
    estoque: "Galpão",
    importadora: 'Y888',
    quantidadeEntrada: 100,
    saldo: 10,
  },
  {
    id: 4,
    sku: 'BT45002',
    container: 'AY-0919',
    dataDeEntrada: new Date(),
    diasEmEstoque: 2,
    estoque: "Galpão",
    importadora: 'Y888',
    quantidadeEntrada: 100,
    saldo: 10,
  },
  {
    id: 5,
    sku: 'BT0032',
    container: 'AY-0919',
    dataDeEntrada: new Date(),
    diasEmEstoque: 2,
    estoque: "Galpão",
    importadora: 'Y888',
    quantidadeEntrada: 100,
    saldo: 10,
  },
  {
    id: 6,
    sku: 'BT0022',
    container: 'AY-0919',
    dataDeEntrada: new Date(),
    diasEmEstoque: 2,
    estoque: "Galpão",
    importadora: 'Y888',
    quantidadeEntrada: 100,
    saldo: 10,
  },
  {
    id: 7,
    sku: 'BT0021',
    container: 'AY-0919',
    dataDeEntrada: new Date(),
    diasEmEstoque: 2,
    estoque: "Galpão",
    importadora: 'Y888',
    quantidadeEntrada: 100,
    saldo: 10,
  },
  {
    id: 8,
    sku: 'BT0020',
    container: 'AY-0919',
    dataDeEntrada: new Date(),
    diasEmEstoque: 2,
    estoque: "Galpão",
    importadora: 'Y888',
    quantidadeEntrada: 100,
    saldo: 10,
  },
  {
    id: 9,
    sku: 'BT0010',
    container: 'AY-0919',
    dataDeEntrada: new Date(),
    diasEmEstoque: 2,
    estoque: "Galpão",
    importadora: 'Y888',
    quantidadeEntrada: 100,
    saldo: 10,
  },
];

export function Home() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [estoque, setEstoque] = useState<Estoque>("Geral");
  const [items, setItems] = useState<ItemHome[]>(itemsExample);
  const [itemIdToDelete, setItemIdToDelete] = useState<ItemHome["id"] | null>(
    null
  );
  const importadoraInput = useRef<HTMLInputElement>(null);
  const codigoInput = useRef<HTMLInputElement>(null);
  const cancelRef = useRef(null);

  function handleChangeEstoque(index: number) {
    const estoqueFromButton = estoques[index];
    if (estoqueFromButton == estoque) return;
    setItems(estoqueFromButton == "Geral"
      ? [...itemsExample]
      : [...itemsExample.filter((item) => item.estoque == estoqueFromButton)]);
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

  const qntDeCaixas = items.reduce<number | ItemHome>((previous, current) => {
    if (typeof previous !== "number") {
      return previous.saldo + current.saldo;
    } else {
      return previous + current.saldo;
    }
  }, 0) as number;

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
          <Box overflowX={"auto"}>
            <Table>
              <Thead>
                <Tr>
                  <Th>Código</Th>
                  <Th>Entrada</Th>
                  <Th>Saldo Atual</Th>
                  <Th>Container</Th>
                  <Th>Importadora</Th>
                  <Th>Data de Entrada</Th>
                  <Th>Dias em Estoque</Th>
                  <Th>Apagar</Th>
                </Tr>
              </Thead>
              <Tbody>
                {items.map((item) => (
                  <Tr key={"item-" + item.sku}>
                    <Td>{item.sku}</Td>
                    <Td>{item.quantidadeEntrada}</Td>
                    <Td>{item.saldo}</Td>
                    <Td>{item.container}</Td>
                    <Td>{item.importadora}</Td>
                    <Td>{format(item.dataDeEntrada, "dd/MM/yyyy")}</Td>
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
