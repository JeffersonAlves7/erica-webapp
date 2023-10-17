import { Stock } from "@/types/stock.enum";
import { Select } from "@chakra-ui/react";
import { PropsWithRef, forwardRef } from "react";

export const StockSelector = forwardRef<HTMLSelectElement, PropsWithRef<{}>>(
  (props, ref) => {
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
