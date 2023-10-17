import { Select } from "@chakra-ui/react";
import { Operator } from "@/types/operator.enum";
import { PropsWithRef, Ref } from "react";

export function OperadorSelector(
  props: PropsWithRef<{ ref: Ref<HTMLSelectElement> }>
) {
  return (
    <Select ref={props.ref} required placeholder={"Selecione um operador"}>
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
