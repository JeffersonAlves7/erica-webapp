import { FormControl, FormLabel, Input } from "@chakra-ui/react";
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
  onChange,
}: PropsPercentageInput) {
  const [isValid, setIsValid] = useState(true);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    const numericValue = parseFloat(inputValue);

    if (isNaN(numericValue) || numericValue < 0 || numericValue > 100) {
      setIsValid(false);
    } else {
      setIsValid(true);
      onChange(numericValue);
    }
  };

  return (
    <FormControl>
      <FormLabel>
        <p className="text-xs">{label}</p>
      </FormLabel>
      <Input
        type="text"
        value={isValid ? value + "%" : value}
        onChange={handleInputChange}
        className={isValid ? "valid" : "invalid"}
      />
      {!isValid && (
        <p className="error-text">
          Valor inválido. Insira uma porcentagem válida entre 0 e 100.
        </p>
      )}
    </FormControl>
  );
}

