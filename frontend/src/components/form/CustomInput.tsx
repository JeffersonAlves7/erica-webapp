import { Input, InputProps } from "@chakra-ui/react";

export function CustomInput(props: InputProps) {
  return (
    <Input
      fontSize={{
        base: "smaller",
        md: "md"
      }}
      size={{
        base: "sm",
        md: "md"
      }}
      {...props}
    />
  );
}
