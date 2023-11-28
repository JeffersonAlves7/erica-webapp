import { ExcelDownloadButton } from "@/components/buttons/excelButtons";
import { CustomTable } from "@/components/customTable";
import { CustomInput } from "@/components/form/CustomInput";
import { InputWithSearch } from "@/components/inputs/inputWithSearch";
import { PaginationSelector } from "@/components/selectors/paginationSelector";
import { excelService } from "@/services/excelService";
import { transactionService } from "@/services/transactionService";
import { TransactionType } from "@/types/transaction-type.enum";
import {
  Box,
  Button,
  Flex,
  Heading,
  Stack,
  Tbody,
  Td,
  Th,
  Thead,
  Tr
} from "@chakra-ui/react";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { BsSearch } from "react-icons/bs";

export function HistoricoTransferencias() {
  const [conferencias, setConferencias] = useState<any[]>([]);

  const today = new Date();
  today.setHours(0, 0, 0);

  const [codeOrEan, setCodeOrEan] = useState("");
  const [date, setDate] = useState(today);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const limitPerPage = 100;

  const lastPage = Math.ceil(total / limitPerPage);

  function search() {
    transactionService
      .getAll({
        limit: limitPerPage,
        page,
        orderBy: "desc",
        code: codeOrEan,
        type: TransactionType.TRANSFERENCE,
        day: date
      })
      .then((data) => {
        setConferencias(data.data);
        setPage(data.page);
        setTotal(data.total);
      });
  }

  useEffect(() => {
    search();
  }, [page, date]);

  function handleSearch() {
    search();
  }

  async function handleDownload() {
    const rows: any[][] = [];

    const headers = [...document.querySelectorAll("table thead th")].map(
      (th) => th.textContent || ""
    );

    for (let page = 1; page <= lastPage; page++) {
      const { data } = await transactionService.getAll({
        limit: limitPerPage,
        page,
        orderBy: "desc",
        code: codeOrEan,
        type: TransactionType.TRANSFERENCE,
        day: date
      });

      data.forEach((transference) => {
        const {
          product: { ean, code },
          entryAmount,
          exitAmount,
          fromStock,
          toStock,
          operator,
          observation,
          createdAt
        } = transference;

        const dataEmBrazil = new Date(createdAt);
        dataEmBrazil.setHours(dataEmBrazil.getHours() - 3);

        rows.push([
          ean,
          code,
          entryAmount,
          exitAmount,
          fromStock,
          toStock,
          operator,
          observation,
          dataEmBrazil
        ]);
      });
    }

    excelService.downloadDataAsSheet("Historico Conferencia", headers, rows);
  }

  return (
    <Stack gap={4}>
      <Heading>Histórico de transferências</Heading>

      <Flex justify={"space-between"} gap={2}>
        <Flex flexWrap={"wrap"} gap={2} align={"center"} flex={1}>
          <Box
            w="full"
            maxW={300}
            display="flex"
            alignItems="center"
            border="1px solid #CBD5E0"
            rounded="md"
            transition="border 0.3s" // Adicione uma transição suave para a borda
            _focus={{ border: "1px solid blue" }} // Estilo do Box quando o input está em foco
            className="group"
          >
            <InputWithSearch
              onSearch={handleSearch}
              value={codeOrEan}
              onChange={(e) => {
                setCodeOrEan(e.target.value);
              }}
              placeholder="Buscar por EAN ou Código"
              border="none"
              outline="none"
              _focusVisible={{
                border: "none"
              }}
            />
            <Button
              onClick={handleSearch}
              backgroundColor="transparent"
              p={2}
              m={0}
              w="min-content"
              h="min-content"
            >
              <BsSearch className="p-0 m-0" />
            </Button>
          </Box>

          <CustomInput
            maxW={150}
            type="date"
            value={date.toISOString().slice(0, 10)}
            onChange={(e) => {
              setDate(new Date(e.target.value));
            }}
          />
        </Flex>

        <ExcelDownloadButton onDownload={handleDownload} />
      </Flex>

      <CustomTable>
        <Thead backgroundColor={"erica.green"}>
          <Tr>
            <Th roundedTopLeft={"2xl"}>EAN</Th>
            <Th>Código</Th>
            <Th>Quantidade Entrada</Th>
            <Th>Operador</Th>
            <Th>Observação</Th>
            <Th roundedTopRight={"2xl"}>Data e Hora</Th>
          </Tr>
        </Thead>

        <Tbody>
          {conferencias.map((conferencia) => {
            const {
              id,
              product: { ean, code },
              entryAmount,
              operator,
              observation,
              createdAt
            } = conferencia;

            return (
              <Tr key={"transference-list-" + id}>
                <Td>{ean}</Td>
                <Td>{code}</Td>
                <Td>{entryAmount}</Td>
                <Td>{operator}</Td>
                <Td>{observation}</Td>
                <Td>{format(new Date(createdAt), "dd/MM/yyy hh:mm:ss")}</Td>
              </Tr>
            );
          })}
        </Tbody>
      </CustomTable>

      <PaginationSelector
        increasePage={() => {
          if (page + 1 <= lastPage) setPage(page + 1);
        }}
        decreasePage={() => {
          if (page - 1 > 0) setPage(page - 1);
        }}
        page={page}
        pageQuantity={lastPage}
      />
    </Stack>
  );
}
