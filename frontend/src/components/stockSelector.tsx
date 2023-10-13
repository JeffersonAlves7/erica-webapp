import { Stock } from "@/types/stock.enum";
import { Select } from "@chakra-ui/react";
import { useRef } from "react";

export function StockSelector(props: { onChange?: (value: Stock) => void }) {
  const ref = useRef<HTMLSelectElement>(null);

  return (
    <Select
      required
      ref={ref}
      onChange={(e) =>
        props.onChange && props.onChange(e.target.value as Stock)
      }
      placeholder={"Selecione um estoque"}
    >
      <option value={Stock.GALPAO}>Galpão</option>
      <option value={Stock.LOJA}>Loja</option>
    </Select>
  );
}
