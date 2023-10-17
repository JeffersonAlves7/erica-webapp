import { FormControl, FormLabel, Input } from "@chakra-ui/react";
import { PropsWithRef, Ref } from "react";

export function ObservacaoInput(
  props: PropsWithRef<{ ref: Ref<HTMLInputElement> }>
) {
  return (
    <FormControl>
      <FormLabel>Observação</FormLabel>
      <Input type="text" ref={props.ref} />
    </FormControl>
  );
}
