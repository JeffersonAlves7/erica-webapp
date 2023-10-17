import { FormControl, FormLabel, Input } from "@chakra-ui/react";
import { PropsWithRef, Ref } from "react";

export function ContainerInput(
  props: PropsWithRef<{ ref: Ref<HTMLInputElement> }>
) {
  return (
    <FormControl>
      <FormLabel>Lote Container</FormLabel>
      <Input required ref={props.ref} placeholder={"Ex.: LT001"} />
    </FormControl>
  );
}
