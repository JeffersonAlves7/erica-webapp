import { CodeOrEanInput } from "@/components/inputs/codeInput";
import { DestinyInput } from "@/components/inputs/destiny.input";
import { ObservacaoInput } from "@/components/inputs/observacao.input";
import { OperatorInput } from "@/components/inputs/operator.input";
import { QuantityInput } from "@/components/inputs/quantity.input";
import { LancamentoFooterWithLink } from "@/components/lancamentoFooterWithLink";
import { productService } from "@/services/product.service";
import { Operator } from "@/types/operator.enum";
import {
  Card,
  CardBody,
  CardHeader,
  Grid,
  Heading,
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
  const locationRef = useRef<HTMLInputElement>(null);
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
        setError(err.response.data.message);
      });
  }

  return (
    <Card w={"550px"}>
      <form onSubmit={handleConfirm}>
        <CardHeader>
          <Heading size={"md"}>Criar Transferência</Heading>
        </CardHeader>

        <CardBody>
          <Grid templateColumns={"1fr 1fr"} gap={6}>
            <CodeOrEanInput ref={codigoRef} />
            <QuantityInput ref={quantidadeRef} />
            <OperatorInput ref={operatorRef} />
            <DestinyInput ref={locationRef} />
            <ObservacaoInput ref={observacaoRef} />
          </Grid>
        </CardBody>

        <LancamentoFooterWithLink
          status={status}
          error={error}
          to="./conferencias"
          linkText="Conferir Transferências"
        />
      </form>
    </Card>
  );
}
