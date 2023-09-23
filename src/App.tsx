import { BrowserRouter, Route, Routes } from "react-router-dom"
import { Login } from "./pages/login"
import { Home } from "./pages/home"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login/>}/>
        <Route path="/home" element={<Home/>}/>
      </Routes> 
    </BrowserRouter>
  )
}

export default App
