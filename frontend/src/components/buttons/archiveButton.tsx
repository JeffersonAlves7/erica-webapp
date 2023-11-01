import { Button, ButtonProps } from "@chakra-ui/react";
import { ArchiveIcon } from "../icons/archiveIcon";

export function ArchiveButton(props: ButtonProps) {
  return (
    <Button {...props} backgroundColor={"transparent"}>
      <ArchiveIcon />
    </Button>
  );
}
