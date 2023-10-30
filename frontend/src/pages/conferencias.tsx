import { ModalConfirm } from "@/components/ModalConfirm";
import { PaginationSelector } from "@/components/selectors/paginationSelector";
import { handleError401 } from "@/services/api";
import { productService } from "@/services/product.service";
import { TransferenceConfirmation } from "@/types/transaction.interface";
import {
  Button,
  Heading,
  Input,
  Stack,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useDisclosure,
  Checkbox,
  Box,
  useToast
} from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";

export function Conferencias() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [page, setPage] = useState(1);
  const [pageQuantity, setPageQuantity] = useState(0);
  const [conferencias, setConferencias] = useState<TransferenceConfirmation[]>(
    []
  );
  const [idsConferencias, setIdsConferencias] = useState<
    TransferenceConfirmation["id"][]
  >([]);

  const conferenciasLimit = 20;
  const pageMax = Math.ceil(pageQuantity / conferenciasLimit);

  const toast = useToast();

  const getConferencias = useCallback(async () => {
    try {
      const response = await productService.getAllTransferences({
        page,
        confirmed: false,
        limit: 20,
        orderBy: "desc"
      });

      setPageQuantity(response.total);
      setConferencias(response.data);
    } catch (err) {
      handleError401(err);
    }
  }, [page]);

  useEffect(() => {
    getConferencias();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  function handleChangeQuantidadeVerificada(
    id: TransferenceConfirmation["id"],
    value?: number
  ) {
    const values = [...conferencias];
    const index = values.findIndex((v) => v.id === id);
    if (!value || values[index].quantidadeEsperada >= value)
      values[index].quantidadeVerificada = value ?? 0;
    setConferencias(values);
  }

  function handleChangeLocalizacao(
    id: TransferenceConfirmation["id"],
    value?: string
  ) {
    const values = [...conferencias];
    const index = values.findIndex((v) => v.id === id);
    values[index].localizacao = value;
    setConferencias(values);
  }

  async function handleConfirmButton() {
    const transfersToExecute = conferencias.filter((conferencia) =>
      idsConferencias.includes(conferencia.id)
    );

    if (transfersToExecute.some((transfer) => !transfer.quantidadeVerificada)) {
      toast({
        title: "Erro ao confirmar conferência",
        description: "Quantidade verificada não pode ser nula",
        status: "error",
        duration: 3000,
        isClosable: true
      });

      onClose();
      return;
    }

    try {
      await productService.confirmTransferences({
        transferences: transfersToExecute.map((transfer) => ({
          id: transfer.id,
          entryAmount: transfer.quantidadeVerificada as number,
          location: transfer.localizacao
        }))
      });

      toast({
        title: "Conferência confirmada com sucesso",
        status: "success",
        duration: 3000,
        isClosable: true
      });
    } catch {
      toast({
        title: "Erro ao confirmar conferência",
        status: "error",
        duration: 3000,
        isClosable: true
      });
    }
    getConferencias();
    onClose();
  }

  return (
    <Stack maxW={1100}>
      <Heading>Conferir Conferências</Heading>

      <Box overflow={"auto"}>
        <Table>
          <Thead>
            <Tr>
              <Th>Código</Th>
              <Th>De</Th>
              <Th>Para</Th>
              <Th>Quantidade Esperada</Th>
              <Th>Quantidade Verificada</Th>
              <Th>Localização</Th>
            </Tr>
          </Thead>

          <Tbody>
            {conferencias.map((conferencia) => {
              const color =
                typeof conferencia.quantidadeVerificada == "number" &&
                conferencia.quantidadeEsperada >
                  conferencia.quantidadeVerificada
                  ? "red.200"
                  : "";

              return (
                <Tr key={"conferencia" + conferencia.id}>
                  <Td backgroundColor={color}>{conferencia.sku}</Td>
                  <Td backgroundColor={color}>Galpão</Td>
                  <Td backgroundColor={color}>Loja</Td>
                  <Td backgroundColor={color}>
                    {conferencia.quantidadeEsperada}
                  </Td>
                  <Td backgroundColor={color}>
                    <Input
                      maxW={20}
                      border={"1px"}
                      borderColor={"black"}
                      textAlign={"center"}
                      type="number"
                      value={"" + conferencia.quantidadeVerificada ?? ""}
                      onChange={(e) => {
                        handleChangeQuantidadeVerificada(
                          conferencia.id,
                          e.target.value ? parseInt(e.target.value) : undefined
                        );
                      }}
                    />
                  </Td>
                  <Td backgroundColor={color}>
                    <Input
                      maxW={40}
                      border={"1px"}
                      borderColor={"black"}
                      textAlign={"center"}
                      type="text"
                      defaultValue={conferencia.localizacao ?? ""}
                      onChange={(e) => {
                        handleChangeLocalizacao(conferencia.id, e.target.value);
                      }}
                    />
                  </Td>
                  <Td backgroundColor={color}>
                    <Checkbox
                      size={"lg"}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setIdsConferencias([
                            ...idsConferencias,
                            conferencia.id
                          ]);
                        } else {
                          setIdsConferencias(
                            idsConferencias.filter(
                              (id) => id !== conferencia.id
                            )
                          );
                        }
                      }}
                    />
                  </Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      </Box>

      <PaginationSelector
        page={page}
        pageQuantity={pageQuantity}
        increasePage={() => {
          if (page < pageMax) setPage(page + 1);
        }}
        decreasePage={() => {
          if (page > 0) setPage(page - 1);
        }}
      />

      <Button
        maxW={200}
        variant={"solid"}
        colorScheme="green"
        backgroundColor={"erica.green"}
        onClick={() => {
          onOpen();
        }}
        p={2}
        size={"md"}
        className="m-[0_auto]"
      >
        Confirmar Transferências
      </Button>

      <ModalConfirm
        isOpen={isOpen}
        onClose={onClose}
        handleConfirm={handleConfirmButton}
      >
        Você realmente deseja confirmar essa conferência?
      </ModalConfirm>
    </Stack>
  );
}
