import { productService } from "@/services/product.service";
import {
  Alert,
  AlertIcon,
  Box,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  Heading,
  Input
} from "@chakra-ui/react";
import { useRef, useState } from "react";
import { handleError401 } from "@/services/api";
import { Operator } from "@/types/operator.enum";
import { OperadorSelector } from "@/components/operadorSelector";
import { StockSelector } from "@/components/stockSelector";
import { Stock } from "@/types/stock.enum";

export function CriarDevolucao() {
  const [error, setError] = useState<string>("");
  const [operator, setOperator] = useState<Operator>("" as Operator);
  const [stock, setStock] = useState<Stock>("" as Stock);
  const [status, setStatus] = useState<
    "idle" | "loading" | "error" | "success"
  >("idle");

  const codigoOuEanRef = useRef<HTMLInputElement>(null);
  const quantidadeRef = useRef<HTMLInputElement>(null);
  const clienteRef = useRef<HTMLInputElement>(null);
  const observacaoRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setStatus("loading");

    const codigoValue = codigoOuEanRef.current?.value;
    const quantidadeValue = parseInt(quantidadeRef.current?.value || "0");
    const containerValue = clienteRef.current?.value;
    const observacaoValue = observacaoRef.current?.value;

    if (
      !codigoValue ||
      !quantidadeValue ||
      !containerValue ||
      !stock ||
      !operator
    ) {
      setError("Preencha todos os campos");
      setStatus("idle");
      return;
    }

    // productService
    //   .createEntry({
    //     codeOrEan: codigoValue,
    //     quantity: quantidadeValue,
    //     container: containerValue,
    //     stock,
    //     operator,
    //     observation: observacaoValue
    //   })
    //   .then(() => {
    //     console.log("Entrada criada com sucesso!");
    //     setStatus("success");
    //   })
    //   .catch((err) => {
    //     handleError401(err);
    //     switch (err.response.data.message) {
    //       case "Product not found":
    //         setError("Produto não encontrado");
    //         break;
    //       default:
    //         setError("Erro ao criar entrada");
    //         break;
    //     }
    //     setStatus("error");
    //   });
  }

  return (
    <Card w={"550px"}>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <Heading size={"md"}>Devolução</Heading>
        </CardHeader>

        <CardBody>
          <Grid templateColumns={"1fr 1fr"} gap={6}>
            <FormControl>
              <FormLabel>Código ou Ean</FormLabel>
              <Input required ref={codigoOuEanRef} />
            </FormControl>

            <FormControl>
              <FormLabel>Quantidade</FormLabel>
              <Input required type="number" min={1} ref={quantidadeRef} />
            </FormControl>

            <FormControl>
              <FormLabel>Cliente</FormLabel>
              <Input required ref={clienteRef} />
            </FormControl>

            <FormControl>
              <FormLabel>Destino</FormLabel>
              <StockSelector onChange={(value) => setStock(value)} />
            </FormControl>

            <FormControl>
              <FormLabel>Operador</FormLabel>
              <OperadorSelector onChange={(value) => setOperator(value)} />
            </FormControl>

            <FormControl>
              <FormLabel>Observação</FormLabel>
              <Input ref={observacaoRef} />
            </FormControl>
          </Grid>
        </CardBody>

        <CardFooter>
          <Box mt={3} w={"full"}>
            {status == "error" && error && (
              <Alert status="error">
                <AlertIcon />
                {error}
              </Alert>
            )}
            {status == "success" && (
              <Alert status="success">
                <AlertIcon />
                Entrada criada com sucesso!
              </Alert>
            )}
            <Flex mt={3} gap={3}>
              <Button type="reset" colorScheme="red">
                Cancelar
              </Button>
              <Button
                type="submit"
                colorScheme="green"
                backgroundColor={"erica.green"}
              >
                Criar
              </Button>
            </Flex>
          </Box>
        </CardFooter>
      </form>
    </Card>
  );
}
