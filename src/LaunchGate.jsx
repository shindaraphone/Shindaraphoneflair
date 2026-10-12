import { useState, useEffect } from "react";

// Launch: Dec 23, 2026 at 12:00 AM, Lagos time (UTC+01:00)
const LAUNCH_TIME = new Date("2026-12-23T00:00:00+01:00").getTime();

const pad = (n) => String(n).padStart(2, "0");

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
  if (!timeLeft) return children;

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
