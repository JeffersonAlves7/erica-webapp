import { InputWithSearch } from "@/components/inputs/inputWithSearch";
import { FormControl, FormLabel, Heading, Stack } from "@chakra-ui/react";
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
      // position: 'top' as const,
    }
    // title: {
    //   display: false,
    //   text: 'Chart.js Line Chart',
    // },
  }
};

const labels = [];
for (let i = 0; i < 31; i++, labels.push(i.toString()));

const Obj1 = {
  label: "Janeiro 2023",
  data: labels.map(() => Math.ceil(Math.random() * (85 - 40)) + 40),
  borderColor: "rgb(255, 99, 132)",
  backgroundColor: "rgba(255, 99, 132, 0.5)"
};

const Obj2 = {
  label: "Dezembro 2023",
  data: labels.map(() => Math.ceil(Math.random() * (85 - 40)) + 40),
  borderColor: "rgb(53, 162, 235)",
  backgroundColor: "rgba(53, 162, 235, 0.5)"
};

const data = {
  labels,
  datasets: [Obj1, Obj2]
};

export function RelatorioComparativoDeVendas() {
  return (
    <Stack w={"full"} maxW={"container.xl"}>
      <FormControl w={"max-content"}>
        <FormLabel>Data</FormLabel>
        <InputWithSearch onSearch={() => {}} type="date" maxW={200} />
      </FormControl>
      <Heading size={"lg"}>Comparativo de Vendas</Heading>
      <Line options={options} data={data} />;
    </Stack>
  );
}
