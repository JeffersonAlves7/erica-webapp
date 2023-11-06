import { FormControl, FormLabel, SelectProps } from "@chakra-ui/react";
import { PropsWithRef, forwardRef } from "react";
import { LojaSelector } from "../selectors/importerSelector copy";

export const LojaInput = forwardRef<
  HTMLSelectElement,
  PropsWithRef<SelectProps>
>((props, ref) => {
  return (
    <FormControl>
      <FormLabel>Destino</FormLabel>
      <LojaSelector {...props} ref={ref} />
    </FormControl>
  );
});
