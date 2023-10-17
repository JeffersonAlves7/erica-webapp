import { productService } from "@/services/product.service";
import { Card, CardBody, CardHeader, Grid, Heading } from "@chakra-ui/react";
import { useRef, useState } from "react";
import { handleError401 } from "@/services/api";
import { CodeOrEanInput } from "@/components/inputs/codeOrEan.input";
import { QuantityInput } from "@/components/inputs/quantity.input";
import { StockInput } from "@/components/inputs/stock.input";
import { OperatorInput } from "@/components/inputs/operator.input";
import { ObservacaoInput } from "@/components/inputs/observacao.input";
import { ClientInput } from "@/components/inputs/client.input";
import { LancamentoFooter } from "@/components/lancamentoFooter";

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
    const container = clienteRef.current?.value;
    const operator = operadorRef.current?.value;
    const stock = stockRef.current?.value;
    const observacao = observacaoRef.current?.value;

    if (!codigo || !quantidade || !container || !stock || !operator) {
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
            <CodeOrEanInput ref={codigoOuEanRef} />
            <QuantityInput ref={quantidadeRef} />
            <ClientInput ref={clienteRef} />
            <StockInput label="Destino" ref={stockRef} />
            <OperatorInput ref={operadorRef} />
            <ObservacaoInput ref={observacaoRef} />
          </Grid>
        </CardBody>

        <LancamentoFooter status={status} error={error} />
      </form>
    </Card>
  );
}
