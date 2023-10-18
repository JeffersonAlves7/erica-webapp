import { Button } from "@chakra-ui/react";

interface CanvelButtonProps {
  onClick?: () => void;
}

export function CancelButton(props: CanvelButtonProps) {
  return (
    <Button
      _hover={{
        opacity: "0.8"
      }}
      backgroundColor={'red.500'}
      onClick={props.onClick ? props.onClick : () => {}}
    >
      Confirmar
    </Button>
  );
}

