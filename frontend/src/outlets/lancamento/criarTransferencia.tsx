import { EricaLink } from "@/components/ericaLink";
import { CodeOrEanInput } from "@/components/inputs/codeInput";
import { LojaInput } from "@/components/inputs/lojaInput";
import { ObservacaoInput } from "@/components/inputs/observacao.input";
import { OperatorInput } from "@/components/inputs/operator.input";
import { QuantityInput } from "@/components/inputs/quantity.input";
import { LancamentoFooterWithLink } from "@/components/lancamentoFooterWithLink";
import { excelService } from "@/services/excel.service";
import { productService } from "@/services/product.service";
import { Operator } from "@/types/operator.enum";
import {
  Card,
  CardBody,
  CardHeader,
  Flex,
  Grid,
  GridItem,
  Heading
} from "@chakra-ui/react";
import { useRef, useState } from "react";

export function CriarTransferencia() {
  const [error, setError] = useState<string>("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "error" | "success"
  >("idle");

  const codigoRef = useRef<HTMLInputElement>(null);
  const quantidadeRef = useRef<HTMLInputElement>(null);
  const observacaoRef = useRef<HTMLInputElement>(null);
  const locationRef = useRef<HTMLSelectElement>(null);
  const operatorRef = useRef<HTMLSelectElement>(null);

  function handleConfirm(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setStatus("loading");
    setError("");

    const codigoValue = codigoRef.current?.value;
    const quantidadeValue = quantidadeRef.current?.value;
    const observacaoValue = observacaoRef.current?.value;
    const locationValue = locationRef.current?.value;
    const operator = operatorRef.current?.value as Operator;

    if (!codigoValue || !quantidadeValue || !operator) {
      setError("Preencha todos os campos");
      setStatus("error");
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
      .then(() => {
        setStatus("success");
        codigoRef.current!.value = "";
        quantidadeRef.current!.value = "";
        observacaoRef.current!.value = "";
        locationRef.current!.value = "";
        operatorRef.current!.value = "";
      })
      .catch((err) => {
        setStatus("error");
        setError(err?.response?.data?.message || err.message);
      });
  }

  function handleImportTransference(file: File) {
    setStatus("loading");
    setError("");

    excelService
      .uploadProductTransfer(file)
      .then(() => {
        setStatus("success");
      })
      .catch((err) => {
        setStatus("error");
        setError(err?.response?.data?.message || err.message);
      });
  }

  return (
    <Card maxW={"550px"} w={"90vw"}>
      <form onSubmit={handleConfirm}>
        <CardHeader>
          <Flex justify={"space-between"}>
            <Heading size={"md"}>Criar Transferência</Heading>

            <EricaLink to="./historico">Histórico de Transferências</EricaLink>
          </Flex>
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
            <OperatorInput ref={operatorRef} />
            <LojaInput ref={locationRef} />
            <GridItem colSpan={2}>
              <ObservacaoInput ref={observacaoRef} />
            </GridItem>
          </Grid>
        </CardBody>

        <LancamentoFooterWithLink
          status={status}
          error={error}
          to="./conferencias"
          linkText="Conferir Transferências"
          onUpload={handleImportTransference}
        />
      </form>
    </Card>
  );
}
