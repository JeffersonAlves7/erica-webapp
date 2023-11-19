import { Select, SelectProps } from "@chakra-ui/react";
import { PropsWithRef, forwardRef } from "react";

export const LojaSelector = forwardRef<
  HTMLSelectElement,
  PropsWithRef<SelectProps>
>((props, ref) => {
  const options = [
    "Loja 38 2º Andar",
    "Loja 38 3º Andar",
    "Loja 38 4º Andar",
    "Loja 40 1º Andar",
    "Loja 40 2º Andar",
    "Loja 40 3º Andar",
    "Loja 40 4º Andar"
  ];

  return (
    <Select placeholder={"Selecione um destino"} {...props} ref={ref}>
      {options.map((op, index) => (
        <option key={"loja-option-" + index} value={op}>
          {op}
        </option>
      ))}
    </Select>
  );
});
