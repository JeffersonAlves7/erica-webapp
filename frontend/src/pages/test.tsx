import { ExcelDownloadButton, ExcelUploadButton } from "@/components/buttons/excelButtons";
import { Stack } from "@chakra-ui/react";

export function Test(){
  return (
    <Stack>
      <ExcelUploadButton withTitle/>
      <ExcelDownloadButton />
    </Stack>
  )
}