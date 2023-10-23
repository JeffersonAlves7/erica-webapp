import { FormControl, FormLabel, Input } from "@chakra-ui/react";
import { PropsWithRef, forwardRef } from "react";

export const DateInput = forwardRef<
  HTMLInputElement,
  PropsWithRef<{ label: string }>
>((props, ref) => {
  return (
    <FormControl>
      <FormLabel>{props.label}</FormLabel>
      <Input required type="date" ref={ref} />
    </FormControl>
  );
});
