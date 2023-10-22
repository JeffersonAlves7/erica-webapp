import { ColorButton } from "@/components/buttons/colorButton";
import { PaginationSelector } from "@/components/selectors/paginationSelector";
import { StockButtonSelector } from "@/components/selectors/stockSelector";
import { handleError401 } from "@/services/api";
import { reservesService } from "@/services/reserves.service";
import { Reserve, ReserveSummary } from "@/types/reserves.interface";
import { Stock } from "@/types/stock.enum";
import { format } from "date-fns";
import {
  Box,
  Checkbox,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr
} from "@chakra-ui/react";
import { useEffect, useState } from "react";

export function Reservas() {
  const [stock, setStock] = useState<Stock | undefined>(undefined);
  const [reserveSummary, setReserveSummary] = useState<
    ReserveSummary | undefined
  >();
  const [reserves, setReserves] = useState<Reserve[]>([]);
  const [selecteds, setSelecteds] = useState<Reserve["id"][]>([]);
  const [allSelected, setAllSelected] = useState(false);
  const [page, setPage] = useState(1);
  const [pageLimit, setPageLimit] = useState(0);

  const reserversPerPage = 20;
  const pageQuantity = Math.ceil(pageLimit / reserversPerPage);

  useEffect(() => {
    reservesService
      .getReserves({
        page: page,
        limit: reserversPerPage
      })
      .then((reserves) => {
        setReserves(reserves.data);
        setPageLimit(reserves.total);
      })
      .catch((error) => {
        handleError401(error);
        console.log(error);
      });

    setReserveSummary({
      galpao: 10,
      loja: 10,
      products: 2
    });
  }, []);

  const reservesSelected = reserves.filter((reserve) =>
    selecteds.includes(reserve.id)
  );

  const quantitySelected = reservesSelected.reduce(
    (acc, reserve) => acc + reserve.quantity,
    0
  );

  function handleChangeStock(stock: string) {
    if (stock == "Galpão") setStock(Stock.GALPAO);
    else if (stock == "Loja") setStock(Stock.LOJA);
    else setStock(undefined);
  }

  function handleSelect(id: Reserve["id"]) {
    if (selecteds.includes(id)) {
      setSelecteds(selecteds.filter((selected) => selected !== id));
    } else {
      setSelecteds([...selecteds, id]);
    }
  }

  function handleUnselect(id: Reserve["id"]) {
    setSelecteds(selecteds.filter((selected) => selected !== id));
    if (allSelected) setAllSelected(false);
  }

  function handleSelectAll() {
    if (allSelected) {
      setAllSelected(false);
      setSelecteds([]);
    } else {
      setAllSelected(true);
      setSelecteds(reserves.map((reserve) => reserve.id));
    }
  }

  function handleConfirmItems() {}

  return (
    <Stack h={"full"} justifyContent={"space-between"}>
      <Stack gap={6}>
        <Heading>Reservas</Heading>

        <StockButtonSelector onClick={handleChangeStock} />

        <Input type="search" placeholder="Buscar por Código, Cliente" />

        <Flex justify={"start"} align={"start"} gap={10} wrap={"wrap"}>
          <FormControl
            display={"flex"}
            alignItems={"center"}
            gap={2}
            width={"auto"}
          >
            <Checkbox isChecked={allSelected} onChange={handleSelectAll} />
            <FormLabel className="underline" fontWeight={"normal"} p={0} m={0}>
              Selecionar todos
            </FormLabel>
          </FormControl>

          <Text fontWeight={"bold"}>
            Total de
            <span className="mx-0.5 px-1 border-black py-0.5 rounded-lg border-2">
              {quantitySelected}
            </span>
            Caixas selecionadas
          </Text>
        </Flex>

        <Box overflow={"auto"}>
          <Table>
            <TableHead />
            <Tbody>
              {reserves.map((reserve) => (
                <TableItem
                  key={reserve.id}
                  reserve={reserve}
                  isSelected={selecteds.includes(reserve.id)}
                  handleSelect={handleSelect}
                  handleUnselect={handleUnselect}
                />
              ))}
            </Tbody>
          </Table>
        </Box>

        <Flex>
          <ColorButton onClick={handleConfirmItems} color="green">
            Confirmar itens
          </ColorButton>

          <PaginationSelector
            decreasePage={() => {
              if (page > 1) setPage(page - 1);
            }}
            increasePage={() => {
              if (page < pageQuantity) setPage(page + 1);
            }}
            page={page}
            pageQuantity={pageQuantity}
          />
        </Flex>
      </Stack>

      {reserveSummary && (
        <p className="">
          {reserveSummary.products} Produto(s) | Total de{" "}
          {reserveSummary.galpao + reserveSummary.loja} Caixas Reservadas |
          Galpão: {reserveSummary.galpao} Caixas | Loja: {reserveSummary.loja}{" "}
          Caixas
        </p>
      )}
    </Stack>
  );
}

function TableHead() {
  return (
    <Thead>
      <Tr>
        <Th></Th>
        <Th>Código</Th>
        <Th>
          Quantidade <br /> de Reserva
        </Th>
        <Th>Estoque</Th>
        <Th>Cliente</Th>
        <Th>
          Previsão de <br /> retirada
        </Th>
        <Th>Operador</Th>
        <Th>Observação</Th>
      </Tr>
    </Thead>
  );
}

function TableItem(props: {
  reserve: Reserve;
  isSelected: boolean;
  handleSelect: (id: Reserve["id"]) => void;
  handleUnselect: (id: Reserve["id"]) => void;
}) {
  const { reserve, isSelected } = props;

  return (
    <Tr>
      <Td>
        <Checkbox
          isChecked={isSelected}
          onChange={(e) => {
            if (e.target.checked) props.handleSelect(reserve.id);
            else props.handleUnselect(reserve.id);
          }}
        />
      </Td>
      <Td>{reserve.code}</Td>
      <Td>{reserve.quantity}</Td>
      <Td>{reserve.stock}</Td>
      <Td>{reserve.client}</Td>
      <Td>{format(new Date(reserve.date), "dd/MM/yyyy")}</Td>
      <Td>{reserve.operator}</Td>
      <Td>{reserve.observation}</Td>
    </Tr>
  );
}
