import { OperadorSelector } from "@/components/operadorSelector";
import { productService } from "@/services/product.service";
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
  const observacaoRef = useRef<HTMLInputElement>(null);
  const locationRef = useRef<HTMLInputElement>(null);

  function handleConfirm(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const codigoValue = codigoRef.current?.value;
    const quantidadeValue = quantidadeRef.current?.value;
    const observacaoValue = observacaoRef.current?.value;
    const locationValue = locationRef.current?.value;

    if (!codigoValue || !quantidadeValue || !operator) {
      return;
    }

    productService
      .createTransference({
        codeOrEan: codigoValue,
        quantity: parseInt(quantidadeValue),
        operator,
        observation: observacaoValue,
        location: locationValue
      })
      .then(() => {})
      .catch((err) => {});
  }

  return (
    <Card w={"550px"}>
      <form onSubmit={handleConfirm}>
        <CardHeader>
          <Heading size={"md"}>Criar Transferência</Heading>
        </CardHeader>

        <CardBody>
          <Grid templateColumns={"1fr 1fr"} gap={6}>
            <FormControl>
              <FormLabel>Código ou Ean</FormLabel>
              <Input ref={codigoRef} />
            </FormControl>

            <FormControl>
              <FormLabel>Quantidade</FormLabel>
              <Input type="number" ref={quantidadeRef} />
            </FormControl>

            <FormControl>
              <FormLabel>Operador</FormLabel>
              <OperadorSelector onChange={(value) => setOperator(value)} />
            </FormControl>

            <FormControl>
              <FormLabel>Destino</FormLabel>
              <Input ref={locationRef} placeholder="Ex.: Loja 1 Andar 2"/>
            </FormControl>

            <FormControl>
              <FormLabel>Observações</FormLabel>
              <Input ref={observacaoRef} />
            </FormControl>
          </Grid>
        </CardBody>

        <CardFooter>
          <Flex w={"full"} justify={"space-between"} gap={6}>
            <Button
              type="reset"
              colorScheme="red"
              backgroundColor={"erica.red"}
            >
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
      </form>
    </Card>
  );
}
