import { FormControl, FormLabel, Input } from "@chakra-ui/react";
import { PropsWithRef, forwardRef } from "react";

export const DestinyInput = forwardRef<
  HTMLInputElement,
  PropsWithRef<{ placeholder?: string }>
>((props, ref) => {
  return (
    <FormControl>
      <FormLabel>Destino</FormLabel>
      <Input
        required
        ref={ref}
        placeholder={
          props.placeholder ? props.placeholder : "Ex.: Loja 1 Andar 2"
        }
      />
    </FormControl>
  );
});
