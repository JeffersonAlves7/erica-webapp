import { FormControl, FormLabel, Input } from "@chakra-ui/react";
import { PropsWithRef, Ref, forwardRef } from "react";

export const ObservacaoInput = forwardRef<HTMLInputElement, PropsWithRef<{}>>(
  (props, ref) => {
    return (
      <FormControl>
        <FormLabel>Observação</FormLabel>
        <Input type="text" ref={ref} />
      </FormControl>
    );
  }
);
