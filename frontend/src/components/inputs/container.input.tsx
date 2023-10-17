import { FormControl, FormLabel, Input } from "@chakra-ui/react";
import { PropsWithRef, forwardRef } from "react";

export const ContainerInput = forwardRef<HTMLInputElement, PropsWithRef<{}>>(
  (props, ref) => {
    return (
      <FormControl>
        <FormLabel>Lote Container</FormLabel>
        <Input required ref={ref} placeholder={"Ex.: LT001"} />
      </FormControl>
    );
  }
);
