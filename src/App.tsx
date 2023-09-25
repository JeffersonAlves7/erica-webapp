import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Login } from "./pages/login";
import { Home } from "./pages/home";
import { Template } from "./components/template";
import { Relatorio } from "./pages/relatorio";
import { IncluirLancamento } from "./pages/incluirLancamento";

function App() {
  return (
    <BrowserRouter>
      <Template>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/relatorios" element={<Relatorio/>} />
          <Route path="/incluir-lancamento" element={<IncluirLancamento/>} />
        </Routes>
      </Template>
    </BrowserRouter>
  );
}

export default App;
