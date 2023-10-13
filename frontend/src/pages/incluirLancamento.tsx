import { LinkSelector } from "@/components/linkSelector";
import { Box, Heading, Stack } from "@chakra-ui/react";
import { Outlet } from "react-router-dom";

export function IncluirLancamento() {
  const links = [
    {
      title: "Entrada",
      to: "entrada",
      or: ["incluir-lancamento", "/incluir-lancamento/entrada"]
    },
    {
      title: "Saída",
      to: "saida",
      or: ["/incluir-lancamento/saida"]
    },
    {
      title: "Transferência",
      to: "transferencia",
      or: ["/incluir-lancamento/transferencia"]
    },
    {
      title: "Devolução",
      to: "devolucao",
      or: ["/incluir-lancamento/devolucao"]
    },
    {
      title: "Reserva",
      to: "reserva",
      or: ["/incluir-lancamento/reserva"]
    }
  ];

  return (
    <Box>
      <Heading mb={6}>Incluir Lançamento</Heading>
      <LinkSelector links={links} />
      <Stack mt={3} w={"full"} align={"center"} justify={"center"}>
        <Outlet />
      </Stack>
    </Box>
  );
}
