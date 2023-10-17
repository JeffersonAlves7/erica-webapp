import { CloseButton as ChakraCloseButton } from "@chakra-ui/react";

interface CloseButtonProps {
  onClick: () => void;
}

export function CloseButton(props: CloseButtonProps) {
  return (
    <ChakraCloseButton
      onClick={props.onClick}
      backgroundColor={"red.400"}
      _hover={{ opacity: 0.7 }}
    />
  );
}
