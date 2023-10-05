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
  useDisclosure
} from "@chakra-ui/react";
import { useRef, useState } from "react";
import { BsFillCheckSquareFill } from "react-icons/bs";

interface Conferencia {
  id: number;
  sku: string;
  de: string;
  para: string;
  quantidadeEsperada: number;
  quantidadeVerificada?: number | string;
}

const exampleConferencia: Conferencia = {
  id: 1,
  sku: "AZ-0002",
  de: "Galpão",
  para: "Loja",
  quantidadeEsperada: 5,
  quantidadeVerificada: 4
};

export function Conferencias() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [conferencias, setConferencias] = useState<Conferencia[]>([
    exampleConferencia,
    {
      ...exampleConferencia,
      id: 2,
      sku: "AZ-0004",
      quantidadeVerificada: undefined
    }
  ]);
  const [idConferenciaToConfirm, setIdConferenciaToConfirm] = useState<Conferencia['id'] | null>(null);
  const cancelRef = useRef(null);

  function handleChangeQuantidadeVerificada(
    id: Conferencia["id"],
    value?: number
  ) {
    const values = [...conferencias];
    const index = values.findIndex((v) => v.id === id);
    if (!value || values[index].quantidadeEsperada >= value)
      values[index].quantidadeVerificada = value ?? "";
    setConferencias(values);
  }

  function handleConfirmButton(){
    console.log({ idConferenciaToConfirm });
    onClose();
  }

  return (
    <Stack>
      <Heading>Conferir Conferências</Heading>

      <Table>
        <Thead>
          <Tr>
            <Th>Código</Th>
            <Th>Quantidade Esperada</Th>
            <Th>Quantidade Verificada</Th>
            <Th>Confirmar Transferência</Th>
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
                  <Button
                    variant={"ghost"}
                    onClick={() => {
                      setIdConferenciaToConfirm(conferencia.id);
                      onOpen();
                    }}
                    p={2}
                    size={"md"}
                  >
                    <BsFillCheckSquareFill className="h-full w-full text-erica-green" />
                  </Button>
                </Td>
              </Tr>
            );
          })}
        </Tbody>
        <AlertDialog
          isOpen={isOpen}
          onClose={onClose}
          leastDestructiveRef={cancelRef}
        >
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogBody>
                <Text>
                  Você realmente deseja confirmar essa conferência?
                </Text>
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
      </Table>
    </Stack>
  );
}
