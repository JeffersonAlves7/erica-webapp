import { Importer } from "@/types/importer.enum";
import { productService } from "@/services/productService";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  Heading,
  Input
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
  const [type, setType] = useState<"create" | "nocreate">("nocreate");

  const codigoRef = useRef<HTMLInputElement>(null);
  const quantidadeRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLInputElement>(null);
  const observacaoRef = useRef<HTMLInputElement>(null);
  const operatorRef = useRef<HTMLSelectElement>(null);
  const importerRef = useRef<HTMLSelectElement>(null);
  const descricaoRef = useRef<HTMLInputElement>(null);
  const chineseDescriptionRef = useRef<HTMLInputElement>(null);
  const eanRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setStatus("loading");

    let code,
      quantity,
      container,
      observation,
      operator,
      importer,
      description,
      chineseDescription,
      ean;

    code = codigoRef.current?.value;
    quantity = quantidadeRef.current?.value
      ? parseInt(quantidadeRef.current?.value)
      : 0;
    container = containerRef.current?.value;
    observation = observacaoRef.current?.value;
    operator = operatorRef.current?.value;
    importer = importerRef.current?.value as Importer;

    if (type == "create") {
      description = descricaoRef.current?.value;
      chineseDescription = chineseDescriptionRef.current?.value;
      ean = eanRef.current?.value;
    }

    if (!code || !quantity || !container || !importer || !operator) {
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
        chineseDescription,
        ean
      })
      .then(() => {
        setStatus("success");
        document.querySelector("form")?.reset();
        setEan("");
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
          <Flex gap={4} mt={4}>
            <Button
              onClick={() => setType("nocreate")}
              color={type == "nocreate" ? "erica.green" : ""}
              background={"none"}
              className=" underline hover:opacity-75 bg-none"
            >
              Criar Lançamento
            </Button>
            <Button
              onClick={() => setType("create")}
              color={type == "create" ? "erica.green" : ""}
              background={"none"}
              className=" underline hover:opacity-75 bg-none"
            >
              Criar Lançamento e Produto
            </Button>
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
            <FormControl>
              <FormLabel>{type == 'create' ? 'Código' : 'Código ou EAN'}</FormLabel>
              <Input required ref={codigoRef} />
            </FormControl>
            {type == "create" && (
              <FormControl>
                <FormLabel>Ean</FormLabel>
                <InputWithSearch
                  value={ean}
                  onChange={(e) => setEan(e.target.value)}
                  type="number"
                  onSearch={handleSearch}
                  onBlur={handleSearch}
                />
              </FormControl>
            )}

            <QuantityInput ref={quantidadeRef} />
            <ContainerInput ref={containerRef} />
            <ImporterInput ref={importerRef} />
            <OperatorInput ref={operatorRef} />

            <GridItem colSpan={2}>
              <ObservacaoInput ref={observacaoRef} />
            </GridItem>

            {type == "create" && (
              <>
                <GridItem colSpan={2}>
                  <FormControl>
                    <FormLabel>Descrição</FormLabel>
                    <Input ref={descricaoRef} required />
                  </FormControl>
                </GridItem>

                <GridItem colSpan={2}>
                  <FormControl>
                    <FormLabel>Descrição em Chinês</FormLabel>
                    <Input ref={chineseDescriptionRef} required />
                  </FormControl>
                </GridItem>
              </>
            )}
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
