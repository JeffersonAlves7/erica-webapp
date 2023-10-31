import { Link as ChakraLink } from "@chakra-ui/react";
import { PropsWithChildren } from "react";
import { Link } from "react-router-dom";

export function EricaLink(props: PropsWithChildren & { to: string }) {
  return (
    <ChakraLink
      as={Link}
      to={props.to}
      textDecoration={"underline"}
      textColor={"#7B65FF"}
      textAlign={"center"}
    >
      {props.children}
    </ChakraLink>
  );
}
