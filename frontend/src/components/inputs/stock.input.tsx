import { FormControl, FormLabel } from "@chakra-ui/react";
import { StockSelector } from "../selectors/stockSelector";
import { PropsWithRef, Ref } from "react";

export function StockInput(
  props: PropsWithRef<{ ref: Ref<HTMLSelectElement>, label: string }>
) {
  return (
    <FormControl>
      <FormLabel>{props.label}</FormLabel>
      <StockSelector ref={props.ref} />
    </FormControl>
  );
}