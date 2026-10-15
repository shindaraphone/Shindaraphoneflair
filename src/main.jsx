import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import ProtectedAdmin from "./ProtectedAdmin";
import PrivacyPolicy from "./PrivacyPolicy";
import TermsOfService from "./TermsOfService";
import LaunchGate from "./LaunchGate";
import { setupAdminPwa } from "./adminPwa";
import "./index.css";

setupAdminPwa();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <LaunchGate>
        <Routes>
          <Route path="/admin" element={<ProtectedAdmin />} />
          <Route path="/admin-login" element={<ProtectedAdmin />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="*" element={<App />} />
        </Routes>
      </LaunchGate>
    </BrowserRouter>
  </React.StrictMode>
);
