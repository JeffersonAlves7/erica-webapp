import { Link as RouterLink } from "react-router-dom";
import {
  Alert,
  AlertIcon,
  Box,
  Button,
  CardFooter,
  Flex,
  Link as ChakraLink
} from "@chakra-ui/react";

interface LancamentoFooterProps {
  status: "idle" | "loading" | "error" | "success";
  error?: string;
  to: string;
  linkText: string;
}

export function LancamentoFooterWithLink(props: LancamentoFooterProps) {
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
            Lançamento incluído com sucesso!
          </Alert>
        )}
        <Flex align={'center'} justify={'space-between'}>
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
          <ChakraLink
            as={RouterLink}
            to={props.to}
            textDecoration={"underline"}
            textColor={"#7B65FF"}
            textAlign={"center"}
          >
            {props.linkText}
          </ChakraLink>
        </Flex>
      </Box>
    </CardFooter>
  );
}
