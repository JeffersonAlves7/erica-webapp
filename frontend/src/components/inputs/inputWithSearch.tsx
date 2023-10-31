import { InputProps } from "@chakra-ui/react";
import { CustomInput } from "../form/CustomInput";

export function InputWithSearch(props: InputProps & { onSearch: () => void }) {
  const { onSearch, ...p } = props;

  return (
    <CustomInput
      {...p}
      onKeyUp={(e) => {
        if (e.key === "Backspace" && e.currentTarget.value === "") onSearch();
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") onSearch();
      }}
    />
  );
}
