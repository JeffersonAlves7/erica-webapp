import { useState } from "react";

export function useLocalStorage(key: string, defaultValue: any) {
  const [value, setValue] = useState(() => {
    const valueInLocalStorage = localStorage.getItem(key);

    if (!valueInLocalStorage) {
      localStorage.setItem(key, defaultValue.toString());
      return defaultValue;
    }

    switch (typeof defaultValue) {
      case "number":
        return Number(valueInLocalStorage);
      case "string":
        return valueInLocalStorage;
      case "boolean":
        return Boolean(valueInLocalStorage);
      case "object":
        return JSON.parse(valueInLocalStorage);
    }

    return valueInLocalStorage;
  });

  return [
    value,
    (value: any) => {
      setValue(value);
      localStorage.setItem(key, value.toString());
    }
  ];
}
