import { Box, Heading, Stack } from "@chakra-ui/react";
import { SaidasPorData } from "../components/saidasPorData";
import { SkusComMaiorMovimentacao } from "@/components/skusComMaiorMovimentacao";
import { SkusComEstoqueMinimo } from "@/components/skusComEstoqueMinimo";
import { SkusComGiroAbaixoDoEsperado } from "@/components/skusComGiroAbaixoDoEsperado";

export function Relatorio() {
  return (
    <Box>
      <Heading mb={10}>Relatórios e Alertas</Heading>
      <Stack gap={10} h={"full"} direction={"row"} flexWrap={"wrap"}>
        <SkusComMaiorMovimentacao />
        <SkusComEstoqueMinimo />
        <SkusComGiroAbaixoDoEsperado />
        <SaidasPorData />
      </Stack>
    </Box>
  );
}
