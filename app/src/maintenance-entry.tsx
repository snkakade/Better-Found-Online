import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { MaintenancePage } from "./components/maintenance-page";
import "./maintenance.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MaintenancePage />
  </StrictMode>,
);
