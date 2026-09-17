import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}

import App from "./App.jsx";
import "./shindara-redesign.css";
import "./system-theme.css";
import ProtectedAdmin from "./ProtectedAdmin.jsx";
import PrivacyPolicy from "./PrivacyPolicy.jsx";
import TermsOfService from "./TermsOfService.jsx";

const path = window.location.pathname;

const isAdminLoginPage = path === "/admin-login";
const isAdminPage = path === "/admin";
const isPrivacyPage = path === "/privacy-policy";
const isTermsPage = path === "/terms";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      {isAdminLoginPage || isAdminPage ? (
        <ProtectedAdmin />
      ) : isPrivacyPage ? (
        <PrivacyPolicy />
      ) : isTermsPage ? (
        <TermsOfService />
      ) : (
        <App />
      )}
    </BrowserRouter>
  </React.StrictMode>
);
