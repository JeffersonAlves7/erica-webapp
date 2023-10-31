import {
  Alert,
  AlertIcon,
  Box,
  Button,
  CardFooter,
  Flex,
  Stack
} from "@chakra-ui/react";
import { ExcelUploadButton } from "./buttons/excelButtons";
import { EricaLink } from "./ericaLink";

interface LancamentoFooterProps {
  status: "idle" | "loading" | "error" | "success";
  error?: string;
  to: string;
  linkText: string;
  onUpload?: (file: any) => void;
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
        <Flex align={"center"} justify={"space-between"}>
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

          <Stack align={"center"} justify={"center"}>
            <EricaLink to={props.to}>{props.linkText}</EricaLink>
            <ExcelUploadButton withTitle onUpload={props.onUpload} />
          </Stack>
        </Flex>
      </Box>
    </CardFooter>
  );
}
