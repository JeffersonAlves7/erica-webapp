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
} from "@chakra-ui/react";
import { useRef } from "react";

export function CriarTransferencia() {
  const codigoRef = useRef<HTMLInputElement>(null);
  const quantidadeRef = useRef<HTMLInputElement>(null);

  function handleConfirm() {
    const codigoValue = codigoRef.current?.value;
    const quantidadeValue = quantidadeRef.current?.value;

    if (!codigoValue || !quantidadeValue) {
      return;
    }

    console.log({ codigoValue, quantidadeValue });
  }

  return (
    <Card w={"550px"}>
      <CardHeader>
        <Heading size={"md"}>Criar Transferência</Heading>
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
            <FormLabel>De</FormLabel>
            <Input disabled defaultValue={"Galpão"} />
          </FormControl>

          <FormControl>
            <FormLabel>Para</FormLabel>
            <Input disabled defaultValue={"Loja"} />
          </FormControl>
        </Grid>
      </CardBody>

      <CardFooter>
        <Button
          onClick={handleConfirm}
          colorScheme="green"
          backgroundColor={"erica.green"}
          mr={6}
        >
          Criar
        </Button>
      </CardFooter>
    </Card>
  );
}
