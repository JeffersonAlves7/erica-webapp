import { Button, ButtonProps } from "@chakra-ui/react";
import { BsSearch } from "react-icons/bs";

interface SearchButtonProps extends ButtonProps {
  onSearch: () => void;
}

export function SearchButton(props: SearchButtonProps) {
  const { onSearch, ...p } = props;

  return (
    <Button
      _hover={{ opacity: 0.7 }}
      backgroundColor={"erica.green"}
      marginTop={6}
      {...p}
      onClick={() => onSearch()}
    >
      <BsSearch />
    </Button>
  );
}
