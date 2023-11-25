import { Td } from "@chakra-ui/react";
import { CustomInput } from "./form/CustomInput";
import { InputWithSearch } from "./inputs/inputWithSearch";
import { useState } from "react";
import { productService } from "@/services/product.service";

interface TableLojaLocationProps {
  itemId: string | number;
  location?: string;
}

export function TableLojaLocation(props: TableLojaLocationProps) {
  const { itemId } = props;
  const [location, setLocation] = useState(props.location?.toString() ?? '')

  function handleSearch(){
    productService.updateProduct({
      id: itemId,
      location
    }).then(() => {

    }).catch(() => {

    })
  }

  return (
    <Td>
      <InputWithSearch
        onSearch={handleSearch}
        value={location}
        onChange={(e) => {
          setLocation(e.target.value);
        }}
      />
    </Td>
  );
}
