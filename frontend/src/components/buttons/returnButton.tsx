import { Button, ButtonProps } from "@chakra-ui/react";
import { ReturnIcon } from "../icons/archiveIcon copy";

export function ReturnButton(props: ButtonProps) {
  return (
    <Button {...props} backgroundColor={"erica.green"}>
      <ReturnIcon />
    </Button>
  );
}
