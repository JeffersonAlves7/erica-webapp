import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Login } from "./pages/login";
import { Estoques } from "./pages/estoques";
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
import { Reservas } from "./pages/reservas";
import { Embarques } from "./pages/embarques";
import { EmbarqueConferencia } from "./pages/embarqueConferencia";
import { HistoricoTransferencias } from "./pages/historicoTransferencias";
import { ItensArquivados } from "./pages/itensArquivados";
import { Register } from "./pages/register";

function App() {
  return (
    <BrowserRouter>
      <Template>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/" element={<Login />} />

          <Route
            path="/estoques"
            element={
              <ProtectedRoute>
                <Estoques />
              </ProtectedRoute>
            }
          />

          <Route
            path="/estoques/arquivados"
            element={
              <ProtectedRoute>
                <ItensArquivados />
              </ProtectedRoute>
            }
          />

          <Route
            path="/estoques/:codigo/:id"
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
            path="/incluir-lancamento/transferencia/historico"
            element={
              <ProtectedRoute>
                <HistoricoTransferencias />
              </ProtectedRoute>
            }
          />

          <Route path="/embarques" element={<Embarques />} />
          <Route
            path="/embarques/:containerId"
            element={<EmbarqueConferencia />}
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
