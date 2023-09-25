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

export function CriarEntrada() {
  const codigoRef = useRef<HTMLInputElement>(null);
  const quantidadeRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLInputElement>(null);
  const estoqueRef = useRef<HTMLSelectElement>(null);

  function handleConfirm() {
    const codigoValue = codigoRef.current?.value;
    const quantidadeValue = quantidadeRef.current?.value;
    const containerValue = containerRef.current?.value;
    const estoqueValue = estoqueRef.current?.value;

    if (!codigoValue || !quantidadeValue || !containerValue || !estoqueValue) {
      return;
    }

    console.log({ codigoValue, quantidadeValue, containerValue, estoqueValue });
  }

  return (
    <Card w={"550px"}>
      <CardHeader>
        <Heading size={"md"}>Entrada</Heading>
      </CardHeader>

      <CardBody>
        <Grid templateColumns={"1fr 1fr"} gap={6}>
          <FormControl>
            <FormLabel>Código</FormLabel>
            <Input ref={codigoRef} />
          </FormControl>

          <FormControl>
            <FormLabel>Quantidade</FormLabel>
            <Input ref={quantidadeRef} />
          </FormControl>

          <FormControl>
            <FormLabel>Cliente</FormLabel>
            <Input ref={containerRef} />
          </FormControl>

          <FormControl>
            <FormLabel>Para</FormLabel>
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
