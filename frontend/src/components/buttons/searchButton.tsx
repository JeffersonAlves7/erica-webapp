import { Button } from "@chakra-ui/react";
import { BsSearch } from "react-icons/bs";

interface SearchButtonProps {
  onSearch: () => void;
}

export function SearchButton(props: SearchButtonProps) {
  return (
    <Button
      _hover={{ opacity: 0.7 }}
      backgroundColor={"erica.green"}
      marginTop={6}
      onClick={props.onSearch}
    >
      <BsSearch />
    </Button>
  );
}
