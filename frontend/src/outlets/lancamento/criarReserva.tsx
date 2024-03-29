import { Card, CardBody, CardHeader, FormControl, FormLabel, Grid, GridItem, Heading, Input } from "@chakra-ui/react";
import { useRef, useState } from "react";
import { CodeOrEanInput } from "@/components/inputs/codeInput";
import { QuantityInput } from "@/components/inputs/quantity.input";
import { OperatorInput } from "@/components/inputs/operator.input";
import { ObservacaoInput } from "@/components/inputs/observacao.input";
import { StockInput } from "@/components/inputs/stock.input";
import { LancamentoFooter } from "@/components/lancamentoFooter";
import { reservesService } from "@/services/reservesService";
import { DateInput } from "@/components/inputs/dateInput";
import { excelService } from "@/services/excelService";

export function CriarReserva() {
  const [error, setError] = useState<string>("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "error" | "success"
  >("idle");

  const codigoOuEanRef = useRef<HTMLInputElement>(null);
  const quantidadeRef = useRef<HTMLInputElement>(null);
  const clienteRef = useRef<HTMLInputElement>(null);
  const observacaoRef = useRef<HTMLInputElement>(null);
  const operatorRef = useRef<HTMLSelectElement>(null);
  const stockRef = useRef<HTMLSelectElement>(null);
  const dataDeRediradaRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setStatus("loading");

    const stock = stockRef.current?.value;
    const codeOrEan = codigoOuEanRef.current?.value;
    const quantity = parseInt(quantidadeRef.current?.value || "0");
    const client = clienteRef.current?.value;
    const operator = operatorRef.current?.value;
    const dataRetirada = dataDeRediradaRef.current?.value;
    const observation = observacaoRef.current?.value;

    if (
      !codeOrEan ||
      !quantity ||
      !client ||
      !stock ||
      !operator ||
      !dataRetirada
    ) {
      setError("Preencha todos os campos");
      setStatus("idle");
      return;
    }

    reservesService
      .createReserve({
        codeOrEan,
        quantity,
        client,
        stock,
        operator,
        date: new Date(dataRetirada),
        observation
      })
      .then(() => {
        setStatus("success");
        clienteRef.current!.value = "";
        codigoOuEanRef.current!.value = "";
        quantidadeRef.current!.value = "";
        observacaoRef.current!.value = "";
        stockRef.current!.value = "";
        operatorRef.current!.value = "";
        dataDeRediradaRef.current!.value = "";
      })
      .catch((err) => {
        setError(err?.response?.data?.message);
        setStatus("error");
      });
  }

  function handleUploadReserve(file: File) {
    setStatus("loading");
    setError("");

    excelService
      .uploadProductReserve(file)
      .then(() => {
        setStatus("success");
      })
      .catch((err) => {
        setStatus("error");
        setError(err?.response?.data?.message);
      });
  }

  return (
    <Card maxW={"550px"} w={"90vw"}>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <Heading size={"md"}>Reserva</Heading>
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
            <StockInput label="Origem" ref={stockRef} />

            <FormControl>
              <FormLabel>Destino/Cliente</FormLabel>
              <Input required ref={clienteRef} />
            </FormControl>

            <OperatorInput ref={operatorRef} />
            <DateInput label="Data de retirada" ref={dataDeRediradaRef} />
            <GridItem colSpan={2}>
              <ObservacaoInput ref={observacaoRef} />
            </GridItem>
          </Grid>
        </CardBody>

        <LancamentoFooter
          status={status}
          error={error}
          onUpload={handleUploadReserve}
        />
      </form>
    </Card>
  );
}
