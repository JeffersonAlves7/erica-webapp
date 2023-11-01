import { ModalConfirm } from "@/components/modalConfirm";
import { ArchiveButton } from "@/components/buttons/archiveButton";
import { ReturnButton } from "@/components/buttons/returnButton";
import { CustomTable } from "@/components/customTable";
import { EricaLink } from "@/components/ericaLink";
import { ImporterInputForStock } from "@/components/inputs/importerInput";
import { PaginationSelector } from "@/components/selectors/paginationSelector";
import { productService } from "@/services/product.service";
import {
  Box,
  Flex,
  Heading,
  Stack,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useDisclosure,
  useToast
} from "@chakra-ui/react";
import { format } from "date-fns";
import { useEffect, useState } from "react";

export function ItensArquivados() {
  const [items, setItems] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [importer, setImporter] = useState("");
  const [idToUnarchive, setIdToUnarchive] = useState<number | undefined>(
    undefined
  );

  const toast = useToast();
  const unarchiveDisclosure = useDisclosure();

  const limitPerPage = 100;

  const lastPage = Math.ceil(total / limitPerPage);

  function search() {
    productService
      .getArchivedProducts({
        limit: limitPerPage,
        page,
        importer
      })
      .then((response) => {
        setItems(response.data);
        setPage(response.page);
        setTotal(response.total);
      });
  }

  useEffect(() => {
    search();
  }, []);

  function handleConfirmModal() {
    if (!idToUnarchive) {
      toast({
        title: "Erro: Nenhum ID encontrado.",
        status: "error",
        duration: 3000,
        isClosable: true
      });

      return;
    }

    productService
      .archiveProduct(idToUnarchive)
      .then(() => {
        toast({
          title: "Sucesso ao desarquivar o produto.",
          status: "success",
          duration: 3000,
          isClosable: true
        });
        search();
      })
      .catch(() => {
        toast({
          title: "Erro ao desarquivar o produto.",
          status: "error",
          duration: 3000,
          isClosable: true
        });
      })
      .finally(() => {
        unarchiveDisclosure.onClose();
      });
  }

  return (
    <Stack gap={6}>
      <Flex gap={6}>
        <Heading>Itens arquivados</Heading>

        <EricaLink to="/estoques">
          <ArchiveButton />
        </EricaLink>
      </Flex>

      <Box w={"max-content"}>
        <ImporterInputForStock onChange={setImporter} />
      </Box>

      <CustomTable>
        <Thead>
          <Tr>
            <Th>Código</Th>
            <Th>Saldo Atual</Th>
            <Th>Container de Origem</Th>
            <Th>Importadora</Th>
            <Th>Data de Entrada</Th>
            <Th>Voltar para estoque</Th>
          </Tr>
        </Thead>

        <Tbody>
          {items.map((item) => {
            const data = new Date(item.transactions[0].createdAt);

            return (
              <Tr>
                <Td>{item.code}</Td>
                <Td>
                  {item.galpaoQuantity +
                    item.galpaoQuantityReserve +
                    item.lojaQuantity +
                    item.lojaQuantityReserve}
                </Td>
                <Td>{item.transactions[0].containerId}</Td>
                <Td>{item.importer}</Td>
                <Td>{format(data, "dd/MM/yyyy")}</Td>
                <Td>
                  <ReturnButton
                    onClick={() => {
                      setIdToUnarchive(item.id);
                      unarchiveDisclosure.onOpen();
                    }}
                  />
                </Td>
              </Tr>
            );
          })}
        </Tbody>
      </CustomTable>

      <PaginationSelector
        page={page}
        pageQuantity={lastPage}
        decreasePage={() => {
          if (page - 1 > 0) setPage(page - 1);
        }}
        increasePage={() => {
          if (page + 1 <= limitPerPage) setPage(page + 1);
        }}
      />

      <ModalConfirm
        isOpen={unarchiveDisclosure.isOpen}
        handleConfirm={handleConfirmModal}
        onClose={unarchiveDisclosure.onClose}
      >
        Tem certeza que deseja desarquivar este produto?
      </ModalConfirm>
    </Stack>
  );
}
