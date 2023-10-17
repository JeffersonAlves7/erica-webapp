import { CodeOrEanInput } from "@/components/inputs/codeOrEan.input";
import { StockInput } from "@/components/inputs/stock.input";
import { ObservacaoInput } from "@/components/inputs/observacao.input";
import { OperatorInput } from "@/components/inputs/operator.input";
import { QuantityInput } from "@/components/inputs/quantity.input";
import { LancamentoFooter } from "@/components/lancamentoFooter";
import {
  Card,
  CardBody,
  CardHeader,
  Grid,
  Heading,
} from "@chakra-ui/react";
import { useRef, useState } from "react";
import { DestinyInput } from "@/components/inputs/destiny.input";

export function CriarSaida() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'success'>('idle'); // 'idle' | 'loading' | 'error' | 'success'
  const [error, setError] = useState<string>("");

  const codigoRef = useRef<HTMLInputElement>(null);
  const quantidadeRef = useRef<HTMLInputElement>(null);
  const clienteRef = useRef<HTMLInputElement>(null);
  const observacaoRef = useRef<HTMLInputElement>(null);
  const operadorRef = useRef<HTMLSelectElement>(null);
  const estoqueRef = useRef<HTMLSelectElement>(null);

  function handleConfirm(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const codigoValue = codigoRef.current?.value;
    const quantidadeValue = quantidadeRef.current?.value;
    const clienteValue = clienteRef.current?.value;
    const observacalValue = observacaoRef.current?.value;
    const operador = operadorRef.current?.value;
    const estoque = estoqueRef.current?.value;

    if (
      !codigoValue ||
      !quantidadeValue ||
      !clienteValue ||
      !operador ||
      !estoque
    ) {
      return;
    }

    const data = {
      codeOrEan: codigoValue,
      quantity: quantidadeValue,
      client: clienteValue,
      operator: operador,
      stock: estoque,
      observacao: observacalValue
    };

    console.log(data);
  }

  return (
    <Card w={"550px"}>
      <form onSubmit={handleConfirm}>
        <CardHeader>
          <Heading size={"md"}>Saída</Heading>
        </CardHeader>

        <CardBody>
          <Grid templateColumns={"1fr 1fr"} gap={6}>
            <CodeOrEanInput ref={codigoRef} />
            <QuantityInput ref={quantidadeRef}/> 
            <StockInput label="Origem" ref={estoqueRef} />
            <DestinyInput placeholder="Ex.: Client 01" ref={clienteRef} />
            <OperatorInput ref={operadorRef}/> 
            <ObservacaoInput ref={observacaoRef} />
          </Grid>
        </CardBody>

        <LancamentoFooter status={status} error={error} />
      </form>
    </Card>
  );
}
