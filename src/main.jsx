import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import ProtectedAdmin from "./ProtectedAdmin";
import PrivacyPolicy from "./PrivacyPolicy";
import TermsOfService from "./TermsOfService";
import LaunchGate from "./LaunchGate";
import "./index.css";

// Makes the admin portal installable as its own app ("Add to Home Screen").
// On /admin pages only, this swaps the page's manifest and icons for the
// admin ones, so the store's install behaviour is left untouched.

function setHead(selector, create, attrs) {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement(create.tag);
    Object.entries(create.attrs || {}).forEach(([k, v]) => el.setAttribute(k, v));
    document.head.appendChild(el);
  }
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
}

function setupAdminPwa() {
  if (typeof window === "undefined") return;
  if (!window.location.pathname.startsWith("/admin")) return;

  setHead('link[rel="manifest"]', { tag: "link", attrs: { rel: "manifest" } }, {
    href: "/admin-manifest.json",
  });
  setHead('link[rel="apple-touch-icon"]', { tag: "link", attrs: { rel: "apple-touch-icon" } }, {
    href: "/admin-apple-touch-icon.png",
  });
  setHead('meta[name="theme-color"]', { tag: "meta", attrs: { name: "theme-color" } }, {
    content: "#170f28",
  });
  setHead('meta[name="apple-mobile-web-app-capable"]', { tag: "meta", attrs: { name: "apple-mobile-web-app-capable" } }, {
    content: "yes",
  });
  setHead('meta[name="mobile-web-app-capable"]', { tag: "meta", attrs: { name: "mobile-web-app-capable" } }, {
    content: "yes",
  });
  setHead('meta[name="apple-mobile-web-app-title"]', { tag: "meta", attrs: { name: "apple-mobile-web-app-title" } }, {
    content: "Shindara Admin",
  });
  setHead('meta[name="apple-mobile-web-app-status-bar-style"]', { tag: "meta", attrs: { name: "apple-mobile-web-app-status-bar-style" } }, {
    content: "default",
  });

  // Pass-through service worker (caches nothing) so Chrome treats the app as installable.
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    });
  }
}

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
