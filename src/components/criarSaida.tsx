import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  FormControl,
  FormLabel,
  Grid,
  Heading,
  Input,
  Select
} from "@chakra-ui/react";
import { useRef } from "react";

export function CriarSaida() {
  const codigoRef = useRef<HTMLInputElement>(null);
  const quantidadeRef = useRef<HTMLInputElement>(null);
  const clienteRef = useRef<HTMLInputElement>(null);
  const operadorRef = useRef<HTMLInputElement>(null);
  const estoqueRef = useRef<HTMLSelectElement>(null);

  function handleConfirm() {
    const codigoValue = codigoRef.current?.value;
    const quantidadeValue = quantidadeRef.current?.value;
    const clienteValue = clienteRef.current?.value;
    const operadorValue = operadorRef.current?.value;
    const estoqueValue = estoqueRef.current?.value;

    if (
      !codigoValue ||
      !quantidadeValue ||
      !clienteValue ||
      !operadorValue ||
      !estoqueValue
    ) {
      return;
    }

    console.log({
      codigoValue,
      quantidadeValue,
      clienteValue,
      operadorValue,
      estoqueValue
    });
  }

  return (
    <Card w={"550px"}>
      <CardHeader>
        <Heading size={"md"}>Saída</Heading>
      </CardHeader>

      <CardBody>
        <Grid templateColumns={"1fr 1fr"} gap={6}>
          <FormControl>
            <FormLabel>Código</FormLabel>
            <Input ref={codigoRef} />
          </FormControl>

          <FormControl>
            <FormLabel>Quantidade</FormLabel>
            <Input type="number" ref={quantidadeRef} />
          </FormControl>

          <FormControl>
            <FormLabel>Cliente</FormLabel>
            <Input ref={clienteRef} />
          </FormControl>

          <FormControl>
            <FormLabel>Operador</FormLabel>
            <Input ref={operadorRef} />
          </FormControl>

          <FormControl>
            <FormLabel>De</FormLabel>
            <Select  ref={estoqueRef} placeholder={"Selecione um estoque"}>
              <option value="Galpão">Galpão</option>
              <option value="Loja">Loja</option>
            </Select>
          </FormControl>
        </Grid>
      </CardBody>

      <CardFooter>
        <Button
          onClick={handleConfirm}
          colorScheme="green"
          backgroundColor={"erica.green"}
          mt={6}
        >
          Criar
        </Button>
      </CardFooter>
    </Card>
  );
}
