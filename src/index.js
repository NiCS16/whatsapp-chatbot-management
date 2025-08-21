// src/index.js
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./App.js";
import "./styles.css"; // global styles

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App /> {/* loads your actual app UI */}
  </React.StrictMode>
);
