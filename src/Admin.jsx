import { useEffect, useMemo, useState } from "react";
import { supabase } from "./supabaseClient";

const PRODUCT_BUCKET = "product-images";

function money(value) {
  return `₦${Number(value || 0).toLocaleString("en-NG")}`;
}

function formatDate(date) {
  if (!date) return "—";

  return new Date(date).toLocaleString("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function Admin() {
  const [activeSection, setActiveSection] = useState("dashboard");

  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [customersLoading, setCustomersLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");

  const [productModal, setProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [savingProduct, setSavingProduct] = useState(false);
  const [processingImage, setProcessingImage] = useState(false);

  const [selectedOrder, setSelectedOrder] = useState(null);

  const [productSearch, setProductSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "",
    image_url: "",
    featured: false,
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const [adminLogo, setAdminLogo] = useState(
    () => localStorage.getItem("shindara_admin_logo") || ""
  );

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [savingLogo, setSavingLogo] = useState(false);

  useEffect(() => {
    loadAll();
  }, []);

  function notify(text, type = "info") {
    setMessage(text);
    setMessageType(type);

    window.clearTimeout(window.__adminMessageTimer);

    window.__adminMessageTimer = window.setTimeout(() => {
      setMessage("");
    }, 5000);
  }

  async function loadAll() {
    await Promise.all([
      loadOrders(),
      loadProducts(),
      loadCustomers(),
    ]);
  }

  /* =====================================================
     ORDERS
  ===================================================== */

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
      notify(`Orders could not be loaded: ${error.message}`, "error");
      setOrders([]);
    } else {
      setOrders(data || []);
    }

    setLoading(false);
  }

  async function updateStatus(orderId, status) {
    const { error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", orderId);

    if (error) {
      notify(`Order status could not be updated: ${error.message}`, "error");
      return;
    }

    setOrders((current) =>
      current.map((order) =>
        order.id === orderId
          ? { ...order, status }
          : order
      )
    );

    setSelectedOrder((current) =>
      current && current.id === orderId
        ? { ...current, status }
        : current
    );

    notify("Order status updated.", "success");
  }

  /* =====================================================
     PRODUCTS
  ===================================================== */

  async function loadProducts() {
    setProductsLoading(true);

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      notify(
        `Products could not be loaded: ${error.message}`,
        "error"
      );
      setProducts([]);
    } else {
      setProducts(data || []);
    }

    setProductsLoading(false);
  }

  /* =====================================================
     CUSTOMERS
  ===================================================== */

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
      notify(
        `Customers could not be loaded: ${error.message}`,
        "error"
      );
      setCustomers([]);
      setCustomersLoading(false);
      return;
    }

    const unique = [];

    for (const customer of data || []) {
      const key =
        customer.user_id ||
        customer.customer_phone ||
        customer.customer_name;

      if (!unique.some((item) => {
        const itemKey =
          item.user_id ||
          item.customer_phone ||
          item.customer_name;

        return itemKey === key;
      })) {
        unique.push(customer);
      }
    }

    setCustomers(unique);
    setCustomersLoading(false);
  }

  /* =====================================================
     NAVIGATION
  ===================================================== */

  function openDashboard() {
    setActiveSection("dashboard");
  }

  function openProducts() {
    setActiveSection("products");
    loadProducts();
  }

  function openOrders() {
    setActiveSection("orders");
    loadOrders();
  }

  function openCustomers() {
    setActiveSection("customers");
    loadCustomers();
  }

  function openSettings() {
    setActiveSection("settings");
  }

  /* =====================================================
     PRODUCT FORM
  ===================================================== */

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

    setImageFile(null);
    setImagePreview("");
  }

  function openAddProduct() {
    setEditingProduct(null);
    resetProductForm();
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

    setImageFile(null);
    setImagePreview(product.image_url || "");
    setProductModal(true);
  }

  function closeProductModal() {
    if (savingProduct || processingImage) return;

    setProductModal(false);
    setEditingProduct(null);
    resetProductForm();
  }

  /* =====================================================
     IMAGE PROCESSING
  ===================================================== */

  function compressImage(file) {
    return new Promise((resolve, reject) => {
      if (!file) {
        resolve(null);
        return;
      }

      const reader = new FileReader();

      reader.onload = () => {
        const img = new Image();

        img.onload = () => {
          const maxSize = 1200;

          let width = img.width;
          let height = img.height;

          if (width > maxSize || height > maxSize) {
            if (width > height) {
              height = Math.round(
                (height * maxSize) / width
              );
              width = maxSize;
            } else {
              width = Math.round(
                (width * maxSize) / height
              );
              height = maxSize;
            }
          }

          const canvas = document.createElement("canvas");

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");

          ctx.drawImage(
            img,
            0,
            0,
            width,
            height
          );

          const dataUrl = canvas.toDataURL(
            "image/jpeg",
            0.82
          );

          resolve(dataUrl);
        };

        img.onerror = () => {
          reject(
            new Error("Unable to process this image.")
          );
        };

        img.src = reader.result;
      };

      reader.onerror = () => {
        reject(
          new Error("Unable to read this image.")
        );
      };

      reader.readAsDataURL(file);
    });
  }

  async function handleImageChange(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      notify("Please select an image file.", "error");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      notify(
        "Image is too large. Please choose an image below 10MB.",
        "error"
      );
      return;
    }

    setProcessingImage(true);

    try {
      const compressed = await compressImage(file);

      if (!compressed) {
        throw new Error("Image could not be processed.");
      }

      setImageFile(file);
      setImagePreview(compressed);

      setProductForm((current) => ({
        ...current,
        image_url: "",
      }));
    } catch (error) {
      console.error(error);

      notify(
        error.message || "Unable to process image.",
        "error"
      );
    } finally {
      setProcessingImage(false);
    }
  }

  /* =====================================================
     UPLOAD PRODUCT IMAGE TO SUPABASE
     BUCKET: product-images
  ===================================================== */

  async function uploadProductImage(file) {
    if (!file) return null;

    const extension =
      file.name.split(".").pop()?.toLowerCase() || "jpg";

    const safeExtension =
      ["jpg", "jpeg", "png", "webp", "gif"].includes(
        extension
      )
        ? extension
        : "jpg";

    const fileName =
      `product-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 10)}.${safeExtension}`;

    const filePath = `products/${fileName}`;

    const { data, error } = await supabase.storage
      .from(PRODUCT_BUCKET)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type || "image/jpeg",
      });

    if (error) {
      console.error("Storage upload error:", error);
      throw new Error(
        `Product image upload failed: ${error.message}`
      );
    }

    const { data: publicData } =
      supabase.storage
        .from(PRODUCT_BUCKET)
        .getPublicUrl(data.path);

    if (!publicData?.publicUrl) {
      throw new Error(
        "Image uploaded, but Supabase could not create its public URL."
      );
    }

    return {
      url: publicData.publicUrl,
      path: data.path,
    };
  }

  /* =====================================================
     SAVE PRODUCT
  ===================================================== */

  async function saveProduct(event) {
    event.preventDefault();

    if (savingProduct || processingImage) return;

    setSavingProduct(true);
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
        throw new Error(
          "Please enter a product name."
        );
      }

      if (!category) {
        throw new Error(
          "Please enter a category."
        );
      }

      if (!Number.isFinite(price) || price < 0) {
        throw new Error(
          "Please enter a valid price."
        );
      }

      if (
        !Number.isInteger(stock) ||
        stock < 0
      ) {
        throw new Error(
          "Please enter a valid stock quantity."
        );
      }

      let imageUrl =
        productForm.image_url || null;

      /* Upload new image if selected */
      if (imageFile) {
        notify("Uploading product image...", "info");

        const uploaded =
          await uploadProductImage(imageFile);

        imageUrl = uploaded.url;
      }

      const productData = {
        name,
        description,
        price,
        category,
        stock,
        image_url: imageUrl,
        featured: Boolean(
          productForm.featured
        ),
      };

      /* UPDATE */
      if (editingProduct) {
        const { data, error } =
          await supabase
            .from("products")
            .update(productData)
            .eq("id", editingProduct.id)
            .select("*");

        if (error) {
          throw new Error(
            `Product could not be updated: ${error.message}`
          );
        }

        if (!data || data.length === 0) {
          throw new Error(
            "Product was not updated. Check your Supabase UPDATE policy."
          );
        }

        setProducts((current) =>
          current.map((item) =>
            item.id === editingProduct.id
              ? data[0]
              : item
          )
        );

        notify(
          "Product updated successfully.",
          "success"
        );
      }

      /* ADD */
      else {
        const { data, error } =
          await supabase
            .from("products")
            .insert(productData)
            .select("*");

        if (error) {
          throw new Error(
            `Product could not be added: ${error.message}`
          );
        }

        if (!data || data.length === 0) {
          throw new Error(
            "Product was not added. Check your Supabase INSERT policy."
          );
        }

        setProducts((current) => [
          data[0],
          ...current,
        ]);

        notify(
          "Product added successfully.",
          "success"
        );
      }

      setProductModal(false);
      setEditingProduct(null);
      resetProductForm();

      await loadProducts();
    } catch (error) {
      console.error(
        "SAVE PRODUCT ERROR:",
        error
      );

      notify(
        error.message ||
          "Unable to save product.",
        "error"
      );
    } finally {
      setSavingProduct(false);
    }
  }

  /* =====================================================
     DELETE PRODUCT
  ===================================================== */

  async function deleteProduct(product) {
    const confirmed = window.confirm(
      `Delete "${product.name}"?\n\nThis cannot be undone.`
    );

    if (!confirmed) return;

    try {
      notify(
        "Checking administrator access...",
        "info"
      );

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        throw new Error(
          `Authentication error: ${authError.message}`
        );
      }

      if (!user) {
        throw new Error(
          "You are not logged into Supabase. Please log into your admin account."
        );
      }

      const {
        data: profile,
        error: profileError,
      } = await supabase
        .from("profiles")
        .select("id, email, is_admin")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        throw new Error(
          `Could not check admin profile: ${profileError.message}`
        );
      }

      if (!profile) {
        throw new Error(
          "Your account does not have a profile record."
        );
      }

      if (!profile.is_admin) {
        throw new Error(
          "This account is not marked as an admin."
        );
      }

      notify(
        "Deleting product...",
        "info"
      );

      const {
        data: deleted,
        error: deleteError,
      } = await supabase
        .from("products")
        .delete()
        .eq("id", product.id)
        .select("id");

      if (deleteError) {
        throw new Error(
          `Product could not be deleted: ${deleteError.message}`
        );
      }

      if (!deleted || deleted.length === 0) {
        throw new Error(
          "Supabase did not delete the product. Your DELETE policy may be blocking the operation."
        );
      }

      setProducts((current) =>
        current.filter(
          (item) => item.id !== product.id
        )
      );

      notify(
        `"${product.name}" deleted successfully.`,
        "success"
      );

      await loadProducts();
    } catch (error) {
      console.error(
        "DELETE PRODUCT ERROR:",
        error
      );

      notify(
        error.message ||
          "Product could not be deleted.",
        "error"
      );
    }
  }

  /* =====================================================
     CATEGORIES
     Uses the categories already stored in products.category.
     DOES NOT CREATE A NEW CATEGORIES TABLE.
  ===================================================== */

  const categories = useMemo(() => {
    const values = products
      .map((product) =>
        String(product.category || "").trim()
      )
      .filter(Boolean);

    return [
      "All",
      ...Array.from(new Set(values)).sort(),
    ];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const search =
      productSearch.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !search ||
        String(product.name || "")
          .toLowerCase()
          .includes(search) ||
        String(product.category || "")
          .toLowerCase()
          .includes(search);

      const matchesCategory =
        categoryFilter === "All" ||
        product.category === categoryFilter;

      return (
        matchesSearch &&
        matchesCategory
      );
    });
  }, [
    products,
    productSearch,
    categoryFilter,
  ]);

  /* =====================================================
     DASHBOARD CALCULATIONS
  ===================================================== */

  const totalRevenue = orders
    .filter(
      (order) =>
        order.status !== "cancelled"
    )
    .reduce(
      (sum, order) =>
        sum + Number(order.total || 0),
      0
    );

  const pendingOrders =
    orders.filter(
      (order) =>
        order.status === "pending"
    ).length;

  const confirmedOrders =
    orders.filter(
      (order) =>
        order.status === "confirmed"
    ).length;

  const shippedOrders =
    orders.filter(
      (order) =>
        order.status === "shipped"
    ).length;

  const deliveredOrders =
    orders.filter(
      (order) =>
        order.status === "delivered"
    ).length;

  const cancelledOrders =
    orders.filter(
      (order) =>
        order.status === "cancelled"
    ).length;

  const lowStockProducts =
    products.filter((product) => {
      const stock = Number(
        product.stock || 0
      );

      return stock > 0 && stock <= 5;
    }).length;

  const outOfStockProducts =
    products.filter(
      (product) =>
        Number(product.stock || 0) <= 0
    ).length;

  const featuredProducts =
    products.filter(
      (product) =>
        Boolean(product.featured)
    ).length;

  /* =====================================================
     LOGO SETTINGS
     ===================================================== */

  async function handleLogoChange(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      notify(
        "Please select an image for your logo.",
        "error"
      );
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      notify(
        "Logo must be below 5MB.",
        "error"
      );
      return;
    }

    setLogoFile(file);

    const preview =
      URL.createObjectURL(file);

    setLogoPreview(preview);
  }

  async function saveLogo() {
    if (!logoFile) {
      notify(
        "Choose a logo first.",
        "error"
      );
      return;
    }

    setSavingLogo(true);

    try {
      const extension =
        logoFile.name
          .split(".")
          .pop()
          ?.toLowerCase() || "png";

      const path =
        `branding/logo-${Date.now()}.${extension}`;

      const {
        data,
        error,
      } = await supabase.storage
        .from(PRODUCT_BUCKET)
        .upload(path, logoFile, {
          cacheControl: "3600",
          upsert: false,
          contentType:
            logoFile.type || "image/png",
        });

      if (error) {
        throw new Error(
          `Logo upload failed: ${error.message}`
        );
      }

      const {
        data: publicData,
      } = supabase.storage
        .from(PRODUCT_BUCKET)
        .getPublicUrl(data.path);

      const url =
        publicData?.publicUrl;

      if (!url) {
        throw new Error(
          "Could not create logo URL."
        );
      }

      /*
       * Keep the logo available immediately.
       *
       * localStorage is used here because we are
       * not assuming a site_settings table exists.
       */
      localStorage.setItem(
        "shindara_admin_logo",
        url
      );

      setAdminLogo(url);
      setLogoFile(null);
      setLogoPreview("");

      notify(
        "Logo uploaded successfully.",
        "success"
      );
    } catch (error) {
      console.error(error);

      notify(
        error.message ||
          "Logo could not be uploaded.",
        "error"
      );
    } finally {
      setSavingLogo(false);
    }
  }

  function removeLogo() {
    localStorage.removeItem(
      "shindara_admin_logo"
    );

    setAdminLogo("");
    setLogoFile(null);
    setLogoPreview("");

    notify(
      "Admin logo removed from this device.",
      "success"
    );
  }

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div className="admin-page">

      <style>{`

        * {
          box-sizing: border-box;
        }

        :root {
          --accent: #6d28d9;
          --accent2: #8b5cf6;
          --dark: #111111;
          --muted: #6b7280;
          --border: rgba(0,0,0,.07);
          --card: rgba(255,255,255,.92);
          --bg: #f5f3f8;
          --danger: #dc2626;
          --success: #15803d;
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
          background: var(--bg);
          color: #111;
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

        button:disabled {
          opacity: .55;
          cursor: not-allowed;
        }

        .admin-page {
          min-height: 100vh;
          padding: 24px 16px 70px;
          background:
            radial-gradient(
              circle at 10% 0%,
              rgba(124,58,237,.16),
              transparent 28%
            ),
            radial-gradient(
              circle at 90% 10%,
              rgba(168,85,247,.10),
              transparent 25%
            ),
            var(--bg);
        }

        .admin-container {
          max-width: 1400px;
          margin: auto;
        }

        .admin-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 20px;
        }

        .brand-area {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .admin-logo {
          width: 58px;
          height: 58px;
          border-radius: 17px;
          object-fit: contain;
          background: white;
          border: 1px solid var(--border);
          padding: 7px;
          box-shadow:
            0 12px 30px rgba(0,0,0,.08);
        }

        .admin-logo-placeholder {
          width: 58px;
          height: 58px;
          border-radius: 17px;
          display: flex;
          align-items: center;
          justify-content: center;
          background:
            linear-gradient(
              135deg,
              var(--accent),
              var(--accent2)
            );
          color: white;
          font-weight: 900;
          font-size: 20px;
          box-shadow:
            0 12px 30px rgba(109,40,217,.25);
        }

        .admin-eyebrow {
          margin: 0 0 6px;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 2px;
          color: var(--accent);
        }

        .admin-header h1 {
          margin: 0;
          font-size: clamp(30px,5vw,52px);
          letter-spacing: -2.8px;
          line-height: 1;
        }

        .admin-header p:not(.admin-eyebrow) {
          margin: 8px 0 0;
          color: var(--muted);
          font-size: 14px;
        }

        .admin-refresh {
          border: 1px solid var(--border);
          background: white;
          color: #111;
          border-radius: 13px;
          padding: 12px 16px;
          font-weight: 800;
        }

        .admin-nav {
          display: flex;
          gap: 7px;
          overflow-x: auto;
          padding: 7px;
          background: rgba(255,255,255,.8);
          backdrop-filter: blur(20px);
          border: 1px solid var(--border);
          border-radius: 19px;
          margin-bottom: 20px;
          scrollbar-width: none;
        }

        .admin-nav::-webkit-scrollbar {
          display: none;
        }

        .admin-nav button {
          border: 0;
          background: transparent;
          color: #555;
          padding: 12px 15px;
          border-radius: 12px;
          font-weight: 800;
          white-space: nowrap;
        }

        .admin-nav button:hover {
          background: #f3f3f5;
        }

        .admin-nav-active {
          background: var(--dark) !important;
          color: white !important;
          box-shadow:
            0 7px 20px rgba(0,0,0,.15);
        }

        .admin-message {
          padding: 14px 16px;
          border-radius: 15px;
          margin-bottom: 20px;
          font-size: 14px;
          font-weight: 650;
          border: 1px solid var(--border);
        }

        .message-info {
          background: rgba(109,40,217,.08);
          color: #5b21b6;
        }

        .message-success {
          background: rgba(21,128,61,.08);
          color: #166534;
        }

        .message-error {
          background: rgba(220,38,38,.08);
          color: #991b1b;
        }

        .admin-stats {
          display: grid;
          grid-template-columns:
            repeat(4,minmax(0,1fr));
          gap: 14px;
          margin-bottom: 22px;
        }

        .admin-stat {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 20px;
          box-shadow:
            0 12px 35px rgba(0,0,0,.045);
        }

        .admin-stat span {
          display: block;
          font-size: 11px;
          color: var(--muted);
          margin-bottom: 8px;
          font-weight: 700;
        }

        .admin-stat strong {
          font-size: 25px;
          letter-spacing: -.8px;
        }

        .quick-actions {
          display: grid;
          grid-template-columns:
            repeat(4,minmax(0,1fr));
          gap: 12px;
          margin-bottom: 25px;
        }

        .quick-action {
          border: 1px solid var(--border);
          background: white;
          border-radius: 18px;
          padding: 17px;
          text-align: left;
          transition:
            transform .18s ease,
            box-shadow .18s ease;
        }

        .quick-action:hover {
          transform: translateY(-2px);
          box-shadow:
            0 15px 30px rgba(0,0,0,.07);
        }

        .quick-icon {
          width: 42px;
          height: 42px;
          border-radius: 13px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(109,40,217,.09);
          margin-bottom: 12px;
          font-size: 19px;
        }

        .quick-action strong {
          display: block;
          margin-bottom: 4px;
        }

        .quick-action small {
          color: var(--muted);
        }

        .section-heading {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 15px;
          margin-bottom: 18px;
        }

        .section-heading h2 {
          margin: 0;
          font-size: 30px;
          letter-spacing: -1.5px;
        }

        .primary-button {
          border: 0;
          background:
            linear-gradient(
              135deg,
              #111,
              #292929
            );
          color: white;
          padding: 13px 17px;
          border-radius: 13px;
          font-weight: 800;
          box-shadow:
            0 10px 22px rgba(0,0,0,.12);
        }

        .purple-button {
          border: 0;
          background:
            linear-gradient(
              135deg,
              var(--accent),
              var(--accent2)
            );
          color: white;
          padding: 13px 17px;
          border-radius: 13px;
          font-weight: 800;
        }

        .secondary-button {
          border: 1px solid var(--border);
          background: white;
          color: #111;
          border-radius: 13px;
          padding: 11px 14px;
          font-weight: 750;
        }

        .danger-button {
          border: 1px solid rgba(220,38,38,.15);
          background: rgba(220,38,38,.06);
          color: #b91c1c;
          padding: 10px 13px;
          border-radius: 11px;
          font-weight: 800;
        }

        .admin-empty {
          text-align: center;
          padding: 70px 20px;
          background: white;
          border-radius: 22px;
          border: 1px solid var(--border);
        }

        .admin-empty-icon {
          font-size: 50px;
          margin-bottom: 10px;
        }

        .admin-empty h2 {
          margin: 0 0 8px;
        }

        .admin-empty p {
          color: var(--muted);
          margin: 0 0 18px;
        }

        /* PRODUCTS */

        .product-toolbar {
          display: grid;
          grid-template-columns:
            1.5fr 1fr;
          gap: 10px;
          margin-bottom: 18px;
        }

        .product-toolbar input,
        .product-toolbar select {
          width: 100%;
          border: 1px solid var(--border);
          background: white;
          border-radius: 13px;
          padding: 13px 14px;
          outline: none;
        }

        .products-grid {
          display: grid;
          grid-template-columns:
            repeat(4,minmax(0,1fr));
          gap: 16px;
        }

        .admin-product-card {
          background: white;
          border: 1px solid var(--border);
          border-radius: 21px;
          overflow: hidden;
          box-shadow:
            0 12px 35px rgba(0,0,0,.045);
        }

        .admin-product-image {
          height: 220px;
          background:
            linear-gradient(
              145deg,
              #f3f3f5,
              #e9e9ec
            );
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .admin-product-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .admin-product-content {
          padding: 17px;
        }

        .admin-product-category {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 1.1px;
          font-weight: 900;
          color: var(--accent);
        }

        .admin-product-content h3 {
          margin: 7px 0;
          font-size: 17px;
        }

        .admin-product-price {
          font-size: 19px;
          font-weight: 900;
          margin: 12px 0 5px;
        }

        .stock-good {
          color: var(--success);
        }

        .stock-low {
          color: #ca8a04;
        }

        .stock-out {
          color: var(--danger);
        }

        .product-actions {
          display: grid;
          grid-template-columns:
            1fr 1fr;
          gap: 8px;
          margin-top: 15px;
        }

        .featured-badge {
          display: inline-block;
          margin-top: 8px;
          padding: 5px 8px;
          border-radius: 999px;
          background: rgba(109,40,217,.09);
          color: var(--accent);
          font-size: 10px;
          font-weight: 900;
        }

        /* ORDERS */

        .orders-grid {
          display: grid;
          grid-template-columns:
            repeat(2,minmax(0,1fr));
          gap: 16px;
        }

        .order-card {
          background: white;
          border: 1px solid var(--border);
          border-radius: 22px;
          padding: 20px;
          box-shadow:
            0 12px 35px rgba(0,0,0,.04);
        }

        .order-top {
          display: flex;
          justify-content: space-between;
          gap: 15px;
          align-items: flex-start;
          padding-bottom: 15px;
          border-bottom: 1px solid var(--border);
        }

        .order-number {
          font-weight: 900;
        }

        .order-date {
          font-size: 12px;
          color: var(--muted);
          margin: 6px 0 0;
        }

        .order-status {
          border: 1px solid var(--border);
          border-radius: 999px;
          padding: 8px 10px;
          background: white;
          font-weight: 750;
          font-size: 12px;
        }

        .order-customer,
        .order-products {
          padding: 16px 0;
          border-bottom: 1px solid var(--border);
        }

        .order-customer h3,
        .order-products h3 {
          margin: 0 0 10px;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: var(--muted);
        }

        .order-customer p {
          margin: 6px 0;
          font-size: 14px;
        }

        .order-product {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 0;
        }

        .order-product-image {
          width: 55px;
          height: 55px;
          border-radius: 11px;
          overflow: hidden;
          background: #f1f1f1;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .order-product-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .order-product p {
          margin: 4px 0 0;
          font-size: 12px;
          color: var(--muted);
        }

        .order-total {
          display: flex;
          justify-content: space-between;
          padding-top: 16px;
          font-size: 18px;
        }

        .view-order-button {
          width: 100%;
          margin-top: 14px;
        }

        /* CUSTOMERS */

        .customers-grid {
          display: grid;
          grid-template-columns:
            repeat(3,minmax(0,1fr));
          gap: 15px;
        }

        .customer-card {
          display: flex;
          gap: 14px;
          background: white;
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 18px;
        }

        .customer-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background:
            linear-gradient(
              135deg,
              #eee,
              #ddd
            );
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .customer-card h3 {
          margin: 0 0 8px;
        }

        .customer-card p {
          margin: 5px 0;
          font-size: 13px;
          color: var(--muted);
        }

        .customer-card small {
          display: block;
          margin-top: 10px;
          color: #999;
        }

        /* SETTINGS */

        .settings-grid {
          display: grid;
          grid-template-columns:
            repeat(2,minmax(0,1fr));
          gap: 18px;
        }

        .settings-card {
          background: white;
          border: 1px solid var(--border);
          border-radius: 22px;
          padding: 23px;
        }

        .settings-card h3 {
          margin: 0 0 7px;
          font-size: 20px;
        }

        .settings-card > p {
          margin: 0 0 20px;
          color: var(--muted);
          font-size: 14px;
        }

        .logo-preview {
          width: 140px;
          height: 140px;
          border-radius: 25px;
          background: #f5f5f7;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          margin-bottom: 15px;
          border: 1px solid var(--border);
        }

        .logo-preview img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }

        .file-label {
          display: inline-block;
          padding: 12px 15px;
          background: #111;
          color: white;
          border-radius: 12px;
          font-weight: 800;
          cursor: pointer;
        }

        .hidden-file {
          display: none;
        }

        .settings-actions {
          display: flex;
          gap: 9px;
          flex-wrap: wrap;
          margin-top: 14px;
        }

        /* MODAL */

        .admin-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          background: rgba(0,0,0,.62);
          backdrop-filter: blur(10px);
        }

        .admin-modal {
          width: min(650px,100%);
          max-height: 94vh;
          overflow-y: auto;
          background: white;
          border-radius: 26px;
          padding: 27px;
          position: relative;
          box-shadow:
            0 35px 100px rgba(0,0,0,.35);
        }

        .admin-modal-close {
          position: absolute;
          top: 17px;
          right: 17px;
          width: 38px;
          height: 38px;
          border: 0;
          border-radius: 50%;
          background: #f1f1f1;
          font-size: 22px;
        }

        .admin-form {
          display: grid;
          gap: 12px;
        }

        .admin-form label {
          font-size: 12px;
          font-weight: 850;
          color: #666;
          margin-bottom: -5px;
        }

        .admin-form input,
        .admin-form textarea,
        .admin-form select {
          width: 100%;
          border: 1px solid rgba(0,0,0,.12);
          background: #fafafa;
          border-radius: 12px;
          padding: 13px 14px;
          outline: none;
        }

        .admin-form textarea {
          min-height: 100px;
          resize: vertical;
        }

        .admin-form input:focus,
        .admin-form textarea:focus,
        .admin-form select:focus {
          border-color: var(--accent);
          background: white;
        }

        .image-upload-box {
          border: 2px dashed rgba(0,0,0,.13);
          border-radius: 16px;
          padding: 15px;
          background: #fafafa;
        }

        .image-preview {
          width: 100%;
          height: 220px;
          border-radius: 14px;
          overflow: hidden;
          background: #eee;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .image-preview img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .image-upload-label {
          display: block;
          text-align: center;
          padding: 13px;
          background: #111;
          color: white;
          border-radius: 12px;
          font-weight: 800;
          cursor: pointer;
        }

        .image-upload-input {
          display: none;
        }

        .featured-toggle {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px;
          background: #f7f7f8;
          border-radius: 12px;
        }

        .featured-toggle input {
          width: auto;
        }

        .modal-actions {
          display: grid;
          grid-template-columns:
            1fr 1fr;
          gap: 10px;
          margin-top: 8px;
        }

        /* ORDER DETAIL MODAL */

        .order-detail-grid {
          display: grid;
          gap: 14px;
        }

        .detail-box {
          background: #f7f7f8;
          border-radius: 15px;
          padding: 15px;
        }

        .detail-box h4 {
          margin: 0 0 9px;
          font-size: 11px;
          text-transform: uppercase;
          color: var(--muted);
          letter-spacing: 1px;
        }

        .detail-box p {
          margin: 5px 0;
          font-size: 14px;
        }

        /* RESPONSIVE */

        @media (max-width:1100px) {
          .products-grid {
            grid-template-columns:
              repeat(3,minmax(0,1fr));
          }

          .customers-grid {
            grid-template-columns:
              repeat(2,minmax(0,1fr));
          }
        }

        @media (max-width:850px) {
          .admin-stats {
            grid-template-columns:
              repeat(2,minmax(0,1fr));
          }

          .quick-actions {
            grid-template-columns:
              repeat(2,minmax(0,1fr));
          }

          .products-grid {
            grid-template-columns:
              repeat(2,minmax(0,1fr));
          }

          .orders-grid {
            grid-template-columns: 1fr;
          }

          .settings-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width:600px) {
          .admin-page {
            padding: 17px 10px 45px;
          }

          .admin-header {
            align-items: flex-start;
          }

          .admin-header h1 {
            font-size: 34px;
          }

          .admin-refresh {
            padding: 10px 12px;
          }

          .brand-area {
            gap: 10px;
          }

          .admin-logo,
          .admin-logo-placeholder {
            width: 48px;
            height: 48px;
          }

          .admin-stats {
            grid-template-columns:
              repeat(2,minmax(0,1fr));
            gap: 9px;
          }

          .admin-stat {
            padding: 16px;
            border-radius: 17px;
          }

          .admin-stat strong {
            font-size: 21px;
          }

          .quick-actions {
            grid-template-columns:
              repeat(2,minmax(0,1fr));
            gap: 9px;
          }

          .quick-action {
            padding: 14px;
          }

          .section-heading {
            align-items: flex-start;
          }

          .section-heading h2 {
            font-size: 26px;
          }

          .products-grid,
          .customers-grid {
            grid-template-columns: 1fr;
          }

          .product-toolbar {
            grid-template-columns: 1fr;
          }

          .admin-product-image {
            height: 250px;
          }

          .admin-modal {
            padding: 22px 16px;
            border-radius: 21px;
          }
        }

        @media (max-width:430px) {
          .admin-header {
            flex-direction: column;
          }

          .admin-refresh {
            width: 100%;
          }

          .quick-actions {
            grid-template-columns: 1fr;
          }

          .admin-stats {
            grid-template-columns: 1fr 1fr;
          }

          .modal-actions {
            grid-template-columns: 1fr;
          }
        }

      `}</style>

      <div className="admin-container">

        {/* HEADER */}

        <header className="admin-header">

          <div className="brand-area">

            {adminLogo ? (
              <img
                src={adminLogo}
                alt="Shindara Phoneflair"
                className="admin-logo"
              />
            ) : (
              <div className="admin-logo-placeholder">
                SP
              </div>
            )}

            <div>
              <p className="admin-eyebrow">
                SHINDARA PHONEFLAIR
              </p>

              <h1>Control Center</h1>

              <p>
                Manage your entire store from one place.
              </p>
            </div>

          </div>

          <button
            className="admin-refresh"
            onClick={loadAll}
          >
            ↻ Refresh
          </button>

        </header>

        {/* NAV */}

        <nav className="admin-nav">

          <button
            className={
              activeSection === "dashboard"
                ? "admin-nav-active"
                : ""
            }
            onClick={openDashboard}
          >
            📊 Dashboard
          </button>

          <button
            className={
              activeSection === "products"
                ? "admin-nav-active"
                : ""
            }
            onClick={openProducts}
          >
            📦 Products
          </button>

          <button
            className={
              activeSection === "orders"
                ? "admin-nav-active"
                : ""
            }
            onClick={openOrders}
          >
            🛒 Orders
          </button>

          <button
            className={
              activeSection === "customers"
                ? "admin-nav-active"
                : ""
            }
            onClick={openCustomers}
          >
            👥 Customers
          </button>

          <button
            className={
              activeSection === "settings"
                ? "admin-nav-active"
                : ""
            }
            onClick={openSettings}
          >
            ⚙️ Settings
          </button>

        </nav>

        {/* MESSAGE */}

        {message && (
          <div
            className={`admin-message message-${messageType}`}
          >
            {message}
          </div>
        )}

        {/* =================================================
            DASHBOARD
        ================================================= */}

        {activeSection === "dashboard" && (
          <>

            <div className="admin-stats">

              <div className="admin-stat">
                <span>Total products</span>
                <strong>
                  {products.length}
                </strong>
              </div>

              <div className="admin-stat">
                <span>Total orders</span>
                <strong>
                  {orders.length}
                </strong>
              </div>

              <div className="admin-stat">
                <span>Customers</span>
                <strong>
                  {customers.length}
                </strong>
              </div>

              <div className="admin-stat">
                <span>Total revenue</span>
                <strong>
                  {money(totalRevenue)}
                </strong>
              </div>

            </div>

            <div className="admin-stats">

              <div className="admin-stat">
                <span>Pending</span>
                <strong>
                  {pendingOrders}
                </strong>
              </div>

              <div className="admin-stat">
                <span>Confirmed</span>
                <strong>
                  {confirmedOrders}
                </strong>
              </div>

              <div className="admin-stat">
                <span>Shipped</span>
                <strong>
                  {shippedOrders}
                </strong>
              </div>

              <div className="admin-stat">
                <span>Delivered</span>
                <strong>
                  {deliveredOrders}
                </strong>
              </div>

            </div>

            {/* QUICK ACTIONS */}

            <h2
              style={{
                margin: "0 0 13px",
                fontSize: 20,
                letterSpacing: "-.5px",
              }}
            >
              Quick Actions
            </h2>

            <div className="quick-actions">

              <button
                className="quick-action"
                onClick={openAddProduct}
              >
                <div className="quick-icon">
                  ➕
                </div>

                <strong>
                  Add Product
                </strong>

                <small>
                  Add new inventory
                </small>
              </button>

              <button
                className="quick-action"
                onClick={openOrders}
              >
                <div className="quick-icon">
                  🛒
                </div>

                <strong>
                  View Orders
                </strong>

                <small>
                  Manage customer orders
                </small>
              </button>

              <button
                className="quick-action"
                onClick={openCustomers}
              >
                <div className="quick-icon">
                  👥
                </div>

                <strong>
                  Customers
                </strong>

                <small>
                  View your customers
                </small>
              </button>

              <button
                className="quick-action"
                onClick={openSettings}
              >
                <div className="quick-icon">
                  ⚙️
                </div>

                <strong>
                  Settings
                </strong>

                <small>
                  Store appearance
                </small>
              </button>

            </div>

            {/* INVENTORY STATUS */}

            <div className="admin-stats">

              <div className="admin-stat">
                <span>Low stock</span>
                <strong>
                  {lowStockProducts}
                </strong>
              </div>

              <div className="admin-stat">
                <span>Out of stock</span>
                <strong>
                  {outOfStockProducts}
                </strong>
              </div>

              <div className="admin-stat">
                <span>Featured products</span>
                <strong>
                  {featuredProducts}
                </strong>
              </div>

              <div className="admin-stat">
                <span>Cancelled orders</span>
                <strong>
                  {cancelledOrders}
                </strong>
              </div>

            </div>

            <div className="admin-empty">

              <div className="admin-empty-icon">
                ✨
              </div>

              <h2>
                Welcome to your store dashboard
              </h2>

              <p>
                Everything you need to manage
                Shindara Phoneflair is here.
              </p>

              <button
                className="primary-button"
                onClick={openAddProduct}
              >
                + Add your next product
              </button>

            </div>

          </>
        )}

        {/* =================================================
            PRODUCTS
        ================================================= */}

        {activeSection === "products" && (
          <>

            <div className="section-heading">

              <div>
                <p className="admin-eyebrow">
                  STORE INVENTORY
                </p>

                <h2>
                  Products
                </h2>
              </div>

              <button
                className="primary-button"
                onClick={openAddProduct}
              >
                + Add Product
              </button>

            </div>

            <div className="admin-stats">

              <div className="admin-stat">
                <span>All products</span>
                <strong>
                  {products.length}
                </strong>
              </div>

              <div className="admin-stat">
                <span>Categories</span>
                <strong>
                  {Math.max(
                    categories.length - 1,
                    0
                  )}
                </strong>
              </div>

              <div className="admin-stat">
                <span>In stock</span>
                <strong>
                  {
                    products.filter(
                      (p) =>
                        Number(p.stock || 0) > 0
                    ).length
                  }
                </strong>
              </div>

              <div className="admin-stat">
                <span>Out of stock</span>
                <strong>
                  {outOfStockProducts}
                </strong>
              </div>

            </div>

            <div className="product-toolbar">

              <input
                type="search"
                placeholder="Search products..."
                value={productSearch}
                onChange={(event) =>
                  setProductSearch(
                    event.target.value
                  )
                }
              />

              <select
                value={categoryFilter}
                onChange={(event) =>
                  setCategoryFilter(
                    event.target.value
                  )
                }
              >
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

            </div>

            {productsLoading ? (
              <div className="admin-empty">
                Loading products...
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="admin-empty">

                <div className="admin-empty-icon">
                  📦
                </div>

                <h2>
                  No products found
                </h2>

                <p>
                  Try another search or add a product.
                </p>

                <button
                  className="primary-button"
                  onClick={openAddProduct}
                >
                  + Add Product
                </button>

              </div>
            ) : (
              <div className="products-grid">

                {filteredProducts.map(
                  (product) => {

                    const stock =
                      Number(
                        product.stock || 0
                      );

                    return (
                      <article
                        className="admin-product-card"
                        key={product.id}
                      >

                        <div className="admin-product-image">

                          {product.image_url ? (
                            <img
                              src={
                                product.image_url
                              }
                              alt={
                                product.name
                              }
                            />
                          ) : (
                            <span
                              style={{
                                fontSize: 55,
                              }}
                            >
                              📦
                            </span>
                          )}

                        </div>

                        <div className="admin-product-content">

                          <span className="admin-product-category">
                            {product.category ||
                              "Uncategorized"}
                          </span>

                          <h3>
                            {product.name}
                          </h3>

                          <div className="admin-product-price">
                            {money(
                              product.price
                            )}
                          </div>

                          <div
                            className={
                              stock <= 0
                                ? "stock-out"
                                : stock <= 5
                                ? "stock-low"
                                : "stock-good"
                            }
                          >
                            {stock <= 0
                              ? "Out of stock"
                              : `${stock} in stock`}
                          </div>

                          {product.featured && (
                            <span className="featured-badge">
                              ⭐ Featured
                            </span>
                          )}

                          <div className="product-actions">

                            <button
                              className="secondary-button"
                              onClick={() =>
                                openEditProduct(
                                  product
                                )
                              }
                            >
                              ✏️ Edit
                            </button>

                            <button
                              className="danger-button"
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
                  }
                )}

              </div>
            )}

          </>
        )}

        {/* =================================================
            ORDERS
        ================================================= */}

        {activeSection === "orders" && (
          <>

            <div className="section-heading">

              <div>
                <p className="admin-eyebrow">
                  STORE ORDERS
                </p>

                <h2>
                  Orders
                </h2>
              </div>

              <button
                className="secondary-button"
                onClick={loadOrders}
              >
                ↻ Refresh
              </button>

            </div>

            <div className="admin-stats">

              <div className="admin-stat">
                <span>Total orders</span>
                <strong>
                  {orders.length}
                </strong>
              </div>

              <div className="admin-stat">
                <span>Pending</span>
                <strong>
                  {pendingOrders}
                </strong>
              </div>

              <div className="admin-stat">
                <span>Delivered</span>
                <strong>
                  {deliveredOrders}
                </strong>
              </div>

              <div className="admin-stat">
                <span>Revenue</span>
                <strong>
                  {money(totalRevenue)}
                </strong>
              </div>

            </div>

            {loading ? (
              <div className="admin-empty">
                Loading orders...
              </div>
            ) : orders.length === 0 ? (
              <div className="admin-empty">

                <div className="admin-empty-icon">
                  🛒
                </div>

                <h2>
                  No orders yet
                </h2>

                <p>
                  New customer orders will appear here.
                </p>

              </div>
            ) : (
              <div className="orders-grid">

                {orders.map(
                  (order) => (

                    <article
                      className="order-card"
                      key={order.id}
                    >

                      <div className="order-top">

                        <div>

                          <span className="order-number">
                            #
                            {String(order.id)
                              .slice(0, 8)
                              .toUpperCase()}
                          </span>

                          <p className="order-date">
                            {formatDate(
                              order.created_at
                            )}
                          </p>

                        </div>

                        <select
                          value={
                            order.status ||
                            "pending"
                          }
                          onChange={(event) =>
                            updateStatus(
                              order.id,
                              event.target.value
                            )
                          }
                          className="order-status"
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

                      <div className="order-customer">

                        <h3>
                          Customer
                        </h3>

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

                      <div className="order-products">

                        <h3>
                          Products
                        </h3>

                        {order.order_items?.map(
                          (item) => (

                            <div
                              className="order-product"
                              key={item.id}
                            >

                              <div className="order-product-image">

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

                                <p>
                                  {
                                    item.quantity
                                  }
                                  {" × "}
                                  {money(
                                    item.price
                                  )}
                                </p>

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
                          {money(
                            order.total
                          )}
                        </strong>

                      </div>

                      <button
                        className="secondary-button view-order-button"
                        onClick={() =>
                          setSelectedOrder(
                            order
                          )
                        }
                      >
                        View Full Order Details
                      </button>

                    </article>

                  )
                )}

              </div>
            )}

          </>
        )}

        {/* =================================================
            CUSTOMERS
        ================================================= */}

        {activeSection === "customers" && (
          <>

            <div className="section-heading">

              <div>
                <p className="admin-eyebrow">
                  CUSTOMER DIRECTORY
                </p>

                <h2>
                  Customers
                </h2>
              </div>

              <button
                className="secondary-button"
                onClick={loadCustomers}
              >
                ↻ Refresh
              </button>

            </div>

            <div className="admin-stats">

              <div className="admin-stat">
                <span>Total customers</span>
                <strong>
                  {customers.length}
                </strong>
              </div>

              <div className="admin-stat">
                <span>Total orders</span>
                <strong>
                  {orders.length}
                </strong>
              </div>

            </div>

            {customersLoading ? (
              <div className="admin-empty">
                Loading customers...
              </div>
            ) : customers.length === 0 ? (
              <div className="admin-empty">

                <div className="admin-empty-icon">
                  👥
                </div>

                <h2>
                  No customers yet
                </h2>

                <p>
                  Customers who place orders will appear here.
                </p>

              </div>
            ) : (
              <div className="customers-grid">

                {customers.map(
                  (customer, index) => (

                    <article
                      className="customer-card"
                      key={
                        customer.user_id ||
                        customer.customer_phone ||
                        index
                      }
                    >

                      <div className="customer-avatar">
                        👤
                      </div>

                      <div>

                        <h3>
                          {
                            customer.customer_name ||
                            "Customer"
                          }
                        </h3>

                        <p>
                          📱{" "}
                          {
                            customer.customer_phone ||
                            "No phone"
                          }
                        </p>

                        <p>
                          📍{" "}
                          {
                            customer.delivery_city ||
                            ""
                          }

                          {customer.delivery_city &&
                          customer.delivery_state
                            ? ", "
                            : ""}

                          {
                            customer.delivery_state ||
                            ""
                          }
                        </p>

                        <small>
                          Last order:{" "}
                          {formatDate(
                            customer.created_at
                          )}
                        </small>

                      </div>

                    </article>

                  )
                )}

              </div>
            )}

          </>
        )}

        {/* =================================================
            SETTINGS
        ================================================= */}

        {activeSection === "settings" && (
          <>

            <div className="section-heading">

              <div>
                <p className="admin-eyebrow">
                  STORE SETTINGS
                </p>

                <h2>
                  Settings
                </h2>
              </div>

            </div>

            <div className="settings-grid">

              <div className="settings-card">

                <h3>
                  Store Logo
                </h3>

                <p>
                  Upload the logo you want displayed
                  in your admin control center.
                </p>

                <div className="logo-preview">

                  {logoPreview ? (
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                    />
                  ) : adminLogo ? (
                    <img
                      src={adminLogo}
                      alt="Current logo"
                    />
                  ) : (
                    <span
                      style={{
                        fontSize: 35,
                        fontWeight: 900,
                        color: "#6d28d9",
                      }}
                    >
                      SP
                    </span>
                  )}

                </div>

                <label
                  className="file-label"
                  htmlFor="admin-logo-upload"
                >
                  📷 Choose Logo
                </label>

                <input
                  id="admin-logo-upload"
                  className="hidden-file"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                />

                <div className="settings-actions">

                  <button
                    className="purple-button"
                    onClick={saveLogo}
                    disabled={
                      !logoFile ||
                      savingLogo
                    }
                  >
                    {savingLogo
                      ? "Uploading..."
                      : "Save Logo"}
                  </button>

                  {adminLogo && (
                    <button
                      className="secondary-button"
                      onClick={removeLogo}
                    >
                      Remove
                    </button>
                  )}

                </div>

              </div>

              <div className="settings-card">

                <h3>
                  Store Overview
                </h3>

                <p>
                  Current store information.
                </p>

                <div className="detail-box">

                  <h4>
                    Brand
                  </h4>

                  <p>
                    Shindara Phoneflair
                  </p>

                </div>

                <div
                  className="detail-box"
                  style={{
                    marginTop: 10,
                  }}
                >

                  <h4>
                    Products
                  </h4>

                  <p>
                    {products.length} products
                  </p>

                </div>

                <div
                  className="detail-box"
                  style={{
                    marginTop: 10,
                  }}
                >

                  <h4>
                    Categories
                  </h4>

                  <p>
                    {Math.max(
                      categories.length - 1,
                      0
                    )} categories
                  </p>

                </div>

              </div>

            </div>

          </>
        )}

      </div>

      {/* =================================================
          PRODUCT MODAL
      ================================================= */}

      {productModal && (

        <div
          className="admin-modal-backdrop"
          onClick={closeProductModal}
        >

          <div
            className="admin-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <button
              className="admin-modal-close"
              onClick={closeProductModal}
              disabled={
                savingProduct ||
                processingImage
              }
            >
              ×
            </button>

            <p className="admin-eyebrow">
              {editingProduct
                ? "EDIT PRODUCT"
                : "NEW PRODUCT"}
            </p>

            <h2
              style={{
                marginTop: 0,
                fontSize: 30,
                letterSpacing: "-1.5px",
              }}
            >
              {editingProduct
                ? "Edit product"
                : "Add product"}
            </h2>

            <p
              style={{
                color: "#777",
                marginBottom: 20,
              }}
            >
              Add your product information below.
            </p>

            <form
              className="admin-form"
              onSubmit={saveProduct}
            >

              <label>
                Product name
              </label>

              <input
                type="text"
                placeholder="e.g. iPhone 15 Case"
                value={
                  productForm.name
                }
                onChange={(event) =>
                  setProductForm({
                    ...productForm,
                    name:
                      event.target.value,
                  })
                }
                required
              />

              <label>
                Description
              </label>

              <textarea
                placeholder="Describe the product..."
                value={
                  productForm.description
                }
                onChange={(event) =>
                  setProductForm({
                    ...productForm,
                    description:
                      event.target.value,
                  })
                }
              />

              <label>
                Price (₦)
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="50000"
                value={
                  productForm.price
                }
                onChange={(event) =>
                  setProductForm({
                    ...productForm,
                    price:
                      event.target.value,
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
                onChange={(event) =>
                  setProductForm({
                    ...productForm,
                    category:
                      event.target.value,
                  })
                }
                required
              >

                <option value="">
                  Select category
                </option>

                {categories
                  .filter(
                    (category) =>
                      category !== "All"
                  )
                  .map(
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
                Stock quantity
              </label>

              <input
                type="number"
                min="0"
                step="1"
                placeholder="10"
                value={
                  productForm.stock
                }
                onChange={(event) =>
                  setProductForm({
                    ...productForm,
                    stock:
                      event.target.value,
                  })
                }
                required
              />

              <label>
                Product image
              </label>

              <div className="image-upload-box">

                <div className="image-preview">

                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Product preview"
                    />
                  ) : productForm.image_url ? (
                    <img
                      src={
                        productForm.image_url
                      }
                      alt="Current product"
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

                <label
                  className="image-upload-label"
                  htmlFor="product-image"
                >
                  📷 Choose Product Image
                </label>

                <input
                  id="product-image"
                  className="image-upload-input"
                  type="file"
                  accept="image/*"
                  onChange={
                    handleImageChange
                  }
                />

                {processingImage && (
                  <p
                    style={{
                      textAlign: "center",
                      color: "#777",
                      marginBottom: 0,
                    }}
                  >
                    Processing image...
                  </p>
                )}

              </div>

              <div className="featured-toggle">

                <input
                  id="featured"
                  type="checkbox"
                  checked={
                    productForm.featured
                  }
                  onChange={(event) =>
                    setProductForm({
                      ...productForm,
                      featured:
                        event.target.checked,
                    })
                  }
                />

                <label
                  htmlFor="featured"
                  style={{
                    margin: 0,
                    color: "#111",
                  }}
                >
                  ⭐ Featured product
                </label>

              </div>

              <div className="modal-actions">

                <button
                  type="button"
                  className="secondary-button"
                  onClick={
                    closeProductModal
                  }
                  disabled={
                    savingProduct ||
                    processingImage
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={
                    savingProduct ||
                    processingImage
                  }
                >
                  {processingImage
                    ? "Processing..."
                    : savingProduct
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

      {/* =================================================
          FULL ORDER DETAILS MODAL
      ================================================= */}

      {selectedOrder && (

        <div
          className="admin-modal-backdrop"
          onClick={() =>
            setSelectedOrder(null)
          }
        >

          <div
            className="admin-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <button
              className="admin-modal-close"
              onClick={() =>
                setSelectedOrder(null)
              }
            >
              ×
            </button>

            <p className="admin-eyebrow">
              ORDER DETAILS
            </p>

            <h2
              style={{
                marginTop: 0,
                fontSize: 30,
              }}
            >
              Order #
              {String(
                selectedOrder.id
              )
                .slice(0, 8)
                .toUpperCase()}
            </h2>

            <div className="order-detail-grid">

              <div className="detail-box">

                <h4>
                  Order information
                </h4>

                <p>
                  <strong>
                    Date:
                  </strong>{" "}
                  {formatDate(
                    selectedOrder.created_at
                  )}
                </p>

                <p>
                  <strong>
                    Status:
                  </strong>{" "}
                  {selectedOrder.status ||
                    "pending"}
                </p>

                <p>
                  <strong>
                    Total:
                  </strong>{" "}
                  {money(
                    selectedOrder.total
                  )}
                </p>

              </div>

              <div className="detail-box">

                <h4>
                  Customer
                </h4>

                <p>
                  <strong>
                    Name:
                  </strong>{" "}
                  {selectedOrder.customer_name ||
                    "—"}
                </p>

                <p>
                  <strong>
                    Phone:
                  </strong>{" "}
                  {selectedOrder.customer_phone ||
                    "—"}
                </p>

              </div>

              <div className="detail-box">

                <h4>
                  Delivery
                </h4>

                <p>
                  {selectedOrder.delivery_address ||
                    "No address"}
                </p>

                <p>
                  {selectedOrder.delivery_city ||
                    ""}
                  {selectedOrder.delivery_city &&
                  selectedOrder.delivery_state
                    ? ", "
                    : ""}
                  {selectedOrder.delivery_state ||
                    ""}
                </p>

              </div>

              <div className="detail-box">

                <h4>
                  Items
                </h4>

                {selectedOrder.order_items?.map(
                  (item) => (

                    <div
                      className="order-product"
                      key={item.id}
                    >

                      <div className="order-product-image">

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

                        <p>
                          {
                            item.quantity
                          }
                          {" × "}
                          {money(
                            item.price
                          )}
                        </p>

                      </div>

                    </div>

                  )
                )}

              </div>

              <button
                className="primary-button"
                onClick={() =>
                  setSelectedOrder(null)
                }
              >
                Close Order Details
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default Admin;