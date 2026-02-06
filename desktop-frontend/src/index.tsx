import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import './lib/i18n';
import './index.css';
import App from "./App";
import { registerSW } from "virtual:pwa-register";

registerSW({ immediate: true });

createRoot(document.getElementById("app") as HTMLElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);