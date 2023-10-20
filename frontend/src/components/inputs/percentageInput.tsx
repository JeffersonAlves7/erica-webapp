import { FormControl, FormLabel, Input, useToast } from "@chakra-ui/react";
import React, { useState } from "react";

interface PropsPercentageInput {
  label: string;
  value: number;
  onChange: (value: number) => void;
  className?: string;
}

export function PercentageInput({
  label,
  value,
  onChange
}: PropsPercentageInput) {
  const [inputValue, setInputValue] = useState(value.toString());
  const [isEditing, setIsEditing] = useState(false);
  const toast = useToast();

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
    setIsEditing(true);
  };

  const handleBlur = () => {
    if (isEditing) {
      const numericValue = parseFloat(inputValue);

      if (!isNaN(numericValue) && numericValue >= 0 && numericValue <= 100) {
        onChange(numericValue);
        setInputValue(numericValue.toString());
      } else {
        setInputValue(value.toString());
        toast({
          title: "Valor inválido",
          description: "O valor deve ser entre 0 e 100",
          status: "error",
          duration: 3000,
          isClosable: true
        });
      }

      setIsEditing(false);
    }
  };

  return (
    <FormControl>
      <FormLabel>
        <p className="text-xs">{label}</p>
      </FormLabel>
      <Input
        type="text"
        value={isEditing ? inputValue : value + "%"}
        onChange={handleInputChange}
        onBlur={handleBlur}
      />
    </FormControl>
  );
}
