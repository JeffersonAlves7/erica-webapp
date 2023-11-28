import { ButtonSelector } from "@/components/selectors/buttonSelector";
import { handleError401 } from "@/services/api";
import { productService } from "@/services/productService";
import {
  Box,
  Heading,
  Input,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr
} from "@chakra-ui/react";
import { useCallback, useEffect, useReducer } from "react";
import { PaginationSelector } from "@/components/selectors/paginationSelector";

interface Product {
  id: number;
  containerNumber: string;
  importadora: string;
  codigo: string;
  descricao: string;
}

interface ProdutosState {
  products: Product[];
  page: number;
  productsQuantity: number;
  importer: string;
  search: string;
}

type ProdutosAction =
  | {
      type: "set_products";
      payload: Product[];
    }
  | {
      type: "products_quantity";
      payload: number;
    }
  | {
      type: "set_page";
      payload: number;
    }
  | {
      type: "set_importer";
      payload: string;
    }
  | {
      type: "reset_page";
      payload: null | undefined;
    }
  | {
      type: "set_search";
      payload: string;
    };

function reducer(state: ProdutosState, action: ProdutosAction): ProdutosState {
  switch (action.type) {
    case "set_products":
      return {
        ...state,
        products: action.payload
      };
    case "products_quantity":
      return {
        ...state,
        productsQuantity: action.payload
      };
    case "set_page":
      if (action.payload < 1 || action.payload > state.productsQuantity)
        return state;
      return {
        ...state,
        page: action.payload
      };
    case "reset_page":
      return {
        ...state,
        page: 1
      };
    case "set_importer":
      return {
        ...state,
        importer: action.payload
      };
    case "set_search":
      return {
        ...state,
        search: action.payload
      };
    default:
      return state;
  }
}

export function Produtos() {
  const [state, dispatch] = useReducer(reducer, {
    products: [],
    page: 1,
    productsQuantity: 0,
    importer: "Geral",
    search: ""
  });
  const pageLimit = 25;
  const { page, products, importer, search } = state;
  const importers = ["Geral", "Attus Bloom", "Attus", "Alpha Ynfinity"];

  const searchProducts = useCallback(() => {
    productService
      .getEntries({
        page: state.page,
        limit: pageLimit,
        importer: importer === "Geral" ? undefined : importer,
        search: search || undefined
      })
      .then((response) => {
        const products = response.data.map((product) => {
          return {
            id: product.id,
            containerNumber: product.container.id,
            importadora: product.product.importer,
            codigo: product.product.code,
            descricao: product.product.description
          };
        });

        dispatch({ type: "set_products", payload: products });
        dispatch({
          type: "products_quantity",
          payload: Math.ceil(response.total / pageLimit)
        });
      })
      .catch((error) => {
        handleError401(error);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [importer, search, state.page]);

  useEffect(() => {
    searchProducts();
  }, [state.importer, state.page]);

  function handleSearch() {
    dispatch({ type: "reset_page", payload: null });
    searchProducts();
  }

  function handleImporter(index: number) {
    dispatch({ type: "set_importer", payload: importers[index] });
    dispatch({ type: "reset_page", payload: null });
  }

  return (
    <Box>
      <Heading mb={6}>Lista de produtos</Heading>
      <Input
        mb={6}
        placeholder="Buscar por Número do container, código ou descrição"
        onChange={(e) =>
          dispatch({ type: "set_search", payload: e.target.value })
        }
        value={state.search}
        onKeyUp={(e) => {
          if (e.key === "Backspace" && state.search === "") handleSearch();
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSearch();
        }}
      />
      <Box mb={6}>
        <ButtonSelector
          keyPrefix="lista-produtos"
          titles={importers}
          onClick={handleImporter}
        />
      </Box>
      <Box className="max-h-[55vh]" overflow={"auto"}>
        <Table>
          <Thead>
            <Tr>
              <Th>Número do container</Th>
              <Th>Importadora</Th>
              <Th>Código</Th>
              <Th>Descrição</Th>
            </Tr>
          </Thead>
          <Tbody>
            {products.map((product, index) => (
              <Tr key={"product-" + index}>
                <Td>{product.containerNumber}</Td>
                <Td>{product.importadora}</Td>
                <Td>{product.codigo}</Td>
                <Td>
                  <Box overflow={"auto"} maxH={"70px"}>
                    {product.descricao}
                  </Box>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
      <PaginationSelector
        page={page}
        decreasePage={() => {
          if (page > 1) dispatch({ type: "set_page", payload: page - 1 });
        }}
        increasePage={() => {
          dispatch({ type: "set_page", payload: page + 1 });
        }}
        pageQuantity={state.productsQuantity}
      />
    </Box>
  );
}
