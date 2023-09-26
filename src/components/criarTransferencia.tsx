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
import { useRef } from "react";
import { Link as RouterLink } from "react-router-dom";

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
        <Flex w={"full"} justify={"space-between"} gap={6}>
          <Button
            onClick={handleConfirm}
            colorScheme="green"
            backgroundColor={"erica.green"}
            mr={6}
          >
            Criar
          </Button>
          <ChakraLink
            as={RouterLink}
            to={"./conferencias"}
            textDecoration={"underline"}
            textColor={'#7B65FF'}
          >
            Conferir Transferências
          </ChakraLink>
        </Flex>
      </CardFooter>
    </Card>
  );
}
