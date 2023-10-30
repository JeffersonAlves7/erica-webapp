import { FormControl, FormLabel, Input, useToast } from "@chakra-ui/react";
import { useRef } from "react";
import { BsFiletypeXlsx } from "react-icons/bs";

interface ExcelUploadButtonProps {
  withTitle?: boolean;
  onUpload?: (file: any) => void;
}

export function ExcelUploadButton(props: ExcelUploadButtonProps) {
  const toast = useToast();

  const fileRef = useRef<HTMLInputElement>(null);

  async function handleUpload() {
    const file = fileRef.current?.files?.[0];

    if (!file) {
      toast({
        title: "Nenhum arquivo selecionado",
        status: "error",
        duration: 3000,
        isClosable: true
      });
      return;
    }

    fileRef.current.value = "";
    props.onUpload && props.onUpload(file);
  }

  return (
    <FormControl w={"max-content"} className="hover:cursor-pointer">
      <FormLabel className="hover:cursor-pointer">
        <span className=" hover:cursor-pointer items-center text-purple-700 underline flex">
          <BsFiletypeXlsx className="text-xl" />
          {props.withTitle && "Importar em massa"}
        </span>
      </FormLabel>
      <Input
        type="file"
        display={"none"}
        accept=".xlsx"
        ref={fileRef}
        onChange={handleUpload}
        title="Arquivo"
      />
    </FormControl>
  );
}

interface ExcelDownloadButtonProps {
  onDownload?: () => void;
}

export function ExcelDownloadButton(props: ExcelDownloadButtonProps) {
  function handleDownload() {
    props.onDownload && props.onDownload();
  }

  return (
    <button onClick={handleDownload}>
      <span className=" items-center text-purple-700 underline flex font-semibold">
        <BsFiletypeXlsx className="text-xl" />
        Exportar em massa
      </span>
    </button>
  );
}
