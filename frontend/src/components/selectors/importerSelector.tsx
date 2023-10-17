import { Importer } from "@/types/importer.enum";
import { Select } from "@chakra-ui/react";
import { PropsWithRef, forwardRef } from "react";

export const ImporterSelector = forwardRef<HTMLSelectElement, PropsWithRef<{}>>(
  (props, ref) => {
    return (
      <Select required ref={ref} placeholder={"Selecione um estoque"}>
        {Object.keys(Importer).map((key) => {
          return (
            <option key={"stock-" + key} value={key}>
              {Importer[key as keyof typeof Importer]}
            </option>
          );
        })}
      </Select>
    );
  }
);
