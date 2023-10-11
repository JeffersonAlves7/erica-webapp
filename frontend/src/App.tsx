import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Login } from "./pages/login";
import { Home } from "./pages/home";
import { Template } from "./components/template";
import { Relatorio } from "./pages/relatorio";
import { IncluirLancamento } from "./pages/incluirLancamento";
import { Conferencias } from "./pages/conferencias";
import { Produtos } from "./pages/produtos";
import { ProtectedRoute } from "./components/protectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Template>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Home />
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
          <Route path="/incluir-lancamento" element={<IncluirLancamento />} />
          <Route
            path="/incluir-lancamento/conferencias"
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
