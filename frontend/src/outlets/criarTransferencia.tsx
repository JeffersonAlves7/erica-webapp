import { OperadorSelector } from "@/components/operadorSelector";
import { Operator } from "@/types/operator.enum";
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
  Link as ChakraLink,
  Flex
} from "@chakra-ui/react";
import { useRef, useState } from "react";
import { Link as RouterLink } from "react-router-dom";

export function CriarTransferencia() {
  const [operator, setOperator] = useState<Operator>("" as Operator);

  const codigoRef = useRef<HTMLInputElement>(null);
  const quantidadeRef = useRef<HTMLInputElement>(null);
  const observacoesRef = useRef<HTMLInputElement>(null);

  function handleConfirm(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const codigoValue = codigoRef.current?.value;
    const quantidadeValue = quantidadeRef.current?.value;
    const observacoesValue = observacoesRef.current?.value;

    if (!codigoValue || !quantidadeValue || !operator || !observacoesValue) {
      return;
    }

    console.log({ codigoValue, quantidadeValue, observacoesValue, operator });
  }

  return (
    <Card w={"550px"}>
      <form onSubmit={handleConfirm}></form>
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
            <FormLabel>Operador</FormLabel>
            <OperadorSelector onChange={(value) => setOperator(value)}/>
          </FormControl>

          <FormControl>
            <FormLabel>Observações</FormLabel>
            <Input ref={observacoesRef}/>
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
        <Flex w={"full"} justify={"space-between"} gap={6}>
          <Button type="reset" colorScheme="red" backgroundColor={"erica.red"}>
            Cancelar
          </Button>
          <Button
            colorScheme="green"
            type="submit"
            backgroundColor={"erica.green"}
            mr={6}
          >
            Criar
          </Button>
          <ChakraLink
            as={RouterLink}
            to={"./conferencias"}
            textDecoration={"underline"}
            textColor={"#7B65FF"}
          >
            Conferir Transferências
          </ChakraLink>
        </Flex>
      </CardFooter>
    </Card>
  );
}
