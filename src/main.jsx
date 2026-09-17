import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
try {
  localStorage.setItem("theme", systemTheme);
} catch {}

document.documentElement.dataset.theme = systemTheme;

const syncSystemTheme = () => {
  const nextTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  try {
    localStorage.setItem("theme", nextTheme);
  } catch {}
  document.documentElement.dataset.theme = nextTheme;
};

const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
if (typeof mediaQuery.addEventListener === "function") {
  mediaQuery.addEventListener("change", syncSystemTheme);
} else if (typeof mediaQuery.addListener === "function") {
  mediaQuery.addListener(syncSystemTheme);
}

const hideThemeToggleUi = () => {
  const wrapper = document.querySelector(".appearance-switch");
  if (!wrapper) return;

  const systemButton = wrapper.querySelector(".system-mode-btn");
  if (!systemButton) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "system-mode-btn active";
    button.textContent = "System mode";
    button.disabled = true;
    wrapper.innerHTML = "";
    wrapper.appendChild(button);
    return;
  }

  systemButton.classList.add("active");
  systemButton.disabled = true;
  systemButton.textContent = "System mode";

  wrapper.querySelectorAll("button").forEach((button) => {
    if (!button.classList.contains("system-mode-btn")) button.remove();
  });
};

const themeObserver = new MutationObserver(() => {
  hideThemeToggleUi();
});

themeObserver.observe(document.body, {
  childList: true,
  subtree: true,
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}

import App from "./App.jsx";
import "./shindara-redesign.css";
import "./midnight-purple.css";
import ProtectedAdmin from "./ProtectedAdmin.jsx";
import PrivacyPolicy from "./PrivacyPolicy.jsx";
import TermsOfService from "./TermsOfService.jsx";

const path = window.location.pathname;

const isAdminLoginPage = path === "/admin-login";
const isAdminPage = path === "/admin";
const isPrivacyPage = path === "/privacy-policy";
const isTermsPage = path === "/terms";

ReactDOM.createRoot(
  document.getElementById("root")
).render(
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
