import { Select, SelectProps } from "@chakra-ui/react";

export function CustomSelect(props: SelectProps) {
  return (
    <Select
      fontSize={{
        base: "smaller",
        md: "md"
      }}
      size={{
        base: "sm",
        md: "md"
      }}
      {...props}
    >
      {props.children}
    </Select>
  );
}
