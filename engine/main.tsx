import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "driver.js/dist/driver.css";
import "./index.css";
import { Root } from "./Root.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
