// Admin.js — SHINDARA PHONEFLAIR ADMIN PORTAL
// Same Supabase project/tables as the storefront (App.js).
// Route this in behind /admin — see wiring notes at the bottom of this file.

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "./supabaseClient";
import "./shindara-redesign.css";
import "./admin-panel.css";

/* =========================================================
   CONFIG
   ========================================================= */

const CATEGORIES = [
  "Phone Cases",
  "Chargers",
  "Cables",
  "Power Banks",
  "Audio",
  "Smart Watches",
  "Screen Protectors",
];

const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "in_transit",
  "out_for_delivery",
  "delivered",
];

const money = (value) => `₦${Number(value || 0).toLocaleString("en-NG")}`;

const formatDate = (value) => {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleDateString("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return String(value);
  }
};

const getProductImage = (product) =>
  product?.image_url || product?.image || product?.imageUrl || "";

/* =========================================================
   SHARED MODAL (matches storefront modal styling)
   ========================================================= */

function Modal({ children, onClose, wide }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className={`modal ${wide ? "modal-wide" : ""}`}
        onClick={(event) => event.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose} aria-label="Close">
          ×
        </button>
        {children}
      </div>
    </div>
  );
}

/* =========================================================
   PRODUCTS TAB
   ========================================================= */

function ProductsTab({ products, reload, showNotice }) {
  const [editing, setEditing] = useState(null); // product being edited, or {} for new
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q)
    );
  }, [products, search]);

  const openNew = () =>
    setEditing({ name: "", category: CATEGORIES[0], price: "", stock: "", description: "", image_url: "" });

  const save = useCallback(
    async (event) => {
      event.preventDefault();
      setSaving(true);

      const payload = {
        name: editing.name.trim(),
        category: editing.category,
        price: Number(editing.price) || 0,
        stock: Number(editing.stock) || 0,
        description: editing.description?.trim() || "",
        image_url: editing.image_url?.trim() || "",
      };

      try {
        let error;
        if (editing.id) {
          ({ error } = await supabase.from("products").update(payload).eq("id", editing.id));
        } else {
          ({ error } = await supabase.from("products").insert(payload));
        }

        if (error) throw error;

        showNotice(editing.id ? "Product updated." : "Product added.");
        setEditing(null);
        await reload();
      } catch (err) {
        showNotice(err.message || "Could not save product.");
      } finally {
        setSaving(false);
      }
    },
    [editing, reload, showNotice]
  );

  const remove = useCallback(
    async (product) => {
      if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) return;

      try {
        const { error } = await supabase.from("products").delete().eq("id", product.id);
        if (error) throw error;
        showNotice("Product deleted.");
        await reload();
      } catch (err) {
        showNotice(err.message || "Could not delete product.");
      }
    },
    [reload, showNotice]
  );

  return (
    <div className="admin-panel">
      <div className="admin-panel-head">
        <div>
          <h2>Products</h2>
          <p>{products.length} product{products.length !== 1 ? "s" : ""} in your catalog.</p>
        </div>
        <div className="admin-panel-actions">
          <input
            className="admin-search"
            placeholder="Search products..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <button className="btn-primary" onClick={openNew}>
            + Add product
          </button>
        </div>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th></th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((product) => (
              <tr key={product.id}>
                <td>
                  <div className="admin-thumb">
                    {getProductImage(product) ? (
                      <img src={getProductImage(product)} alt={product.name} />
                    ) : (
                      <span>S</span>
                    )}
                  </div>
                </td>
                <td>{product.name}</td>
                <td>
                  <span className="admin-tag">{product.category || "—"}</span>
                </td>
                <td>{money(product.price)}</td>
                <td>
                  <span className={Number(product.stock) <= 5 ? "admin-stock low" : "admin-stock"}>
                    {product.stock ?? 0}
                  </span>
                </td>
                <td className="admin-row-actions">
                  <button className="btn-text" onClick={() => setEditing(product)}>
                    Edit
                  </button>
                  <button className="admin-danger" onClick={() => remove(product)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="admin-empty-row">
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editing && (
        <Modal onClose={() => setEditing(null)}>
          <div className="modal-head">
            <span className="modal-kicker">{editing.id ? "Edit product" : "New product"}</span>
            <h2>{editing.id ? editing.name : "Add a product"}</h2>
          </div>

          <form onSubmit={save}>
            <div className="field">
              <label>Product name</label>
              <input
                value={editing.name}
                onChange={(event) => setEditing((p) => ({ ...p, name: event.target.value }))}
                required
              />
            </div>

            <div className="field">
              <label>Category</label>
              <select
                value={editing.category}
                onChange={(event) => setEditing((p) => ({ ...p, category: event.target.value }))}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="admin-field-row">
              <div className="field">
                <label>Price (₦)</label>
                <input
                  type="number"
                  min="0"
                  value={editing.price}
                  onChange={(event) => setEditing((p) => ({ ...p, price: event.target.value }))}
                  required
                />
              </div>

              <div className="field">
                <label>Stock</label>
                <input
                  type="number"
                  min="0"
                  value={editing.stock}
                  onChange={(event) => setEditing((p) => ({ ...p, stock: event.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="field">
              <label>Description</label>
              <textarea
                rows="3"
                value={editing.description}
                onChange={(event) => setEditing((p) => ({ ...p, description: event.target.value }))}
              />
            </div>

            <div className="field">
              <label>Image URL</label>
              <input
                value={editing.image_url}
                onChange={(event) => setEditing((p) => ({ ...p, image_url: event.target.value }))}
                placeholder="https://..."
              />
              <small className="admin-hint">
                Paste an image link for now — direct photo upload is a planned upgrade.
              </small>
            </div>

            <button className="btn-primary full" type="submit" disabled={saving}>
              {saving ? "Saving..." : editing.id ? "Save changes" : "Add product"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}

/* =========================================================
   ORDERS TAB
   ========================================================= */

function OrdersTab({ orders, reload, showNotice }) {
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("all");
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    if (filter === "all") return orders;
    if (filter === "unpaid") return orders.filter((o) => o.payment_status !== "paid");
    return orders.filter((o) => o.status === filter);
  }, [orders, filter]);

  const updateOrder = useCallback(
    async (id, changes) => {
      setSaving(true);
      try {
        const { error } = await supabase.from("orders").update(changes).eq("id", id);
        if (error) throw error;
        showNotice("Order updated.");
        await reload();
        setSelected((prev) => (prev ? { ...prev, ...changes } : prev));
      } catch (err) {
        showNotice(err.message || "Could not update order.");
      } finally {
        setSaving(false);
      }
    },
    [reload, showNotice]
  );

  return (
    <div className="admin-panel">
      <div className="admin-panel-head">
        <div>
          <h2>Orders</h2>
          <p>{orders.length} order{orders.length !== 1 ? "s" : ""} total.</p>
        </div>
        <div className="admin-panel-actions">
          <select className="admin-search" value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All orders</option>
            <option value="unpaid">Unpaid only</option>
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>
                Status: {s.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Tracking #</th>
              <th>Customer</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Date</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((order) => (
              <tr key={order.id}>
                <td>{order.tracking_number || `#${String(order.id).slice(0, 8)}`}</td>
                <td>{order.customer_name}</td>
                <td>{money(order.total)}</td>
                <td>
                  <span
                    className={
                      String(order.payment_status).toLowerCase() === "paid"
                        ? "status-paid"
                        : "status-pending"
                    }
                  >
                    {String(order.payment_status || "pending").toUpperCase()}
                  </span>
                </td>
                <td>
                  <span className="admin-tag">{String(order.status || "pending").replace(/_/g, " ")}</span>
                </td>
                <td>{formatDate(order.created_at)}</td>
                <td className="admin-row-actions">
                  <button className="btn-text" onClick={() => setSelected(order)}>
                    View
                  </button>
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="admin-empty-row">
                  No orders match this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selected && (
        <Modal onClose={() => setSelected(null)} wide>
          <div className="modal-head">
            <span className="modal-kicker">Order detail</span>
            <h2>{selected.tracking_number || `Order #${String(selected.id).slice(0, 8)}`}</h2>
            <p>Placed {formatDate(selected.created_at)}</p>
          </div>

          <div className="admin-detail-grid">
            <div>
              <div className="settings-block-title">Customer</div>
              <p>{selected.customer_name}</p>
              <p>{selected.customer_phone}</p>
              <p>{selected.customer_email}</p>
            </div>

            <div>
              <div className="settings-block-title">Delivery</div>
              <p>{selected.delivery_address}</p>
              <p>
                {selected.delivery_city}, {selected.delivery_state}
              </p>
            </div>
          </div>

          <div className="tracking-items">
            <div className="tracking-section-title">Items</div>
            {(selected.items || []).map((item) => (
              <div className="tracking-item" key={item.id}>
                <div>
                  <strong>{item.products?.name || "Product"}</strong>
                  <span>
                    Qty {item.quantity} × {money(item.price)}
                  </span>
                </div>
                <strong>{money(Number(item.price) * Number(item.quantity))}</strong>
              </div>
            ))}
          </div>

          <div className="tracking-grand-total">
            <span>Total</span>
            <strong>{money(selected.total)}</strong>
          </div>

          <div className="admin-field-row">
            <div className="field">
              <label>Payment status</label>
              <select
                value={selected.payment_status || "pending"}
                disabled={saving}
                onChange={(event) =>
                  updateOrder(selected.id, { payment_status: event.target.value })
                }
              >
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
              </select>
            </div>

            <div className="field">
              <label>Order status</label>
              <select
                value={selected.status || "pending"}
                disabled={saving}
                onChange={(event) => updateOrder(selected.id, { status: event.target.value })}
              >
                {ORDER_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* =========================================================
   CUSTOMERS TAB
   ========================================================= */

function CustomersTab({ customers }) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(
      (c) =>
        c.full_name?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q)
    );
  }, [customers, search]);

  return (
    <div className="admin-panel">
      <div className="admin-panel-head">
        <div>
          <h2>Customers</h2>
          <p>{customers.length} registered customer{customers.length !== 1 ? "s" : ""}.</p>
        </div>
        <div className="admin-panel-actions">
          <input
            className="admin-search"
            placeholder="Search customers..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Orders</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((customer) => (
              <tr key={customer.id}>
                <td>{customer.full_name || "—"}</td>
                <td>{customer.email || "—"}</td>
                <td>{customer.phone || "—"}</td>
                <td>{customer.orderCount || 0}</td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="admin-empty-row">
                  No customers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* =========================================================
   ADMIN APP
   (auth + admin verification already handled by ProtectedAdmin.jsx —
   this component assumes it's only ever rendered for a verified admin)
   ========================================================= */

export default function Admin() {
  const [loading, setLoading] = useState(true);

  const [tab, setTab] = useState("products");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [notice, setNotice] = useState("");

  const showNotice = useCallback((message) => {
    setNotice(message);
    setTimeout(() => setNotice(""), 3000);
  }, []);

  const loadProducts = useCallback(async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Products:", error);
      return;
    }
    setProducts(data || []);
  }, []);

  const loadOrders = useCallback(async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Orders:", error);
      return;
    }

    const orderData = data || [];

    const complete = await Promise.all(
      orderData.map(async (order) => {
        const { data: items } = await supabase
          .from("order_items")
          .select("*, products:product_id(*)")
          .eq("order_id", order.id);

        return { ...order, items: items || [] };
      })
    );

    setOrders(complete);
  }, []);

  const loadCustomers = useCallback(async () => {
    const { data: profiles, error } = await supabase.from("profiles").select("*");

    if (error) {
      console.error("Customers:", error);
      return;
    }

    const { data: allOrders } = await supabase.from("orders").select("user_id");

    const counts = {};
    (allOrders || []).forEach((o) => {
      counts[o.user_id] = (counts[o.user_id] || 0) + 1;
    });

    setCustomers(
      (profiles || []).map((p) => ({ ...p, orderCount: counts[p.id] || 0 }))
    );
  }, []);

  useEffect(() => {
    let mounted = true;

    (async () => {
      await Promise.all([loadProducts(), loadOrders(), loadCustomers()]);
      if (mounted) setLoading(false);
    })();

    return () => {
      mounted = false;
    };
  }, [loadProducts, loadOrders, loadCustomers]);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    // ProtectedAdmin.jsx listens for the SIGNED_OUT auth event and will
    // swap back to AdminLogin on its own — nothing else to do here.
  }, []);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-mark">S</div>
        <p>Loading admin portal...</p>
      </div>
    );
  }

  return (
    <div className="admin-app">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <span>◆</span>
          <div>
            <strong>Shindara</strong>
            <small>ADMIN</small>
          </div>
        </div>

        <nav className="admin-nav">
          <button className={tab === "products" ? "active" : ""} onClick={() => setTab("products")}>
            Products
          </button>
          <button className={tab === "orders" ? "active" : ""} onClick={() => setTab("orders")}>
            Orders
          </button>
          <button className={tab === "customers" ? "active" : ""} onClick={() => setTab("customers")}>
            Customers
          </button>
        </nav>

        <button className="logout-button" onClick={logout}>
          Sign out
        </button>
      </aside>

      <main className="admin-main">
        {tab === "products" && (
          <ProductsTab products={products} reload={loadProducts} showNotice={showNotice} />
        )}
        {tab === "orders" && (
          <OrdersTab orders={orders} reload={loadOrders} showNotice={showNotice} />
        )}
        {tab === "customers" && <CustomersTab customers={customers} />}
      </main>

      {notice && (
        <div className="toast">
          <span>✓</span>
          <p>{notice}</p>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   WIRING NOTES (not executed — read before deploying)
   =========================================================

   This file is rendered by your existing ProtectedAdmin.jsx, which
   already handles: checking the session, checking profiles.is_admin,
   showing AdminLogin.jsx when needed, and rendering <Admin /> only
   once verified. This file assumes that's already true and just
   renders the dashboard — it does no auth checking of its own.

   Files this depends on, all in src/:
     - ProtectedAdmin.jsx  (yours — the auth gate, unchanged)
     - AdminLogin.jsx      (rebuilt to match ProtectedAdmin's
                             `onLogin` prop — just a sign-in form)
     - Admin.js            (this file — the dashboard)
     - admin-panel.css     (layout: sidebar, tables, forms)
     - shindara-redesign.css (shared design tokens/components)

   Route /admin at <ProtectedAdmin /> (not <Admin /> directly), e.g.:

     // main.jsx / index.js, if you don't have react-router yet
     import ProtectedAdmin from "./ProtectedAdmin.jsx";
     import App from "./App.js";

     const isAdminRoute = window.location.pathname.startsWith("/admin");
     root.render(isAdminRoute ? <ProtectedAdmin /> : <App />);

     // or with react-router:
     <Route path="/admin/*" element={<ProtectedAdmin />} />

   Database: make sure `profiles.is_admin` exists (boolean, default
   false) and is `true` for your own account:
     update profiles set is_admin = true where email = 'you@example.com';

   Supabase Row Level Security: `products`, `orders`, and
   `order_items` need UPDATE/INSERT/DELETE policies for authenticated
   users where profiles.is_admin = true — the admin UI can't bypass
   RLS, so writes will silently fail if policies aren't in place.
   ========================================================= */
