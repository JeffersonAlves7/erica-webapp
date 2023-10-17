import { CodeOrEanInput } from "@/components/inputs/codeInput";
import { DestinyInput } from "@/components/inputs/destiny.input";
import { ObservacaoInput } from "@/components/inputs/observacao.input";
import { OperatorInput } from "@/components/inputs/operator.input";
import { QuantityInput } from "@/components/inputs/quantity.input";
import { LancamentoFooter } from "@/components/lancamentoFooter";
import { productService } from "@/services/product.service";
import { Operator } from "@/types/operator.enum";
import {
  Card,
  CardBody,
  CardHeader,
  Grid,
  Heading,
  Link as ChakraLink,
  Flex
} from "@chakra-ui/react";
import { useRef, useState } from "react";
import { Link as RouterLink } from "react-router-dom";

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
    const codigoValue = codigoRef.current?.value;
    const quantidadeValue = quantidadeRef.current?.value;
    const observacaoValue = observacaoRef.current?.value;
    const locationValue = locationRef.current?.value;
    const operator = operatorRef.current?.value as Operator;

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
            <CodeOrEanInput ref={codigoRef} />
            <QuantityInput ref={quantidadeRef} />
            <OperatorInput ref={operatorRef} />
            <DestinyInput ref={locationRef} />
            <ObservacaoInput ref={observacaoRef} />
          </Grid>
        </CardBody>

        <Flex align={"center"} justify={"space-between"}>
          <LancamentoFooter status={status} error={error} />
          <ChakraLink
            as={RouterLink}
            to={"./conferencias"}
            textDecoration={"underline"}
            textColor={"#7B65FF"}
            textAlign={"center"}
            marginTop={"1.5rem"}
            marginRight={"1rem"}
          >
            Conferir Transferências
          </ChakraLink>
        </Flex>
      </form>
    </Card>
  );
}
