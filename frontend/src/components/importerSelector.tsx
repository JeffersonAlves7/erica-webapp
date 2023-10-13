import { Importer } from "@/types/importer.enum";
import { Select } from "@chakra-ui/react";
import { useRef } from "react";

export function ImporterSelector(props: {
  onChange?: (value: Importer) => void;
}) {
  const ref = useRef<HTMLSelectElement>(null);

  return (
    <Select required ref={ref}
    onChange={e => props.onChange && props.onChange(e.target.value as Importer)} 
    placeholder={"Selecione um estoque"}>
      <option value={Importer.ALPHA_YNFINITY}>Alpha Ynfinity</option>
      <option value={Importer.ATTUS}>Attus</option>
      <option value={Importer.ATTUS_BLOOM}>Attus Bloom</option>
    </Select>
  );
}
