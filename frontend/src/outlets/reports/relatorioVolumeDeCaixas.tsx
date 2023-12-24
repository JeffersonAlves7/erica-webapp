import { handleError401 } from "@/services/api";
import {
  InterfaceMonthEntryReport,
  reportsService
} from "@/services/reportsService";
import { Heading, Stack } from "@chakra-ui/react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";
import { useEffect, useState } from "react";
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
    }
  }
};

function formatMonthYearLabel(month: number, year: number): string {
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

  return `${months[month - 1]} ${year}`;
}

export function RelatorioVolumeDeCaixas() {
  const [objects, setObjects] = useState<InterfaceMonthEntryReport[]>([]);

  useEffect(() => {
    const runFetch = async () => {
      try {
        const response = await reportsService.monthEntryReport();
        setObjects(response);
      } catch (e) {
        handleError401(e);
      }
    };

    runFetch();
  }, []);

  const labels = objects.map((o) => formatMonthYearLabel(o.month, o.year));

  const Obj1 = {
    label: "",
    data: labels.map((_, index) => objects[index].entryAmount),
    borderColor: "rgb(150, 140, 140)",
    backgroundColor: "rgb(150, 140, 140, 0.5)"
  };

  const data = {
    labels,
    datasets: [Obj1]
  };

  return (
    <Stack w={"full"} maxW={"container.xl"}>
      <Heading size={"lg"}>Volume de Caixas | 12 Meses anteriores</Heading>
      <Bar options={options} data={data} />;
    </Stack>
  );
}
