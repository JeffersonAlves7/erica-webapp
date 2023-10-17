import { handleError401 } from "@/services/api";
import { productService } from "@/services/product.service";
import {
  AlertDialog,
  AlertDialogBody,
  Text,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogOverlay,
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
  Checkbox
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";

interface Conferencia {
  id: number;
  sku: string;
  quantidadeEsperada: number;
  quantidadeVerificada?: number;
  localizacao?: string;
}

export function Conferencias() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [page, setPage] = useState(0);
  const [conferencias, setConferencias] = useState<Conferencia[]>([]);
  const [idsConferencias, setIdsConferencias] = useState<Conferencia["id"][]>(
    []
  );
  const cancelRef = useRef(null);

  useEffect(() => {
    productService
      .getAllTransferences({
        page,
        confirmed: false,
        limit: 20,
        orderBy: "desc"
      })
      .then((res) => {
        const transferencias = res.data.map((transferencia) => {
          return {
            id: transferencia.id,
            sku: transferencia.product.code,
            quantidadeEsperada: transferencia.entryExpected,
            quantidadeVerificada: undefined,
            localizacao: transferencia.location
          };
        });

        setConferencias(transferencias);
      })
      .catch((err) => {
        handleError401(err);
      });
  }, [page]);

  function handleChangeQuantidadeVerificada(
    id: Conferencia["id"],
    value?: number
  ) {
    const values = [...conferencias];
    const index = values.findIndex((v) => v.id === id);
    if (!value || values[index].quantidadeEsperada >= value)
      values[index].quantidadeVerificada = value ?? 0;
    setConferencias(values);
  }

  function handleChangeLocalizacao(id: Conferencia["id"], value?: string) {
    const values = [...conferencias];
    const index = values.findIndex((v) => v.id === id);
    values[index].localizacao = value;
    setConferencias(values);
  }

  function handleConfirmButton() {
    const transfersToExecute = conferencias.filter((conferencia) =>
      idsConferencias.includes(conferencia.id)
    );

    if (transfersToExecute.some((transfer) => !transfer.quantidadeVerificada)) {
      onClose();
      return;
    }

    productService
      .confirmTransferences({
        transferences: transfersToExecute.map((transfer) => ({
          id: transfer.id,
          entryAmount: transfer.quantidadeVerificada
            ? transfer.quantidadeVerificada
            : 0,
          location: transfer.localizacao
        }))
      })
      .then(() => {
        setConferencias(
          conferencias.filter(
            (conferencia) => !idsConferencias.includes(conferencia.id)
          )
        );
      })
      .catch((err) => {
        handleError401(err);
      });
    onClose();
  }

  return (
    <Stack maxW={1100}>
      <Heading>Conferir Conferências</Heading>

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
              conferencia.quantidadeEsperada > conferencia.quantidadeVerificada
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
                          idsConferencias.filter((id) => id !== conferencia.id)
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

      <AlertDialog
        isOpen={isOpen}
        onClose={onClose}
        leastDestructiveRef={cancelRef}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogBody>
              <Text>Você realmente deseja confirmar essa conferência?</Text>
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button colorScheme="red" ref={cancelRef} onClick={onClose}>
                Cancelar
              </Button>
              <Button
                colorScheme="green"
                backgroundColor={"erica.green"}
                onClick={handleConfirmButton}
                ml={3}
              >
                Confirmar
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Stack>
  );
}
