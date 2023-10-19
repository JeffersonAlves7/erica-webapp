import { FormControl, FormLabel, Input } from "@chakra-ui/react";
import { PropsWithRef, forwardRef } from "react";

export const ObservacaoInput = forwardRef<HTMLInputElement, PropsWithRef<any>>(
  (_, ref) => {
    return (
      <FormControl>
        <FormLabel>Observação</FormLabel>
        <Input type="text" ref={ref} />
      </FormControl>
    );
  }
);
