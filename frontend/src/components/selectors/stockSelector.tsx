import { Stock } from "@/types/stock.enum";
import { Select } from "@chakra-ui/react";
import { PropsWithRef, Ref } from "react";

export function StockSelector(
  props: PropsWithRef<{ ref: Ref<HTMLSelectElement> }>
) {
  return (
    <Select required ref={props.ref} placeholder={"Selecione um estoque"}>
      <option value={Stock.GALPAO}>Galpão</option>
      <option value={Stock.LOJA}>Loja</option>
    </Select>
  );
}
