import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Login } from "./pages/login";
import { Home } from "./pages/home";
import { Template } from "./components/template";
import { Relatorio } from "./pages/relatorio";
import { IncluirLancamento } from "./pages/incluirLancamento";
import { Conferencias } from "./pages/conferencias";
import { Produtos } from "./pages/produtos";

function App() {
  return (
    <BrowserRouter>
      <Template>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/relatorios" element={<Relatorio/>} />
          <Route path="/incluir-lancamento" element={<IncluirLancamento/>} />
          <Route path="/incluir-lancamento/conferencias" element={<Conferencias/>} />
          <Route path="/produtos" element={<Produtos/>} />
        </Routes>
      </Template>
    </BrowserRouter>
  );
}

export default App;
