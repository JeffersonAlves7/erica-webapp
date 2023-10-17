import { Importer } from "@/types/importer.enum";
import { Select } from "@chakra-ui/react";
import { PropsWithRef, Ref } from "react";

export function ImporterSelector(
  props: PropsWithRef<{ ref: Ref<HTMLSelectElement> }>
) {
  return (
    <Select required ref={props.ref} placeholder={"Selecione um estoque"}>
      <option value={Importer.ALPHA_YNFINITY}>Alpha Ynfinity</option>
      <option value={Importer.ATTUS}>Attus</option>
      <option value={Importer.ATTUS_BLOOM}>Attus Bloom</option>
    </Select>
  );
}
