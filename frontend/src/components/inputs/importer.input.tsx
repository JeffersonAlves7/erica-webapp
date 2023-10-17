import { FormControl, FormLabel } from "@chakra-ui/react";
import { PropsWithRef, forwardRef } from "react";
import { ImporterSelector } from "../selectors/importerSelector";

export const ImporterInput = forwardRef<HTMLSelectElement, PropsWithRef<{}>>(
  (props, ref) => {
    return (
      <FormControl>
        <FormLabel>Importadora</FormLabel>
        <ImporterSelector ref={ref} />
      </FormControl>
    );
  }
);
