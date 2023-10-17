import { FormControl, FormLabel } from "@chakra-ui/react";
import { StockSelector } from "../selectors/stockSelector";
import { PropsWithRef, forwardRef } from "react";

export const StockInput = forwardRef<
  HTMLSelectElement,
  PropsWithRef<{ label: string }>
>((props, ref) => {
  return (
    <FormControl>
      <FormLabel>{props.label}</FormLabel>
      <StockSelector ref={ref} />
    </FormControl>
  );
});
