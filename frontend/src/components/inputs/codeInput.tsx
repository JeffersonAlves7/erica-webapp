import { FormControl, FormLabel, Input } from "@chakra-ui/react";
import { PropsWithRef, forwardRef } from "react";

export const CodeOrEanInput = forwardRef<HTMLInputElement, PropsWithRef<any>>(
  (_, ref) => {
    return (
      <FormControl id="codigo" isRequired>
        <FormLabel>Código ou EAN</FormLabel>
        <Input required type="text" ref={ref} />
      </FormControl>
    );
  }
);

export const CodeInputForStock = forwardRef<
  HTMLInputElement,
  PropsWithRef<{ onSearch: () => void }>
>((props, ref) => {
  function handleKeyUp(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.currentTarget.value === "") props.onSearch();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") props.onSearch();
  }

  return (
    <FormControl maxW={150}>
      <FormLabel>
        <p className="text-xs">Filtrar por Código</p>
      </FormLabel>
      <Input
        placeholder={"Ex.: BT0001"}
        ref={ref}
        onKeyUp={handleKeyUp}
        onKeyDown={handleKeyDown}
      />
    </FormControl>
  );
});
