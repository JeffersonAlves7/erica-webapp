import { Select } from "@chakra-ui/react";
import { Operator } from "@/types/operator.enum";
import { useRef } from "react";

export function OperadorSelector(props: {
  onChange?: (value: Operator) => void;
}) {
  const ref = useRef<HTMLSelectElement>(null);

  return (
    <Select
      ref={ref}
      onChange={(e) => {
        if (props.onChange) {
          props.onChange(e.target.value as Operator);
        }
      }}
      required
      placeholder={"Selecione um operador"}
    >
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
