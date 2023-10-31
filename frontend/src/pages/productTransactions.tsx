import { CloseButton } from "@/components/buttons/closeButton";
import { ModalConfirm } from "@/components/ModalConfirm";
import { PaginationSelector } from "@/components/selectors/paginationSelector";
import { StockButtonSelector } from "@/components/selectors/stockSelector";
import { handleError401 } from "@/services/api";
import { productService } from "@/services/product.service";
import { ProductTransaction } from "@/types/products.interface";
import { Stock } from "@/types/stock.enum";
import { TransactionType } from "@/types/transaction-type.enum";
import {
  Box,
  Flex,
  Grid,
  Heading,
  Stack,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useDisclosure,
  useToast
} from "@chakra-ui/react";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export function ProductTransactions() {
  const deleteTransactionDisclosure = useDisclosure();
  const deleteProductDisclusure = useDisclosure();

  const toast = useToast();
  const navigator = useNavigate();

  const [transactionToDelete, setTransactionToDelete] = useState<
    number | undefined
  >(undefined);
  const [product, setProduct] = useState<any>(undefined);
  const [stock, setStock] = useState<Stock | undefined>(undefined);
  const [transactions, setTransactions] = useState<ProductTransaction[]>([]);
  const [page, setPage] = useState(1);
  const [pageQuantity, setPageQuantity] = useState(0);

  const { id: idString, codigo: code } = useParams<{
    codigo: string;
    id: string;
  }>();
  const id = parseInt(idString as string);

  const transactionsLimit = 10;
  const pageLimit = Math.ceil(pageQuantity / transactionsLimit);

  useEffect(() => {
    productService
      .getTransactions({
        limit: transactionsLimit,
        page: page,
        orderBy: "desc",
        code,
        stock
      })
      .then((response) => {
        setProduct(response.data[0]?.product);
        setPage(page);
        setPageQuantity(response.total);
        setTransactions(response.data);
      })
      .catch((error) => {
        handleError401(error);
      });
  }, [stock, code]);

  function handleChangePage(page: number) {
    productService
      .getTransactions({
        limit: transactionsLimit,
        page: page,
        orderBy: "desc",
        code,
        stock
      })
      .then((response) => {
        setProduct(response.data[0]?.product);
        setPage(page);
        setPageQuantity(response.total);
        setTransactions(response.data);
      })
      .catch((error) => {
        handleError401(error);
      });
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

  function handleConfirmDeleteProduct() {
    productService
      .deleteProduct(id)
      .then(() => {
        toast({
          title: "Produto apagado com sucesso",
          status: "success",
          duration: 3000,
          isClosable: true
        });
        navigator("/")
      })
      .catch(() => {
        toast({
          title: "Falha ao apagar o produto",
          status: "error",
          duration: 3000,
          isClosable: true
        });
      })
      .finally(() => {
        deleteProductDisclusure.onClose();
      });
  }

  function handleDelete(id: number) {
    setTransactionToDelete(id);
    deleteTransactionDisclosure.onOpen();
  }

  function handleConfirmDelete() {
    if (!transactionToDelete) {
      deleteTransactionDisclosure.onClose();
      return;
    }

    productService
      .deleteTransaction(transactionToDelete)
      .then(() => {
        setTransactionToDelete(undefined);
        handleChangePage(page);
      })
      .catch((error) => {
        handleError401(error);
      })
      .finally(() => {
        deleteTransactionDisclosure.onClose();
      });
  }

  return (
    <Stack h={"full"} gap={5}>
      <Heading>
        {product?.description || "Rotação"} - {code}
      </Heading>

      <Flex gap={4}>
        <StockButtonSelector onClick={handleChangeStock} />

        <CloseButton onClick={deleteProductDisclusure.onOpen}/>
      </Flex>
    `
      <ProductInfo
        galpaoQuantity={
          product?.galpaoQuantity + product?.galpaoQuantityReserve ?? 0
        }
        lojaQuantity={product?.lojaQuantity + product?.lojaQuantityReserve ?? 0}
        reservado={
          product?.galpaoQuantityReserve + product?.lojaQuantityReserve ?? 0
        }
      />

      <Box overflow={"auto"} minH={200}>
        <Table>
          <ProductTableHead />
          <Tbody>
            {transactions.map((transaction) => (
              <ProductTableItem
                transaction={transaction}
                key={transaction.id}
                handleDelete={handleDelete}
              />
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

      <ModalConfirm
        isOpen={deleteTransactionDisclosure.isOpen}
        onClose={deleteTransactionDisclosure.onClose}
        handleConfirm={handleConfirmDelete}
      >
        Você realmente deseja excluir esta transação? Essa ação não pode ser
        desfeita.
      </ModalConfirm>

      <ModalConfirm
        isOpen={deleteProductDisclusure.isOpen}
        onClose={deleteProductDisclusure.onClose}
        handleConfirm={handleConfirmDeleteProduct}
      >
        Tem certeza que deseja apagar o produto?
      </ModalConfirm>
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
  transaction,
  handleDelete
}: {
  transaction: ProductTransaction;
  handleDelete?: (id: number) => void;
}) {
  const date = transaction.createdAt
    ? format(new Date(transaction.createdAt), "dd/MM/yyyy")
    : "";

  return (
    <Tr>
      <Td>{transaction.code}</Td>
      <Td>{transaction.entryAmount}</Td>
      <Td>{transaction.exitAmount}</Td>
      <Td>
        {TransactionType[transaction.type as keyof typeof TransactionType]}
      </Td>
      <Td>{transaction.from}</Td>
      <Td>{transaction.to}</Td>
      <Td>{transaction.client}</Td>
      <Td>{transaction.operator}</Td>
      <Td>{date}</Td>
      <Td>{transaction.observation}</Td>
      <Td>
        <CloseButton
          onClick={() => handleDelete && handleDelete(transaction.id)}
        />
      </Td>
    </Tr>
  );
}
