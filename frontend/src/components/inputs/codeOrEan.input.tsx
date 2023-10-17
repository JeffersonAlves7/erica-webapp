import { FormControl, FormLabel, Input } from "@chakra-ui/react";
import { PropsWithRef, Ref } from "react";

export function CodeOrEanInput(
  props: PropsWithRef<{ ref: Ref<HTMLInputElement> }>
) {
  return (
    <FormControl id="codigo" isRequired>
      <FormLabel>Código ou EAN</FormLabel>
      <Input required type="text" ref={props.ref} />
    </FormControl>
  );
}
