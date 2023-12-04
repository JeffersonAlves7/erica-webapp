import { Box, Table, TableProps } from "@chakra-ui/react";

export function CustomTable(props: TableProps) {
  return (
    <Box overflow={"auto"} height={"50vh"} minH={300} >
      <Table minW={1500} {...props}>{props.children}</Table>
    </Box>
  );
}
