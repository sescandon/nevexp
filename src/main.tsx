import React from "react";
import ReactDOM from "react-dom/client";
import { NavBar } from "./components/navigation/NavBar.tsx";
import "bootstrap/dist/css/bootstrap.min.css";
import "./main.css";
import { MainContent } from "./components/navigation/mainContent/MainContent.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <NavBar />
    <MainContent />
  </React.StrictMode>
);
