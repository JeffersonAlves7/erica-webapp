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
} from "@/services/embarques.service";
import { excelService } from "@/services/excel.service";
import { Importer } from "@/types/importer.enum";
import {
  Flex,
  Heading,
  Stack,
  Tbody,
  Td,
  Th,
  Thead,
  Tr
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
  const [status, setStatus] = useState<string>("");

  const [embarquesData, setEmbarquesData] = useState<EmbarquesResponse[]>([]);

  const [page, setPage] = useState<number>(1);
  const [embarquesTotal, setEmbarquesTotal] = useState<number>(0);

  const embarquesLimit = 50;

  const pageLimit = Math.ceil(embarquesTotal / embarquesLimit);

  function handleSearch() {
    embarquesService
      .getEmbarques({
        container,
        codeOrEan: code,
        limit: embarquesLimit,
        page,
        importer,
        status
      })
      .then((data) => {
        setEmbarquesData(data.data);
        setPage(data.page);
        setEmbarquesTotal(data.total);
      });
  }

  useEffect(() => {
    handleSearch();
  }, [importer]);

  function handleChangeImporter(event: ChangeEvent<HTMLSelectElement>) {
    setImporter(event.currentTarget.value);
  }

  function handleChangeContainer(event: ChangeEvent<HTMLInputElement>) {
    setContainer(event.currentTarget.value);
  }

  function handleChangeCode(event: ChangeEvent<HTMLInputElement>) {
    setCode(event.currentTarget.value);
  }

  function handleChangeStatus(event: ChangeEvent<HTMLInputElement>) {
    setStatus(event.currentTarget.value);
  }

  async function handleUploadFile(file: File) {
    try {
      await excelService.uploadProductEmbarques(file);
      embarquesService
        .getEmbarques({
          container,
          codeOrEan: code,
          limit: embarquesLimit,
          page,
          importer,
          status
        })
        .then((data) => {
          setEmbarquesData(data.data);
          setPage(data.page);
          setEmbarquesTotal(data.total);
        });
    } catch (e) {
      handleError401(e);
    }
  }

  function handleChangePage(page: number) {
    if (!(page > 0 && page < pageLimit)) return;
    setPage(page);
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
          <InputWithSearch
            value={status}
            onChange={handleChangeStatus}
            onSearch={handleSearch}
          />
        </CustomFormControl>
      </Flex>

      <CustomTable>
        <Thead>
          <Tr>
            <Th>Código</Th>
            <Th>Quantidade de caixas</Th>
            <Th>Importadora</Th>
            <Th>Container</Th>
            <Th>Data de embarque</Th>
            <Th>Previsão de chegada</Th>
            <Th>Dias para chegar</Th>
            <Th>Status</Th>
            <Th>Ean</Th>
          </Tr>
        </Thead>

        <Tbody>
          {embarquesData.map((embarque) => {
            const dataDeEmbarque = new Date(embarque.embarqueAt);
            const dayToCome = new Date(dataDeEmbarque);
            dayToCome.setDate(dayToCome.getDate() + 30);

            const daysToCome = Math.floor(
              (dayToCome.valueOf() - new Date().valueOf()) /
                (1000 * 60 * 60 * 24)
            );

            const arrivalDate = new Date(embarque.arrivalAt);
            const diaEsperado = new Date();
            let arrivalMessage = embarque.arrivalAt && `Chegou dia ${format(arrivalDate, "dd/MM/yyyy")}`;

            if(embarque.arrivalAt){
              if (daysToCome < 0)
                diaEsperado.setDate(diaEsperado.getDate() - daysToCome);
              else if (daysToCome > 0)
                diaEsperado.setDate(diaEsperado.getDate() + daysToCome);

              if (arrivalDate.valueOf() < diaEsperado.valueOf()) {
                // Verifica se a data real de chegada é anterior à data esperada
                let atraso = Math.floor(
                  (diaEsperado.valueOf() - new Date(embarque.arrivalAt).valueOf()) /
                    (1000 * 60 * 60 * 24)
                );
                console.log(atraso)
                arrivalMessage += ` ${atraso} dias adiantado.`
              } 
              if (arrivalDate.valueOf() > diaEsperado.valueOf()) {
                // Verifica se a data real de chegada é posterior à data esperada
                let atraso = -Math.floor(
                  (new Date(embarque.arrivalAt).valueOf() - diaEsperado.valueOf()) /
                    (1000 * 60 * 60 * 24)
                );
                console.log(atraso)
                arrivalMessage += ` ${atraso} dias de atraso.`
              }
            }

            return (
              <Tr key={"embarque-" + embarque.id}>
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
                {embarque.arrivalAt ? (
                  <Td>
                    <p>
                      {arrivalMessage}
                    </p>
                  </Td>
                ) : daysToCome > 0 ? (
                  <Td className=" text-green-500 font-bold">{daysToCome}</Td>
                ) : (
                  <Td className=" text-red-500 font-bold">{daysToCome}</Td>
                )}
                <Td></Td>
                <Td>{embarque.product.ean}</Td>
              </Tr>
            );
          })}
        </Tbody>
      </CustomTable>

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

      <Flex justify={"space-between"} wrap="wrap">
        <ExcelUploadButton onUpload={handleUploadFile} withTitle />
      </Flex>
    </Stack>
  );
}
