// Admin.js — SHINDARA PHONEFLAIR ADMIN PORTAL
// Same Supabase project/tables as the storefront (App.js).
// Route this in behind /admin — see wiring notes at the bottom of this file.

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "./supabaseAdminClient";
import "./shindara-redesign.css";
import "./admin-panel.css";

/* =========================================================
   CONFIG
   ========================================================= */

// ⚠️ Set this to your actual Supabase Storage bucket name for product photos.
const STORAGE_BUCKET = "product-images";

const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "in_transit",
  "out_for_delivery",
  "delivered",
];

const NIGERIA_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue",
  "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT",
  "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi",
  "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo",
  "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara",
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

function ProductsTab({ products, categories, reload, showNotice }) {
  const [editing, setEditing] = useState(null); // product being edited, or {} for new
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [spotlightSaving, setSpotlightSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkCategory, setBulkCategory] = useState("");
  const [bulkWorking, setBulkWorking] = useState(false);
  const [notifyCount, setNotifyCount] = useState(0);
  const [notifySending, setNotifySending] = useState(false);

  useEffect(() => {
    if (!editing?.id) {
      setNotifyCount(0);
      return;
    }

    let mounted = true;

    (async () => {
      const { count } = await supabase
        .from("stock_notify_requests")
        .select("*", { count: "exact", head: true })
        .eq("product_id", editing.id)
        .eq("notified", false);

      if (mounted) setNotifyCount(count || 0);
    })();

    return () => {
      mounted = false;
    };
  }, [editing?.id]);

  const notifyWaitingCustomers = useCallback(async () => {
    if (!editing?.id) return;
    setNotifySending(true);

    try {
      const { data: requests, error } = await supabase
        .from("stock_notify_requests")
        .select("id, email")
        .eq("product_id", editing.id)
        .eq("notified", false);

      if (error) throw error;

      for (const req of requests || []) {
        await fetch("/api/send-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: req.email,
            subject: `${editing.name} is back in stock! — Shindara PhoneFlair`,
            html: `<p>Good news! <strong>${editing.name}</strong> is back in stock at Shindara PhoneFlair. Shop now before it sells out again.</p>`,
          }),
        }).catch(() => {});
      }

      const ids = (requests || []).map((r) => r.id);

      if (ids.length > 0) {
        await supabase.from("stock_notify_requests").update({ notified: true }).in("id", ids);
      }

      showNotice(`Notified ${ids.length} customer${ids.length !== 1 ? "s" : ""}.`);
      setNotifyCount(0);
    } catch (err) {
      showNotice(err.message || "Could not send notifications.");
    } finally {
      setNotifySending(false);
    }
  }, [editing, showNotice]);

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
    setEditing({
      name: "",
      category: categories[0]?.name || "",
      price: "",
      stock: "",
      description: "",
      image_url: "",
      is_featured: false,
      images: [],
    });

  const uploadPhoto = useCallback(
    async (file) => {
      if (!file) return;
      setUploading(true);

      try {
        const ext = file.name.split(".").pop();
        const path = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from(STORAGE_BUCKET)
          .upload(path, file, { cacheControl: "3600", upsert: false });

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);

        setEditing((p) => ({ ...p, image_url: data.publicUrl }));
      } catch (err) {
        showNotice(err.message || "Could not upload photo.");
      } finally {
        setUploading(false);
      }
    },
    [showNotice]
  );

  const uploadGalleryPhotos = useCallback(
    async (files) => {
      if (!files || files.length === 0) return;
      setUploading(true);

      try {
        const uploadedUrls = [];

        for (const file of Array.from(files)) {
          const ext = file.name.split(".").pop();
          const path = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

          const { error: uploadError } = await supabase.storage
            .from(STORAGE_BUCKET)
            .upload(path, file, { cacheControl: "3600", upsert: false });

          if (uploadError) throw uploadError;

          const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
          uploadedUrls.push(data.publicUrl);
        }

        setEditing((p) => ({ ...p, images: [...(p.images || []), ...uploadedUrls] }));
      } catch (err) {
        showNotice(err.message || "Could not upload photos.");
      } finally {
        setUploading(false);
      }
    },
    [showNotice]
  );

  const removeGalleryPhoto = useCallback((url) => {
    setEditing((p) => ({ ...p, images: (p.images || []).filter((img) => img !== url) }));
  }, []);

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
        is_featured: Boolean(editing.is_featured),
        images: editing.images || [],
      };

      try {
        let error;
        if (editing.id) {
          ({ error } = await supabase.from("products").update(payload).eq("id", editing.id));
        } else {
          ({ error } = await supabase.from("products").insert(payload));
        }

        if (error) throw error;

        if (payload.is_featured) {
          await supabase
            .from("products")
            .update({ is_featured: false })
            .eq("is_featured", true)
            .neq("id", editing.id || "");
        }

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

  const toggleSpotlight = useCallback(
    async (product) => {
      setSpotlightSaving(true);

      try {
        if (product.is_featured) {
          // turning it off just un-features this one — homepage falls
          // back to the first product until another is chosen
          const { error } = await supabase
            .from("products")
            .update({ is_featured: false })
            .eq("id", product.id);
          if (error) throw error;
          showNotice("Removed from Spotlight.");
        } else {
          const { error: unsetError } = await supabase
            .from("products")
            .update({ is_featured: false })
            .eq("is_featured", true);
          if (unsetError) throw unsetError;

          const { error } = await supabase
            .from("products")
            .update({ is_featured: true })
            .eq("id", product.id);
          if (error) throw error;

          showNotice(`${product.name} is now in the Spotlight.`);
        }

        await reload();
      } catch (err) {
        showNotice(err.message || "Could not update Spotlight.");
      } finally {
        setSpotlightSaving(false);
      }
    },
    [reload, showNotice]
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

  const toggleSelected = useCallback((id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  const toggleSelectAll = useCallback(() => {
    setSelectedIds((prev) => (prev.length === filtered.length ? [] : filtered.map((p) => p.id)));
  }, [filtered]);

  const bulkDelete = useCallback(async () => {
    if (selectedIds.length === 0) return;
    if (
      !window.confirm(
        `Delete ${selectedIds.length} product${selectedIds.length !== 1 ? "s" : ""}? This cannot be undone.`
      )
    )
      return;

    setBulkWorking(true);
    try {
      const { error } = await supabase.from("products").delete().in("id", selectedIds);
      if (error) throw error;
      showNotice(`${selectedIds.length} product${selectedIds.length !== 1 ? "s" : ""} deleted.`);
      setSelectedIds([]);
      await reload();
    } catch (err) {
      showNotice(err.message || "Could not delete selected products.");
    } finally {
      setBulkWorking(false);
    }
  }, [selectedIds, reload, showNotice]);

  const bulkChangeCategory = useCallback(async () => {
    if (selectedIds.length === 0 || !bulkCategory) return;

    setBulkWorking(true);
    try {
      const { error } = await supabase
        .from("products")
        .update({ category: bulkCategory })
        .in("id", selectedIds);
      if (error) throw error;
      showNotice(`Moved ${selectedIds.length} product${selectedIds.length !== 1 ? "s" : ""} to ${bulkCategory}.`);
      setSelectedIds([]);
      setBulkCategory("");
      await reload();
    } catch (err) {
      showNotice(err.message || "Could not update category.");
    } finally {
      setBulkWorking(false);
    }
  }, [selectedIds, bulkCategory, reload, showNotice]);

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

      {selectedIds.length > 0 && (
        <div className="admin-bulk-bar">
          <span>{selectedIds.length} selected</span>
          <select
            value={bulkCategory}
            onChange={(event) => setBulkCategory(event.target.value)}
            disabled={bulkWorking}
          >
            <option value="">Move to category...</option>
            {categories.map((cat) => (
              <option key={cat.name} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="btn-secondary"
            disabled={!bulkCategory || bulkWorking}
            onClick={bulkChangeCategory}
          >
            Apply
          </button>
          <button type="button" className="admin-danger" disabled={bulkWorking} onClick={bulkDelete}>
            Delete selected
          </button>
          <button type="button" className="btn-text" onClick={() => setSelectedIds([])}>
            Clear
          </button>
        </div>
      )}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={filtered.length > 0 && selectedIds.length === filtered.length}
                  onChange={toggleSelectAll}
                  aria-label="Select all"
                />
              </th>
              <th></th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Spotlight</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((product) => (
              <tr key={product.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(product.id)}
                    onChange={() => toggleSelected(product.id)}
                    aria-label={`Select ${product.name}`}
                  />
                </td>
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
                <td>
                  <button
                    className={`admin-spotlight-star ${product.is_featured ? "active" : ""}`}
                    onClick={() => toggleSpotlight(product)}
                    disabled={spotlightSaving}
                    aria-label={
                      product.is_featured ? "Currently in Spotlight" : "Set as Spotlight product"
                    }
                    title={product.is_featured ? "Currently in Spotlight" : "Set as Spotlight"}
                  >
                    {product.is_featured ? "★" : "☆"}
                  </button>
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
                <td colSpan={8} className="admin-empty-row">
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
                {categories.map((cat) => (
                  <option key={cat.name} value={cat.name}>
                    {cat.name}
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

            {editing.id && notifyCount > 0 && (
              <div className="admin-notify-banner">
                <span>
                  {notifyCount} customer{notifyCount !== 1 ? "s are" : " is"} waiting for this to restock.
                </span>
                <button
                  type="button"
                  className="btn-secondary"
                  disabled={notifySending || Number(editing.stock) <= 0}
                  onClick={notifyWaitingCustomers}
                >
                  {notifySending ? "Sending..." : "Notify them now"}
                </button>
              </div>
            )}

            <div className="field">
              <label>Description</label>
              <textarea
                rows="3"
                value={editing.description}
                onChange={(event) => setEditing((p) => ({ ...p, description: event.target.value }))}
              />
            </div>

            <div className="field">
              <label>Product photo</label>

              <div className="admin-photo-upload">
                <div className="admin-photo-preview">
                  {editing.image_url ? (
                    <img src={editing.image_url} alt="Preview" />
                  ) : (
                    <span>No photo</span>
                  )}
                </div>

                <div className="admin-photo-controls">
                  <label className="btn-secondary admin-upload-btn">
                    {uploading ? "Uploading..." : editing.image_url ? "Replace photo" : "Upload photo"}
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      disabled={uploading}
                      onChange={(event) => uploadPhoto(event.target.files?.[0])}
                    />
                  </label>

                  {editing.image_url && (
                    <button
                      type="button"
                      className="admin-danger"
                      onClick={() => setEditing((p) => ({ ...p, image_url: "" }))}
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="field">
              <label>Additional photos (gallery)</label>

              <div className="admin-gallery-grid">
                {(editing.images || []).map((url) => (
                  <div className="admin-gallery-thumb" key={url}>
                    <img src={url} alt="Gallery" />
                    <button type="button" onClick={() => removeGalleryPhoto(url)} aria-label="Remove photo">
                      ×
                    </button>
                  </div>
                ))}

                <label className="admin-gallery-add">
                  {uploading ? "..." : "+ Add"}
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    multiple
                    disabled={uploading}
                    onChange={(event) => uploadGalleryPhotos(event.target.files)}
                  />
                </label>
              </div>

              <small className="admin-hint">
                The main photo above shows first everywhere. These extra photos appear as a swipeable gallery when a customer opens the product.
              </small>
            </div>

            <label className="admin-checkbox-field">
              <input
                type="checkbox"
                checked={Boolean(editing.is_featured)}
                onChange={(event) =>
                  setEditing((p) => ({ ...p, is_featured: event.target.checked }))
                }
              />
              Show in homepage Spotlight
            </label>
            <small className="admin-hint">
              Only one product shows there at a time — checking this one will replace whichever was
              featured before once you save.
            </small>

            <button className="btn-primary full" type="submit" disabled={saving || uploading}>
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
  const [note, setNote] = useState("");
  const [filter, setFilter] = useState("all");
  const [saving, setSaving] = useState(false);
  const [savingNote, setSavingNote] = useState(false);

  const filtered = useMemo(() => {
    if (filter === "all") return orders;
    if (filter === "unpaid") return orders.filter((o) => o.payment_status !== "paid");
    return orders.filter((o) => o.status === filter);
  }, [orders, filter]);

  const exportCSV = useCallback(() => {
    const headers = [
      "Tracking Number", "Customer Name", "Phone", "Email", "Total",
      "Payment Status", "Order Status", "Date", "Delivery Address", "State", "City",
    ];

    const rows = filtered.map((o) => [
      o.tracking_number || o.id,
      o.customer_name || "",
      o.customer_phone || "",
      o.customer_email || "",
      o.total || 0,
      o.payment_status || "",
      o.status || "",
      formatDate(o.created_at),
      o.delivery_address || "",
      o.delivery_state || "",
      o.delivery_city || "",
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `shindara-orders-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [filtered]);

  const buildWhatsAppLink = useCallback((order) => {
    const phoneDigits = String(order.customer_phone || "").replace(/\D/g, "");
    const phone = phoneDigits.startsWith("0") ? `234${phoneDigits.slice(1)}` : phoneDigits;
    const message = `Hi ${order.customer_name}, this is Shindara PhoneFlair. An update on your order ${
      order.tracking_number || ""
    }: status is now "${String(order.status || "pending").replace(/_/g, " ")}". Thank you for shopping with us!`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  }, []);

  const openOrder = (order) => {
    setSelected(order);
    setNote(order.status_note || "");
  };

  const sendDeliveryEmail = useCallback((order) => {
    if (!order.customer_email) return;

    const itemsHtml = (order.items || [])
      .map(
        (item) => `
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid #eee;">${item.products?.name || item.product_name || "Product"} × ${item.quantity}</td>
            <td style="padding:10px 0;border-bottom:1px solid #eee;text-align:right;">${money(
              Number(item.price || 0) * Number(item.quantity || 0)
            )}</td>
          </tr>`
      )
      .join("");

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;color:#170f28;">
        <div style="background:linear-gradient(135deg,#7c3aed,#ec4899);padding:24px;border-radius:12px 12px 0 0;text-align:center;">
          <h1 style="color:#fff;margin:0;font-size:20px;">Shindara PhoneFlair</h1>
        </div>
        <div style="padding:24px;border:1px solid #eee;border-top:none;border-radius:0 0 12px 12px;">
          <h2 style="font-size:18px;">Your order has arrived, ${order.customer_name}! 📦</h2>
          <p style="color:#555;font-size:14px;">Your order has been marked as delivered. We hope you love it!</p>
          <p style="font-size:14px;"><strong>Tracking number:</strong> ${order.tracking_number}</p>
          <table style="width:100%;border-collapse:collapse;margin:16px 0;">
            ${itemsHtml}
            <tr>
              <td style="padding:10px 0;font-weight:bold;">Total paid</td>
              <td style="padding:10px 0;text-align:right;font-weight:bold;">${money(order.total)}</td>
            </tr>
          </table>
          <p style="font-size:13px;color:#888;margin-top:20px;">
            Loved what you bought? Leave a review on the product page to let others know.
          </p>
        </div>
      </div>`;

    fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: order.customer_email,
        subject: "Your Shindara PhoneFlair order has arrived! 📦",
        html,
      }),
    }).catch((err) => console.error("Delivery email error:", err));
  }, []);

  const updateOrder = useCallback(
    async (id, changes) => {
      setSaving(true);
      try {
        const { error } = await supabase.from("orders").update(changes).eq("id", id);
        if (error) throw error;
        showNotice("Order updated.");
        await reload();
        setSelected((prev) => {
          const updated = prev ? { ...prev, ...changes } : prev;
          if (changes.status === "delivered" && prev?.status !== "delivered" && updated) {
            sendDeliveryEmail(updated);
          }
          return updated;
        });
      } catch (err) {
        showNotice(err.message || "Could not update order.");
      } finally {
        setSaving(false);
      }
    },
    [reload, showNotice, sendDeliveryEmail]
  );

  const saveNote = useCallback(async () => {
    setSavingNote(true);
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status_note: note.trim() })
        .eq("id", selected.id);
      if (error) throw error;
      showNotice("Note sent to customer.");
      await reload();
      setSelected((prev) => (prev ? { ...prev, status_note: note.trim() } : prev));
    } catch (err) {
      showNotice(err.message || "Could not save note.");
    } finally {
      setSavingNote(false);
    }
  }, [note, selected, reload, showNotice]);

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
          <button type="button" className="btn-secondary" onClick={exportCSV}>
            Export CSV
          </button>
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
                  <button className="btn-text" onClick={() => openOrder(order)}>
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

          {selected.customer_phone && (
            <a
              className="btn-secondary"
              href={buildWhatsAppLink(selected)}
              target="_blank"
              rel="noopener noreferrer"
              style={{ marginBottom: "20px", display: "inline-flex" }}
            >
              💬 Message on WhatsApp
            </a>
          )}

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

          <div className="field">
            <label>Delivery note for customer</label>
            <textarea
              rows="2"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="e.g. Your package left our Lagos warehouse and should arrive within 2 days."
              disabled={savingNote}
            />
            <small className="admin-hint">
              Shows on the customer's tracking page. Leave blank to show nothing extra.
            </small>
            <button
              type="button"
              className="btn-secondary"
              style={{ marginTop: "10px" }}
              disabled={savingNote}
              onClick={saveNote}
            >
              {savingNote ? "Saving..." : "Save note"}
            </button>
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
   CATEGORIES TAB
   ========================================================= */

function CategoriesTab({ categories, reload, showNotice }) {
  const [editing, setEditing] = useState(null); // {} for new, or a category row
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const uploadPhoto = useCallback(
    async (file) => {
      if (!file) return;
      setUploading(true);

      try {
        const ext = file.name.split(".").pop();
        const path = `categories/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from(STORAGE_BUCKET)
          .upload(path, file, { cacheControl: "3600", upsert: false });

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
        setEditing((p) => ({ ...p, image_url: data.publicUrl }));
      } catch (err) {
        showNotice(err.message || "Could not upload photo.");
      } finally {
        setUploading(false);
      }
    },
    [showNotice]
  );

  const save = useCallback(
    async (event) => {
      event.preventDefault();
      setSaving(true);

      const payload = {
        name: editing.name.trim(),
        icon: editing.icon.trim() || "◆",
        image_url: editing.image_url?.trim() || "",
      };

      try {
        let error;
        if (editing.id) {
          ({ error } = await supabase.from("categories").update(payload).eq("id", editing.id));
        } else {
          const nextOrder =
            categories.length > 0 ? Math.max(...categories.map((c) => c.sort_order || 0)) + 1 : 1;
          ({ error } = await supabase
            .from("categories")
            .insert({ ...payload, sort_order: nextOrder }));
        }

        if (error) throw error;

        showNotice(editing.id ? "Category updated." : "Category added.");
        setEditing(null);
        await reload();
      } catch (err) {
        showNotice(err.message || "Could not save category.");
      } finally {
        setSaving(false);
      }
    },
    [editing, categories, reload, showNotice]
  );

  const remove = useCallback(
    async (category) => {
      if (
        !window.confirm(
          `Delete "${category.name}"? Products already in this category will keep the label but it won't be selectable anymore.`
        )
      )
        return;

      try {
        const { error } = await supabase.from("categories").delete().eq("id", category.id);
        if (error) throw error;
        showNotice("Category deleted.");
        await reload();
      } catch (err) {
        showNotice(err.message || "Could not delete category.");
      }
    },
    [reload, showNotice]
  );

  const move = useCallback(
    async (index, direction) => {
      const target = index + direction;
      if (target < 0 || target >= categories.length) return;

      const a = categories[index];
      const b = categories[target];

      try {
        await Promise.all([
          supabase.from("categories").update({ sort_order: b.sort_order }).eq("id", a.id),
          supabase.from("categories").update({ sort_order: a.sort_order }).eq("id", b.id),
        ]);
        await reload();
      } catch (err) {
        showNotice(err.message || "Could not reorder categories.");
      }
    },
    [categories, reload, showNotice]
  );

  return (
    <div className="admin-panel">
      <div className="admin-panel-head">
        <div>
          <h2>Categories</h2>
          <p>{categories.length} categor{categories.length !== 1 ? "ies" : "y"}. Order here matches the storefront.</p>
        </div>
        <div className="admin-panel-actions">
          <button className="btn-primary" onClick={() => setEditing({ name: "", icon: "◆", image_url: "" })}>
            + Add category
          </button>
        </div>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th></th>
              <th>Icon</th>
              <th>Name</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat, index) => (
              <tr key={cat.id}>
                <td className="admin-reorder">
                  <button
                    disabled={index === 0}
                    onClick={() => move(index, -1)}
                    aria-label="Move up"
                  >
                    ↑
                  </button>
                  <button
                    disabled={index === categories.length - 1}
                    onClick={() => move(index, 1)}
                    aria-label="Move down"
                  >
                    ↓
                  </button>
                </td>
                <td className="admin-icon-cell">
                  {cat.image_url ? (
                    <img className="admin-cat-thumb" src={cat.image_url} alt={cat.name} />
                  ) : (
                    cat.icon || "◆"
                  )}
                </td>
                <td>{cat.name}</td>
                <td className="admin-row-actions">
                  <button className="btn-text" onClick={() => setEditing(cat)}>
                    Edit
                  </button>
                  <button className="admin-danger" onClick={() => remove(cat)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {categories.length === 0 && (
              <tr>
                <td colSpan={4} className="admin-empty-row">
                  No categories yet — add your first one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editing && (
        <Modal onClose={() => setEditing(null)}>
          <div className="modal-head">
            <span className="modal-kicker">{editing.id ? "Edit category" : "New category"}</span>
            <h2>{editing.id ? editing.name : "Add a category"}</h2>
          </div>

          <form onSubmit={save}>
            <div className="field">
              <label>Category name</label>
              <input
                value={editing.name}
                onChange={(event) => setEditing((p) => ({ ...p, name: event.target.value }))}
                placeholder="e.g. Wireless Earbuds"
                required
              />
            </div>

            <div className="field">
              <label>Photo</label>

              <div className="admin-photo-upload">
                <div className="admin-photo-preview">
                  {editing.image_url ? (
                    <img src={editing.image_url} alt="Preview" />
                  ) : (
                    <span>{editing.icon || "◆"}</span>
                  )}
                </div>

                <div className="admin-photo-controls">
                  <label className="btn-secondary admin-upload-btn">
                    {uploading ? "Uploading..." : editing.image_url ? "Replace photo" : "Upload photo"}
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      disabled={uploading}
                      onChange={(event) => uploadPhoto(event.target.files?.[0])}
                    />
                  </label>

                  {editing.image_url && (
                    <button
                      type="button"
                      className="admin-danger"
                      onClick={() => setEditing((p) => ({ ...p, image_url: "" }))}
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
              <small className="admin-hint">
                A square photo works best. If no photo is set, the icon below shows instead.
              </small>
            </div>

            <div className="field">
              <label>Icon (fallback if no photo)</label>
              <input
                value={editing.icon}
                onChange={(event) => setEditing((p) => ({ ...p, icon: event.target.value }))}
                placeholder="Any single character or emoji, e.g. ⚡ or 🎧"
                maxLength={4}
              />
            </div>

            <button className="btn-primary full" type="submit" disabled={saving || uploading}>
              {saving ? "Saving..." : editing.id ? "Save changes" : "Add category"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}

/* =========================================================
   BRANDING TAB
   ========================================================= */

function BrandingTab({ settings, reload, showNotice }) {
  const [logoUrl, setLogoUrl] = useState(settings.logo_url || "");
  const [tagline, setTagline] = useState(settings.tagline || "");
  const [instagramUrl, setInstagramUrl] = useState(settings.instagram_url || "");
  const [tiktokUrl, setTiktokUrl] = useState(settings.tiktok_url || "");
  const [supportEmail, setSupportEmail] = useState(settings.support_email || "");
  const [whatsappNumber, setWhatsappNumber] = useState(settings.whatsapp_number || "");
  const [heroImageUrl, setHeroImageUrl] = useState(settings.hero_image_url || "");
  const [uploading, setUploading] = useState(false);
  const [uploadingHero, setUploadingHero] = useState(false);
  const [saving, setSaving] = useState(false);

  const uploadLogo = useCallback(
    async (file) => {
      if (!file) return;
      setUploading(true);

      try {
        const ext = file.name.split(".").pop();
        const path = `branding/logo-${Date.now()}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from(STORAGE_BUCKET)
          .upload(path, file, { cacheControl: "3600", upsert: false });

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
        setLogoUrl(data.publicUrl);
      } catch (err) {
        showNotice(err.message || "Could not upload logo.");
      } finally {
        setUploading(false);
      }
    },
    [showNotice]
  );

  const uploadHeroImage = useCallback(
    async (file) => {
      if (!file) return;
      setUploadingHero(true);

      try {
        const ext = file.name.split(".").pop();
        const path = `branding/hero-${Date.now()}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from(STORAGE_BUCKET)
          .upload(path, file, { cacheControl: "3600", upsert: false });

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
        setHeroImageUrl(data.publicUrl);
      } catch (err) {
        showNotice(err.message || "Could not upload hero image.");
      } finally {
        setUploadingHero(false);
      }
    },
    [showNotice]
  );

  const save = useCallback(
    async (event) => {
      event.preventDefault();
      setSaving(true);

      try {
        const { error } = await supabase
          .from("site_settings")
          .update({
            logo_url: logoUrl.trim(),
            tagline: tagline.trim(),
            instagram_url: instagramUrl.trim(),
            tiktok_url: tiktokUrl.trim(),
            support_email: supportEmail.trim(),
            whatsapp_number: whatsappNumber.trim(),
            hero_image_url: heroImageUrl.trim(),
          })
          .eq("id", 1);

        if (error) throw error;

        showNotice("Branding updated.");
        await reload();
      } catch (err) {
        showNotice(err.message || "Could not save branding.");
      } finally {
        setSaving(false);
      }
    },
    [
      logoUrl,
      tagline,
      instagramUrl,
      tiktokUrl,
      supportEmail,
      whatsappNumber,
      heroImageUrl,
      reload,
      showNotice,
    ]
  );

  return (
    <div className="admin-panel">
      <div className="admin-panel-head">
        <div>
          <h2>Branding</h2>
          <p>Your logo, homepage statement, and contact links — changes appear on the storefront immediately.</p>
        </div>
      </div>

      <form className="admin-branding-form" onSubmit={save}>
        <div className="field">
          <label>Logo</label>

          <div className="admin-photo-upload">
            <div className="admin-photo-preview admin-logo-preview">
              {logoUrl ? <img src={logoUrl} alt="Logo preview" /> : <span>◆</span>}
            </div>

            <div className="admin-photo-controls">
              <label className="btn-secondary admin-upload-btn">
                {uploading ? "Uploading..." : logoUrl ? "Replace logo" : "Upload logo"}
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  disabled={uploading}
                  onChange={(event) => uploadLogo(event.target.files?.[0])}
                />
              </label>

              {logoUrl && (
                <button type="button" className="admin-danger" onClick={() => setLogoUrl("")}>
                  Remove
                </button>
              )}
            </div>
          </div>
          <small className="admin-hint">
            A wide logo (roughly 200×60px, transparent PNG or SVG) fits best in the header.
          </small>
        </div>

        <div className="field">
          <label>Top banner text</label>
          <textarea
            rows="2"
            value={tagline}
            onChange={(event) => setTagline(event.target.value)}
            placeholder="Premium phone accessories are screaming here."
          />
          <small className="admin-hint">
            Shown in the scrolling banner at the very top of every page.
          </small>
        </div>

        <div className="settings-block-title admin-section-title">Contact links</div>

        <div className="field">
          <label>Instagram URL</label>
          <input
            value={instagramUrl}
            onChange={(event) => setInstagramUrl(event.target.value)}
            placeholder="https://instagram.com/shindaraphoneflair"
          />
        </div>

        <div className="field">
          <label>TikTok URL</label>
          <input
            value={tiktokUrl}
            onChange={(event) => setTiktokUrl(event.target.value)}
            placeholder="https://tiktok.com/@shindaraphoneflair"
          />
        </div>

        <div className="field">
          <label>WhatsApp number</label>
          <input
            value={whatsappNumber}
            onChange={(event) => setWhatsappNumber(event.target.value)}
            placeholder="2348012345678 (with country code, no + or spaces)"
          />
          <small className="admin-hint">
            Shows a WhatsApp icon in your header that opens a chat with this number.
          </small>
        </div>

        <div className="field">
          <label>Support email</label>
          <input
            type="email"
            value={supportEmail}
            onChange={(event) => setSupportEmail(event.target.value)}
            placeholder="support@shindaraphoneflair.com"
          />
        </div>
        <small className="admin-hint">
          Leave any of these blank to hide that link on the storefront.
        </small>

        <div className="settings-block-title admin-section-title">Hero image</div>

        <div className="field">
          <div className="admin-photo-upload">
            <div className="admin-photo-preview admin-hero-preview">
              {heroImageUrl ? <img src={heroImageUrl} alt="Hero preview" /> : <span>No image</span>}
            </div>

            <div className="admin-photo-controls">
              <label className="btn-secondary admin-upload-btn">
                {uploadingHero ? "Uploading..." : heroImageUrl ? "Replace image" : "Upload image"}
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  disabled={uploadingHero}
                  onChange={(event) => uploadHeroImage(event.target.files?.[0])}
                />
              </label>

              {heroImageUrl && (
                <button
                  type="button"
                  className="admin-danger"
                  onClick={() => setHeroImageUrl("")}
                >
                  Remove
                </button>
              )}
            </div>
          </div>
          <small className="admin-hint">
            A product photo collage for the homepage banner. If not set, a decorative illustration shows instead.
          </small>
        </div>

        <button className="btn-primary full" type="submit" disabled={saving || uploading || uploadingHero}>
          {saving ? "Saving..." : "Save branding"}
        </button>
      </form>
    </div>
  );
}

/* =========================================================
   DELIVERY FEES TAB
   ========================================================= */

function DeliveryFeesTab({ fees, reload, showNotice }) {
  const [values, setValues] = useState(() => {
    const initial = {};
    NIGERIA_STATES.forEach((state) => {
      initial[state] = fees[state] !== undefined ? String(fees[state]) : "";
    });
    return initial;
  });
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const filteredStates = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return NIGERIA_STATES;
    return NIGERIA_STATES.filter((s) => s.toLowerCase().includes(q));
  }, [search]);

  const saveAll = useCallback(
    async (event) => {
      event.preventDefault();
      setSaving(true);

      try {
        const rows = NIGERIA_STATES.map((state) => ({
          state,
          fee: Number(values[state]) || 0,
        }));

        const { error } = await supabase
          .from("delivery_fees")
          .upsert(rows, { onConflict: "state" });

        if (error) throw error;

        showNotice("Delivery fees updated.");
        await reload();
      } catch (err) {
        showNotice(err.message || "Could not save delivery fees.");
      } finally {
        setSaving(false);
      }
    },
    [values, reload, showNotice]
  );

  return (
    <div className="admin-panel">
      <div className="admin-panel-head">
        <div>
          <h2>Delivery fees</h2>
          <p>Set a delivery fee per state — it's added to the customer's total automatically at checkout.</p>
        </div>
        <div className="admin-panel-actions">
          <input
            className="admin-search"
            placeholder="Search states..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </div>

      <form onSubmit={saveAll}>
        <div className="admin-fees-grid">
          {filteredStates.map((state) => (
            <div className="admin-fee-row" key={state}>
              <label>{state}</label>
              <div className="admin-fee-input">
                <span>₦</span>
                <input
                  type="number"
                  min="0"
                  value={values[state]}
                  onChange={(event) =>
                    setValues((prev) => ({ ...prev, [state]: event.target.value }))
                  }
                  placeholder="0"
                />
              </div>
            </div>
          ))}
        </div>

        <button className="btn-primary full" type="submit" disabled={saving} style={{ marginTop: "20px" }}>
          {saving ? "Saving..." : "Save all delivery fees"}
        </button>
      </form>
    </div>
  );
}

/* =========================================================
   ANALYTICS TAB
   ========================================================= */

function AnalyticsTab({ orders, products, supportEmail, showNotice }) {
  const [sendingAlert, setSendingAlert] = useState(false);
  const [searchLogs, setSearchLogs] = useState([]);

  useEffect(() => {
    let mounted = true;

    (async () => {
      const { data, error } = await supabase
        .from("search_logs")
        .select("query")
        .order("created_at", { ascending: false })
        .limit(500);

      if (!error && mounted) setSearchLogs(data || []);
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const topFailedSearches = useMemo(() => {
    const counts = {};
    searchLogs.forEach((row) => {
      const q = (row.query || "").trim().toLowerCase();
      if (!q) return;
      counts[q] = (counts[q] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
  }, [searchLogs]);

  const stats = useMemo(() => {
    const paidOrders = orders.filter(
      (o) => String(o.payment_status).toLowerCase() === "paid"
    );

    const revenue = paidOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);
    const avgOrder = paidOrders.length > 0 ? revenue / paidOrders.length : 0;

    const productCounts = {};
    paidOrders.forEach((order) => {
      (order.items || []).forEach((item) => {
        const name = item.products?.name || item.product_name || "Unknown";
        const qty = Number(item.quantity || 0);
        productCounts[name] = (productCounts[name] || 0) + qty;
      });
    });

    const topProducts = Object.entries(productCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const lowStock = products
      .filter((p) => Number(p.stock || 0) <= 5)
      .sort((a, b) => Number(a.stock || 0) - Number(b.stock || 0))
      .slice(0, 6);

    const statusCounts = {};
    orders.forEach((o) => {
      const s = o.status || "pending";
      statusCounts[s] = (statusCounts[s] || 0) + 1;
    });

    return { revenue, avgOrder, paidCount: paidOrders.length, topProducts, lowStock, statusCounts };
  }, [orders, products]);

  const sendLowStockAlert = useCallback(async () => {
    if (!supportEmail) {
      showNotice("Set a support email in Branding first.");
      return;
    }
    if (stats.lowStock.length === 0) {
      showNotice("Nothing is low on stock right now.");
      return;
    }

    setSendingAlert(true);

    try {
      const rows = stats.lowStock
        .map(
          (p) =>
            `<tr><td style="padding:8px 0;border-bottom:1px solid #eee;">${p.name}</td><td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;">${p.stock} left</td></tr>`
        )
        .join("");

      const html = `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;">
          <h2 style="font-size:18px;">Low stock alert — Shindara PhoneFlair</h2>
          <p style="color:#555;font-size:14px;">These products are running low:</p>
          <table style="width:100%;border-collapse:collapse;margin-top:12px;">${rows}</table>
        </div>`;

      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: supportEmail,
          subject: `Low stock alert — ${stats.lowStock.length} product${stats.lowStock.length !== 1 ? "s" : ""}`,
          html,
        }),
      });

      if (!response.ok) throw new Error("Email could not be sent.");

      showNotice("Low stock alert sent to " + supportEmail);
    } catch (err) {
      showNotice(err.message || "Could not send alert.");
    } finally {
      setSendingAlert(false);
    }
  }, [stats.lowStock, supportEmail, showNotice]);

  return (
    <div className="admin-panel">
      <div className="admin-panel-head">
        <div>
          <h2>Overview</h2>
          <p>A snapshot of how the store is doing, based on your paid orders.</p>
        </div>
      </div>

      <div className="admin-stat-grid">
        <div className="admin-stat-card">
          <span>Total revenue</span>
          <strong>{money(stats.revenue)}</strong>
        </div>
        <div className="admin-stat-card">
          <span>Paid orders</span>
          <strong>{stats.paidCount}</strong>
        </div>
        <div className="admin-stat-card">
          <span>Average order value</span>
          <strong>{money(stats.avgOrder)}</strong>
        </div>
        <div className="admin-stat-card">
          <span>Products in catalog</span>
          <strong>{products.length}</strong>
        </div>
      </div>

      <div className="admin-analytics-grid">
        <div className="admin-analytics-block">
          <div className="settings-block-title">Top selling products</div>
          {stats.topProducts.length === 0 ? (
            <p className="admin-hint">No sales yet.</p>
          ) : (
            <div className="admin-rank-list">
              {stats.topProducts.map(([name, qty], index) => (
                <div className="admin-rank-row" key={name}>
                  <span className="admin-rank-number">{index + 1}</span>
                  <span className="admin-rank-name">{name}</span>
                  <strong>{qty} sold</strong>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="admin-analytics-block">
          <div className="settings-block-title">Low stock</div>
          {stats.lowStock.length === 0 ? (
            <p className="admin-hint">Nothing running low.</p>
          ) : (
            <>
              <div className="admin-rank-list">
                {stats.lowStock.map((p) => (
                  <div className="admin-rank-row" key={p.id}>
                    <span className="admin-rank-name">{p.name}</span>
                    <strong className={Number(p.stock) === 0 ? "admin-stock low" : "admin-stock"}>
                      {p.stock} left
                    </strong>
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="btn-secondary"
                style={{ marginTop: "14px" }}
                disabled={sendingAlert}
                onClick={sendLowStockAlert}
              >
                {sendingAlert ? "Sending..." : "Email me this list"}
              </button>
            </>
          )}
        </div>

        <div className="admin-analytics-block">
          <div className="settings-block-title">Orders by status</div>
          <div className="admin-rank-list">
            {Object.entries(stats.statusCounts).map(([status, count]) => (
              <div className="admin-rank-row" key={status}>
                <span className="admin-rank-name">{status.replace(/_/g, " ")}</span>
                <strong>{count}</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-analytics-block">
          <div className="settings-block-title">Searched but not found</div>
          {topFailedSearches.length === 0 ? (
            <p className="admin-hint">No missed searches yet.</p>
          ) : (
            <div className="admin-rank-list">
              {topFailedSearches.map(([q, count]) => (
                <div className="admin-rank-row" key={q}>
                  <span className="admin-rank-name">"{q}"</span>
                  <strong>{count}×</strong>
                </div>
              ))}
            </div>
          )}
          <small className="admin-hint" style={{ display: "block", marginTop: "10px" }}>
            Things customers searched for that turned up nothing — a hint at what to stock next.
          </small>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   REVIEWS TAB
   ========================================================= */

function ReviewsTab({ reviews, products, reload, showNotice }) {
  const [search, setSearch] = useState("");

  const productName = useCallback(
    (productId) => products.find((p) => p.id === productId)?.name || "Deleted product",
    [products]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return reviews;
    return reviews.filter(
      (r) =>
        r.customer_name?.toLowerCase().includes(q) ||
        r.comment?.toLowerCase().includes(q) ||
        productName(r.product_id).toLowerCase().includes(q)
    );
  }, [reviews, search, productName]);

  const remove = useCallback(
    async (review) => {
      if (!window.confirm("Delete this review? This cannot be undone.")) return;
      try {
        const { error } = await supabase.from("reviews").delete().eq("id", review.id);
        if (error) throw error;
        showNotice("Review deleted.");
        await reload();
      } catch (err) {
        showNotice(err.message || "Could not delete review.");
      }
    },
    [reload, showNotice]
  );

  return (
    <div className="admin-panel">
      <div className="admin-panel-head">
        <div>
          <h2>Reviews</h2>
          <p>{reviews.length} review{reviews.length !== 1 ? "s" : ""} across all products.</p>
        </div>
        <div className="admin-panel-actions">
          <input
            className="admin-search"
            placeholder="Search reviews..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Customer</th>
              <th>Rating</th>
              <th>Comment</th>
              <th>Date</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((review) => (
              <tr key={review.id}>
                <td>{productName(review.product_id)}</td>
                <td>{review.customer_name}</td>
                <td>{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</td>
                <td className="admin-review-comment">{review.comment || "—"}</td>
                <td>{new Date(review.created_at).toLocaleDateString()}</td>
                <td className="admin-row-actions">
                  <button className="admin-danger" onClick={() => remove(review)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="admin-empty-row">
                  No reviews yet.
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

  const [tab, setTabState] = useState(
    () => sessionStorage.getItem("admin-active-tab") || "overview"
  );

  const setTab = useCallback((next) => {
    setTabState(next);
    sessionStorage.setItem("admin-active-tab", next);
  }, []);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [settings, setSettings] = useState({
    logo_url: "",
    tagline: "",
    instagram_url: "",
    tiktok_url: "",
    support_email: "",
  });
  const [deliveryFees, setDeliveryFees] = useState({});
  const [reviews, setReviews] = useState([]);
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

  const loadCategories = useCallback(async () => {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("Categories:", error);
      return;
    }
    setCategories(data || []);
  }, []);

  const loadSettings = useCallback(async () => {
    const { data, error } = await supabase
      .from("site_settings")
      .select("*")
      .eq("id", 1)
      .maybeSingle();

    if (error) {
      console.error("Settings:", error);
      return;
    }
    setSettings({
      logo_url: data?.logo_url || "",
      tagline: data?.tagline || "",
      instagram_url: data?.instagram_url || "",
      tiktok_url: data?.tiktok_url || "",
      support_email: data?.support_email || "",
    });
  }, []);

  const loadDeliveryFees = useCallback(async () => {
    const { data, error } = await supabase.from("delivery_fees").select("*");

    if (error) {
      console.error("Delivery fees:", error);
      return;
    }

    const map = {};
    (data || []).forEach((row) => {
      map[row.state] = row.fee;
    });
    setDeliveryFees(map);
  }, []);

  const loadReviews = useCallback(async () => {
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Reviews:", error);
      return;
    }
    setReviews(data || []);
  }, []);

  useEffect(() => {
    let mounted = true;

    (async () => {
      await Promise.all([
        loadProducts(),
        loadOrders(),
        loadCustomers(),
        loadCategories(),
        loadSettings(),
        loadDeliveryFees(),
        loadReviews(),
      ]);
      if (mounted) setLoading(false);
    })();

    return () => {
      mounted = false;
    };
  }, [
    loadProducts,
    loadOrders,
    loadCustomers,
    loadCategories,
    loadSettings,
    loadDeliveryFees,
    loadReviews,
  ]);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    // ProtectedAdmin.jsx listens for the SIGNED_OUT auth event and will
    // swap back to AdminLogin on its own — nothing else to do here.
  }, []);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-glow" />
        <div className="loading-mark-wrap">
          <div className="loading-mark">◆</div>
        </div>
        <div className="loading-brand">
          <strong>Shindara</strong>
          <span>ADMIN</span>
        </div>
        <div className="loading-underline" />
        <p>Loading admin portal...</p>
      </div>
    );
  }

  return (
    <div className="admin-app">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          {settings.logo_url ? (
            <img className="admin-brand-logo" src={settings.logo_url} alt="Logo" />
          ) : (
            <span>◆</span>
          )}
          <div>
            <strong>Shindara</strong>
            <small>ADMIN</small>
          </div>
        </div>

        <nav className="admin-nav">
          <button className={tab === "overview" ? "active" : ""} onClick={() => setTab("overview")}>
            Overview
          </button>
          <button className={tab === "products" ? "active" : ""} onClick={() => setTab("products")}>
            Products
          </button>
          <button className={tab === "categories" ? "active" : ""} onClick={() => setTab("categories")}>
            Categories
          </button>
          <button className={tab === "orders" ? "active" : ""} onClick={() => setTab("orders")}>
            Orders
          </button>
          <button className={tab === "customers" ? "active" : ""} onClick={() => setTab("customers")}>
            Customers
          </button>
          <button className={tab === "branding" ? "active" : ""} onClick={() => setTab("branding")}>
            Branding
          </button>
          <button className={tab === "delivery" ? "active" : ""} onClick={() => setTab("delivery")}>
            Delivery Fees
          </button>
          <button className={tab === "reviews" ? "active" : ""} onClick={() => setTab("reviews")}>
            Reviews
          </button>
        </nav>

        <button className="logout-button" onClick={logout}>
          Sign out
        </button>
      </aside>

      <main className="admin-main">
        {tab === "overview" && (
          <AnalyticsTab
            orders={orders}
            products={products}
            supportEmail={settings.support_email}
            showNotice={showNotice}
          />
        )}
        {tab === "products" && (
          <ProductsTab
            products={products}
            categories={categories}
            reload={loadProducts}
            showNotice={showNotice}
          />
        )}
        {tab === "categories" && (
          <CategoriesTab categories={categories} reload={loadCategories} showNotice={showNotice} />
        )}
        {tab === "orders" && (
          <OrdersTab orders={orders} reload={loadOrders} showNotice={showNotice} />
        )}
        {tab === "customers" && <CustomersTab customers={customers} />}
        {tab === "branding" && (
          <BrandingTab settings={settings} reload={loadSettings} showNotice={showNotice} />
        )}
        {tab === "delivery" && (
          <DeliveryFeesTab fees={deliveryFees} reload={loadDeliveryFees} showNotice={showNotice} />
        )}
        {tab === "reviews" && (
          <ReviewsTab
            reviews={reviews}
            products={products}
            reload={loadReviews}
            showNotice={showNotice}
          />
        )}
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

   IMPORTANT: This file imports supabase from "./supabaseAdminClient",
   NOT "./supabaseClient" — this keeps the admin session completely
   separate from the customer storefront's session. Make sure
   supabaseAdminClient.js exists in src/ already (it should, from
   earlier fixes).

   Route /admin at <ProtectedAdmin /> (not <Admin /> directly).

   Database: make sure `profiles.is_admin` exists (boolean, default
   false) and is `true` for your own account.

   Supabase Row Level Security: `products`, `orders`, and
   `order_items` need UPDATE/INSERT/DELETE policies for authenticated
   users where profiles.is_admin = true.
   ========================================================= */
