import { FormControl, FormLabel } from "@chakra-ui/react";
import { PropsWithRef, Ref } from "react";
import { ImporterSelector } from "../selectors/importerSelector";

export function ImporterInput(
  props: PropsWithRef<{ ref: Ref<HTMLSelectElement> }>
) {
  return (
    <FormControl>
      <FormLabel>Importadora</FormLabel>
      <ImporterSelector ref={props.ref} />
    </FormControl>
  );
}
