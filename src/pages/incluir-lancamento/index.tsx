import { Box, Heading, Stack } from "@chakra-ui/react";
import { CriarTransferencia } from "./components/criarTransferencia";
import { CriarSaida } from "./components/criarSaida";
import { CriarEntrada } from "./components/criarEntrada";

export function IncluirLancamento() {
  return (
    <Box>
      <Heading mb={6}>Incluir Lançamento</Heading>
      <Stack gap={6} h={"full"} direction={"row"} flexWrap={"wrap"}>
        <CriarTransferencia/>
        <CriarEntrada/>
        <CriarSaida/>
      </Stack>
    </Box>
  );
}