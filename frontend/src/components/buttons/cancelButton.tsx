import { Button } from "@chakra-ui/react";

interface CancelButtonProps {
  onClick?: () => void;
}

export function CancelButton(props: CancelButtonProps) {
  return (
    <Button
      _hover={{
        opacity: "0.8"
      }}
      backgroundColor={'red.500'}
      onClick={props.onClick ? props.onClick : () => {}}
    >
      Cancelar
    </Button>
  );
}

