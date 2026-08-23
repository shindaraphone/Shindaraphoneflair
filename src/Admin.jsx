import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

export default function Admin() {
  const [status, setStatus] = useState("checking");
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function checkAdmin() {
      try {
        const {
          data: { user },
          error: userError
        } = await supabase.auth.getUser();

        if (userError || !user) {
          setStatus("not-authenticated");
          return;
        }

        const { data: profile, error: profileError } =
          await supabase
            .from("profiles")
            .select("is_admin")
            .eq("id", user.id)
            .single();

        if (profileError || !profile?.is_admin) {
          setStatus("not-admin");
          return;
        }

        setUser(user);
        setStatus("admin");
      } catch (error) {
        console.error(error);
        setStatus("error");
      }
    }

    checkAdmin();
  }, []);

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  if (status === "checking") {
    return (
      <div style={styles.center}>
        <h2>Checking admin access...</h2>
      </div>
    );
  }

  if (status === "not-authenticated") {
    return (
      <div style={styles.center}>
        <div style={styles.card}>
          <h1>Shindara Admin</h1>
          <p>Please sign in to access the admin dashboard.</p>
          <a href="/" style={styles.button}>
            Back to store
          </a>
        </div>
      </div>
    );
  }

  if (status === "not-admin") {
    return (
      <div style={styles.center}>
        <div style={styles.card}>
          <div style={styles.icon}>🔒</div>

          <h1>Access denied</h1>

          <p>
            This account does not have administrator
            permissions.
          </p>

          <a href="/" style={styles.button}>
            Back to store
          </a>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div style={styles.center}>
        <div style={styles.card}>
          <h1>Something went wrong</h1>

          <p>
            We couldn't verify your administrator
            account.
          </p>

          <a href="/" style={styles.button}>
            Back to store
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div>
          <p style={styles.eyebrow}>
            SHINDARA PHONEFLAIR
          </p>

          <h1 style={styles.title}>
            Admin Dashboard
          </h1>
        </div>

        <button
          style={styles.logout}
          onClick={logout}
        >
          Log out
        </button>
      </header>

      <main style={styles.main}>
        <section style={styles.hero}>
          <p style={styles.eyebrow}>
            CONTROL CENTER
          </p>

          <h2>
            Welcome, Admin 👑
          </h2>

          <p style={styles.muted}>
            {user?.email}
          </p>
        </section>

        <section style={styles.grid}>
          <div style={styles.card}>
            <div style={styles.icon}>📦</div>
            <h3>Products</h3>
            <p>
              Add, edit, delete products and manage
              prices and stock.
            </p>
          </div>

          <div style={styles.card}>
            <div style={styles.icon}>🖼️</div>
            <h3>Product Images</h3>
            <p>
              Upload and manage your product images.
            </p>
          </div>

          <div style={styles.card}>
            <div style={styles.icon}>🛒</div>
            <h3>Orders</h3>
            <p>
              View customer orders and update their
              status.
            </p>
          </div>

          <div style={styles.card}>
            <div style={styles.icon}>👥</div>
            <h3>Customers</h3>
            <p>
              View registered Shindara customers.
            </p>
          </div>

          <div style={styles.card}>
            <div style={styles.icon}>🏷️</div>
            <h3>Categories</h3>
            <p>
              Manage your store categories.
            </p>
          </div>

          <div style={styles.card}>
            <div style={styles.icon}>📊</div>
            <h3>Analytics</h3>
            <p>
              Track store activity and sales.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "var(--bg)",
    color: "var(--text)",
    padding: "30px"
  },

  header: {
    maxWidth: "1200px",
    margin: "0 auto",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px"
  },

  main: {
    maxWidth: "1200px",
    margin: "50px auto"
  },

  hero: {
    padding: "45px",
    borderRadius: "28px",
    background: "var(--surface)",
    border: "1px solid var(--border)",
    marginBottom: "25px"
  },

  grid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "20px"
  },

  card: {
    padding: "30px",
    borderRadius: "24px",
    background: "var(--surface)",
    border: "1px solid var(--border)"
  },

  icon: {
    fontSize: "36px",
    marginBottom: "15px"
  },

  eyebrow: {
    color: "var(--accent)",
    fontSize: "12px",
    fontWeight: "700",
    letterSpacing: "2px"
  },

  title: {
    fontSize: "36px",
    margin: "5px 0"
  },

  muted: {
    color: "var(--muted)"
  },

  logout: {
    padding: "12px 20px",
    borderRadius: "999px",
    border: "1px solid var(--border)",
    background: "var(--surface)",
    color: "var(--text)",
    cursor: "pointer"
  },

  button: {
    display: "inline-block",
    marginTop: "20px",
    padding: "12px 20px",
    borderRadius: "999px",
    background: "var(--accent)",
    color: "#fff",
    textDecoration: "none"
  },

  center: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "var(--bg)",
    color: "var(--text)",
    padding: "20px",
    textAlign: "center"
  }
};
