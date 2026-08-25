import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App.jsx";
import Admin from "./Admin.jsx";
import PrivacyPolicy from "./PrivacyPolicy.jsx";
import TermsOfService from "./TermsOfService.jsx";
import "./index.css";

const path = window.location.pathname;

const isAdminPage = path.startsWith("/admin");
const isPrivacyPage = path === "/privacy-policy";
const isTermsPage = path === "/terms";

ReactDOM.createRoot(
  document.getElementById("root")
).render(
  <React.StrictMode>
    {isAdminPage ? (
      <Admin />
    ) : isPrivacyPage ? (
      <PrivacyPolicy />
    ) : isTermsPage ? (
      <TermsOfService />
    ) : (
      <App />
    )}
  </React.StrictMode>
);