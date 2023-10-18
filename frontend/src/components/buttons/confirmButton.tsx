import { Button } from "@chakra-ui/react";

interface ConfirmButtonProps {
  onClick?: () => void;
}

export function ConfirmButton(props: ConfirmButtonProps) {
  return (
    <Button
      _hover={{
        opacity: "0.8"
      }}
      backgroundColor={"erica.green"}
      onClick={props.onClick ? props.onClick : () => {}}
    >
      Confirmar
    </Button>
  );
}
