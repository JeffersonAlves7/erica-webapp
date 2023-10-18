import { FormControl, FormLabel, Input } from "@chakra-ui/react";
import { PropsWithRef, forwardRef } from "react";

export const ClientInput = forwardRef<HTMLInputElement, PropsWithRef<{}>>(
  (_, ref) => {
    return (
      <FormControl>
        <FormLabel>Cliente</FormLabel>
        <Input required ref={ref} />
      </FormControl>
    );
  }
);
