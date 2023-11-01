import { Button, ButtonProps } from "@chakra-ui/react";
import { TrashIcon } from "../icons/trashIcon";

export function TrashButton(props: ButtonProps) {
  return (
    <Button {...props} backgroundColor={"transparent"}>
      <TrashIcon />
    </Button>
  );
}
