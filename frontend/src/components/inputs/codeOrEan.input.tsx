import { FormControl, FormLabel, Input } from "@chakra-ui/react";
import { PropsWithRef, forwardRef } from "react";

export const CodeOrEanInput = forwardRef<HTMLInputElement, PropsWithRef<{}>>(
  (props, ref) => {
    return (
      <FormControl id="codigo" isRequired>
        <FormLabel>Código ou EAN</FormLabel>
        <Input required type="text" ref={ref} />
      </FormControl>
    );
  }
);
