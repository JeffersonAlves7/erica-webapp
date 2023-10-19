import { Select } from "@chakra-ui/react";
import { Operator } from "@/types/operator.enum";
import { PropsWithRef, forwardRef } from "react";

export const OperatorSelector = forwardRef<HTMLSelectElement, PropsWithRef<{}>>(
  (_, ref) => {
    return (
      <Select ref={ref} required placeholder={"Selecione um operador"}>
        {Object.keys(Operator).map((key) => {
          return (
            <option key={"operator-" + key} value={key}>
              {Operator[key as keyof typeof Operator]}
            </option>
          );
        })}
      </Select>
    );
  }
);
