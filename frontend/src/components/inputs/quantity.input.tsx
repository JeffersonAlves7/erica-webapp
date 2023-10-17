import { FormControl, FormLabel, Input } from "@chakra-ui/react";
import { PropsWithRef, forwardRef } from "react";

export const QuantityInput = forwardRef<HTMLInputElement, PropsWithRef<{}>>(
  (props, ref) => {
    return (
      <FormControl>
        <FormLabel>Quantidade</FormLabel>
        <Input required min={1} type="number" ref={ref} />
      </FormControl>
    );
  }
);
