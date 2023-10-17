import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Login } from "./pages/login";
import { Stocks } from "./pages/stocks";
import { Template } from "./components/template";
import { Relatorio } from "./pages/relatorio";
import { IncluirLancamento } from "./pages/incluirLancamento";
import { Conferencias } from "./pages/conferencias";
import { Produtos } from "./pages/produtos";
import { ProtectedRoute } from "./components/protectedRoute";
import { CriarEntrada } from "./outlets/criarEntrada";
import { CriarSaida } from "./outlets/criarSaida";
import { CriarTransferencia } from "./outlets/criarTransferencia";
import { CriarDevolucao } from "./outlets/criarDevolucao";
import { CriarReserva } from "./outlets/criarReserva";

function App() {
  return (
    <BrowserRouter>
      <Template>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route
            path="/estoques"
            element={
              <ProtectedRoute>
                <Stocks />
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
            children={
              <>
                <Route path="" element={<CriarEntrada />} />
                <Route path="entrada" element={<CriarEntrada />} />
                <Route path="saida" element={<CriarSaida />} />
                <Route path="transferencia" element={<CriarTransferencia />} />
                <Route path="devolucao" element={<CriarDevolucao />} />
                <Route path="reserva" element={<CriarReserva />} />
              </>
            }
          />
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
