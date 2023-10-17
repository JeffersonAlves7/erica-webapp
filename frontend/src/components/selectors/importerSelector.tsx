import { Importer } from "@/types/importer.enum";
import { Select } from "@chakra-ui/react";
import { PropsWithRef, forwardRef } from "react";

interface ImporterSelectorProps {
  placeholder?: string;
  onChange?: (importer: Importer) => void;
}

export const ImporterSelector = forwardRef<
  HTMLSelectElement,
  PropsWithRef<ImporterSelectorProps>
>((props, ref) => {
  return (
    <Select
      required
      ref={ref}
      placeholder={
        props.placeholder ? props.placeholder : "Selecione uma importadora"
      }
      onChange={(e) => {
        props.onChange && props.onChange(e.target.value as Importer);
      }}
    >
      {Object.keys(Importer).map((key) => {
        return (
          <option key={"stock-" + key} value={key}>
            {Importer[key as keyof typeof Importer]}
          </option>
        );
      })}
    </Select>
  );
});
