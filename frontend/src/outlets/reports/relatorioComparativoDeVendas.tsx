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
  return `${months[data.m]} ${data.y}`;
}

export function RelatorioComparativoDeVendas() {
  const [datas, setDatas] = useState<{ m: number; y: number }[]>([]);
  const monthRef = useRef<HTMLSelectElement>(null);
  const yearRef = useRef<HTMLInputElement>(null);

  const objects = datas.map((data) => {
    return {
      label: parseData(data),
      data: labels.map(() => Math.ceil(Math.random() * (85 - 40)) + 40),
      borderColor: "rgb(255, 99, 132)",
      backgroundColor: "rgba(255, 99, 132, 0.5)"
    };
  });

  const data = {
    labels,
    datasets: objects
  };

  function handleAddDate() {
    const monthValue = monthRef.current!.value as unknown as number;
    const yearValue = yearRef.current!.value as unknown as number;

    if (
      !monthValue ||
      !yearValue ||
      datas.some((v) => v.m == monthValue && v.y == yearValue)
    )
      return;

    setDatas((d) => [
      ...d,
      {
        m: monthValue,
        y: yearValue
      }
    ]);
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

        <List display={"flex"} alignItems={"center"} ml={2} pb={2} gap={10}>
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
                    onClick={() =>
                      setDatas((datas) => datas.filter((d) => d !== data))
                    }
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
