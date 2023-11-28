import { Td, useToast } from "@chakra-ui/react";
import { useState } from "react";
import { productService } from "@/services/productService";
import { LojaSelector } from "./selectors/lojaSelector";

interface TableLojaLocationProps {
  itemId: string | number;
  location?: string;
}

export function TableLojaLocation(props: TableLojaLocationProps) {
  const { itemId } = props;
  const toast = useToast();
  const [location, setLocation] = useState(props.location?.toString() ?? "");

  async function handleSearch(location: string) {
    setLocation(location || "");

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
      <LojaSelector
        value={location}
        onChange={(e) => handleSearch(e.target.value || "")}
      />
    </Td>
  );
}
