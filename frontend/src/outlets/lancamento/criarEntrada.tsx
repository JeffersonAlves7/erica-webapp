import { Importer } from "@/types/importer.enum";
import { productService } from "@/services/productService";
import {
  Card,
  CardBody,
  CardHeader,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  Heading,
  Input,
} from "@chakra-ui/react";
import { useRef, useState } from "react";
import { handleError401 } from "@/services/api";
import { LancamentoFooter } from "@/components/lancamentoFooter";
import { OperatorInput } from "@/components/inputs/operator.input";
import { ObservacaoInput } from "@/components/inputs/observacao.input";
import { QuantityInput } from "@/components/inputs/quantity.input";
import { ContainerInput } from "@/components/inputs/container.input";
import { ImporterInput } from "@/components/inputs/importerInput";
import { excelService } from "@/services/excelService";
import { InputWithSearch } from "@/components/inputs/inputWithSearch";

export function CriarEntrada() {
  const [error, setError] = useState<string>("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "error" | "success"
  >("idle");
  const [ean, setEan] = useState<string>("");

  const codigoRef = useRef<HTMLInputElement>(null);
  const quantidadeRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLInputElement>(null);
  const observacaoRef = useRef<HTMLInputElement>(null);
  const operatorRef = useRef<HTMLSelectElement>(null);
  const importerRef = useRef<HTMLSelectElement>(null);
  const descricaoRef = useRef<HTMLInputElement>(null);
  const eanRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setStatus("loading");

    const code = codigoRef.current?.value;
    const quantity = quantidadeRef.current?.value
      ? parseInt(quantidadeRef.current?.value)
      : 0;
    const container = containerRef.current?.value;
    const observation = observacaoRef.current?.value;
    const operator = operatorRef.current?.value;
    const importer = importerRef.current?.value as Importer;
    const description = descricaoRef.current?.value;
    const ean = eanRef.current?.value;

    if (
      !code ||
      !quantity ||
      !container ||
      !importer ||
      !operator
    ) {
      setError("Preencha todos os campos");
      setStatus("idle");
      return;
    }

    productService
      .createEntry({
        code,
        quantity,
        container,
        importer,
        operator,
        observation,
        description,
        ean
      })
      .then(() => {
        setStatus("success");
        codigoRef.current!.value = "";
        quantidadeRef.current!.value = "";
        containerRef.current!.value = "";
        observacaoRef.current!.value = "";
        operatorRef.current!.value = "";
        importerRef.current!.value = "";
        eanRef.current!.value = "";
        descricaoRef.current!.value = "";
      })
      .catch((err) => {
        handleError401(err);
        setError(err?.response?.data?.message || err.message);
        setStatus("error");
      });
  }

  function handleImportData(file: any) {
    setStatus("loading");
    setError("");

    excelService
      .uploadProductsEntries(file)
      .then(() => {
        setStatus("success");
      })
      .catch((err) => {
        handleError401(err);
        setError(err?.response?.data?.message || err.message);
        setStatus("error");
      });
  }

  function handleSearch() {
    productService
      .searchProduct(ean)
      .then((product) => {
        if (!product) return;
        codigoRef.current!.value = product.code as string;
      })
      .catch((e) => {
        handleError401(e);
      });
  }

  return (
    <Card maxW={"550px"} w={"90vw"}>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <Heading size={"md"}>Entrada</Heading>
        </CardHeader>

        <CardBody>
          <Grid
            templateColumns={{
              base: "1fr",
              md: "1fr 1fr"
            }}
            gap={6}
          >
            <FormControl>
              <FormLabel>Código</FormLabel>
              <Input required ref={codigoRef} />
            </FormControl>

            <FormControl>
              <FormLabel>Ean</FormLabel>
              <InputWithSearch
                isRequired
                value={ean}
                onChange={(e) => setEan(e.target.value)}
                type="number"
                placeholder="Optional para criação"
                onSearch={handleSearch}
                onBlur={handleSearch}
              />
            </FormControl>

            <QuantityInput ref={quantidadeRef} />
            <ContainerInput ref={containerRef} />
            <ImporterInput ref={importerRef} />
            <OperatorInput ref={operatorRef} />

            <GridItem colSpan={2}>
              <ObservacaoInput ref={observacaoRef} />
            </GridItem>

            <GridItem colSpan={2}>
              <FormControl>
                <FormLabel>Descrição</FormLabel>
                <Input ref={descricaoRef} placeholder="Optional para criação" />
              </FormControl>
            </GridItem>
          </Grid>
        </CardBody>

        <LancamentoFooter
          status={status}
          error={error}
          onUpload={handleImportData}
        />
      </form>
    </Card>
  );
}
