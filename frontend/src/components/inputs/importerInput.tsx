import { FormControl, FormLabel } from "@chakra-ui/react";
import { PropsWithRef, forwardRef } from "react";
import { ImporterSelector } from "../selectors/importerSelector";
import { Importer } from "@/types/importer.enum";

export const ImporterInput = forwardRef<HTMLSelectElement, PropsWithRef<any>>(
  (_, ref) => {
    return (
      <FormControl>
        <FormLabel>Importadora</FormLabel>
        <ImporterSelector ref={ref} />
      </FormControl>
    );
  }
);

export function ImporterInputForStock(props: {
  onChange: (importer: Importer) => void;
}) {
  return (
    <FormControl maxW={250}>
      <FormLabel>
        <p className="text-xs">Filtrar por Importadora</p>
      </FormLabel>
      <ImporterSelector onChange={props.onChange} />
    </FormControl>
  );
}
