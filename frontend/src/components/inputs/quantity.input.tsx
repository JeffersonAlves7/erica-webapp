import { FormControl, FormLabel, Input } from "@chakra-ui/react";
import { PropsWithRef, Ref } from "react";

export function QuantityInput(
  props: PropsWithRef<{ ref: Ref<HTMLInputElement> }>
) {
  return (
    <FormControl>
      <FormLabel>Quantidade</FormLabel>
      <Input required min={1} type="number" ref={props.ref} />
    </FormControl>
  );
}
