import { Importer } from "@/types/importer.enum";
import { Operator } from "@/types/operator.enum";
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
  Input,
  Select
} from "@chakra-ui/react";
import { useRef, useState } from "react";
import { tokenService } from "@/services/token.service";

export function CriarEntrada() {
  const [error, setError] = useState<string>("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "error" | "success"
  >("idle");

  const codigoRef = useRef<HTMLInputElement>(null);
  const quantidadeRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLInputElement>(null);
  const importadoraRef = useRef<HTMLSelectElement>(null);
  const operadorRef = useRef<HTMLSelectElement>(null);
  const observacaoRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setStatus("loading");

    const codigoValue = codigoRef.current?.value;
    const quantidadeValue = parseInt(quantidadeRef.current?.value || "0");
    const containerValue = containerRef.current?.value;
    const importadoraValue = importadoraRef.current?.value as Importer;
    const operadorValue = operadorRef.current?.value as Operator;
    const observacaoValue = observacaoRef.current?.value;

    if (
      !codigoValue ||
      !quantidadeValue ||
      !containerValue ||
      !importadoraValue ||
      !operadorValue
    ) {
      setError("Preencha todos os campos");
      setStatus("idle");
      return;
    }

    productService
      .createEntry({
        codeOrEan: codigoValue,
        quantity: quantidadeValue,
        container: containerValue,
        importer: importadoraValue,
        operator: operadorValue,
        observation: observacaoValue
      })
      .then(() => {
        console.log("Entrada criada com sucesso!");
        setStatus("success");
      })
      .catch((err) => {
        if (err.response.status === 401) {
          tokenService.removeLocalAccessToken();
          tokenService.removeLocalRefreshToken();
          window.location.reload();
        }

        switch (err.response.data.message) {
          case "Product not found":
            setError("Produto não encontrado");
            break;
          default:
            setError("Erro ao criar entrada");
            break;
        }
        setStatus("error");
      });
  }

  return (
    <Card w={"550px"}>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <Heading size={"md"}>Entrada</Heading>
        </CardHeader>

        <CardBody>
          <Grid templateColumns={"1fr 1fr"} gap={6}>
            <FormControl>
              <FormLabel>Código ou Ean</FormLabel>
              <Input required ref={codigoRef} />
            </FormControl>

            <FormControl>
              <FormLabel>Quantidade</FormLabel>
              <Input required type="number" min={1} ref={quantidadeRef} />
            </FormControl>

            <FormControl>
              <FormLabel>Lote Container</FormLabel>
              <Input required ref={containerRef} />
            </FormControl>

            <FormControl>
              <FormLabel>Importadora</FormLabel>
              <Select
                required
                ref={importadoraRef}
                placeholder={"Selecione um estoque"}
              >
                <option value={Importer.ALPHA_YNFINITY}>Alpha Ynfinity</option>
                <option value={Importer.ATTUS}>Attus</option>
                <option value={Importer.ATTUS_BLOOM}>Attus Bloom</option>
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel>Operador</FormLabel>
              <Select
                required
                ref={operadorRef}
                placeholder={"Selecione um operador"}
              >
                {Object.keys(Operator).map((key) => {
                  return (
                    <option key={"operator-" + key} value={key}>
                      {key}
                    </option>
                  );
                })}
              </Select>
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
