import { useState, useEffect } from "react";

// MASTER SWITCH
//   true  = website is LOCKED (countdown shows for everyone)
//   false = website is UNLOCKED (everyone sees the real site)
const SITE_LOCKED = false;

// Launch: Dec 23, 2026 at 12:00 AM, Lagos time (UTC+01:00)
const LAUNCH_TIME = new Date("2026-12-23T00:00:00+01:00").getTime();

const pad = (n) => String(n).padStart(2, "0");

// Private preview: lets you (only) see the real site before launch.
//   Unlock: yoursite.com/?preview=PREVIEW_CODE
//   Lock again: yoursite.com/?preview=off  (or just close the tab)
// It is stored only in your own browser tab, so customers still see the countdown.
// Keep this code private. Change it any time if you want a new one.
const PREVIEW_CODE = "open-sesame-7391";
const PREVIEW_KEY = "shindara-preview-unlocked";

function hasPreviewAccess() {
  try {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("preview");

    if (code !== null) {
      if (code === PREVIEW_CODE) sessionStorage.setItem(PREVIEW_KEY, "1");
      if (code === "off") sessionStorage.removeItem(PREVIEW_KEY);

      // Remove ?preview=... from the address bar
      params.delete("preview");
      const query = params.toString();
      window.history.replaceState(
        null,
        "",
        window.location.pathname + (query ? "?" + query : "") + window.location.hash
      );
    }

    return sessionStorage.getItem(PREVIEW_KEY) === "1";
  } catch {
    return false;
  }
}

function getTimeLeft() {
  const diff = LAUNCH_TIME - Date.now();
  if (diff <= 0) return null;
  return {
    days: pad(Math.floor(diff / 86400000)),
    hours: pad(Math.floor(diff / 3600000) % 24),
    minutes: pad(Math.floor(diff / 60000) % 60),
    seconds: pad(Math.floor(diff / 1000) % 60),
  };
}

export default function LaunchGate({ children }) {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft());
  const [previewing] = useState(hasPreviewAccess);

  useEffect(() => {
    if (!timeLeft) return;
    const timer = setInterval(() => {
      const t = getTimeLeft();
      setTimeLeft(t);
      if (!t) clearInterval(timer);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Launch time reached: show the real website
  const isAdmin = window.location.pathname.startsWith("/admin");
  if (!SITE_LOCKED || !timeLeft || isAdmin || previewing) return children;

  const boxStyle = {
    background: "#222",
    borderRadius: 12,
    padding: "16px 12px",
    minWidth: 72,
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#111",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        fontFamily: "Arial, sans-serif",
        padding: 20,
      }}
    >
      <h1 style={{ margin: "0 0 8px" }}>We're launching soon</h1>
      <p style={{ margin: "0 0 32px", opacity: 0.7 }}>
        Our website opens on December 23rd
      </p>
      <div style={{ display: "flex", gap: 16 }}>
        {Object.entries(timeLeft).map(([label, value]) => (
          <div key={label} style={boxStyle}>
            <div style={{ fontSize: "2.2rem", fontWeight: "bold" }}>{value}</div>
            <small style={{ opacity: 0.6, textTransform: "uppercase" }}>{label}</small>
          </div>
        ))}
      </div>
    </div>
  );
}
