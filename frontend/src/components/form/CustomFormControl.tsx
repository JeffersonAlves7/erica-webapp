import { FormControl } from "@chakra-ui/react";
import { PropsWithChildren } from "react";

export function CustomFormControl(props: PropsWithChildren) {
  return (
    <FormControl maxW={{
      md: 200,
      base: 170,
    }}>
      {props.children}
    </FormControl>
  );
}
