import { Td, useToast } from "@chakra-ui/react";
import { InputWithSearch } from "./inputs/inputWithSearch";
import { useState } from "react";
import { productService } from "@/services/productService";

interface TableLojaLocationProps {
  itemId: string | number;
  location?: string;
}

export function TableLojaLocation(props: TableLojaLocationProps) {
  const { itemId } = props;
  const toast = useToast();
  const [location, setLocation] = useState(props.location?.toString() ?? "");

  async function handleSearch() {
    try {
      await productService.updateProduct({
        id: itemId,
        location
      });

      toast({
        title: "Localização alterada com sucesso",
        status: "success",
        duration: 3000,
        isClosable: true
      });
    } catch (e) {
      toast({
        title: "Falha ao alterar a localização",
        status: "error",
        duration: 3000,
        isClosable: true
      });
    }
  }

  return (
    <Td>
      <InputWithSearch
        onSearch={handleSearch}
        value={location}
        onChange={(e) => setLocation(e.target.value)}
      />
    </Td>
  );
}
