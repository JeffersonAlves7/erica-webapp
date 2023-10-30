import { InputProps } from "@chakra-ui/react";
import { CustomInput } from "../form/CustomInput";

export function InputWithSearch(props: InputProps & { onSearch: () => void }) {
  return (
    <CustomInput
      {...props}
      onKeyUp={(e) => {
        if (e.key === "Backspace" && e.currentTarget.value === "")
          props.onSearch();
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") props.onSearch();
      }}
    />
  );
}
