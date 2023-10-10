import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./global.css";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  colors: {
    erica: {
      green: "#68D293",
      pink: "#FF9F9F"
    }
  }
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <App />
    </ChakraProvider>
  </React.StrictMode>
);
