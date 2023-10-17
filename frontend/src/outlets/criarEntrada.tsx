import { Importer } from "@/types/importer.enum";
import { productService } from "@/services/product.service";
import {
  Card,
  CardBody,
  CardHeader,
  Grid,
  Heading
} from "@chakra-ui/react";
import { useRef, useState } from "react";
import { handleError401 } from "@/services/api";
import { LancamentoFooter } from "@/components/lancamentoFooter";
import { OperatorInput } from "@/components/inputs/operator.input";
import { ObservacaoInput } from "@/components/inputs/observacao.input";
import { CodeOrEanInput } from "@/components/inputs/codeOrEan.input";
import { QuantityInput } from "@/components/inputs/quantity.input";
import { ContainerInput } from "@/components/inputs/container.input";
import { ImporterInput } from "@/components/inputs/importer.input";

export function CriarEntrada() {
  const [error, setError] = useState<string>("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "error" | "success"
  >("idle");

  const codigoRef = useRef<HTMLInputElement>(null);
  const quantidadeRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLInputElement>(null);
  const observacaoRef = useRef<HTMLInputElement>(null);
  const operatorRef = useRef<HTMLSelectElement>(null);
  const importerRef = useRef<HTMLSelectElement>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setStatus("loading");

    const codigoValue = codigoRef.current?.value;
    const quantidadeValue = parseInt(quantidadeRef.current?.value || "0");
    const containerValue = containerRef.current?.value;
    const observacaoValue = observacaoRef.current?.value;
    const operator = operatorRef.current?.value;
    const importer = importerRef.current?.value as Importer;

    if (
      !codigoValue ||
      !quantidadeValue ||
      !containerValue ||
      !importer ||
      !operator
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
        importer,
        operator,
        observation: observacaoValue
      })
      .then(() => {
        console.log("Entrada criada com sucesso!");
        setStatus("success");
      })
      .catch((err) => {
        handleError401(err);
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
            <CodeOrEanInput ref={codigoRef} />
            <QuantityInput ref={quantidadeRef} />
            <ContainerInput ref={containerRef} />
            <ImporterInput ref={importerRef} />
            <OperatorInput ref={operatorRef} />
            <ObservacaoInput ref={observacaoRef} />
          </Grid>
        </CardBody>

        <LancamentoFooter status={status} error={error} />
      </form>
    </Card>
  );
}
