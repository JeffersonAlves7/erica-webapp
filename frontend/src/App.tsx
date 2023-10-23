import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Login } from "./pages/login";
import { Stocks } from "./pages/stocks";
import { Template } from "./components/template";
import { Relatorio } from "./pages/relatorio";
import { IncluirLancamento } from "./pages/incluirLancamento";
import { Conferencias } from "./pages/conferencias";
import { Produtos } from "./pages/produtos";
import { ProtectedRoute } from "./components/protectedRoute";
import { CriarEntrada } from "./outlets/lancamento/criarEntrada";
import { CriarSaida } from "./outlets/lancamento/criarSaida";
import { CriarTransferencia } from "./outlets/lancamento/criarTransferencia";
import { CriarDevolucao } from "./outlets/lancamento/criarDevolucao";
import { CriarReserva } from "./outlets/lancamento/criarReserva";
import { ProductTransactions } from "./pages/productTransactions";
import { Test } from "./pages/test";
import { Reservas } from "./pages/reservas";

function App() {
  return (
    <BrowserRouter>
      <Template>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Login />} />
          <Route path="/test" element={<Test />} />
          <Route
            path="/estoques"
            element={
              <ProtectedRoute>
                <Stocks />
              </ProtectedRoute>
            }
          />
          <Route
            path="/estoques/:codigo"
            element={
              <ProtectedRoute>
                <ProductTransactions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reservas"
            element={
              <ProtectedRoute>
                <Reservas />
              </ProtectedRoute>
            }
          />
          <Route
            path="/relatorios"
            element={
              <ProtectedRoute>
                <Relatorio />
              </ProtectedRoute>
            }
          />
          <Route
            path="/incluir-lancamento"
            element={
              <ProtectedRoute>
                <IncluirLancamento />
              </ProtectedRoute>
            }
          >
            <>
              <Route path="" element={<CriarEntrada />} />
              <Route path="entrada" element={<CriarEntrada />} />
              <Route path="saida" element={<CriarSaida />} />
              <Route path="transferencia" element={<CriarTransferencia />} />
              <Route path="devolucao" element={<CriarDevolucao />} />
              <Route path="reserva" element={<CriarReserva />} />
            </>
          </Route>
          <Route
            path="/incluir-lancamento/transferencia/conferencias"
            element={
              <ProtectedRoute>
                <Conferencias />
              </ProtectedRoute>
            }
          />
          <Route
            path="/produtos"
            element={
              <ProtectedRoute>
                <Produtos />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Template>
    </BrowserRouter>
  );
}

export default App;
