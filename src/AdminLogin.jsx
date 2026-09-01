// AdminLogin.jsx
// Rendered by ProtectedAdmin.jsx when there's no verified admin session.
// Only responsible for signing the user in — ProtectedAdmin re-checks
// admin status itself after onLogin() fires.

import { useState, useCallback } from "react";
import { supabase } from "./supabaseClient";
import "./shindara-redesign.css";
import "./admin-panel.css";

function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      setError("");
      setLoading(true);

      try {
        const { data, error: signInError } =
          await supabase.auth.signInWithPassword({ email, password });

        if (signInError) throw signInError;

        if (!data?.user) {
          throw new Error("Sign in failed. Please try again.");
        }

        onLogin();
      } catch (err) {
        setError(err.message || "Could not sign in.");
        setLoading(false);
      }
    },
    [email, password, onLogin]
  );

  return (
    <div className="admin-gate">
      <form className="admin-gate-card" onSubmit={handleSubmit}>
        <span className="modal-kicker">Shindara PhoneFlair</span>
        <h2>Admin sign in</h2>
        <p>Staff access only.</p>

        {error && <div className="message error">{error}</div>}

        <div className="field">
          <label>Email address</label>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@shindara.com"
            required
            autoComplete="email"
          />
        </div>

        <div className="field">
          <label>Password</label>
          <div className="password-field">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password"
              required
              autoComplete="current-password"
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        <button className="btn-primary full" type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}

export default AdminLogin;
