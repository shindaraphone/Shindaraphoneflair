/* =========================================================
   SHINDARA PHONEFLAIR — ADMIN PORTAL
   Reuses design tokens + shared components (.btn-primary,
   .field, .modal, .status-paid, etc.) from shindara-redesign.css
   ========================================================= */

/* ---------- login gate ---------- */

.admin-gate {
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--ink);
  padding: 20px;
}

.admin-gate-card {
  background: var(--paper);
  color: var(--ink);
  border-radius: var(--radius-lg);
  padding: 34px 30px;
  max-width: 380px;
  width: 100%;
  box-shadow: var(--shadow-pop);
}
.admin-gate-card h2 { font-size: 22px; margin: 4px 0 6px; }
.admin-gate-card p { color: var(--ink-soft); font-size: 14px; margin-bottom: 20px; }

.admin-denied {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--paper);
  color: var(--ink);
  padding: 14px 20px;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-pop);
  display: flex;
  align-items: center;
  gap: 14px;
  font-size: 14px;
  z-index: 50;
}

/* ---------- app shell ---------- */

.admin-app {
  display: grid;
  grid-template-columns: 240px 1fr;
  min-height: 100vh;
  min-height: 100dvh;
  background: var(--case);
  color: var(--ink);
}

.admin-sidebar {
  background: var(--ink);
  color: var(--case);
  display: flex;
  flex-direction: column;
  padding: 24px 18px;
  position: sticky;
  top: 0;
  height: 100vh;
  height: 100dvh;
}

.admin-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 34px;
  padding: 0 4px;
}
.admin-brand span { color: var(--gold); font-size: 20px; }
.admin-brand strong { font-family: var(--font-display); font-size: 15px; display: block; }
.admin-brand small { font-size: 10px; color: var(--gold-soft); letter-spacing: 0.14em; }

.admin-nav { display: flex; flex-direction: column; gap: 2px; flex: 1; }
.admin-nav button {
  text-align: left;
  padding: 11px 14px;
  border-radius: var(--radius-sm);
  font-size: 14.5px;
  font-weight: 500;
  color: #cfc5db;
}
.admin-nav button:hover { background: rgba(255,255,255,0.06); color: var(--case); }
.admin-nav button.active { background: var(--flair); color: #fff; }

.admin-sidebar .logout-button { color: #f0576d; margin-top: 10px; text-align: left; padding: 11px 14px; }

.admin-main {
  padding: 34px clamp(20px, 4vw, 48px);
  overflow-x: hidden;
}

@media (max-width: 860px) {
  .admin-app { grid-template-columns: 1fr; }
  .admin-sidebar {
    position: static;
    height: auto;
    flex-direction: row;
    align-items: center;
    padding: 14px 16px;
    gap: 18px;
    overflow-x: auto;
  }
  .admin-brand { margin-bottom: 0; }
  .admin-nav { flex-direction: row; flex: none; }
  .admin-sidebar .logout-button { margin-top: 0; margin-left: auto; white-space: nowrap; }
  .admin-main { padding: 22px 16px 60px; }
}

/* ---------- panel head ---------- */

.admin-panel-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 24px;
}
.admin-panel-head h2 { font-size: 24px; }
.admin-panel-head p { color: var(--ink-soft); font-size: 14px; margin-top: 2px; }

.admin-panel-actions { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }

.admin-search {
  padding: 11px 14px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--line);
  background: var(--paper);
  font-size: 14px;
  min-width: 200px;
}

/* ---------- table ---------- */

.admin-table-wrap {
  background: var(--paper);
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  overflow-x: auto;
}

.admin-table { width: 100%; border-collapse: collapse; min-width: 620px; }
.admin-table th {
  text-align: left;
  font-size: 12px;
  font-weight: 600;
  color: var(--ink-soft);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 14px 16px;
  border-bottom: 1px solid var(--line);
}
.admin-table td {
  padding: 12px 16px;
  font-size: 14px;
  border-bottom: 1px solid var(--line);
  vertical-align: middle;
}
.admin-table tr:last-child td { border-bottom: none; }
.admin-table tr:hover td { background: var(--case); }

.admin-thumb {
  width: 40px; height: 40px;
  border-radius: var(--radius-sm);
  background: var(--case);
  overflow: hidden;
  display: flex; align-items: center; justify-content: center;
  color: var(--gold);
  font-family: var(--font-display);
  font-size: 14px;
}
.admin-thumb img { width: 100%; height: 100%; object-fit: cover; }

.admin-tag {
  font-size: 11.5px;
  font-weight: 600;
  color: var(--teal);
  background: var(--teal-soft);
  padding: 4px 9px;
  border-radius: 999px;
  text-transform: capitalize;
}

.admin-stock { font-weight: 600; }
.admin-stock.low { color: var(--flair); }

.admin-row-actions { display: flex; gap: 12px; white-space: nowrap; }
.admin-danger { color: var(--flair); font-size: 13.5px; font-weight: 500; }
.admin-danger:hover { text-decoration: underline; }

.admin-empty-row { text-align: center; color: var(--ink-soft); padding: 40px 16px !important; }

/* ---------- forms in modals ---------- */

.admin-field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0 16px; }
@media (max-width: 520px) { .admin-field-row { grid-template-columns: 1fr; } }

.admin-hint { display: block; color: var(--ink-soft); font-size: 12px; margin-top: 6px; }

.admin-detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 22px;
  font-size: 13.5px;
}
.admin-detail-grid p { color: var(--ink-soft); margin-top: 2px; }
@media (max-width: 520px) { .admin-detail-grid { grid-template-columns: 1fr; } }
