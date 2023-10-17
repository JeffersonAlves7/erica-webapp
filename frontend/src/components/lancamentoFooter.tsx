import {
  Alert,
  AlertIcon,
  Box,
  Button,
  CardFooter,
  Flex,
} from "@chakra-ui/react";

interface LancamentoFooterProps {
  status: "idle" | "loading" | "error" | "success";
  error?: string;
}

export function LancamentoFooter(props: LancamentoFooterProps) {
  const { status, error } = props;

  return (
    <CardFooter>
      <Box mt={3} w={"full"}>
        {status == "error" && error && (
          <Alert status="error">
            <AlertIcon />
            {error}
          </Alert>
        )}
        {status == "success" && (
          <Alert status="success">
            <AlertIcon />
            Entrada criada com sucesso!
          </Alert>
        )}
        <Flex mt={3} gap={3}>
          <Button type="reset" colorScheme="red">
            Cancelar
          </Button>
          <Button
            type="submit"
            colorScheme="green"
            backgroundColor={"erica.green"}
          >
            Criar
          </Button>
        </Flex>
      </Box>
    </CardFooter>
  );
}

