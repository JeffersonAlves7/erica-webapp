import {
  Card,
  CardBody,
  CardHeader,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  Heading,
  Input
} from "@chakra-ui/react";
import { useRef, useState } from "react";
import { CodeOrEanInput } from "@/components/inputs/codeInput";
import { QuantityInput } from "@/components/inputs/quantity.input";
import { StockInput } from "@/components/inputs/stock.input";
import { OperatorInput } from "@/components/inputs/operator.input";
import { ObservacaoInput } from "@/components/inputs/observacao.input";
import { LancamentoFooter } from "@/components/lancamentoFooter";
import { productService } from "@/services/product.service";
import { handleError401 } from "@/services/api";
import { excelService } from "@/services/excel.service";

export function CriarDevolucao() {
  const [error, setError] = useState<string>("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "error" | "success"
  >("idle");

  const stockRef = useRef<HTMLSelectElement>(null);
  const codigoOuEanRef = useRef<HTMLInputElement>(null);
  const quantidadeRef = useRef<HTMLInputElement>(null);
  const clienteRef = useRef<HTMLInputElement>(null);
  const observacaoRef = useRef<HTMLInputElement>(null);
  const operadorRef = useRef<HTMLSelectElement>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setStatus("loading");

    const codigo = codigoOuEanRef.current?.value;
    const quantidade = parseInt(quantidadeRef.current?.value || "0");
    const client = clienteRef.current?.value;
    const operator = operadorRef.current?.value;
    const stock = stockRef.current?.value;
    const observacao = observacaoRef.current?.value;

    if (!codigo || !quantidade || !client || !stock || !operator) {
      setError("Preencha todos os campos");
      setStatus("idle");
      return;
    }

    productService
      .createDevolution({
        codeOrEan: codigo,
        quantity: quantidade,
        client,
        operator,
        stock,
        observation: observacao
      })
      .then(() => {
        setStatus("success");
        codigoOuEanRef.current!.value = "";
        quantidadeRef.current!.value = "";
        clienteRef.current!.value = "";
        operadorRef.current!.value = "";
        stockRef.current!.value = "";
        observacaoRef.current!.value = "";
      })
      .catch((err) => {
        handleError401(err);
        setError(err.message);
        setStatus("error");
      });
  }

  function handleUploadDevolution(file: File) {
    setStatus("loading");
    setError("");

    excelService
      .uploadProductDevolution(file)
      .then(() => {
        setStatus("success");
      })
      .catch((err) => {
        handleError401(err);
        setError(err.message);
        setStatus("error");
      });
  }

  return (
    <Card maxW={"550px"} w={"90vw"}>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <Heading size={"md"}>Devolução</Heading>
        </CardHeader>

        <CardBody>
          <Grid
            templateColumns={{
              base: "1fr",
              md: "1fr 1fr"
            }}
            gap={6}
          >
            <CodeOrEanInput ref={codigoOuEanRef} />
            <QuantityInput ref={quantidadeRef} />
            <StockInput label="Destino" ref={stockRef} />
            <FormControl>
              <FormLabel>Origem/Cliente</FormLabel>
              <Input required ref={clienteRef} />
            </FormControl>
            <OperatorInput ref={operadorRef} />
            <GridItem colSpan={2}>
              <ObservacaoInput  ref={observacaoRef} />
            </GridItem>
          </Grid>
        </CardBody>

        <LancamentoFooter
          status={status}
          error={error}
          onUpload={handleUploadDevolution}
        />
      </form>
    </Card>
  );
}
