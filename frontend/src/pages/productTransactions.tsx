import { ArchiveButton } from "@/components/buttons/archiveButton";
import { CloseButton } from "@/components/buttons/closeButton";
import { TrashButton } from "@/components/buttons/trashButton";
import { CustomTable } from "@/components/customTable";
import { InputWithSearch } from "@/components/inputs/inputWithSearch";
import { ModalConfirm } from "@/components/modalConfirm";
import { PaginationSelector } from "@/components/selectors/paginationSelector";
import { StockButtonSelector } from "@/components/selectors/stockSelector";
import { handleError401 } from "@/services/api";
import { productService } from "@/services/productService";
import { transactionService } from "@/services/transactionService";
import { ProductTransaction } from "@/types/products.interface";
import { Stock } from "@/types/stock.enum";
import { TransactionTypePT } from "@/types/transaction-type.enum";
import {
  Flex,
  Heading,
  Stack,
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
  const archiveProductDisclusure = useDisclosure();

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

  const transactionsLimit = 100;
  const pageLimit = Math.ceil(pageQuantity / transactionsLimit);

  function formatTransactions(data: any): any {
    return data.map((transaction: any) => ({
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
      observation: transaction.observation
    }));
  }

  useEffect(() => {
    productService
      .getProductById(idString as string)
      .then((response) => {
        setProduct(response);
      })
      .catch((e) => {
        handleError401(e);
      });
  }, []);

  useEffect(() => {
    transactionService
      .getAll({
        limit: transactionsLimit,
        page: page,
        orderBy: "desc",
        code,
        stock
      })
      .then((response) => {
        const transactions = formatTransactions(response.data);
        setPage(page);
        setPageQuantity(response.total);
        setTransactions(transactions);
      })
      .catch((error) => {
        handleError401(error);
      });
  }, [stock, code]);

  function handleChangePage(page: number) {
    transactionService
      .getAll({
        limit: transactionsLimit,
        page: page,
        orderBy: "desc",
        code,
        stock
      })
      .then((response) => {
        const transactions = formatTransactions(response.data);
        setPage(page);
        setPageQuantity(response.total);
        setTransactions(transactions);
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
        navigator("/");
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

  function handleArchiveProduct() {
    productService
      .archiveProduct(id)
      .then(() => {
        toast({
          title: "Produto arquivado com sucesso",
          status: "success",
          duration: 3000,
          isClosable: true
        });
        navigator("/estoques");
      })
      .catch(() => {
        toast({
          title: "Falha ao arquivar o produto",
          status: "error",
          duration: 3000,
          isClosable: true
        });
      })
      .finally(() => {
        archiveProductDisclusure.onClose();
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

    transactionService
      .delete(transactionToDelete)
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

  const saldoGalpao =
    product?.galpaoQuantity + product?.galpaoQuantityReserve || 0;
  const saldoLoja = product?.lojaQuantity + product?.lojaQuantityReserve || 0;
  const saldoReservado =
    stock == Stock.GALPAO
      ? product?.galpaoQuantityReserve || 0
      : stock == Stock.LOJA
      ? product?.lojaQuantityReserve || 0
      : (product?.galpaoQuantityReserve || 0) +
        (product?.lojaQuantityReserve || 0);
  const saldoTotal = saldoGalpao + saldoLoja;

  let disponivelParaVenda = 0;

  if (!stock) {
    disponivelParaVenda =
      product?.galpaoQuantity ||
      0 + product?.lojaQuantity ||
      0 - (product?.galpaoQuantityReserve ?? 0 + product?.lojaQuantityReserve);
  } else if (stock == Stock.GALPAO) {
    disponivelParaVenda =
      (product?.galpaoQuantity ?? 0) - (product?.galpaoQuantityReserve ?? 0);
  } else {
    disponivelParaVenda =
      (product?.lojaQuantity ?? 0) - (product?.lojaQuantityReserve ?? 0);
  }

  console.log({product});

  return (
    <Stack h={"full"} gap={5}>
      <Heading>
        {code} - {product?.description || "Não possuí descrição"}
      </Heading>

      <Flex gap={4}>
        <StockButtonSelector onClick={handleChangeStock} />
        <ArchiveButton onClick={archiveProductDisclusure.onOpen} />
        <TrashButton onClick={deleteProductDisclusure.onOpen} />
      </Flex>

      <div className="max-w-[600px] grid md:grid-cols-2 grid-cols-1">
        {!stock ? (
          <>
            <Text>Saldo total: {saldoTotal}</Text>
            <Text>Saldo Galpão: {saldoGalpao}</Text>
            <Text>Saldo Loja: {saldoLoja}</Text>
          </>
        ) : (
          <Text>Saldo: {stock == Stock.LOJA ? saldoLoja : saldoGalpao}</Text>
        )}
        <Text>Reservado: {saldoReservado}</Text>
        <Text>Disponível para venda: {disponivelParaVenda}</Text>
        {stock == Stock.LOJA && (
          <Text>Localização: {product?.lojaLocation}</Text>
        )}
      </div>

      <CustomTable>
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
      </CustomTable>

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
      <ModalConfirm
        isOpen={archiveProductDisclusure.isOpen}
        onClose={archiveProductDisclusure.onClose}
        handleConfirm={handleArchiveProduct}
      >
        Tem certeza que deseja arquivar o produto?
      </ModalConfirm>

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
  const toast = useToast();

  const [observation, setObservation] = useState("");

  useEffect(() => {
    setObservation(transaction.observation ?? "");
  }, [transaction.observation]);

  const date = transaction.createdAt
    ? format(new Date(transaction.createdAt), "dd/MM/yyyy")
    : "";

  return (
    <Tr>
      <Td>{transaction.code}</Td>
      <Td>{transaction.entryAmount}</Td>
      <Td>{transaction.exitAmount}</Td>
      <Td>
        {TransactionTypePT[transaction.type as keyof typeof TransactionTypePT]}
      </Td>
      <Td>{transaction.from}</Td>
      <Td>{transaction.to}</Td>
      <Td>{transaction.client}</Td>
      <Td>{transaction.operator}</Td>
      <Td>{date}</Td>
      <Td>
        <InputWithSearch
          onSearch={async function () {
            try {
              await transactionService.update({
                id: transaction.id,
                observation
              });

              toast({
                title: "Sucesso ao alterar a observação",
                status: "success",
                duration: 3000,
                isClosable: true
              });
            } catch {
              toast({
                title: "Erro ao alterar a observação",
                status: "error",
                duration: 3000,
                isClosable: true
              });
            }
          }}
          onChange={(e) => setObservation(e.target.value)}
          value={observation}
        />
      </Td>
      <Td>
        <CloseButton
          onClick={() => handleDelete && handleDelete(transaction.id)}
        />
      </Td>
    </Tr>
  );
}
