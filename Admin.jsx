import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

export default function Admin() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkUser() {
      const { data } = await supabase.auth.getUser();

      setUser(data?.user ?? null);
      setLoading(false);
    }

    checkUser();
  }, []);

  if (loading) {
    return (
      <div style={styles.center}>
        <h2>Loading Admin...</h2>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={styles.center}>
        <div style={styles.card}>
          <h1>Shindara Admin</h1>
          <p>
            You must be signed in to access the
            administration area.
          </p>
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
          onClick={async () => {
            await supabase.auth.signOut();
            window.location.href = "/";
          }}
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
            Welcome to your store,
            <br />
            {user.email}
          </h2>

          <p>
            Manage your Shindara Phoneflair
            store from one place.
          </p>
        </section>

        <section style={styles.grid}>

          <div style={styles.card}>
            <div style={styles.icon}>📦</div>
            <h3>Products</h3>
            <p>
              Add, edit and manage your products,
              prices and stock.
            </p>
          </div>

          <div style={styles.card}>
            <div style={styles.icon}>🛒</div>
            <h3>Orders</h3>
            <p>
              View customer orders and update
              their status.
            </p>
          </div>

          <div style={styles.card}>
            <div style={styles.icon}>👥</div>
            <h3>Customers</h3>
            <p>
              View customers who have created
              accounts.
            </p>
          </div>

          <div style={styles.card}>
            <div style={styles.icon}>📊</div>
            <h3>Analytics</h3>
            <p>
              Track sales and store performance.
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

  logout: {
    padding: "12px 20px",
    borderRadius: "999px",
    border: "1px solid var(--border)",
    background: "var(--surface)",
    color: "var(--text)",
    cursor: "pointer"
  },

  center: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "var(--bg)",
    color: "var(--text)",
    padding: "20px"
  }
};
