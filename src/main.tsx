import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./main.css";
import ConfigProvider from "./components/ConfigProvider";
import { config } from "./config";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ConfigProvider config={config}>
      <App />
    </ConfigProvider>
  </React.StrictMode>,
);
