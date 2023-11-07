import { ColorButton } from "@/components/buttons/colorButton";
import { CustomTable } from "@/components/customTable";
import { EricaLink } from "@/components/ericaLink";
import { OperatorSelector } from "@/components/selectors/operatorSelector";
import {
  EmbarquesResponse,
  embarquesService
} from "@/services/embarques.service";
import {
  Box,
  Checkbox,
  Flex,
  Heading,
  Input,
  Stack,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useToast
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";

export function EmbarqueConferencia() {
  const [embarquesData, setEmbarquesData] = useState<
    (EmbarquesResponse & { quantity: number; observation: string })[]
  >([]);
  const [selecteds, setSelecteds] = useState<number[]>([]);
  const toast = useToast();
  const { containerId } = useParams<{ containerId: string }>();

  const itemsSelecionados = embarquesData.filter((v) =>
    selecteds.includes(v.id)
  );

  const operatorRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    embarquesService
      .getEmbarqueConferences(containerId ?? "")
      .then((data) =>
        setEmbarquesData(
          data.map((d) => ({ ...d, quantity: 0, observation: "" }))
        )
      );
  }, []);

  function handleSelectItem(id: number, isSelected: boolean) {
    if (isSelected) {
      setSelecteds([...selecteds.filter((v) => v !== id)]);
    } else {
      setSelecteds([...selecteds, id]);
    }
  }

  function handleChangeQuantity(id: number, quantity: number) {
    setEmbarquesData(
      embarquesData.map((embarque) => {
        if (embarque.id == id) {
          return {
            ...embarque,
            quantity
          };
        } else {
          return embarque;
        }
      })
    );
  }

  function handleChangeObservation(id: number, observation: string) {
    setEmbarquesData(
      embarquesData.map((embarque) => {
        if (embarque.id == id) {
          return {
            ...embarque,
            observation
          };
        } else {
          return embarque;
        }
      })
    );
  }

  function handleConfirmConference() {
    if (itemsSelecionados.length == 0) {
      toast({
        title: "Nenhum item selecionado!",
        status: "error",
        duration: 3000,
        isClosable: true
      });
    } else if (itemsSelecionados.some((v) => !v.quantity)) {
      toast({
        title:
          "Todos os itens selecionados precisam de uma quantidade verificada!",
        status: "error",
        duration: 3000,
        isClosable: true
      });
    } else if (!operatorRef.current?.value) {
      toast({
        title: "Selecione um operador!",
        status: "error",
        duration: 3000,
        isClosable: true
      });
    } else {
      embarquesService
        .confirmEmbarqueConference(
          itemsSelecionados.map((v) => ({
            id: v.id,
            operator: operatorRef.current!.value as string,
            quantity: v.quantity,
            observation: v.observation
          }))
        )
        .then(() => {
          setEmbarquesData(
            embarquesData.filter((embarque) => !selecteds.includes(embarque.id))
          );

          toast({
            title: "Conferência feita com sucesso!",
            status: "success",
            duration: 3000,
            isClosable: true
          });
        });
    }
  }

  return (
    <Stack gap={4}>
      <Heading>Conferência de Container</Heading>

      {embarquesData.length > 0 ? (
        <>
          <CustomTable>
            <Thead>
              <Tr>
                <Th>Código</Th>
                <Th>Importadora</Th>
                <Th>Container</Th>
                <Th>Quantidade Esperada</Th>
                <Th>Quantidade Verificada</Th>
                <Th>Observação</Th>
                <Th>Confirmar Entrada</Th>
              </Tr>
            </Thead>

            <Tbody>
              {embarquesData.map((embarque) => {
                const isChecked = selecteds.includes(embarque.id);
                const color =
                  embarque.quantity == 0 || !embarque.quantity
                    ? ""
                    : embarque.quantityExpected > embarque.quantity
                    ? "red.200"
                    : "erica.green";

                return (
                  <Tr key={"embarque-conferencia-" + embarque.id}>
                    <Td backgroundColor={color}>{embarque.product.code}</Td>
                    <Td backgroundColor={color}>{embarque.product.importer}</Td>
                    <Td backgroundColor={color}>{embarque.containerId}</Td>
                    <Td backgroundColor={color}>{embarque.quantityExpected}</Td>
                    <Td backgroundColor={color}>
                      <Input
                        type="number"
                        value={embarque.quantity}
                        onChange={(e) =>
                          handleChangeQuantity(
                            embarque.id,
                            parseInt(e.target.value)
                          )
                        }
                      />
                    </Td>
                    <Td backgroundColor={color}>
                      <Input
                        type="text"
                        onChange={(e) =>
                          handleChangeObservation(embarque.id, e.target.value)
                        }
                      />
                    </Td>
                    <Td backgroundColor={color}>
                      <Checkbox
                        isChecked={isChecked}
                        onChange={() =>
                          handleSelectItem(embarque.id, isChecked)
                        }
                      />
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </CustomTable>

          <Flex gap={4}>
            <ColorButton color="green" onClick={handleConfirmConference}>
              Mudar Status para Em Estoque
            </ColorButton>

            <Box>
              <OperatorSelector ref={operatorRef} />
            </Box>
          </Flex>
        </>
      ) : (
        <>
          <p>Todos os itens já foram conferidos!</p>
          <EricaLink to="/embarques">Ir para Embarques.</EricaLink>
        </>
      )}
    </Stack>
  );
}
