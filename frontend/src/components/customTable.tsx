import { Box, Table, TableProps } from "@chakra-ui/react";

export function CustomTable(props: TableProps) {
  return (
    <Box overflow={"auto"}>
      <Table {...props}>{props.children}</Table>
    </Box>
  );
}
