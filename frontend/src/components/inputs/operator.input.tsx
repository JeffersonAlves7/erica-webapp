import { FormControl, FormLabel } from "@chakra-ui/react";
import { OperatorSelector } from "../selectors/operatorSelector";
import { PropsWithRef, forwardRef } from "react";

export const OperatorInput = forwardRef<HTMLSelectElement, PropsWithRef<{}>>(
  (_, ref) => {
    return (
      <FormControl>
        <FormLabel>Operador</FormLabel>
        <OperatorSelector ref={ref} />
      </FormControl>
    );
  }
);
