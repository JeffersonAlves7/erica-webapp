import { FormLabel, FormLabelProps } from "@chakra-ui/react";

export function CustomLabel(props: FormLabelProps) {
  return (
    <FormLabel
      {...props}
      fontSize={{
        base: "smaller",
        md: "md"
      }}
    >
      {props.children}
    </FormLabel>
  );
}
