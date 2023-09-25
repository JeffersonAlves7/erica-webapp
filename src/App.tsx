import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Login } from "./pages/login";
import { Home } from "./pages/home";
import { Template } from "./components/template";

function App() {
  return (
    <BrowserRouter>
      <Template>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/home" element={<Home />} />
        </Routes>
      </Template>
    </BrowserRouter>
  );
}

export default App;
