import { ColorButton } from "@/components/buttons/colorButton";
import { PaginationSelector } from "@/components/selectors/paginationSelector";
import { StockButtonSelector } from "@/components/selectors/stockSelector";
import { handleError401 } from "@/services/api";
import { reservesService } from "@/services/reservesService";
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
  Tr,
  useToast
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { ModalConfirm } from "@/components/modalConfirm";
import { transactionService } from "@/services/transactionService";
import { CloseButton } from "@/components/buttons/closeButton";
import { InputWithSearch } from "@/components/inputs/inputWithSearch";

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
  const [reserveIdToCancel, setReserveIdToCancel] = useState<
    undefined | number
  >(undefined);

  const toast = useToast();

  const reserversPerPage = 20;
  const pageQuantity = Math.ceil(pageLimit / reserversPerPage);

  async function getAllReserves() {
    return reservesService
      .getReserves({
        page: page,
        limit: reserversPerPage,
        stock: stock
      })
      .then((reserves) => {
        setReserves(reserves.data);
        setPageLimit(reserves.total);
        setPage(1);
        setReserveSummary({
          galpao: reserves.summary.galpaoQuantity as number,
          loja: reserves.summary.lojaQuantity as number,
          products: reserves.summary.products as number
        });
      })
      .catch((error) => {
        handleError401(error);
        console.log(error);
      });
  }

  useEffect(() => {
    getAllReserves();
  }, [stock]);

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

  function handleConfirmItems() {
    reservesService
      .confirmReserve(selecteds)
      .then(() => {
        toast({
          title: "Reservas confirmadas com sucesso!",
          status: "success",
          duration: 5000,
          isClosable: true
        });

        setSelecteds([]);
        setAllSelected(false);

        return getAllReserves()
      })
      .catch((error) => {
        handleError401(error);
        console.log(error);
      });
  }

  function handleSearchProductOrClient(value: string){

  }

  return (
    <Stack h={"full"} justifyContent={"space-between"}>
      <Stack gap={6}>
        <Heading>Reservas</Heading>

        <StockButtonSelector onClick={handleChangeStock} />

        <Input
          type="search"
          placeholder="Buscar por Código, Cliente"
          onChange={(e) => {
            handleSearchProductOrClient(e.target.value || "");
          }}
        />

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
                <Th>Cancelar</Th>
              </Tr>
            </Thead>
            <Tbody>
              {reserves.map((reserve) => (
                <Tr key={`reservers-${reserve.id}`}>
                  <Td>
                    <Checkbox
                      isChecked={selecteds.includes(reserve.id)}
                      onChange={(e) => {
                        if (e.target.checked) handleSelect(reserve.id);
                        else handleUnselect(reserve.id);
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
                  <Td>
                    <CloseButton
                      onClick={() => setReserveIdToCancel(reserve.id)}
                    />
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>

        <Stack gap={4}>
          <Flex justify={"space-between"}>
            <ColorButton onClick={handleConfirmItems} color="green">
              Confirmar saídas
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

          {reserveSummary && (
            <p className="">
              {reserveSummary.products} Produto(s) | Total de{" "}
              {reserveSummary.galpao + reserveSummary.loja} Caixas Reservadas |
              Galpão: {reserveSummary.galpao} Caixas | Loja:{" "}
              {reserveSummary.loja} Caixas
            </p>
          )}
        </Stack>
      </Stack>

      <ModalConfirm
        isOpen={reserveIdToCancel !== undefined}
        handleConfirm={() => {
          transactionService
            .delete(reserveIdToCancel as number)
            .then(() => {
              getAllReserves();

              toast({
                title: "Reserva cancelada com sucesso!",
                status: "success",
                duration: 5000,
                isClosable: true
              });
            })
            .catch(() => {
              toast({
                title: "Erro ao cancelar a reserva!",
                status: "error",
                duration: 5000,
                isClosable: true
              });
            })
            .finally(() => {
              setReserveIdToCancel(undefined);
            });
        }}
        onClose={() => {
          setReserveIdToCancel(undefined);
        }}
      >
        Tem certeza que deseja cancelar essa reserva?
      </ModalConfirm>
    </Stack>
  );
}
