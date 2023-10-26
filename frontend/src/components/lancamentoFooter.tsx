import {
  Alert,
  AlertIcon,
  Box,
  Button,
  CardFooter,
  Flex
} from "@chakra-ui/react";
import { ExcelUploadButton } from "./buttons/excelButtons";

interface LancamentoFooterProps {
  status: "idle" | "loading" | "error" | "success";
  error?: string;
  onUpload?: (file: any) => void;
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
            Lançamento incluído com sucesso!
          </Alert>
        )}
        <Flex mt={3} justify={"space-between"} align={"center"}>
          <Flex gap={3}>
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
          {props.onUpload && (
            <ExcelUploadButton onUpload={props.onUpload} withTitle />
          )}
        </Flex>
      </Box>
    </CardFooter>
  );
}
