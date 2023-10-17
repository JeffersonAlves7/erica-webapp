import { FormControl, FormLabel, Input } from "@chakra-ui/react";
import { PropsWithRef, Ref, forwardRef } from "react";

export const ClientInput = forwardRef<HTMLInputElement, PropsWithRef<{}>>(
  (props, ref) => {
    return (
      <FormControl>
        <FormLabel>Cliente</FormLabel>
        <Input required ref={ref} />
      </FormControl>
    );
  }
);
