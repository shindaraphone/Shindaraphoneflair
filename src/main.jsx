import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import Admin from "./Admin.jsx";
import AdminLogin from "./AdminLogin.jsx";
import ProtectedAdmin from "./ProtectedAdmin.jsx";
import PrivacyPolicy from "./PrivacyPolicy.jsx";
import TermsOfService from "./TermsOfService.jsx";
import "./index.css";
const path = window.location.pathname;
/*
========================================
ROUTES
========================================
*/
const isAdminLoginPage =
  path === "/admin-login";
const isAdminPage =
  path === "/admin";
const isPrivacyPage =
  path === "/privacy-policy";
const isTermsPage =
  path === "/terms";
/*
========================================
RENDER
========================================
*/
ReactDOM.createRoot(
  document.getElementById("root")
).render(
  <React.StrictMode>
    {isAdminLoginPage ? (
      <AdminLogin />
    ) : isAdminPage ? (
      <ProtectedAdmin>
        <Admin />
      </ProtectedAdmin>
    ) : isPrivacyPage ? (
      <PrivacyPolicy />
    ) : isTermsPage ? (
      <TermsOfService />
    ) : (
      <App />
    )}
  </React.StrictMode>
);