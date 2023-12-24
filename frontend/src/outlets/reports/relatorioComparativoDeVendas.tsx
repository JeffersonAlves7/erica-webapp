import { handleError401 } from "@/services/api";
import {
  InterfaceSalesOfPeriod,
  reportsService
} from "@/services/reportsService";
import {
  Button,
  CloseButton,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  List,
  ListItem,
  Select,
  Stack
} from "@chakra-ui/react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";
import { useRef, useState } from "react";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export const options = {
  responsive: true,
  plugins: {
    legend: {
      position: "bottom" as const
    }
  }
};

const labels: any[] = [];
for (let i = 0; i < 31; i++, labels.push(i.toString()));

const months = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro"
];

function parseData(data: { m: number; y: number }) {
  return `${months[data.m - 1]} ${data.y}`;
}

function generateRandomColor() {
  const letters = "0123456789ABCDEF";
  let color = "#";

  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }

  return color;
}

function generateDatasetObject(
  data: { m: number; y: number },
  objects: InterfaceSalesOfPeriod[]
) {
  const objectLength = objects.length;

  const newDataObject = {
    label: parseData(data),
    data: labels.map((_, index) => {
      if (index >= objectLength) return 0;

      return objects[index].difference;
    }),
    borderColor: generateRandomColor(),
    backgroundColor: generateRandomColor()
  };

  return newDataObject;
}

export function RelatorioComparativoDeVendas() {
  const [datas, setDatas] = useState<{ m: number; y: number }[]>([]);
  const [dataObjects, setDataObjects] = useState<
    ReturnType<typeof generateDatasetObject>[]
  >([]);
  const monthRef = useRef<HTMLSelectElement>(null);
  const yearRef = useRef<HTMLInputElement>(null);

  const data = {
    labels,
    datasets: dataObjects
  };

  function handleAddDate() {
    const monthValue = monthRef.current!.value as unknown as number;
    const yearValue = yearRef.current!.value as unknown as number;

    if (
      !monthValue ||
      !yearValue ||
      datas.some((v) => v.m === monthValue && v.y === yearValue)
    ) {
      return;
    }

    const newData = {
      m: monthValue,
      y: yearValue
    };

    reportsService
      .salesOfPeriod({
        month: newData.m,
        year: newData.y
      })
      .then((objects) => {
        setDatas((d) => [...d, newData]);

        const newDataObject = generateDatasetObject(newData, objects);
        setDataObjects((prevDataObjects) => [
          ...prevDataObjects,
          newDataObject
        ]);
      })
      .catch((e) => {
        handleError401(e);
      });
  }

  return (
    <Stack w={"full"} maxW={"container.xl"}>
      <Flex align={"flex-end"} gap={6}>
        <FormControl w={"max-content"}>
          <FormLabel>Mês</FormLabel>
          <Select placeholder="Selecione o mês" ref={monthRef}>
            {months.map((month, index) => (
              <option key={index} value={index + 1}>
                {month}
              </option>
            ))}
          </Select>
        </FormControl>

        <FormControl w={150}>
          <FormLabel>Ano</FormLabel>
          <Input
            type="number"
            defaultValue={new Date().getFullYear()}
            ref={yearRef}
          />
        </FormControl>

        <Button background="erica.green" onClick={handleAddDate}>
          Selecionar
        </Button>

        <List
          display={"flex"}
          alignItems={"center"}
          ml={2}
          pb={2}
          gap={10}
          overflow={"auto"}
        >
          {datas.map((data, index) => {
            const dataString = parseData(data);
            return (
              <ListItem
                key={`${dataString.replace(" ", "")}${index}`}
                style={{ listStyle: "circle" }}
              >
                <Flex align={"center"} gap={2}>
                  {dataString}{" "}
                  <CloseButton
                    onClick={() => {
                      setDatas((datas) => datas.filter((d) => d !== data));
                      setDataObjects((objects) =>
                        objects.filter((object) => object.label != dataString)
                      );
                    }}
                    p={2}
                    _hover={{ opacity: 0.7 }}
                  />
                </Flex>
              </ListItem>
            );
          })}
        </List>
      </Flex>
      <Heading size={"lg"}>Comparativo de Vendas</Heading>
      <Line options={options} data={data} />;
    </Stack>
  );
}
