import { ExcelUploadButton } from "@/components/buttons/excelButtons";
import { CustomTable } from "@/components/customTable";
import { CustomFormControl } from "@/components/form/CustomFormControl";
import { CustomLabel } from "@/components/form/CustomLabel";
import { CustomSelect } from "@/components/form/CustomSelect";
import { InputWithSearch } from "@/components/inputs/inputWithSearch";
import { PaginationSelector } from "@/components/selectors/paginationSelector";
import { handleError401 } from "@/services/api";
import {
  EmbarquesResponse,
  embarquesService
} from "@/services/embarquesService";
import { excelService } from "@/services/excelService";
import { Importer } from "@/types/importer.enum";
import {
  Flex,
  Heading,
  Stack,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useToast
} from "@chakra-ui/react";
import { format } from "date-fns";
import { ChangeEvent, useEffect, useState } from "react";
import { EricaLink } from "@/components/ericaLink";

export function Embarques() {
  const [importer, setImporter] = useState<Importer | string | undefined>(
    undefined
  );
  const [container, setContainer] = useState<string>("");
  const [code, setCode] = useState<string>("");
  const [status, setStatus] = useState<string | undefined>(undefined);

  const [embarquesData, setEmbarquesData] = useState<EmbarquesResponse[]>([]);

  const [page, setPage] = useState<number>(1);
  const [embarquesTotal, setEmbarquesTotal] = useState<number>(0);
  const [productsInfo, setProudctsInfo] = useState({
    productsQuantity: 0,
    boxQuantity: 0
  });

  const toast = useToast();
  const embarquesLimit = 100;

  const pageLimit = Math.ceil(embarquesTotal / embarquesLimit);

  function handleSearch() {
    embarquesService
      .getEmbarques({
        container,
        codeOrEan: code,
        limit: embarquesLimit,
        page,
        importer,
        status:
          status === "true" || status === "false"
            ? status === "true"
            : undefined
      })
      .then((data) => {
        setEmbarquesData(data.data);
        setPage(data.page);
        setEmbarquesTotal(data.total);
        return embarquesService.getEmbarquesInfo({
          importer,
          code,
          active: false,
          status:
            status === "true" || status === "false"
              ? status === "true"
              : undefined
        });
      })
      .then((data) => {
        setProudctsInfo(data);
      })
      .catch((e) => {
        handleError401(e);
      });
  }

  useEffect(() => {
    embarquesService
      .getEmbarques({
        container,
        codeOrEan: code,
        limit: embarquesLimit,
        page: 1,
        importer,
        status:
          status === "true" || status === "false"
            ? status === "true"
            : undefined
      })
      .then((data) => {
        setEmbarquesData(data.data);
        setPage(1);
        setEmbarquesTotal(data.total);
        return embarquesService.getEmbarquesInfo({
          importer,
          code,
          active: false,
          status:
            status === "true" || status === "false"
              ? status === "true"
              : undefined
        });
      })
      .then((data) => {
        setProudctsInfo(data);
      })
      .catch((e) => {
        handleError401(e);
      });
  }, [importer, status]);

  function handleChangeImporter(event: ChangeEvent<HTMLSelectElement>) {
    setImporter(event.currentTarget.value);
  }

  function handleChangeContainer(event: ChangeEvent<HTMLInputElement>) {
    setContainer(event.currentTarget.value);
  }

  function handleChangeCode(event: ChangeEvent<HTMLInputElement>) {
    setCode(event.currentTarget.value);
  }

  function handleChangeStatus(event: ChangeEvent<HTMLSelectElement>) {
    setStatus(event.currentTarget.value);
  }

  async function handleUploadFile(file: File) {
    try {
      await excelService.uploadProductEmbarques(file);
      toast({
        title: "Sucesso ao importar os embarques",
        isClosable: true,
        duration: 3000,
        status: "success"
      });

      handleSearch();
    } catch (e: any) {
      toast({
        title: e?.response?.data?.message || "Falha ao importar os embarques",
        isClosable: true,
        duration: 3000,
        status: "error"
      });

      handleError401(e);
    }
  }

  function handleChangePage(page: number) {
    if (page <= 0 || page > pageLimit) return;
    embarquesService
      .getEmbarques({
        container,
        codeOrEan: code,
        limit: embarquesLimit,
        page,
        importer,
        status:
          status === "true" || status === "false"
            ? status === "true"
            : undefined
      })
      .then((data) => {
        setEmbarquesData(data.data);
        setPage(page);
        setEmbarquesTotal(data.total);
        return embarquesService.getEmbarquesInfo({
          importer,
          code,
          active: false,
          status:
            status === "true" || status === "false"
              ? status === "true"
              : undefined
        });
      })
      .then((data) => {
        setProudctsInfo(data);
      })
      .catch((e) => {
        handleError401(e);
      });
  }

  return (
    <Stack gap={4}>
      <Heading>Embarques</Heading>

      <Flex wrap={"wrap"} alignItems={"center"} gap={4}>
        <CustomFormControl>
          <CustomLabel>Filtrar por container</CustomLabel>
          <InputWithSearch
            value={container}
            onChange={handleChangeContainer}
            onSearch={handleSearch}
          />
        </CustomFormControl>

        <CustomFormControl>
          <CustomLabel>Filtrar por importadora</CustomLabel>
          <CustomSelect
            onChange={handleChangeImporter}
            placeholder="Selecione uma importadora"
          >
            {Object.keys(Importer).map((key) => {
              return (
                <option
                  key={"stock-" + key}
                  defaultValue={importer}
                  value={key}
                >
                  {Importer[key as keyof typeof Importer]}
                </option>
              );
            })}
          </CustomSelect>
        </CustomFormControl>

        <CustomFormControl>
          <CustomLabel>Filtrar por Código ou Ean</CustomLabel>
          <InputWithSearch
            value={code}
            onChange={handleChangeCode}
            onSearch={handleSearch}
          />
        </CustomFormControl>

        <CustomFormControl>
          <CustomLabel>Filtrar por Status</CustomLabel>
          <CustomSelect
            onChange={handleChangeStatus}
            value={status}
            placeholder="Selecione um Status"
          >
            <option value={"false"}>A Caminho</option>
            <option value={"true"}>Em Estoque</option>
          </CustomSelect>
        </CustomFormControl>
      </Flex>

      <CustomTable>
        <Thead>
          <Tr>
            <Th>Ean</Th>
            <Th>Código</Th>
            <Th>Quantidade de caixas</Th>
            <Th>Importadora</Th>
            <Th>Container</Th>
            <Th>Data de embarque</Th>
            <Th>Previsão de chegada</Th>
            <Th>Dias para chegar</Th>
            <Th>Status</Th>
          </Tr>
        </Thead>

        <Tbody>
          {embarquesData.map((embarque) => {
            const dataDeEmbarque = new Date(embarque.embarqueAt);
            const dayToCome = new Date(dataDeEmbarque);
            const mediaDeDias =
              embarque.product.importer == Importer.ALPHA_YNFINITY ? 35 : 30;

            dayToCome.setDate(dayToCome.getDate() + mediaDeDias);

            const daysToCome = Math.floor(
              (dayToCome.valueOf() - new Date().valueOf()) /
                (1000 * 60 * 60 * 24)
            );

            const arrivalDate = new Date(embarque.arrivalAt);
            let arrivalMessage =
              embarque.arrivalAt &&
              `Chegou dia ${format(arrivalDate, "dd/MM/yyyy")}`;

            if (embarque.arrivalAt) {
              if (arrivalDate.valueOf() < dayToCome.valueOf()) {
                // Verifica se a data real de chegada é anterior à data esperada
                let atraso = Math.floor(
                  (dayToCome.valueOf() -
                    new Date(embarque.arrivalAt).valueOf()) /
                    (1000 * 60 * 60 * 24)
                );
                arrivalMessage += ` ${atraso} dias adiantado.`;
              }
              if (arrivalDate.valueOf() > dayToCome.valueOf()) {
                // Verifica se a data real de chegada é posterior à data esperada
                let atraso = Math.floor(
                  (new Date(embarque.arrivalAt).valueOf() -
                    dayToCome.valueOf()) /
                    (1000 * 60 * 60 * 24)
                );

                arrivalMessage += ` ${atraso} dias atrasado.`;
              }
            }

            return (
              <Tr key={"embarque-" + embarque.id}>
                <Td>{embarque.product.ean}</Td>
                <Td>{embarque.product.code}</Td>
                <Td>{embarque.quantityExpected}</Td>
                <Td>{embarque.product.importer}</Td>
                <Td>
                  <EricaLink to={`./${embarque.containerId}`}>
                    {embarque.containerId}
                  </EricaLink>
                </Td>
                <Td>{format(dataDeEmbarque, "dd/MM/yyyy")}</Td>
                <Td>{format(dayToCome, "dd/MM/yyyy")}</Td>
                <Td>
                  {embarque.arrivalAt ? (
                    <p
                      className={
                        arrivalMessage.includes("atrasado")
                          ? "text-red-500"
                          : ""
                      }
                    >
                      {arrivalMessage}
                    </p>
                  ) : daysToCome > 0 ? (
                    <p className="text-green-500 font-bold">{daysToCome}</p>
                  ) : (
                    <p className=" text-red-500 font-bold">
                      {Math.abs(daysToCome) + " dias atrasado!"}
                    </p>
                  )}
                </Td>
                <Td>{embarque.confirmed ? "Em Estoque" : "A Caminho"}</Td>
              </Tr>
            );
          })}
        </Tbody>
      </CustomTable>

      <Flex justify={"space-between"} wrap="wrap" align={"center"}>
        <ExcelUploadButton onUpload={handleUploadFile} withTitle />

        <Flex align={"center"} gap={10}>
          <span>
            {productsInfo.productsQuantity} Embarques(s) | Total de{" "}
            {productsInfo.boxQuantity} caixas.
          </span>
          <PaginationSelector
            page={page}
            pageQuantity={pageLimit}
            decreasePage={() => {
              handleChangePage(page - 1);
            }}
            increasePage={() => {
              handleChangePage(page + 1);
            }}
          />
        </Flex>
      </Flex>
    </Stack>
  );
}
