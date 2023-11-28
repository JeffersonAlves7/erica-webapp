import { CodeOrEanInput } from "@/components/inputs/codeInput";
import { StockInput } from "@/components/inputs/stock.input";
import { ObservacaoInput } from "@/components/inputs/observacao.input";
import { OperatorInput } from "@/components/inputs/operator.input";
import { QuantityInput } from "@/components/inputs/quantity.input";
import { LancamentoFooter } from "@/components/lancamentoFooter";
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
import { productService } from "@/services/productService";
import { Operator } from "@/types/operator.enum";
import { Stock } from "@/types/stock.enum";
import { excelService } from "@/services/excelService";
import { handleError401 } from "@/services/api";

export function CriarSaida() {
  const [status, setStatus] = useState<
    "idle" | "loading" | "error" | "success"
  >("idle"); // 'idle' | 'loading' | 'error' | 'success'
  const [error, setError] = useState<string>("");

  const codigoRef = useRef<HTMLInputElement>(null);
  const quantidadeRef = useRef<HTMLInputElement>(null);
  const clienteRef = useRef<HTMLInputElement>(null);
  const observacaoRef = useRef<HTMLInputElement>(null);
  const operadorRef = useRef<HTMLSelectElement>(null);
  const estoqueRef = useRef<HTMLSelectElement>(null);

  function handleConfirm(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setStatus("loading");

    const codigoValue = codigoRef.current?.value;
    const quantidadeValue = quantidadeRef.current?.value;
    const clienteValue = clienteRef.current?.value;
    const observacalValue = observacaoRef.current?.value;
    const operator = operadorRef.current?.value as Operator;
    const estoque = estoqueRef.current?.value as Stock;

    if (
      !codigoValue ||
      !quantidadeValue ||
      !clienteValue ||
      !operator ||
      !estoque
    ) {
      setError("Preencha todos os campos");
      setStatus("idle");
    }

    productService
      .createExit({
        client: clienteValue ?? "",
        codeOrEan: codigoValue ?? "",
        quantity: parseInt(quantidadeValue ?? ""),
        operator: operator,
        from: estoque,
        observation: observacalValue
      })
      .then(() => {
        setStatus("success");
        codigoRef.current!.value = "";
        quantidadeRef.current!.value = "";
        clienteRef.current!.value = "";
        observacaoRef.current!.value = "";
        operadorRef.current!.value = "";
        estoqueRef.current!.value = "";
      })
      .catch((err) => {
        handleError401(err);
        setError(err?.response?.data?.message || err.message);
        setStatus("error");
      });
  }

  function handleUpload(file: any) {
    setStatus("loading");
    setError("");

    excelService
      .uploadProductsExit(file)
      .then(() => {
        setStatus("success");
      })
      .catch((err) => {
        handleError401(err);
        setError(err?.response?.data?.message || err.message);
        setStatus("error");
      });
  }

  return (
    <Card maxW={"550px"} w={"90vw"}>
      <form onSubmit={handleConfirm}>
        <CardHeader>
          <Heading size={"md"}>Saída</Heading>
        </CardHeader>

        <CardBody>
          <Grid
            templateColumns={{
              base: "1fr",
              md: "1fr 1fr"
            }}
            gap={6}
          >
            <CodeOrEanInput ref={codigoRef} />
            <QuantityInput ref={quantidadeRef} />
            <StockInput label="Origem" ref={estoqueRef} />

            <FormControl>
              <FormLabel>Destino/Cliente</FormLabel>
              <Input required ref={clienteRef} />
            </FormControl>

            <OperatorInput ref={operadorRef} />
            <GridItem colSpan={2}>
              <ObservacaoInput ref={observacaoRef} />
            </GridItem>
          </Grid>
        </CardBody>

        <LancamentoFooter
          status={status}
          error={error}
          onUpload={handleUpload}
        />
      </form>
    </Card>
  );
}
