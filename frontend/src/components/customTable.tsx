import { Box, Table, TableProps } from "@chakra-ui/react";

export function CustomTable(props: TableProps) {
  return (
    <Box overflow={"auto"} height={"50vh"} minH={300}>
      <Table {...props}>{props.children}</Table>
    </Box>
  );
}
