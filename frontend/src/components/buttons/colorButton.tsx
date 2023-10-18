import { Button } from "@chakra-ui/react";
import { PropsWithChildren } from "react";

interface ColorButtonProps extends PropsWithChildren {
  onClick?: () => void;
  color: "green" | "pink";
}

export function ColorButton(props: ColorButtonProps) {
  return (
    <Button
      backgroundColor={props.color === "green" ? "erica.green" : "erica.pink"}
      _hover={{
        opacity: 0.8
      }}
      onClick={() => props.onClick && props.onClick()}
      textColor={"white"}
    >
      {props.children}
    </Button>
  );
}
