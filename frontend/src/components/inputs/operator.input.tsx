import { FormControl, FormLabel } from "@chakra-ui/react";
import { OperadorSelector } from "../selectors/operadorSelector";
import { PropsWithRef, Ref } from "react";

export function OperatorInput(
  props: PropsWithRef<{ ref: Ref<HTMLSelectElement> }>
) {
  return (
    <FormControl>
      <FormLabel>Operador</FormLabel>
      <OperadorSelector ref={props.ref} />
    </FormControl>
  );
}
