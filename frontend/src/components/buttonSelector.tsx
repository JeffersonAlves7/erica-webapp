import { Button, Flex, Stack } from "@chakra-ui/react";
import { useState } from "react";

interface ButtonSelectorProps {
  titles: string[];
  onClick?: (index: number) => void;
  keyPrefix?: string;
}

/**
 * ButtonSelector is a component that renders a list of buttons, and highlights the selected one.
 * @param props ButtonSelectorProps {titles: string[], onClick: (index: number) => void, key?: string}
 * @returns
 */
export function ButtonSelector(props: ButtonSelectorProps) {
  const [selected, setSelected] = useState<number>(0);

  return (
    <Flex gap={6}>
      {props.titles.map((title, index) => (
        <Button
          key={"btn-sel-" + (props.keyPrefix ?? "") + "-" + index}
          backgroundColor={selected === index ? "erica.green" : "erica.pink"}
          _hover={{
            opacity: 0.8,
          }}
          onClick={() => {
            setSelected(index);
            props.onClick && props.onClick(index);
          }}
        >
          {title}
        </Button>
      ))}
    </Flex>
  );
}
