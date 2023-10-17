import { CloseButton } from "@/components/buttons/closeButton";
import { PaginationSelector } from "@/components/selectors/paginationSelector";
import { StockButtonSelector } from "@/components/selectors/stockSelector";
import { productService } from "@/services/product.service";
import { ProductTransaction } from "@/types/products.interface";
import { Stock } from "@/types/stock.enum";
import {
  Box,
  Grid,
  Heading,
  Stack,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr
} from "@chakra-ui/react";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export function ProductTransactions() {
  const [product, setProduct] = useState<any>(undefined);
  const [stock, setStock] = useState<Stock | undefined>(undefined);
  const [transactions, setTransactions] = useState<ProductTransaction[]>([]);
  const [page, setPage] = useState(1);
  const [pageQuantity, setPageQuantity] = useState(0);

  const { codigo } = useParams<{ codigo: string }>();

  const transactionsLimit = 20;
  const pageLimit = Math.ceil(pageQuantity / transactionsLimit);

  useEffect(() => {
    productService.getTransactions({
      limit: transactionsLimit,
      page: page,
      orderBy: 'desc',
      code: codigo,
      toStock: stock,
    }).then((response) => {
      const items = response.data.map((transaction) => {
        if(!product) setProduct(transaction.product);
      
        return {
          id: transaction.id,
          code: transaction.product.code,  
          entryAmount: transaction.entryAmount,
          exitAmount: transaction.exitAmount,
          type: transaction.type,
          from: transaction.fromStock,
          to: transaction.toStock,
          client: transaction.client,
          operator: transaction.operator,
          createdAt: transaction.createdAt,
          observation: transaction.observation,
        }
      })

      setTransactions(items);
    });
  }, [stock]);

  function handleChangePage(page: number) {
    setPage(page);
  }

  function handleChangeStock(stock: string) {
    if (stock === "Geral") {
      setStock(undefined);
    } else if (stock == "Loja") {
      setStock(Stock.LOJA);
    } else {
      setStock(Stock.GALPAO);
    }
  }

  return (
    <Stack>
      <Heading>Rotação - {codigo}</Heading>
      <StockButtonSelector onClick={handleChangeStock} />
      <ProductInfo
        galpaoQuantity={product?.galpaoQuantity ?? 0}
        lojaQuantity={product?.lojaQuantity ?? 0}
        reservado={0}
      />
      <Box overflow={"auto"}>
        <Table>
          <ProductTableHead />
          <Tbody>
            {transactions.map((transaction) => (
              <ProductTableItem transaction={transaction} key={transaction.id} />
            ))}
          </Tbody>
        </Table>
      </Box>
      <PaginationSelector
        page={page}
        pageQuantity={pageLimit}
        increasePage={() => {
          if (page + 1 > pageLimit) return;
          handleChangePage(page + 1);
        }}
        decreasePage={() => {
          if (page - 1 < 1) return;
          handleChangePage(page - 1);
        }}
      />
    </Stack>
  );
}

function ProductInfo(props: {
  galpaoQuantity: number;
  lojaQuantity: number;
  reservado: number;
}) {
  const saldoTotal = props.galpaoQuantity + props.lojaQuantity;
  const totalDisponivel = saldoTotal - props.reservado;
  return (
    <Grid gridTemplateColumns={"200px 200px"}>
      <Box>
        <Text>Saldo total: {saldoTotal}</Text>
      </Box>
      <Box>
        <Text>Saldo Galpão: {props.galpaoQuantity}</Text>
      </Box>
      <Box>
        <Text>Saldo Loja: {props.lojaQuantity}</Text>
      </Box>
      <Box>
        <Text>Reservado: {props.reservado}</Text>
      </Box>
      <Box>
        <Text>Disponível para venda: {totalDisponivel}</Text>
      </Box>
    </Grid>
  );
}

function ProductTableHead() {
  return (
    <Thead>
      <Tr>
        <Th>Código</Th>
        <Th>
          Saldo <br /> entrada
        </Th>
        <Th>
          Saldo <br /> saída
        </Th>
        <Th>
          Tipo de <br /> operação
        </Th>
        <Th>Origem</Th>
        <Th>Destino</Th>
        <Th>Cliente</Th>
        <Th>Operador</Th>
        <Th>Data</Th>
        <Th>Observação</Th>
        <Th></Th>
      </Tr>
    </Thead>
  );
}

function ProductTableItem({
  transaction
}: {
  transaction: ProductTransaction;
}) {
  const date = transaction.createdAt
    ? format(new Date(transaction.createdAt), "dd/MM/yyyy")
    : "";

  return (
    <Tr>
      <Td>{transaction.code}</Td>
      <Td>{transaction.entryAmount}</Td>
      <Td>{transaction.exitAmount}</Td>
      <Td>{transaction.type}</Td>
      <Td>{transaction.from}</Td>
      <Td>{transaction.to}</Td>
      <Td>{transaction.client}</Td>
      <Td>{transaction.operator}</Td>
      <Td>{date}</Td>
      <Td>{transaction.observation}</Td>
      <Td>
        <CloseButton onClick={() => {}} />
      </Td>
    </Tr>
  );
}
