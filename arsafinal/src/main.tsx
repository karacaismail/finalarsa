import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import "./styles.css";

// Path-tabanlı mod seçimi (runtime):
//   /finansal/     → v1 klasik (motor + DEFAULT_DATA)
//   /finansal/v2/  → v2 canlı master_plan (giderler sheet'ten, personel motordan)
//   /finansal/v3/  → v3 = v2 + kalem alt-detay modalı (alt_detay sekmesi, canlı)
const path = window.location.pathname;
const v3Mode = path.includes("/finansal/v3");
const sheetMode = !v3Mode && path.includes("/finansal/v2");

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App sheetMode={sheetMode} v3Mode={v3Mode} />
  </React.StrictMode>,
);
