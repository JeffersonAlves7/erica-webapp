import { ColorButton } from "@/components/buttons/colorButton";
import { CustomTable } from "@/components/customTable";
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

export function EmbarqueConferencia() {
  const [embarquesData, setEmbarquesData] = useState<
    (EmbarquesResponse & { quantity: number; observation: string })[]
  >([]);
  const [selecteds, setSelecteds] = useState<number[]>([]);
  const toast = useToast();

  const itemsSelecionados = embarquesData.filter((v) =>
    selecteds.includes(v.id)
  );

  const operatorRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    embarquesService
      .getEmbarqueConferences()
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
        .then(() =>
          setEmbarquesData(
            embarquesData.filter((embarque) => !selecteds.includes(embarque.id))
          )
        );
    }
  }

  return (
    <Stack gap={4}>
      <Heading>Conferência de Container</Heading>

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

            return (
              <Tr key={"embarque-conferencia-" + embarque.id}>
                <Td>{embarque.product.code}</Td>
                <Td>{embarque.product.importer}</Td>
                <Td>{embarque.containerId}</Td>
                <Td>{embarque.quantityExpected}</Td>
                <Td>
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
                <Td>
                  <Input
                    type="text"
                    onChange={(e) =>
                      handleChangeObservation(embarque.id, e.target.value)
                    }
                  />
                </Td>
                <Td>
                  <Checkbox
                    isChecked={isChecked}
                    onChange={() => handleSelectItem(embarque.id, isChecked)}
                  />
                </Td>
                <Td></Td>
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
    </Stack>
  );
}
