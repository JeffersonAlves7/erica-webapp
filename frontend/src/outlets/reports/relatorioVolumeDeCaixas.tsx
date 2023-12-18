import { ExcelDownloadButton } from "@/components/buttons/excelButtons";
import { InputWithSearch } from "@/components/inputs/inputWithSearch";
import { Flex, FormControl, FormLabel, Heading, Stack } from "@chakra-ui/react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";
import { format, startOfMonth, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export const options = {
  responsive: true,
  plugins: {
    legend: {
      display: false
      // position: 'bottom' as const,
    }
    // title: {
    // display: false,
    // text: 'Chart.js Bar Chart',
    // },
  }
};

const today = new Date();
const labels = Array.from({ length: 12 }, (_, index) => {
  const date = subMonths(today, index);
  return format(startOfMonth(date), "MMMM yyyy", {
    locale: ptBR
  });
});

// for (let i = 0; i < 31; i++, labels.push(i.toString()));

const Obj1 = {
  label: "",
  data: labels.map(() => Math.ceil(Math.random() * (85 - 40)) + 40),
  borderColor: "rgb(150, 140, 140)",
  backgroundColor: "rgb(150, 140, 140, 0.5)"
};

const data = {
  labels,
  datasets: [Obj1]
};

export function RelatorioVolumeDeCaixas() {
  return (
    <Stack w={"full"} maxW={"container.xl"}>
      <Heading size={"lg"}>Volume de Caixas | 12 Meses anteriores</Heading>
      <Bar options={options} data={data} />;
    </Stack>
  );
}
