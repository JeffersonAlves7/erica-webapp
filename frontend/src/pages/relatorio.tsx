import { Box, Heading, Stack } from "@chakra-ui/react";
import { RelatorioSaida } from "@/outlets/reports/relatorioSaidas";
import { RelatorioEstoqueMinimo } from "@/outlets/reports/relatorioEstoqueMinimo";
import { RelatorioMovimentacoes } from "@/outlets/reports/relatorioMovimentacoes";
import { RelatorioComparativoDeVendas } from "@/outlets/reports/relatorioComparativoDeVendas";
import { RelatorioVolumeDeCaixas } from "@/outlets/reports/relatorioVolumeDeCaixas";

export function Relatorio() {
  return (
    <Box>
      <Heading mb={10}>Relatórios e Alertas</Heading>
      <Stack gap={40} h={"full"} direction={"row"} flexWrap={"wrap"}>
        <RelatorioSaida />
        <RelatorioEstoqueMinimo />
        <RelatorioMovimentacoes />
        <RelatorioComparativoDeVendas />
        <RelatorioVolumeDeCaixas />
      </Stack>
    </Box>
  );
}
