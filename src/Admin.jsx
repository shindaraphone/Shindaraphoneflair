import { useEffect, useMemo, useState } from "react";
import { supabase } from "./supabaseClient";

const BUCKET = "product-images";

function money(value) {
  return `₦${Number(value || 0).toLocaleString("en-NG")}`;
}

function formatDate(value) {
  if (!value) return "—";

  return new Date(value).toLocaleString("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function Admin() {
  const [section, setSection] = useState("dashboard");

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(true);
  const [customersLoading, setCustomersLoading] = useState(true);

  const [message, setMessage] = useState("");

  const [productModal, setProductModal] = useState(false);
  const [orderModal, setOrderModal] = useState(null);

  const [editingProduct, setEditingProduct] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [logo, setLogo] = useState(
    localStorage.getItem("shindara_admin_logo") || ""
  );

  const [logoUploading, setLogoUploading] = useState(false);

  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "",
    image_url: "",
    featured: false,
  });

  const [imagePreview, setImagePreview] = useState("");

  const categories = [
    "Phones",
    "Phone Cases",
    "Chargers",
    "Cables",
    "Power Banks",
    "Earphones",
    "Headphones",
    "Smart Watches",
    "Speakers",
    "Screen Protectors",
    "Adapters",
    "Other Electronics",
  ];

  useEffect(() => {
    loadEverything();
  }, []);

  async function loadEverything() {
    await Promise.all([
      loadProducts(),
      loadOrders(),
      loadCustomers(),
    ]);
  }

  /* =========================
     PRODUCTS
  ========================= */

  async function loadProducts() {
    setProductsLoading(true);

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      setMessage(error.message);
    } else {
      setProducts(data || []);
    }

    setProductsLoading(false);
  }

  /* =========================
     ORDERS
  ========================= */

  async function loadOrders() {
    setLoading(true);

    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        order_items (
          id,
          product_name,
          price,
          quantity,
          image_url
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      setMessage(error.message);
      setOrders([]);
    } else {
      setOrders(data || []);
    }

    setLoading(false);
  }

  /* =========================
     CUSTOMERS
  ========================= */

  async function loadCustomers() {
    setCustomersLoading(true);

    const { data, error } = await supabase
      .from("orders")
      .select(
        "user_id, customer_name, customer_phone, delivery_address, delivery_city, delivery_state, created_at"
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      setMessage(error.message);
      setCustomers([]);
      setCustomersLoading(false);
      return;
    }

    const unique = [];

    for (const customer of data || []) {
      if (
        !unique.some(
          (item) => item.user_id === customer.user_id
        )
      ) {
        unique.push(customer);
      }
    }

    setCustomers(unique);
    setCustomersLoading(false);
  }

  /* =========================
     PRODUCT FORM
  ========================= */

  function resetProductForm() {
    setProductForm({
      name: "",
      description: "",
      price: "",
      category: "",
      stock: "",
      image_url: "",
      featured: false,
    });

    setImagePreview("");
  }

  function openAddProduct() {
    setEditingProduct(null);
    resetProductForm();
    setMessage("");
    setProductModal(true);
  }

  function openEditProduct(product) {
    setEditingProduct(product);

    setProductForm({
      name: product.name || "",
      description: product.description || "",
      price: product.price ?? "",
      category: product.category || "",
      stock: product.stock ?? "",
      image_url: product.image_url || "",
      featured: Boolean(product.featured),
    });

    setImagePreview(product.image_url || "");
    setMessage("");
    setProductModal(true);
  }

  function closeProductModal() {
    if (saving || uploading) return;

    setProductModal(false);
    setEditingProduct(null);
    resetProductForm();
  }

  /* =========================
     SUPABASE STORAGE IMAGE
  ========================= */

  async function uploadImage(file) {
    if (!file) return null;

    if (!file.type.startsWith("image/")) {
      throw new Error("Please choose an image file.");
    }

    if (file.size > 10 * 1024 * 1024) {
      throw new Error("Image must be smaller than 10MB.");
    }

    setUploading(true);

    try {
      const extension =
        file.name.split(".").pop()?.toLowerCase() || "jpg";

      const fileName =
        `${Date.now()}-${Math.random()
          .toString(36)
          .substring(2, 9)}.${extension}`;

      const filePath = `products/${fileName}`;

      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type,
        });

      if (error) {
        throw new Error(
          `Image upload failed: ${error.message}`
        );
      }

      const { data } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(filePath);

      if (!data?.publicUrl) {
        throw new Error(
          "Image uploaded but public URL could not be created."
        );
      }

      return data.publicUrl;
    } finally {
      setUploading(false);
    }
  }

  async function handleImageChange(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    try {
      setMessage("");

      const localPreview =
        URL.createObjectURL(file);

      setImagePreview(localPreview);

      const url = await uploadImage(file);

      setProductForm((current) => ({
        ...current,
        image_url: url,
      }));

      setImagePreview(url);

      setMessage("Product image uploaded successfully.");
    } catch (error) {
      console.error(error);

      setMessage(
        error?.message ||
          "Unable to upload product image."
      );
    }
  }

  /* =========================
     SAVE PRODUCT
  ========================= */

  async function saveProduct(event) {
    event.preventDefault();

    if (saving || uploading) return;

    setSaving(true);
    setMessage("");

    try {
      const name = productForm.name.trim();
      const description =
        productForm.description.trim();

      const category =
        productForm.category.trim();

      const price = Number(productForm.price);
      const stock = Number(productForm.stock);

      if (!name) {
        throw new Error("Enter a product name.");
      }

      if (!category) {
        throw new Error("Choose a product category.");
      }

      if (!Number.isFinite(price) || price < 0) {
        throw new Error("Enter a valid price.");
      }

      if (!Number.isInteger(stock) || stock < 0) {
        throw new Error("Enter a valid stock quantity.");
      }

      const productData = {
        name,
        description,
        category,
        price,
        stock,
        image_url:
          productForm.image_url || null,
        featured: Boolean(productForm.featured),
      };

      if (editingProduct) {
        const { data, error } = await supabase
          .from("products")
          .update(productData)
          .eq("id", editingProduct.id)
          .select("*");

        if (error) throw error;

        if (!data?.length) {
          throw new Error(
            "Product was not updated."
          );
        }

        setProducts((current) =>
          current.map((item) =>
            item.id === editingProduct.id
              ? data[0]
              : item
          )
        );

        setMessage(
          "Product updated successfully."
        );
      } else {
        const { data, error } = await supabase
          .from("products")
          .insert(productData)
          .select("*");

        if (error) throw error;

        if (!data?.length) {
          throw new Error(
            "Product was not added."
          );
        }

        setProducts((current) => [
          data[0],
          ...current,
        ]);

        setMessage(
          "Product added successfully."
        );
      }

      setProductModal(false);
      setEditingProduct(null);
      resetProductForm();

      await loadProducts();
    } catch (error) {
      console.error(error);

      setMessage(
        error?.message ||
          "Unable to save product."
      );
    } finally {
      setSaving(false);
    }
  }

  /* =========================
     DELETE PRODUCT
  ========================= */

  async function deleteProduct(product) {
    const confirmed = window.confirm(
      `Delete "${product.name}"?\n\nThis cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setMessage("Checking admin access...");

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;

      if (!user) {
        throw new Error(
          "You are not logged into your admin account."
        );
      }

      const { data: profile, error: profileError } =
        await supabase
          .from("profiles")
          .select("id, email, is_admin")
          .eq("id", user.id)
          .maybeSingle();

      if (profileError) throw profileError;

      if (!profile?.is_admin) {
        throw new Error(
          "This account is not an administrator."
        );
      }

      setMessage("Deleting product...");

      const { data, error } = await supabase
        .from("products")
        .delete()
        .eq("id", product.id)
        .select("id");

      if (error) throw error;

      if (!data?.length) {
        throw new Error(
          "Product was not deleted. Check your database DELETE policy."
        );
      }

      setProducts((current) =>
        current.filter(
          (item) => item.id !== product.id
        )
      );

      setMessage(
        `"${product.name}" deleted successfully.`
      );
    } catch (error) {
      console.error(error);

      setMessage(
        error?.message ||
          "Unable to delete product."
      );
    }
  }

  /* =========================
     ORDER STATUS
  ========================= */

  async function updateOrderStatus(
    orderId,
    status
  ) {
    const { error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", orderId);

    if (error) {
      setMessage(error.message);
      return;
    }

    setOrders((current) =>
      current.map((order) =>
        order.id === orderId
          ? { ...order, status }
          : order
      )
    );

    setMessage("Order status updated.");
  }

  /* =========================
     LOGO
  ========================= */

  async function handleLogoChange(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    try {
      setLogoUploading(true);
      setMessage("Uploading logo...");

      const url = await uploadImage(file);

      if (!url) {
        throw new Error("Logo upload failed.");
      }

      localStorage.setItem(
        "shindara_admin_logo",
        url
      );

      setLogo(url);

      setMessage(
        "Logo uploaded successfully."
      );
    } catch (error) {
      console.error(error);

      setMessage(
        error?.message ||
          "Unable to upload logo."
      );
    } finally {
      setLogoUploading(false);
    }
  }

  /* =========================
     DASHBOARD STATS
  ========================= */

  const totalRevenue = useMemo(
    () =>
      orders
        .filter(
          (order) =>
            order.status !== "cancelled"
        )
        .reduce(
          (sum, order) =>
            sum + Number(order.total || 0),
          0
        ),
    [orders]
  );

  const pendingOrders = orders.filter(
    (order) =>
      order.status === "pending"
  ).length;

  const deliveredOrders = orders.filter(
    (order) =>
      order.status === "delivered"
  ).length;

  const lowStock = products.filter(
    (product) =>
      Number(product.stock || 0) > 0 &&
      Number(product.stock || 0) <= 5
  ).length;

  const outOfStock = products.filter(
    (product) =>
      Number(product.stock || 0) <= 0
  ).length;

  /* =========================
     NAVIGATION
  ========================= */

  function goTo(name) {
    setSection(name);
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  /* =========================
     RENDER
  ========================= */

  return (
    <div className="admin">

      <style>{`

        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          background: #f6f7fb;
          color: #111827;
          font-family:
            Inter,
            -apple-system,
            BlinkMacSystemFont,
            "SF Pro Display",
            "Segoe UI",
            sans-serif;
        }

        button,
        input,
        textarea,
        select {
          font: inherit;
        }

        button {
          cursor: pointer;
        }

        .admin {
          min-height: 100vh;
          background:
            radial-gradient(
              circle at 10% 0%,
              rgba(99,102,241,.13),
              transparent 28%
            ),
            radial-gradient(
              circle at 90% 10%,
              rgba(168,85,247,.10),
              transparent 25%
            ),
            #f6f7fb;
          padding: 22px;
        }

        .admin-container {
          max-width: 1400px;
          margin: auto;
        }

        /* HEADER */

        .topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 22px;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 13px;
        }

        .brand-logo {
          width: 48px;
          height: 48px;
          border-radius: 15px;
          overflow: hidden;
          background: #111827;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 900;
          flex-shrink: 0;
        }

        .brand-logo img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .brand-name {
          font-size: 18px;
          font-weight: 900;
          letter-spacing: -.5px;
        }

        .brand-subtitle {
          font-size: 12px;
          color: #6b7280;
          margin-top: 3px;
        }

        .refresh {
          border: 1px solid #e5e7eb;
          background: white;
          padding: 11px 15px;
          border-radius: 13px;
          font-weight: 800;
        }

        /* NAV */

        .nav {
          display: flex;
          gap: 7px;
          overflow-x: auto;
          padding: 7px;
          background: rgba(255,255,255,.8);
          backdrop-filter: blur(20px);
          border: 1px solid #e5e7eb;
          border-radius: 18px;
          margin-bottom: 22px;
          scrollbar-width: none;
        }

        .nav::-webkit-scrollbar {
          display: none;
        }

        .nav button {
          border: 0;
          background: transparent;
          padding: 11px 15px;
          border-radius: 12px;
          font-weight: 800;
          white-space: nowrap;
          color: #6b7280;
        }

        .nav button.active {
          background: #111827;
          color: white;
          box-shadow: 0 6px 18px rgba(17,24,39,.18);
        }

        /* MESSAGE */

        .message {
          background: #eef2ff;
          border: 1px solid #c7d2fe;
          color: #3730a3;
          border-radius: 14px;
          padding: 13px 15px;
          margin-bottom: 20px;
          font-size: 14px;
          font-weight: 700;
        }

        /* HERO */

        .hero {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 20px;
          margin-bottom: 24px;
        }

        .eyebrow {
          margin: 0 0 7px;
          color: #6366f1;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 2px;
        }

        .hero h1 {
          margin: 0;
          font-size: clamp(34px,6vw,58px);
          letter-spacing: -3px;
          line-height: .95;
        }

        .hero p {
          color: #6b7280;
          margin: 12px 0 0;
        }

        /* BUTTONS */

        .primary {
          border: 0;
          color: white;
          background: linear-gradient(
            135deg,
            #111827,
            #312e81
          );
          padding: 13px 18px;
          border-radius: 13px;
          font-weight: 900;
          box-shadow: 0 10px 25px rgba(49,46,129,.18);
        }

        .secondary {
          border: 1px solid #e5e7eb;
          color: #111827;
          background: white;
          padding: 12px 15px;
          border-radius: 12px;
          font-weight: 800;
        }

        .danger {
          border: 1px solid #fecaca;
          color: #b91c1c;
          background: #fff1f2;
          padding: 10px 13px;
          border-radius: 11px;
          font-weight: 800;
        }

        /* STATS */

        .stats {
          display: grid;
          grid-template-columns:
            repeat(4, minmax(0,1fr));
          gap: 14px;
          margin-bottom: 24px;
        }

        .stat {
          background: rgba(255,255,255,.9);
          border: 1px solid #e5e7eb;
          border-radius: 20px;
          padding: 20px;
          box-shadow:
            0 15px 40px rgba(15,23,42,.05);
        }

        .stat-label {
          color: #6b7280;
          font-size: 12px;
          font-weight: 800;
        }

        .stat-value {
          display: block;
          margin-top: 8px;
          font-size: 27px;
          letter-spacing: -.8px;
        }

        /* QUICK ACTIONS */

        .quick-actions {
          display: grid;
          grid-template-columns:
            repeat(4, minmax(0,1fr));
          gap: 12px;
          margin-bottom: 24px;
        }

        .quick {
          text-align: left;
          border: 1px solid #e5e7eb;
          background: white;
          border-radius: 18px;
          padding: 18px;
          transition: .2s;
        }

        .quick:hover {
          transform: translateY(-2px);
          box-shadow:
            0 14px 30px rgba(15,23,42,.08);
        }

        .quick-icon {
          font-size: 25px;
          margin-bottom: 12px;
        }

        .quick strong {
          display: block;
        }

        .quick span {
          display: block;
          color: #6b7280;
          font-size: 12px;
          margin-top: 5px;
        }

        /* SECTION */

        .section-title {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          margin-bottom: 18px;
        }

        .section-title h2 {
          margin: 0;
          font-size: 28px;
          letter-spacing: -1px;
        }

        .section-title p {
          margin: 4px 0 0;
          color: #6b7280;
          font-size: 13px;
        }

        /* PRODUCTS */

        .products {
          display: grid;
          grid-template-columns:
            repeat(4, minmax(0,1fr));
          gap: 16px;
        }

        .product {
          overflow: hidden;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 20px;
          box-shadow:
            0 12px 30px rgba(15,23,42,.04);
        }

        .product-image {
          height: 220px;
          background: #f1f5f9;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .product-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .product-content {
          padding: 17px;
        }

        .category {
          color: #6366f1;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 1.2px;
          font-weight: 900;
        }

        .product h3 {
          margin: 7px 0;
          font-size: 17px;
        }

        .price {
          font-size: 19px;
          font-weight: 900;
          margin: 12px 0 5px;
        }

        .stock {
          font-size: 13px;
          font-weight: 800;
        }

        .good {
          color: #15803d;
        }

        .low {
          color: #b45309;
        }

        .out {
          color: #dc2626;
        }

        .badge {
          display: inline-block;
          margin-top: 9px;
          padding: 5px 9px;
          border-radius: 999px;
          background: #eef2ff;
          color: #4338ca;
          font-size: 10px;
          font-weight: 900;
        }

        .product-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-top: 15px;
        }

        /* ORDERS */

        .orders {
          display: grid;
          grid-template-columns:
            repeat(2,minmax(0,1fr));
          gap: 15px;
        }

        .order {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 20px;
          padding: 20px;
        }

        .order-head {
          display: flex;
          justify-content: space-between;
          gap: 15px;
          align-items: flex-start;
          border-bottom: 1px solid #f1f5f9;
          padding-bottom: 15px;
        }

        .order-id {
          font-weight: 900;
        }

        .order-date {
          color: #94a3b8;
          font-size: 11px;
          margin-top: 5px;
        }

        .status {
          border: 1px solid #e5e7eb;
          background: white;
          padding: 8px;
          border-radius: 10px;
          font-size: 12px;
          font-weight: 800;
        }

        .order-body {
          padding: 15px 0;
        }

        .order-body h4 {
          margin: 0 0 9px;
          font-size: 11px;
          text-transform: uppercase;
          color: #94a3b8;
          letter-spacing: 1px;
        }

        .order-body p {
          margin: 6px 0;
          font-size: 13px;
        }

        .order-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 0;
        }

        .order-item-image {
          width: 50px;
          height: 50px;
          border-radius: 10px;
          overflow: hidden;
          background: #f1f5f9;
          flex-shrink: 0;
        }

        .order-item-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .order-total {
          border-top: 1px solid #f1f5f9;
          padding-top: 15px;
          display: flex;
          justify-content: space-between;
          font-size: 18px;
        }

        /* CUSTOMERS */

        .customers {
          display: grid;
          grid-template-columns:
            repeat(3,minmax(0,1fr));
          gap: 15px;
        }

        .customer {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 20px;
          padding: 18px;
          display: flex;
          gap: 13px;
        }

        .avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: #eef2ff;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .customer h3 {
          margin: 0 0 7px;
          font-size: 15px;
        }

        .customer p {
          margin: 5px 0;
          color: #64748b;
          font-size: 12px;
        }

        /* SETTINGS */

        .settings-card {
          max-width: 700px;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 22px;
          padding: 22px;
        }

        .logo-preview {
          width: 130px;
          height: 130px;
          border-radius: 25px;
          overflow: hidden;
          background: #111827;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 45px;
          font-weight: 900;
          margin: 15px 0;
        }

        .logo-preview img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .upload-label {
          display: inline-block;
          background: #111827;
          color: white;
          padding: 12px 16px;
          border-radius: 12px;
          font-weight: 800;
          cursor: pointer;
        }

        .hidden {
          display: none;
        }

        /* EMPTY */

        .empty {
          text-align: center;
          padding: 65px 20px;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 20px;
        }

        .empty-icon {
          font-size: 50px;
        }

        .empty p {
          color: #64748b;
        }

        /* MODAL */

        .backdrop {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: rgba(2,6,23,.65);
          backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 15px;
        }

        .modal {
          width: min(620px,100%);
          max-height: 92vh;
          overflow-y: auto;
          background: white;
          border-radius: 25px;
          padding: 25px;
          position: relative;
          box-shadow:
            0 35px 100px rgba(0,0,0,.3);
        }

        .close {
          position: absolute;
          top: 15px;
          right: 15px;
          border: 0;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: #f1f5f9;
          font-size: 22px;
        }

        .form {
          display: grid;
          gap: 11px;
        }

        .form label {
          font-size: 12px;
          font-weight: 900;
          color: #475569;
          margin-top: 5px;
        }

        .form input,
        .form textarea,
        .form select {
          width: 100%;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          border-radius: 12px;
          padding: 13px;
          outline: none;
        }

        .form input:focus,
        .form textarea:focus,
        .form select:focus {
          border-color: #6366f1;
          background: white;
        }

        .form textarea {
          min-height: 100px;
          resize: vertical;
        }

        .preview {
          width: 100%;
          height: 220px;
          border-radius: 15px;
          background: #f1f5f9;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 10px;
        }

        .preview img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .file-label {
          display: block;
          text-align: center;
          padding: 13px;
          background: #111827;
          color: white;
          border-radius: 12px;
          font-weight: 900;
          cursor: pointer;
        }

        .modal-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 9px;
          margin-top: 10px;
        }

        .featured {
          display: flex;
          align-items: center;
          gap: 9px;
          background: #f8fafc;
          padding: 12px;
          border-radius: 12px;
        }

        .featured input {
          width: auto;
        }

        /* RESPONSIVE */

        @media(max-width:1050px) {
          .products {
            grid-template-columns:
              repeat(3,minmax(0,1fr));
          }

          .customers {
            grid-template-columns:
              repeat(2,minmax(0,1fr));
          }
        }

        @media(max-width:800px) {
          .admin {
            padding: 14px;
          }

          .stats {
            grid-template-columns:
              repeat(2,minmax(0,1fr));
          }

          .quick-actions {
            grid-template-columns:
              repeat(2,minmax(0,1fr));
          }

          .products,
          .orders,
          .customers {
            grid-template-columns: 1fr;
          }

          .hero {
            align-items: flex-start;
            flex-direction: column;
          }
        }

        @media(max-width:500px) {
          .topbar {
            align-items: flex-start;
          }

          .brand-name {
            font-size: 15px;
          }

          .stats {
            grid-template-columns: 1fr 1fr;
            gap: 9px;
          }

          .stat {
            padding: 15px;
            border-radius: 16px;
          }

          .stat-value {
            font-size: 21px;
          }

          .quick-actions {
            gap: 9px;
          }

          .quick {
            padding: 14px;
          }

          .product-image {
            height: 270px;
          }

          .section-title {
            align-items: flex-start;
          }

          .modal {
            padding: 20px 15px;
            border-radius: 20px;
          }
        }

      `}</style>

      <div className="admin-container">

        {/* TOP BAR */}

        <div className="topbar">

          <div className="brand">

            <div className="brand-logo">
              {logo ? (
                <img
                  src={logo}
                  alt="Shindara Phoneflair"
                />
              ) : (
                "S"
              )}
            </div>

            <div>
              <div className="brand-name">
                Shindara Phoneflair
              </div>

              <div className="brand-subtitle">
                Admin Control Center
              </div>
            </div>

          </div>

          <button
            className="refresh"
            onClick={loadEverything}
          >
            ↻ Refresh
          </button>

        </div>

        {/* NAVIGATION */}

        <nav className="nav">

          {[
            ["dashboard", "📊 Dashboard"],
            ["products", "📦 Products"],
            ["orders", "🛒 Orders"],
            ["customers", "👥 Customers"],
            ["settings", "⚙️ Settings"],
          ].map(([id, label]) => (
            <button
              key={id}
              className={
                section === id
                  ? "active"
                  : ""
              }
              onClick={() => goTo(id)}
            >
              {label}
            </button>
          ))}

        </nav>

        {message && (
          <div className="message">
            {message}
          </div>
        )}

        {/* =========================
            DASHBOARD
        ========================= */}

        {section === "dashboard" && (
          <>

            <div className="hero">

              <div>
                <p className="eyebrow">
                  STORE OVERVIEW
                </p>

                <h1>
                  Good day, Admin.
                </h1>

                <p>
                  Here's what's happening
                  with your store.
                </p>
              </div>

              <button
                className="primary"
                onClick={openAddProduct}
              >
                + Add Product
              </button>

            </div>

            <div className="stats">

              <div className="stat">
                <span className="stat-label">
                  Revenue
                </span>

                <strong className="stat-value">
                  {money(totalRevenue)}
                </strong>
              </div>

              <div className="stat">
                <span className="stat-label">
                  Orders
                </span>

                <strong className="stat-value">
                  {orders.length}
                </strong>
              </div>

              <div className="stat">
                <span className="stat-label">
                  Customers
                </span>

                <strong className="stat-value">
                  {customers.length}
                </strong>
              </div>

              <div className="stat">
                <span className="stat-label">
                  Products
                </span>

                <strong className="stat-value">
                  {products.length}
                </strong>
              </div>

            </div>

            <div className="quick-actions">

              <button
                className="quick"
                onClick={openAddProduct}
              >
                <div className="quick-icon">
                  ➕
                </div>

                <strong>
                  Add Product
                </strong>

                <span>
                  Add something new
                </span>
              </button>

              <button
                className="quick"
                onClick={() =>
                  goTo("orders")
                }
              >
                <div className="quick-icon">
                  🛒
                </div>

                <strong>
                  View Orders
                </strong>

                <span>
                  {pendingOrders} pending
                </span>
              </button>

              <button
                className="quick"
                onClick={() =>
                  goTo("customers")
                }
              >
                <div className="quick-icon">
                  👥
                </div>

                <strong>
                  Customers
                </strong>

                <span>
                  View customer directory
                </span>
              </button>

              <button
                className="quick"
                onClick={() =>
                  goTo("settings")
                }
              >
                <div className="quick-icon">
                  ⚙️
                </div>

                <strong>
                  Settings
                </strong>

                <span>
                  Store customization
                </span>
              </button>

            </div>

            <div className="stats">

              <div className="stat">
                <span className="stat-label">
                  Pending orders
                </span>

                <strong className="stat-value">
                  {pendingOrders}
                </strong>
              </div>

              <div className="stat">
                <span className="stat-label">
                  Delivered
                </span>

                <strong className="stat-value">
                  {deliveredOrders}
                </strong>
              </div>

              <div className="stat">
                <span className="stat-label">
                  Low stock
                </span>

                <strong className="stat-value">
                  {lowStock}
                </strong>
              </div>

              <div className="stat">
                <span className="stat-label">
                  Out of stock
                </span>

                <strong className="stat-value">
                  {outOfStock}
                </strong>
              </div>

            </div>

          </>
        )}

        {/* =========================
            PRODUCTS
        ========================= */}

        {section === "products" && (
          <>

            <div className="section-title">

              <div>
                <p className="eyebrow">
                  STORE INVENTORY
                </p>

                <h2>
                  Products
                </h2>

                <p>
                  Manage your products,
                  stock and pricing.
                </p>
              </div>

              <button
                className="primary"
                onClick={openAddProduct}
              >
                + Add Product
              </button>

            </div>

            <div className="stats">

              <div className="stat">
                <span className="stat-label">
                  All Products
                </span>

                <strong className="stat-value">
                  {products.length}
                </strong>
              </div>

              <div className="stat">
                <span className="stat-label">
                  In Stock
                </span>

                <strong className="stat-value">
                  {
                    products.filter(
                      (p) =>
                        Number(p.stock) > 0
                    ).length
                  }
                </strong>
              </div>

              <div className="stat">
                <span className="stat-label">
                  Low Stock
                </span>

                <strong className="stat-value">
                  {lowStock}
                </strong>
              </div>

              <div className="stat">
                <span className="stat-label">
                  Out of Stock
                </span>

                <strong className="stat-value">
                  {outOfStock}
                </strong>
              </div>

            </div>

            {productsLoading ? (
              <div className="empty">
                Loading products...
              </div>
            ) : products.length === 0 ? (
              <div className="empty">
                <div className="empty-icon">
                  📦
                </div>

                <h2>
                  No products yet
                </h2>

                <p>
                  Add your first product.
                </p>

                <button
                  className="primary"
                  onClick={openAddProduct}
                >
                  + Add Product
                </button>
              </div>
            ) : (
              <div className="products">

                {products.map((product) => {

                  const stock =
                    Number(product.stock || 0);

                  return (
                    <article
                      className="product"
                      key={product.id}
                    >

                      <div className="product-image">

                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                          />
                        ) : (
                          <span
                            style={{
                              fontSize: 50,
                            }}
                          >
                            📦
                          </span>
                        )}

                      </div>

                      <div className="product-content">

                        <div className="category">
                          {product.category ||
                            "Electronics"}
                        </div>

                        <h3>
                          {product.name}
                        </h3>

                        <div className="price">
                          {money(product.price)}
                        </div>

                        <div
                          className={
                            stock <= 0
                              ? "stock out"
                              : stock <= 5
                              ? "stock low"
                              : "stock good"
                          }
                        >
                          {stock <= 0
                            ? "Out of stock"
                            : `${stock} in stock`}
                        </div>

                        {product.featured && (
                          <span className="badge">
                            ⭐ Featured
                          </span>
                        )}

                        <div className="product-actions">

                          <button
                            className="secondary"
                            onClick={() =>
                              openEditProduct(
                                product
                              )
                            }
                          >
                            ✏️ Edit
                          </button>

                          <button
                            className="danger"
                            onClick={() =>
                              deleteProduct(
                                product
                              )
                            }
                          >
                            🗑️ Delete
                          </button>

                        </div>

                      </div>

                    </article>
                  );
                })}

              </div>
            )}

          </>
        )}

        {/* =========================
            ORDERS
        ========================= */}

        {section === "orders" && (
          <>

            <div className="section-title">

              <div>
                <p className="eyebrow">
                  STORE ORDERS
                </p>

                <h2>
                  Orders
                </h2>

                <p>
                  Manage and track customer
                  purchases.
                </p>
              </div>

              <button
                className="secondary"
                onClick={loadOrders}
              >
                ↻ Refresh
              </button>

            </div>

            <div className="stats">

              <div className="stat">
                <span className="stat-label">
                  Orders
                </span>

                <strong className="stat-value">
                  {orders.length}
                </strong>
              </div>

              <div className="stat">
                <span className="stat-label">
                  Pending
                </span>

                <strong className="stat-value">
                  {pendingOrders}
                </strong>
              </div>

              <div className="stat">
                <span className="stat-label">
                  Delivered
                </span>

                <strong className="stat-value">
                  {deliveredOrders}
                </strong>
              </div>

              <div className="stat">
                <span className="stat-label">
                  Revenue
                </span>

                <strong className="stat-value">
                  {money(totalRevenue)}
                </strong>
              </div>

            </div>

            {loading ? (
              <div className="empty">
                Loading orders...
              </div>
            ) : orders.length === 0 ? (
              <div className="empty">
                <div className="empty-icon">
                  🛒
                </div>

                <h2>
                  No orders yet
                </h2>

                <p>
                  Customer orders will
                  appear here.
                </p>
              </div>
            ) : (
              <div className="orders">

                {orders.map((order) => (

                  <article
                    className="order"
                    key={order.id}
                  >

                    <div className="order-head">

                      <div>

                        <div className="order-id">
                          #
                          {String(order.id)
                            .slice(0, 8)
                            .toUpperCase()}
                        </div>

                        <div className="order-date">
                          {formatDate(
                            order.created_at
                          )}
                        </div>

                      </div>

                      <select
                        className="status"
                        value={
                          order.status ||
                          "pending"
                        }
                        onChange={(e) =>
                          updateOrderStatus(
                            order.id,
                            e.target.value
                          )
                        }
                      >
                        <option value="pending">
                          Pending
                        </option>

                        <option value="confirmed">
                          Confirmed
                        </option>

                        <option value="shipped">
                          Shipped
                        </option>

                        <option value="delivered">
                          Delivered
                        </option>

                        <option value="cancelled">
                          Cancelled
                        </option>
                      </select>

                    </div>

                    <div className="order-body">

                      <h4>
                        Customer
                      </h4>

                      <p>
                        👤{" "}
                        {order.customer_name ||
                          "Customer"}
                      </p>

                      <p>
                        📱{" "}
                        {order.customer_phone ||
                          "No phone"}
                      </p>

                      <p>
                        📍{" "}
                        {order.delivery_address ||
                          "No address"}
                      </p>

                      <p>
                        {order.delivery_city}
                        {order.delivery_city &&
                        order.delivery_state
                          ? ", "
                          : ""}
                        {order.delivery_state}
                      </p>

                    </div>

                    <div className="order-body">

                      <h4>
                        Order items
                      </h4>

                      {order.order_items?.map(
                        (item) => (
                          <div
                            className="order-item"
                            key={item.id}
                          >

                            <div className="order-item-image">

                              {item.image_url ? (
                                <img
                                  src={
                                    item.image_url
                                  }
                                  alt={
                                    item.product_name
                                  }
                                />
                              ) : (
                                <span>
                                  📦
                                </span>
                              )}

                            </div>

                            <div>

                              <strong>
                                {
                                  item.product_name
                                }
                              </strong>

                              <div
                                style={{
                                  color:
                                    "#64748b",
                                  fontSize:
                                    12,
                                  marginTop:
                                    4,
                                }}
                              >
                                {item.quantity} ×{" "}
                                {money(
                                  item.price
                                )}
                              </div>

                            </div>

                          </div>
                        )
                      )}

                    </div>

                    <div className="order-total">

                      <span>
                        Total
                      </span>

                      <strong>
                        {money(order.total)}
                      </strong>

                    </div>

                    <button
                      className="secondary"
                      style={{
                        width: "100%",
                        marginTop: 15,
                      }}
                      onClick={() =>
                        setOrderModal(order)
                      }
                    >
                      View Full Order Details
                    </button>

                  </article>

                ))}

              </div>
            )}

          </>
        )}

        {/* =========================
            CUSTOMERS
        ========================= */}

        {section === "customers" && (
          <>

            <div className="section-title">

              <div>
                <p className="eyebrow">
                  CUSTOMER DIRECTORY
                </p>

                <h2>
                  Customers
                </h2>

                <p>
                  Customers who have placed
                  orders.
                </p>
              </div>

              <button
                className="secondary"
                onClick={loadCustomers}
              >
                ↻ Refresh
              </button>

            </div>

            <div className="stats">

              <div className="stat">
                <span className="stat-label">
                  Customers
                </span>

                <strong className="stat-value">
                  {customers.length}
                </strong>
              </div>

            </div>

            {customersLoading ? (
              <div className="empty">
                Loading customers...
              </div>
            ) : customers.length === 0 ? (
              <div className="empty">
                <div className="empty-icon">
                  👥
                </div>

                <h2>
                  No customers yet
                </h2>

                <p>
                  Customers will appear
                  after their first order.
                </p>
              </div>
            ) : (
              <div className="customers">

                {customers.map((customer, index) => (

                  <article
                    className="customer"
                    key={
                      customer.user_id ||
                      index
                    }
                  >

                    <div className="avatar">
                      👤
                    </div>

                    <div>

                      <h3>
                        {customer.customer_name ||
                          "Customer"}
                      </h3>

                      <p>
                        📱{" "}
                        {customer.customer_phone ||
                          "No phone"}
                      </p>

                      <p>
                        📍{" "}
                        {customer.delivery_city}
                        {customer.delivery_city &&
                        customer.delivery_state
                          ? ", "
                          : ""}
                        {customer.delivery_state}
                      </p>

                      <p>
                        Last order:{" "}
                        {formatDate(
                          customer.created_at
                        )}
                      </p>

                    </div>

                  </article>

                ))}

              </div>
            )}

          </>
        )}

        {/* =========================
            SETTINGS
        ========================= */}

        {section === "settings" && (
          <>

            <div className="section-title">

              <div>
                <p className="eyebrow">
                  STORE SETTINGS
                </p>

                <h2>
                  Settings
                </h2>

                <p>
                  Customize your Shindara
                  Phoneflair admin experience.
                </p>
              </div>

            </div>

            <div className="settings-card">

              <h2>
                Store Logo
              </h2>

              <p
                style={{
                  color: "#64748b",
                }}
              >
                Upload your Shindara
                Phoneflair logo.
              </p>

              <div className="logo-preview">

                {logo ? (
                  <img
                    src={logo}
                    alt="Store logo"
                  />
                ) : (
                  "S"
                )}

              </div>

              <label className="upload-label">

                {logoUploading
                  ? "Uploading..."
                  : "📷 Upload Logo"}

                <input
                  className="hidden"
                  type="file"
                  accept="image/*"
                  onChange={
                    handleLogoChange
                  }
                  disabled={
                    logoUploading
                  }
                />

              </label>

              <p
                style={{
                  color: "#94a3b8",
                  fontSize: 12,
                  marginTop: 15,
                }}
              >
                Your logo is uploaded to
                Supabase Storage.
              </p>

            </div>

          </>
        )}

      </div>

      {/* =========================
          PRODUCT MODAL
      ========================= */}

      {productModal && (

        <div
          className="backdrop"
          onClick={closeProductModal}
        >

          <div
            className="modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <button
              className="close"
              onClick={closeProductModal}
            >
              ×
            </button>

            <p className="eyebrow">
              {editingProduct
                ? "EDIT PRODUCT"
                : "NEW PRODUCT"}
            </p>

            <h2>
              {editingProduct
                ? "Edit Product"
                : "Add Product"}
            </h2>

            <form
              className="form"
              onSubmit={saveProduct}
            >

              <label>
                Product Name
              </label>

              <input
                value={productForm.name}
                placeholder="iPhone 15 Case"
                onChange={(e) =>
                  setProductForm({
                    ...productForm,
                    name: e.target.value,
                  })
                }
                required
              />

              <label>
                Description
              </label>

              <textarea
                value={
                  productForm.description
                }
                placeholder="Describe this product..."
                onChange={(e) =>
                  setProductForm({
                    ...productForm,
                    description:
                      e.target.value,
                  })
                }
              />

              <label>
                Price (₦)
              </label>

              <input
                type="number"
                min="0"
                value={productForm.price}
                placeholder="50000"
                onChange={(e) =>
                  setProductForm({
                    ...productForm,
                    price: e.target.value,
                  })
                }
                required
              />

              <label>
                Category
              </label>

              <select
                value={
                  productForm.category
                }
                onChange={(e) =>
                  setProductForm({
                    ...productForm,
                    category:
                      e.target.value,
                  })
                }
                required
              >

                <option value="">
                  Select category
                </option>

                {categories.map(
                  (category) => (
                    <option
                      key={category}
                      value={category}
                    >
                      {category}
                    </option>
                  )
                )}

              </select>

              <label>
                Stock Quantity
              </label>

              <input
                type="number"
                min="0"
                step="1"
                value={productForm.stock}
                placeholder="10"
                onChange={(e) =>
                  setProductForm({
                    ...productForm,
                    stock: e.target.value,
                  })
                }
                required
              />

              <label>
                Product Image
              </label>

              <div>

                <div className="preview">

                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Preview"
                    />
                  ) : (
                    <span
                      style={{
                        fontSize: 50,
                      }}
                    >
                      📷
                    </span>
                  )}

                </div>

                <label className="file-label">

                  {uploading
                    ? "Uploading image..."
                    : "📷 Choose Product Image"}

                  <input
                    className="hidden"
                    type="file"
                    accept="image/*"
                    onChange={
                      handleImageChange
                    }
                    disabled={
                      uploading ||
                      saving
                    }
                  />

                </label>

              </div>

              <div className="featured">

                <input
                  type="checkbox"
                  checked={
                    productForm.featured
                  }
                  onChange={(e) =>
                    setProductForm({
                      ...productForm,
                      featured:
                        e.target.checked,
                    })
                  }
                />

                <span>
                  ⭐ Featured Product
                </span>

              </div>

              <div className="modal-actions">

                <button
                  type="button"
                  className="secondary"
                  onClick={
                    closeProductModal
                  }
                  disabled={
                    saving ||
                    uploading
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary"
                  disabled={
                    saving ||
                    uploading
                  }
                >
                  {uploading
                    ? "Uploading..."
                    : saving
                    ? "Saving..."
                    : editingProduct
                    ? "Save Changes"
                    : "Add Product"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* =========================
          FULL ORDER MODAL
      ========================= */}

      {orderModal && (

        <div
          className="backdrop"
          onClick={() =>
            setOrderModal(null)
          }
        >

          <div
            className="modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <button
              className="close"
              onClick={() =>
                setOrderModal(null)
              }
            >
              ×
            </button>

            <p className="eyebrow">
              ORDER DETAILS
            </p>

            <h2>
              Order #
              {String(orderModal.id)
                .slice(0, 8)
                .toUpperCase()}
            </h2>

            <div
              style={{
                background: "#f8fafc",
                borderRadius: 15,
                padding: 15,
                margin: "15px 0",
              }}
            >

              <strong>
                Customer
              </strong>

              <p>
                👤{" "}
                {orderModal.customer_name}
              </p>

              <p>
                📱{" "}
                {orderModal.customer_phone}
              </p>

              <p>
                📍{" "}
                {orderModal.delivery_address}
              </p>

              <p>
                {orderModal.delivery_city}
                {orderModal.delivery_city &&
                orderModal.delivery_state
                  ? ", "
                  : ""}
                {orderModal.delivery_state}
              </p>

              <p>
                🕐{" "}
                {formatDate(
                  orderModal.created_at
                )}
              </p>

            </div>

            <h3>
              Items
            </h3>

            {orderModal.order_items?.map(
              (item) => (

                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    gap: 12,
                    alignItems: "center",
                    padding: "10px 0",
                    borderBottom:
                      "1px solid #f1f5f9",
                  }}
                >

                  <div
                    style={{
                      width: 55,
                      height: 55,
                      borderRadius: 10,
                      overflow: "hidden",
                      background:
                        "#f1f5f9",
                      flexShrink: 0,
                    }}
                  >

                    {item.image_url ? (
                      <img
                        src={
                          item.image_url
                        }
                        alt={
                          item.product_name
                        }
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit:
                            "cover",
                        }}
                      />
                    ) : (
                      <span
                        style={{
                          display:
                            "flex",
                          alignItems:
                            "center",
                          justifyContent:
                            "center",
                          height:
                            "100%",
                        }}
                      >
                        📦
                      </span>
                    )}

                  </div>

                  <div
                    style={{
                      flex: 1,
                    }}
                  >

                    <strong>
                      {
                        item.product_name
                      }
                    </strong>

                    <div
                      style={{
                        color:
                          "#64748b",
                        fontSize: 12,
                        marginTop: 4,
                      }}
                    >
                      {item.quantity} ×{" "}
                      {money(item.price)}
                    </div>

                  </div>

                  <strong>
                    {money(
                      Number(
                        item.price || 0
                      ) *
                        Number(
                          item.quantity ||
                            0
                        )
                    )}
                  </strong>

                </div>

              )
            )}

            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                fontSize: 21,
                fontWeight: 900,
                paddingTop: 18,
              }}
            >
              <span>
                Total
              </span>

              <span>
                {money(orderModal.total)}
              </span>
            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default Admin;