import { Stock } from "@/types/stock.enum";
import { Select, Stack } from "@chakra-ui/react";
import { PropsWithRef, forwardRef } from "react";
import { ButtonSelector } from "./buttonSelector";

export const StockSelector = forwardRef<HTMLSelectElement, PropsWithRef<any>>(
  (_, ref) => {
    return (
      <Select required ref={ref} placeholder={"Selecione um estoque"}>
        {Object.keys(Stock).map((key) => {
          return (
            <option key={"stock-" + key} value={key}>
              {Stock[key as keyof typeof Stock]}
            </option>
          );
        })}
      </Select>
    );
  }
);

export function StockButtonSelector(props: {
  onClick: (stock: "Geral" | "Galpão" | "Loja") => void;
}) {
  const stocks = ["Geral", "Galpão", "Loja"];

  function handleChangeStock(index: number) {
    props.onClick(stocks[index] as Stock & "Geral");
  }

  return (
    <Stack direction={"row"} gap={4}>
      <ButtonSelector titles={stocks} onClick={handleChangeStock} />
    </Stack>
  );
}
