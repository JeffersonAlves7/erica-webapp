import { ReportExit } from "@/outlets/reports/reportExit";
import { ReportStockMinimum } from "@/outlets/reports/reportStockMinimum";
import { Box, Heading, Stack } from "@chakra-ui/react";

export function Relatorio() {
  return (
    <Box>
      <Heading mb={10}>Relatórios e Alertas</Heading>
      <Stack gap={10} h={"full"} direction={"row"} flexWrap={"wrap"}>
        <ReportExit />
        <ReportStockMinimum />
      </Stack>
    </Box>
  );
}
