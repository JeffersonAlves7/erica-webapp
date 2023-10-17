import { FormControl, FormLabel, Input } from "@chakra-ui/react";
import { PropsWithRef, Ref } from "react";

export function DestinyInput(
  props: PropsWithRef<{ ref: Ref<HTMLInputElement>; placeholder?: string }>
) {
  return (
    <FormControl>
      <FormLabel>Destino</FormLabel>
      <Input
        ref={props.ref}
        placeholder={
          props.placeholder ? props.placeholder : "Ex.: Loja 1 Andar 2"
        }
      />
    </FormControl>
  );
}
