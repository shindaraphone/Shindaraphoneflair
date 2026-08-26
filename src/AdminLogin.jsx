import { useState } from "react";
import { supabase } from "./supabaseClient";

function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleLogin(event) {
    event.preventDefault();

    if (loading) return;

    setLoading(true);
    setMessage("");

    try {
      const cleanEmail = email.trim();

      if (!cleanEmail || !password) {
        throw new Error(
          "Please enter your admin email and password."
        );
      }

      const { data, error } =
        await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

      if (error) {
        throw new Error(error.message);
      }

      if (!data?.user) {
        throw new Error(
          "Login failed. No user session was created."
        );
      }

      /*
       * Verify the profile belongs to an admin.
       */
      const { data: profile, error: profileError } =
        await supabase
          .from("profiles")
          .select("id, email, is_admin")
          .eq("id", data.user.id)
          .maybeSingle();

      if (profileError) {
        await supabase.auth.signOut();

        throw new Error(
          `Could not verify admin account: ${profileError.message}`
        );
      }

      if (!profile) {
        await supabase.auth.signOut();

        throw new Error(
          "This account does not have a profile."
        );
      }

      if (!profile.is_admin) {
        await supabase.auth.signOut();

        throw new Error(
          "Access denied. This account is not an administrator."
        );
      }

      /*
       * Everything is correct.
       */
      onLogin(data.user);
    } catch (error) {
      console.error("ADMIN LOGIN ERROR:", error);

      setMessage(
        error?.message ||
          "Unable to sign in."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-login-page">
      <style>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          font-family:
            Inter,
            -apple-system,
            BlinkMacSystemFont,
            "SF Pro Display",
            "Segoe UI",
            sans-serif;
        }

        .admin-login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background:
            radial-gradient(
              circle at 20% 10%,
              rgba(124,58,237,.18),
              transparent 35%
            ),
            radial-gradient(
              circle at 90% 90%,
              rgba(168,85,247,.14),
              transparent 35%
            ),
            #f5f5f7;
        }

        .admin-login-card {
          width: min(430px, 100%);
          padding: 34px;
          background: rgba(255,255,255,.9);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(0,0,0,.07);
          border-radius: 28px;
          box-shadow:
            0 30px 80px rgba(0,0,0,.12);
        }

        .admin-logo {
          width: 58px;
          height: 58px;
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #111;
          color: white;
          font-size: 25px;
          font-weight: 900;
          margin-bottom: 25px;
        }

        .admin-login-eyebrow {
          margin: 0 0 8px;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 2px;
          opacity: .45;
        }

        .admin-login-card h1 {
          margin: 0;
          font-size: 36px;
          letter-spacing: -2px;
        }

        .admin-login-subtitle {
          margin: 10px 0 28px;
          line-height: 1.5;
          opacity: .55;
          font-size: 14px;
        }

        .admin-login-form {
          display: grid;
          gap: 12px;
        }

        .admin-login-form label {
          font-size: 12px;
          font-weight: 800;
          opacity: .6;
          margin-top: 4px;
        }

        .admin-login-input-wrap {
          position: relative;
        }

        .admin-login-form input {
          width: 100%;
          height: 52px;
          border: 1px solid rgba(0,0,0,.12);
          border-radius: 14px;
          background: #fafafa;
          padding: 0 15px;
          outline: none;
          font-size: 15px;
          transition: .2s ease;
        }

        .admin-login-form input:focus {
          background: white;
          border-color: #111;
          box-shadow:
            0 0 0 4px rgba(0,0,0,.05);
        }

        .password-input {
          padding-right: 75px !important;
        }

        .show-password {
          position: absolute;
          right: 8px;
          top: 7px;
          height: 38px;
          border: 0;
          border-radius: 10px;
          padding: 0 10px;
          background: #eee;
          font-size: 11px;
          font-weight: 800;
        }

        .admin-login-error {
          padding: 13px 14px;
          border-radius: 13px;
          background: rgba(220,38,38,.08);
          color: #b91c1c;
          font-size: 13px;
          line-height: 1.45;
        }

        .admin-login-button {
          width: 100%;
          height: 54px;
          margin-top: 8px;
          border: 0;
          border-radius: 15px;
          background: #111;
          color: white;
          font-weight: 800;
          font-size: 15px;
          transition: .2s ease;
        }

        .admin-login-button:hover {
          transform: translateY(-1px);
          box-shadow:
            0 10px 25px rgba(0,0,0,.15);
        }

        .admin-login-button:disabled {
          opacity: .55;
          cursor: not-allowed;
          transform: none;
        }

        .admin-login-footer {
          text-align: center;
          margin-top: 22px;
          font-size: 11px;
          opacity: .4;
        }

        @media (max-width: 480px) {
          .admin-login-page {
            padding: 14px;
          }

          .admin-login-card {
            padding: 27px 20px;
            border-radius: 24px;
          }

          .admin-login-card h1 {
            font-size: 32px;
          }
        }
      `}</style>

      <div className="admin-login-card">

        <div className="admin-logo">
          S
        </div>

        <p className="admin-login-eyebrow">
          SHINDARA PHONEFLAIR
        </p>

        <h1>
          Admin Login
        </h1>

        <p className="admin-login-subtitle">
          Sign in to access your store
          control center.
        </p>

        <form
          className="admin-login-form"
          onSubmit={handleLogin}
        >

          <label>
            Admin email
          </label>

          <input
            type="email"
            placeholder="admin@example.com"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            autoComplete="email"
            required
          />

          <label>
            Password
          </label>

          <div className="admin-login-input-wrap">

            <input
              className="password-input"
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              placeholder="Enter your password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              autoComplete="current-password"
              required
            />

            <button
              type="button"
              className="show-password"
              onClick={() =>
                setShowPassword(
                  (current) => !current
                )
              }
            >
              {showPassword
                ? "Hide"
                : "Show"}
            </button>

          </div>

          {message && (
            <div className="admin-login-error">
              {message}
            </div>
          )}

          <button
            type="submit"
            className="admin-login-button"
            disabled={loading}
          >
            {loading
              ? "Signing in..."
              : "Sign in to Admin"}
          </button>

        </form>

        <div className="admin-login-footer">
          Shindara Phoneflair • Secure Admin Area
        </div>

      </div>
    </div>
  );
}

export default AdminLogin;