import { FormControl, FormLabel, Input } from "@chakra-ui/react";
import { PropsWithRef, Ref } from "react";

export function ClientInput(
  props: PropsWithRef<{ ref: Ref<HTMLInputElement> }>
) {
  return (
    <FormControl>
      <FormLabel>Cliente</FormLabel>
      <Input required ref={props.ref} />
    </FormControl>
  );
}
