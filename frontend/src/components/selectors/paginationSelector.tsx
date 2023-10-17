import { Box, Button, Stack } from "@chakra-ui/react";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";

interface PaginationSelectorProps {
  page: number;
  pageQuantity: number;
  increasePage: () => void;
  decreasePage: () => void;
}

export function PaginationSelector(props: PaginationSelectorProps) {
  return (
    props.pageQuantity > 1 && (
      <Stack direction="row" spacing={3} align="center" justify={"end"} mt={3}>
        <Button
          colorScheme="green"
          backgroundColor={"erica.green"}
          onClick={props.decreasePage}
          padding={0}
        >
          <MdKeyboardArrowLeft className="text-2xl" />
        </Button>
        <Box>
          <span>
            Página {props.page} de {props.pageQuantity}
          </span>
        </Box>
        <Button
          colorScheme="green"
          backgroundColor={"erica.green"}
          onClick={props.increasePage}
          padding={0}
        >
          <MdKeyboardArrowRight className="text-2xl" />
        </Button>
      </Stack>
    )
  );
}
