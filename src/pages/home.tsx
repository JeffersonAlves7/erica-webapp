import {
  Box,
  Button,
  CloseButton,
  Flex,
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
  Tr
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
}

const itemExample: ItemHome = {
  id: 1,
  sku: "BT001",
  container: "AY-0909",
  dataDeEntrada: new Date(),
  quantidadeEntrada: 100,
  diasEmEstoque: 2,
  saldo: 10,
  importadora: "Y888"
};

export function Home() {
  const [estoque, setEstoque] = useState<Estoque>("Geral");
  const [items, setItems] = useState<ItemHome[]>([itemExample]);
  const importadoraInput = useRef<HTMLInputElement>(null);
  const codigoInput = useRef<HTMLInputElement>(null);

  function handleChangeEstoque(estoqueFromButton: Estoque) {
    if (estoqueFromButton == estoque) return;
    setEstoque(estoqueFromButton);
  }

  function handleSearchPedidos() {
    const importadoraValue = importadoraInput.current?.value;
    const codigoValue = codigoInput.current?.value;

    if (!importadoraValue && !codigoValue) return;

    console.log({ importadoraValue, codigoValue });
  }

  function handleDeleteItem(itemId: ItemHome['id']){
    setItems(items => items.filter(item => item.id !== itemId));
  }

  const qntDeCaixas = items.reduce<number | ItemHome>((previous, current) => {
    if (typeof previous !== "number") {
      return previous.saldo + current.saldo;
    } else {
      return previous + current.saldo;
    }
  }, 0) as number;

  return (
    <Stack gap={10} h={"full"}>
      <Heading>Estoques</Heading>

      {/* Seletor de estoques */}
      <Stack direction={"row"} gap={4}>
        {estoques.map((currentEstoque) => (
          <Button
            key={currentEstoque + "-button"}
            onClick={() => handleChangeEstoque(currentEstoque)}
            w={150}
            backgroundColor={
              estoque == currentEstoque ? "erica.green" : "erica.pink"
            }
            _hover={{ opacity: 0.7 }}
            size={"md"}
          >
            {currentEstoque}
          </Button>
        ))}
      </Stack>

      {/* Filtros */}
      <Stack direction={"row"} gap={4} align={"center"}>
        <FormControl w={150}>
          <FormLabel>
            <p className="text-xs">Filtrar por Importadora</p>
          </FormLabel>
          <Input
            placeholder="Ex.: Y888"
            ref={importadoraInput}
            onKeyDown={(e) => {
              if (e.key.toLowerCase() === "enter") {
                handleSearchPedidos();
              }
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
              if (e.key.toLowerCase() === "enter") {
                handleSearchPedidos();
              }
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
      <Box overflowX={"scroll"}>
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
                  <Flex align={"center"} justify={"center"}>
                    <CloseButton
                    onClick={() => handleDeleteItem(item.id)}
                      backgroundColor={"red.400"}
                      _hover={{
                        opacity: 0.7
                      }}
                    />
                  </Flex>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      {/* Resumo da quantidade */}
      <Box justifySelf={"flex-end"}>
        <span>
          {items.length} Produto(s) | Total de {qntDeCaixas} caixas.
        </span>
      </Box>
    </Stack>
  );
}
