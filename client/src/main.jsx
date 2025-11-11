import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css"; // keep if you have it; otherwise create empty

const rootEl = document.getElementById("root");
if (!rootEl) {
  throw new Error("Root element not found: ensure index.html has <div id='root'></div>");
}
createRoot(rootEl).render(<App />);
